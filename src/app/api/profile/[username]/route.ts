import { NextRequest, NextResponse } from 'next/server'
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore'
import { initializeApp, getApps } from 'firebase/app'

// Initialize Firebase Admin (server-side)
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
}

// Initialize Firebase app if not already initialized
let app
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig)
} else {
  app = getApps()[0]
}

const db = getFirestore(app)

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params

    if (!username) {
      return NextResponse.json(
        { error: 'Username is required' },
        { status: 400 }
      )
    }

    console.log('API: Fetching public profile for username:', username)
    console.log('API: Firebase config:', {
      projectId: firebaseConfig.projectId,
      hasApiKey: !!firebaseConfig.apiKey
    })

    // Check if Firebase is properly configured
    if (!firebaseConfig.apiKey || firebaseConfig.apiKey === 'demo-key') {
      console.error('API: Firebase not configured properly')
      return NextResponse.json(
        { error: 'Firebase not configured' },
        { status: 500 }
      )
    }

    // Query users collection for the username
    const usersRef = collection(db, 'users')
    const q = query(usersRef, where('username', '==', username.toLowerCase()))
    const snapshot = await getDocs(q)

    console.log('API: Query executed, docs found:', snapshot.docs.length)

    if (snapshot.empty) {
      console.log('API: No profile found for username:', username)
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      )
    }

    const userDoc = snapshot.docs[0]
    const data = userDoc.data()

    console.log('API: Profile data retrieved:', {
      username: data.username,
      isPublic: data.isPublic,
      hasAvatar: !!data.avatar,
      hasBanner: !!data.banner
    })

    // Only return if profile is public
    if (!data.isPublic) {
      console.log('API: Profile is not public')
      return NextResponse.json(
        { error: 'Profile is not public' },
        { status: 403 }
      )
    }

    // Convert Firestore timestamps to ISO strings
    const profile = {
      ...data,
      uid: userDoc.id,
      createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      updatedAt: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      lastLoginAt: data.lastLoginAt?.toDate?.()?.toISOString() || null
    }

    console.log('API: Profile processed successfully:', (profile as { name?: string }).name || 'Unknown')
    return NextResponse.json(profile)

  } catch (error) {
    console.error('API: Error fetching public profile:', error)
    console.error('API: Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    })
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
