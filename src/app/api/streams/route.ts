import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/firebase'
import { collection, addDoc, getDocs, query, where, orderBy, limit } from 'firebase/firestore'

// Stream Management API
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'all' // 'live', 'featured', 'all'
    const limitCount = parseInt(searchParams.get('limit') || '20')

    let streamsQuery = query(
      collection(db, 'streams'),
      where('isLive', '==', true),
      orderBy('startTime', 'desc'),
      limit(limitCount)
    )

    if (type === 'featured') {
      streamsQuery = query(
        collection(db, 'streams'),
        where('isLive', '==', true),
        where('isFeatured', '==', true),
        orderBy('startTime', 'desc'),
        limit(limitCount)
      )
    }

    const snapshot = await getDocs(streamsQuery)
    const streams = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))

    return NextResponse.json({ streams })

  } catch (error) {
    console.error('Error fetching streams:', error)
    return NextResponse.json(
      { error: 'Failed to fetch streams', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check Firebase configuration
    if (!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
      console.error('Firebase not configured - missing NEXT_PUBLIC_FIREBASE_PROJECT_ID')
      return NextResponse.json(
        { error: 'Firebase not configured' },
        { status: 500 }
      )
    }

    const streamData = await request.json()
    console.log('Creating stream with data:', streamData)
    
    // Validate required fields
    const { channelName, streamerId, streamerName, title, description } = streamData
    
    if (!channelName || !streamerId || !streamerName || !title) {
      return NextResponse.json(
        { error: 'Missing required fields', received: { channelName, streamerId, streamerName, title } },
        { status: 400 }
      )
    }

    // Create stream document
    const streamDoc = {
      channelName,
      streamerId,
      streamerName,
      title,
      description: description || '',
      isLive: true,
      isFeatured: false,
      viewerCount: 0,
      startTime: new Date(),
      endTime: null,
      thumbnail: streamData.thumbnail || '',
      tags: streamData.tags || [],
      category: streamData.category || 'general',
      quality: streamData.quality || '720p',
      createdAt: new Date(),
      updatedAt: new Date()
    }

    console.log('Adding stream document to Firestore...')
    const docRef = await addDoc(collection(db, 'streams'), streamDoc)
    console.log('Stream created successfully with ID:', docRef.id)

    return NextResponse.json({ 
      id: docRef.id,
      ...streamDoc 
    })

  } catch (error) {
    console.error('Error creating stream:', error)
    return NextResponse.json(
      { 
        error: 'Failed to create stream', 
        details: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}
