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
      avatar: 'https://via.placeholder.com/150/4F46E5/FFFFFF?text=CC',
      banner: 'https://via.placeholder.com/800x200/4F46E5/FFFFFF?text=Banner',
      location: 'San Francisco, CA',
      website: 'https://example.com',
      socialLinks: {
        twitter: 'https://twitter.com/chizzcto',
        linkedin: 'https://linkedin.com/in/chizzcto',
        instagram: 'https://instagram.com/chizzcto'
      }
    }

    console.log('API: Returning mock profile for username:', username)
    return NextResponse.json(mockProfile)

  } catch (error) {
    console.error('API: Error in profile route:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
