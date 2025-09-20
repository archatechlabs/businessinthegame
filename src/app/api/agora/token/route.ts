import { NextRequest, NextResponse } from 'next/server'
import { RtcTokenBuilder, RtcRole } from 'agora-access-token'

// Agora Token Generation
export async function POST(request: NextRequest) {
  try {
    const { channelName, uid, role = 'publisher' } = await request.json()

    if (!channelName) {
      return NextResponse.json(
        { error: 'Channel name is required' },
        { status: 400 }
      )
    }

    // Check if Agora is configured
    if (!process.env.NEXT_PUBLIC_AGORA_APP_ID || !process.env.NEXT_PUBLIC_AGORA_APP_CERTIFICATE) {
      return NextResponse.json(
        { error: 'Agora App ID or Certificate not configured' },
        { status: 500 }
      )
    }

    // Generate real Agora token
    const token = await generateAgoraToken(
      channelName,
      uid || Math.floor(Math.random() * 100000),
      role
    )

    const tokenData = {
      token,
      channelName,
      uid: uid || Math.floor(Math.random() * 100000),
      role,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
    }

    return NextResponse.json(tokenData)

  } catch (error) {
    console.error('Error generating Agora token:', error)
    return NextResponse.json(
      { error: 'Failed to generate token' },
      { status: 500 }
    )
  }
}

// Real Agora token generation
async function generateAgoraToken(
  channelName: string,
  uid: number,
  role: 'publisher' | 'subscriber' = 'publisher'
) {
  const appId = process.env.NEXT_PUBLIC_AGORA_APP_ID!
  const appCertificate = process.env.NEXT_PUBLIC_AGORA_APP_CERTIFICATE!
  const expirationTimeInSeconds = 3600 // 1 hour
  
  const currentTimestamp = Math.floor(Date.now() / 1000)
  const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds
  
  const rtcRole = role === 'publisher' ? RtcRole.PUBLISHER : RtcRole.SUBSCRIBER
  
  const token = RtcTokenBuilder.buildTokenWithUid(
    appId,
    appCertificate,
    channelName,
    uid,
    rtcRole,
    privilegeExpiredTs
  )
  
  return token
}
