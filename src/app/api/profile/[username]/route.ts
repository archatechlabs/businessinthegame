import { NextRequest, NextResponse } from 'next/server'

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

    // Add cache busting timestamp
    const timestamp = Date.now()

    // For now, return a mock profile to test the API route
    // This will help us verify the API is working before fixing Firebase
    const mockProfile = {
      uid: 'mock-uid-123',
      email: 'chizzcto@example.com',
      name: 'Chizz CTO',
      username: 'chizzcto',
      bio: 'This is a mock profile for testing purposes',
      role: 'user',
      tier: 'member',
      status: 'active',
      permissions: ['view_content', 'create_content', 'manage_own_profile'],
      isPublic: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
      avatar: `https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face&auto=format&q=80&t=${timestamp}`,
      banner: `https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=200&fit=crop&auto=format&q=80&t=${timestamp}`,
      location: 'San Francisco, CA',
      website: 'https://example.com',
      socialLinks: {
        twitter: 'https://twitter.com/chizzcto',
        linkedin: 'https://linkedin.com/in/chizzcto',
        instagram: 'https://instagram.com/chizzcto'
      }
    }

    console.log('API: Returning mock profile for username:', username)
    console.log('API: Avatar URL:', mockProfile.avatar)
    console.log('API: Banner URL:', mockProfile.banner)
    return NextResponse.json(mockProfile)

  } catch (error) {
    console.error('API: Error in profile route:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
