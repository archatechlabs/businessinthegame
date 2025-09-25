import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/firebase'
import { collection, addDoc, getDocs, query, where, orderBy, doc, updateDoc, deleteDoc, getDoc } from 'firebase/firestore'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { streamId, requesterId, requesterName, requesterAvatar, message } = body

    console.log('🔍 StreamRequest POST - Received data:', { streamId, requesterId, requesterName, requesterAvatar, message })

    if (!streamId || !requesterId || !requesterName) {
      console.log('❌ StreamRequest POST - Missing required fields:', { streamId, requesterId, requesterName })
      return NextResponse.json(
        { error: 'Missing required fields: streamId, requesterId, requesterName' },
        { status: 400 }
      )
    }

    // Check if stream exists and is live
    const streamRef = doc(db, 'streams', streamId)
    const streamSnap = await getDoc(streamRef)
    
    console.log('🔍 StreamRequest POST - Checking stream:', { streamId, exists: streamSnap.exists() })
    
    if (!streamSnap.exists()) {
      console.log('❌ StreamRequest POST - Stream not found:', streamId)
      return NextResponse.json(
        { error: 'Stream not found' },
        { status: 404 }
      )
    }

    const streamData = streamSnap.data()
    console.log('🔍 StreamRequest POST - Stream data:', { isLive: streamData.isLive, streamerId: streamData.streamerId })
    
    if (!streamData.isLive) {
      console.log('❌ StreamRequest POST - Stream is not live:', streamId)
      return NextResponse.json(
        { error: 'Stream is not live' },
        { status: 400 }
      )
    }

    // Check if user already has a pending request for this stream
    const existingRequestsQuery = query(
      collection(db, 'streamRequests'),
      where('streamId', '==', streamId),
      where('requesterId', '==', requesterId),
      where('status', '==', 'pending')
    )
    const existingRequests = await getDocs(existingRequestsQuery)
    
    console.log('🔍 StreamRequest POST - Checking existing requests:', { count: existingRequests.size })
    
    if (!existingRequests.empty) {
      console.log('❌ StreamRequest POST - User already has pending request')
      return NextResponse.json(
        { error: 'You already have a pending request for this stream' },
        { status: 400 }
      )
    }

    // Create new stream request
    const requestData = {
      streamId,
      requesterId,
      requesterName,
      requesterAvatar: requesterAvatar || null,
      message: message || '',
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    }

    const docRef = await addDoc(collection(db, 'streamRequests'), requestData)
    
    console.log('✅ Stream request created:', docRef.id)
    
    return NextResponse.json({
      success: true,
      requestId: docRef.id,
      message: 'Join request sent successfully'
    })

  } catch (error) {
    console.error('❌ Error creating stream request:', error)
    
    // Handle Firebase/permission errors gracefully
    if (error instanceof Error && (
      error.message.includes('permission') || 
      error.message.includes('Firebase') ||
      error.message.includes('auth') ||
      error.message.includes('network')
    )) {
      return NextResponse.json(
        { error: 'Database connection error. Please try again.' },
        { status: 503 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to create stream request', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const streamId = searchParams.get('streamId')
    const requesterId = searchParams.get('requesterId')
    const status = searchParams.get('status') || 'pending'

    console.log('🔍 StreamRequest GET - Parameters:', { streamId, requesterId, status })

    let requestsQuery

    if (streamId) {
      // Get requests for a specific stream
      console.log('🔍 StreamRequest GET - Fetching requests for stream:', streamId)
      requestsQuery = query(
        collection(db, 'streamRequests'),
        where('streamId', '==', streamId),
        where('status', '==', status),
        orderBy('createdAt', 'desc')
      )
    } else if (requesterId) {
      // Get requests made by a specific user
      console.log('🔍 StreamRequest GET - Fetching requests for user:', requesterId)
      requestsQuery = query(
        collection(db, 'streamRequests'),
        where('requesterId', '==', requesterId),
        orderBy('createdAt', 'desc')
      )
    } else {
      console.log('❌ StreamRequest GET - Missing required parameters')
      return NextResponse.json(
        { error: 'Missing required parameter: streamId or requesterId' },
        { status: 400 }
      )
    }

    const snapshot = await getDocs(requestsQuery)
    const requests = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate?.() || new Date()
    }))

    console.log(`📋 Found ${requests.length} stream requests`)
    return NextResponse.json(requests)

  } catch (error) {
    console.error('❌ Error fetching stream requests:', error)
    
    // Handle Firebase/permission errors gracefully
    if (error instanceof Error && (
      error.message.includes('permission') || 
      error.message.includes('Firebase') ||
      error.message.includes('auth') ||
      error.message.includes('network')
    )) {
      return NextResponse.json([])
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch stream requests', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { requestId, status, streamerId } = body

    if (!requestId || !status) {
      return NextResponse.json(
        { error: 'Missing required fields: requestId, status' },
        { status: 400 }
      )
    }

    if (!['accepted', 'rejected'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be "accepted" or "rejected"' },
        { status: 400 }
      )
    }

    // Update the request status
    const requestRef = doc(db, 'streamRequests', requestId)
    await updateDoc(requestRef, {
      status,
      updatedAt: new Date(),
      respondedBy: streamerId || null
    })

    console.log(`✅ Stream request ${requestId} ${status}`)
    
    return NextResponse.json({
      success: true,
      message: `Request ${status} successfully`
    })

  } catch (error) {
    console.error('❌ Error updating stream request:', error)
    return NextResponse.json(
      { error: 'Failed to update stream request', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const requestId = searchParams.get('requestId')

    if (!requestId) {
      return NextResponse.json(
        { error: 'Missing required parameter: requestId' },
        { status: 400 }
      )
    }

    await deleteDoc(doc(db, 'streamRequests', requestId))
    
    console.log(`✅ Stream request ${requestId} deleted`)
    
    return NextResponse.json({
      success: true,
      message: 'Request deleted successfully'
    })

  } catch (error) {
    console.error('❌ Error deleting stream request:', error)
    return NextResponse.json(
      { error: 'Failed to delete stream request', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
