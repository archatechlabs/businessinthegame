import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const appId = process.env.NEXT_PUBLIC_AGORA_APP_ID
    const appCert = process.env.NEXT_PUBLIC_AGORA_APP_CERTIFICATE

    const credentials = {
      appId: appId ? `${appId.substring(0, 8)}...${appId.substring(appId.length - 4)}` : 'undefined',
      appIdLength: appId?.length || 0,
      appIdValid: appId?.length === 32,
      appCert: appCert ? `${appCert.substring(0, 8)}...${appCert.substring(appCert.length - 4)}` : 'undefined',
      appCertLength: appCert?.length || 0,
      appCertValid: appCert?.length === 32,
      hasBothCredentials: !!(appId && appCert),
      environment: process.env.NODE_ENV
    }

    console.log('🔍 Agora credentials check:', credentials)

    return NextResponse.json({
      success: true,
      credentials,
      message: credentials.hasBothCredentials && credentials.appIdValid && credentials.appCertValid 
        ? 'Credentials look valid' 
        : 'Credentials have issues - check Agora console'
    })

  } catch (error) {
    console.error('❌ Error checking credentials:', error)
    return NextResponse.json(
      { error: 'Failed to check credentials' },
      { status: 500 }
    )
  }
}
