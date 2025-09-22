import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/firebase'
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  limit, 
  getDocs, 
  addDoc, 
  doc, 
  getDoc 
} from 'firebase/firestore'

// Helper function to safely convert Firestore timestamps
function safeConvertTimestamp(timestamp: unknown): Date {
  if (!timestamp) return new Date()
  
  // Type guard for Firestore timestamp
  if (typeof timestamp === 'object' && timestamp !== null && 'seconds' in timestamp) {
    return new Date((timestamp as { seconds: number }).seconds * 1000)
  }
  
  // Type guard for Firestore timestamp with toDate method
  if (typeof timestamp === 'object' && timestamp !== null && 'toDate' in timestamp && typeof (timestamp as { toDate: () => Date }).toDate === 'function') {
    return (timestamp as { toDate: () => Date }).toDate()
  }
  
  if (timestamp instanceof Date) {
    return timestamp
  }
  
  if (typeof timestamp === 'string') {
    return new Date(timestamp)
  }
  
  if (typeof timestamp === 'number') {
    return new Date(timestamp)
  }
  
  return new Date()
}

// Stream Management API
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 GET /api/streams - Starting request')
    
    const { searchParams } = new URL(request.url)
    const streamId = searchParams.get('id')
    const type = searchParams.get('type') || 'all'
    const limitCount = parseInt(searchParams.get('limit') || '20')

    console.log('📋 Query parameters:', { streamId, type, limitCount })

    // If requesting a specific stream by ID
    if (streamId) {
      console.log('🔍 Fetching specific stream by ID:', streamId)
      
      try {
        const streamDoc = await getDoc(doc(db, 'streams', streamId))
        
        if (!streamDoc.exists()) {
          console.log('❌ Stream not found:', streamId)
          return NextResponse.json(
            { error: 'Stream not found', timestamp: new Date().toISOString() },
            { status: 404 }
          )
        }
        
        const data = streamDoc.data()
        console.log('📊 Stream data found:', data)
        
        const stream = {
          id: streamDoc.id,
          ...data,
          startTime: safeConvertTimestamp(data.startTime || data.startedAt),
          createdAt: safeConvertTimestamp(data.createdAt),
          updatedAt: safeConvertTimestamp(data.updatedAt)
        }
        
        console.log('✅ Returning single stream:', stream)
        return NextResponse.json([stream]) // Return as array for consistency
      } catch (err) {
        console.error('❌ Error fetching stream by ID:', err)
        return NextResponse.json(
          { error: 'Failed to fetch stream', details: err instanceof Error ? err.message : 'Unknown error', timestamp: new Date().toISOString() },
          { status: 500 }
        )
      }
    }

    // Otherwise, fetch all live streams
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

    console.log('🔍 Executing Firestore query...')
    const snapshot = await getDocs(streamsQuery)
    console.log('📊 Firestore query completed, docs found:', snapshot.docs.length)
    
    const streams = snapshot.docs.map(doc => {
      const data = doc.data()
      console.log('📊 Raw stream data:', doc.id, data)
      
      // Safely convert all timestamps
      const startTime = safeConvertTimestamp(data.startTime || data.startedAt)
      const createdAt = safeConvertTimestamp(data.createdAt)
      const updatedAt = safeConvertTimestamp(data.updatedAt)
      
      return {
        id: doc.id,
        ...data,
        startTime,
        createdAt,
        updatedAt
      }
    })

    console.log('🎥 Total streams found:', streams.length)

    console.log('✅ Sending response with', streams.length, 'streams')
    return NextResponse.json(streams)

  } catch (error) {
    console.error('❌ Error fetching streams:', error)
    return NextResponse.json(
      { error: 'Failed to fetch streams', details: error instanceof Error ? error.message : 'Unknown error', timestamp: new Date().toISOString() },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 POST /api/streams - Starting request')
    
    if (!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
      console.error('Firebase not configured - missing NEXT_PUBLIC_FIREBASE_PROJECT_ID')
      return NextResponse.json(
        { error: 'Firebase not configured' },
        { status: 500 }
      )
    }

    const streamData = await request.json()
    console.log('🎬 Creating stream with data:', streamData)
    
    const { channelName, streamerId, streamerName, title, description } = streamData
    
    if (!channelName || !streamerId || !streamerName || !title) {
      const errorResponse = {
        error: 'Missing required fields', 
        received: { channelName, streamerId, streamerName, title },
        timestamp: new Date().toISOString()
      }
      console.log('❌ Missing required fields:', errorResponse)
      return NextResponse.json(errorResponse, { status: 400 })
    }

    const now = new Date()
    const streamDoc = {
      channelName,
      streamerId,
      streamerName,
      streamerUsername: streamData.streamerUsername || streamData.username || streamerName.toLowerCase().replace(/\s+/g, ''),
      streamerAvatar: streamData.streamerAvatar || streamData.avatar || '',
      title,
      description: description || '',
      isLive: true,
      isFeatured: false,
      viewerCount: 0,
      startTime: now,
      endTime: null,
      thumbnail: streamData.thumbnail || '',
      tags: streamData.tags || [],
      category: streamData.category || 'general',
      quality: streamData.quality || '720p',
      isAdminStream: streamData.isAdminStream || false,
      createdAt: now,
      updatedAt: now
    }

    console.log('💾 Adding stream document to Firestore:', streamDoc)
    const docRef = await addDoc(collection(db, 'streams'), streamDoc)
    console.log('✅ Stream created successfully with ID:', docRef.id)

    const response = { 
      id: docRef.id,
      ...streamDoc 
    }
    
    console.log('✅ Stream creation successful:', response)
    return NextResponse.json(response)

  } catch (error) {
    console.error('❌ Error creating stream:', error)
    return NextResponse.json(
      { error: 'Failed to create stream', details: error instanceof Error ? error.message : 'Unknown error', timestamp: new Date().toISOString() },
      { status: 500 }
    )
  }
}
