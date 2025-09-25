import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/firebase'
import { collection, addDoc, getDocs, query, where, orderBy, limit } from 'firebase/firestore'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { streamId, emoji, userId, username, userAvatar } = body

    if (!streamId || !emoji || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields: streamId, emoji, userId' },
        { status: 400 }
      )
    }

    // Create emoji reaction
    const reactionData = {
      streamId,
      emoji,
      userId,
      username: username || 'Anonymous',
      userAvatar: userAvatar || null,
      timestamp: new Date(),
      x: Math.random() * 80 + 10, // Random position 10-90%
      y: Math.random() * 80 + 10
    }

    const docRef = await addDoc(collection(db, 'emojiReactions'), reactionData)
    
    console.log('✅ Emoji reaction shared:', docRef.id, emoji)
    
    return NextResponse.json({
      success: true,
      reactionId: docRef.id,
      message: 'Emoji reaction shared successfully'
    })

  } catch (error) {
    console.error('❌ Error sharing emoji reaction:', error)
    return NextResponse.json(
      { error: 'Failed to share emoji reaction', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const streamId = searchParams.get('streamId')
    const limitCount = parseInt(searchParams.get('limit') || '50')

    if (!streamId) {
      return NextResponse.json(
        { error: 'Missing required parameter: streamId' },
        { status: 400 }
      )
    }

    // Validate streamId format
    if (typeof streamId !== 'string' || streamId.trim().length === 0) {
      return NextResponse.json(
        { error: 'Invalid streamId format' },
        { status: 400 }
      )
    }

    // Get recent emoji reactions for this stream
    const reactionsQuery = query(
      collection(db, 'emojiReactions'),
      where('streamId', '==', streamId.trim()),
      orderBy('timestamp', 'desc'),
      limit(Math.min(limitCount, 100)) // Cap at 100 to prevent abuse
    )

    const snapshot = await getDocs(reactionsQuery)
    const reactions = snapshot.docs.map(doc => {
      const data = doc.data()
      return {
        id: doc.id,
        ...data,
        timestamp: data.timestamp?.toDate?.() || new Date()
      }
    })

    console.log(`🎭 Found ${reactions.length} emoji reactions for stream ${streamId}`)
    return NextResponse.json(reactions)

  } catch (error) {
    console.error('❌ Error fetching emoji reactions:', error)
    
    // Return empty array instead of error to prevent UI issues
    if (error instanceof Error && error.message.includes('permission')) {
      console.log('📝 Permission denied for emoji reactions, returning empty array')
      return NextResponse.json([])
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch emoji reactions', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
