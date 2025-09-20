// Agora Live Streaming Utilities
export interface AgoraConfig {
  appId: string
  appCertificate: string
  restfulId: string
  restfulSecret: string
}

export interface StreamToken {
  token: string
  channelName: string
  uid: number
  expireTime: number
}

// Get Agora configuration from environment variables
export const getAgoraConfig = (): AgoraConfig => {
  return {
    appId: process.env.NEXT_PUBLIC_AGORA_APP_ID || '',
    appCertificate: process.env.NEXT_PUBLIC_AGORA_APP_CERTIFICATE || '',
    restfulId: process.env.AGORA_RESTFUL_ID || '',
    restfulSecret: process.env.AGORA_RESTFUL_SECRET || ''
  }
}

// Generate a random UID for the stream
export const generateUID = (): number => {
  return Math.floor(Math.random() * 100000) + 1
}

// Generate a random channel name
export const generateChannelName = (): string => {
  return `big_stream_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// Check if user has streaming permissions
export const canUserStream = (userRole: string, userTier: string): boolean => {
  // Super Admin and Admin can stream for free
  if (userRole === 'super_admin' || userRole === 'admin') {
    return true
  }
  
  // Premium and VIP users can stream
  if (userTier === 'premium' || userTier === 'vip') {
    return true
  }
  
  return false
}

// Get streaming tier based on user role and tier
export const getStreamingTier = (userRole: string, userTier: string): 'free' | 'premium' | 'vip' => {
  if (userRole === 'super_admin' || userRole === 'admin') {
    return 'free'
  }
  
  if (userTier === 'vip') {
    return 'vip'
  }
  
  if (userTier === 'premium') {
    return 'premium'
  }
  
  return 'premium' // Default to premium for paid users
}

// Stream quality settings based on tier
export const getStreamQuality = (tier: 'free' | 'premium' | 'vip') => {
  switch (tier) {
    case 'free':
      return {
        width: 1280,
        height: 720,
        frameRate: 30,
        bitrate: 2000
      }
    case 'premium':
      return {
        width: 1920,
        height: 1080,
        frameRate: 30,
        bitrate: 3000
      }
    case 'vip':
      return {
        width: 1920,
        height: 1080,
        frameRate: 60,
        bitrate: 4000
      }
    default:
      return {
        width: 1280,
        height: 720,
        frameRate: 30,
        bitrate: 2000
      }
  }
}
