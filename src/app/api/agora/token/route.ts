import { NextRequest, NextResponse } from 'next/server'
import { RtcTokenBuilder, RtcRole } from 'agora-access-token'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const channel = searchParams.get('channel')
    const uid = searchParams.get('uid') || '0'
    const role = searchParams.get('role') || 'publisher'

    if (!channel) {
      return NextResponse.json({ error: 'Channel name is required' }, { status: 400 })
    }

    return await generateToken(channel, parseInt(uid), role)
  } catch (error) {
    console.error('Error in GET /api/agora/token:', error)
    return NextResponse.json(
      { error: 'Failed to generate token', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { channel, uid, role } = body

    if (!channel) {
      return NextResponse.json({ error: 'Channel name is required' }, { status: 400 })
    }

    return await generateToken(channel, uid || 0, role || 'publisher')
  } catch (error) {
    console.error('Error in POST /api/agora/token:', error)
    return NextResponse.json(
      { error: 'Failed to generate token', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

async function generateToken(channel: string, uid: number, role: string) {
  try {
    // Get and trim the credentials to remove any whitespace/newlines
    const appId = process.env.NEXT_PUBLIC_AGORA_APP_ID?.trim()
    const appCert = process.env.NEXT_PUBLIC_AGORA_APP_CERTIFICATE?.trim()

    console.log('🔍 Token generation debug:', {
      appId: appId ? `${appId.substring(0, 8)}...` : 'undefined',
      appIdLength: appId?.length || 0,
      appCert: appCert ? `${appCert.substring(0, 8)}...` : 'undefined',
      appCertLength: appCert?.length || 0,
      channel,
      uid,
      role
    })

    if (!appId || !appCert) {
      console.error('❌ Missing Agora credentials:', { appId: !!appId, appCert: !!appCert })
      return NextResponse.json({ error: 'Agora credentials not configured' }, { status: 500 })
    }

    if (appId.length !== 32) {
      console.error('❌ Invalid App ID length:', appId.length, 'App ID:', `"${appId}"`)
      return NextResponse.json({ error: `Invalid App ID length: ${appId.length}, expected 32. App ID: "${appId}"` }, { status: 500 })
    }

    if (appCert.length !== 32) {
      console.error('❌ Invalid App Certificate length:', appCert.length, 'App Cert:', `"${appCert}"`)
      return NextResponse.json({ error: `Invalid App Certificate length: ${appCert.length}, expected 32. App Cert: "${appCert}"` }, { status: 500 })
    }

    // Set expiration time (1 hour from now)
    const expireTime = Math.floor(Date.now() / 1000) + 3600

    // Determine role
    let rtcRole
    if (role === 'subscriber' || role === 'audience') {
      rtcRole = RtcRole.SUBSCRIBER
    } else {
      rtcRole = RtcRole.PUBLISHER
    }

    console.log('🎫 Generating token with:', {
      appId: appId.substring(0, 8) + '...',
      appCert: appCert.substring(0, 8) + '...',
      channel,
      uid,
      role: rtcRole,
      expireTime
    })

    // Generate the token
    const token = RtcTokenBuilder.buildTokenWithUid(appId, appCert, channel, uid, rtcRole, expireTime)

    console.log('✅ Token generated successfully:', {
      tokenLength: token.length,
      channel,
      uid,
      role
    })

    return NextResponse.json({ token })
  } catch (error) {
    console.error('❌ Error generating Agora token:', error)
    return NextResponse.json(
      { 
        error: 'Failed to generate token', 
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}
