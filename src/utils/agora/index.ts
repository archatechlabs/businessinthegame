// Agora utility functions for live streaming

export type UserRole = 'super-admin' | 'admin' | 'moderator' | 'user'
export type UserTier = 'member' | 'non-member' | 'premium' | 'vip' | 'founder'
export type StreamingTier = 'free' | 'premium' | 'vip'

export interface StreamQuality {
  width: number
  height: number
  frameRate: number
  bitrate: number
  quality: string
}

// Check if user can stream based on role and tier
export function canUserStream(role: UserRole, tier?: UserTier): boolean {
  // Super Admin and Admin can always stream for free
  if (role === 'super-admin' || role === 'admin') {
    return true
  }
  
  // Regular users need a paid tier
  return tier === 'premium' || tier === 'vip' || tier === 'founder'
}

// Get streaming tier based on role and user tier
export function getStreamingTier(role: UserRole, tier?: UserTier): StreamingTier {
  if (role === 'super-admin' || role === 'admin') {
    return 'free'
  }
  
  if (tier === 'vip' || tier === 'founder') {
    return 'vip'
  }
  
  if (tier === 'premium') {
    return 'premium'
  }
  
  return 'free' // Default for testing
}

// Get stream quality settings based on tier
export function getStreamQuality(tier: StreamingTier): StreamQuality {
  switch (tier) {
    case 'vip':
      return {
        width: 1920,
        height: 1080,
        frameRate: 60,
        bitrate: 4000,
        quality: '1080p'
      }
    case 'premium':
      return {
        width: 1280,
        height: 720,
        frameRate: 30,
        bitrate: 2000,
        quality: '720p'
      }
    case 'free':
    default:
      return {
        width: 854,
        height: 480,
        frameRate: 30,
        bitrate: 1000,
        quality: '480p'
      }
  }
}

// Generate unique channel name
export function generateChannelName(): string {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 8)
  return `big-${timestamp}-${random}`
}

// Generate unique UID for Agora
export function generateUID(): number {
  return Math.floor(Math.random() * 1000000)
}

// Validate channel name
export function isValidChannelName(channelName: string): boolean {
  // Agora channel names must be 1-64 characters, alphanumeric and special characters
  return /^[a-zA-Z0-9_-]{1,64}$/.test(channelName)
}

// Get streaming capabilities for user
export function getStreamingCapabilities(role: UserRole, tier?: UserTier) {
  const canStream = canUserStream(role, tier)
  const streamingTier = getStreamingTier(role, tier)
  const quality = getStreamQuality(streamingTier)
  
  return {
    canStream,
    tier: streamingTier,
    quality,
    maxViewers: streamingTier === 'vip' ? 10000 : streamingTier === 'premium' ? 1000 : 100,
    features: {
      recording: streamingTier !== 'free',
      transcoding: streamingTier === 'vip',
      analytics: streamingTier !== 'free',
      customThumbnail: streamingTier === 'vip'
    }
  }
}
