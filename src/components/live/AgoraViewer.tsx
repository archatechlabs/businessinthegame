'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import EmojiReactions from './EmojiReactions'

interface AgoraViewerProps {
  streamId: string
  channelName: string
  onLeave: () => void
}

export default function AgoraViewer({ channelName, streamId, onLeave }: AgoraViewerProps) {
  const { userProfile } = useAuth()
  const [isViewing, setIsViewing] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [viewerCount, setViewerCount] = useState(0)
  const [agoraLoaded, setAgoraLoaded] = useState(false)
  const [connectionState, setConnectionState] = useState<string>('disconnected')
  const [reactionCount, setReactionCount] = useState(0)
  
  // Debug logging for component props and auth state
  console.log('🎬 AgoraViewer component rendered with props:', {
    channelName,
    streamId,
    userProfile: userProfile ? 'present' : 'null',
    userUid: userProfile?.uid || 'none'
  })
  
  const clientRef = useRef<unknown>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const audioRef = useRef<HTMLAudioElement>(null)
  const initializedRef = useRef(false)

  // Check Agora App ID availability
  const agoraAppId = process.env.NEXT_PUBLIC_AGORA_APP_ID?.trim()
  
  // Debug environment variables
  console.log('🔧 Environment check:', {
    agoraAppId: agoraAppId ? `${agoraAppId.substring(0, 8)}...` : 'MISSING',
    agoraAppIdLength: agoraAppId?.length || 0,
    nodeEnv: process.env.NODE_ENV
  })

  // Load Agora SDK
  useEffect(() => {
    console.log('🔄 Starting Agora SDK load process...')
    const loadAgora = async () => {
      try {
        console.log('📦 Importing agora-rtc-sdk-ng...')
        await import('agora-rtc-sdk-ng')
        console.log('✅ Agora SDK loaded for viewer')
        setAgoraLoaded(true)
      } catch (err) {
        console.error('❌ Failed to load Agora SDK:', err)
        setError('Failed to load video streaming SDK')
      }
    }
    
    loadAgora()
  }, [])

  // Generate a consistent numeric UID for viewer
  const getNumericUid = useCallback(() => {
    if (userProfile?.uid) {
      // Try to convert string UID to number, fallback to hash
      const numericUid = parseInt(userProfile.uid, 10)
      if (!isNaN(numericUid) && numericUid > 0) {
        return numericUid + 10000 // Add offset to differentiate from streamer
      }
      // If string UID can't be converted to number, create a hash
      let hash = 0
      for (let i = 0; i < userProfile.uid.length; i++) {
        const char = userProfile.uid.charCodeAt(i)
        hash = ((hash << 5) - hash) + char
        hash = hash & hash // Convert to 32-bit integer
      }
      return Math.abs(hash) + 10000
    }
    return Math.floor(Math.random() * 100000) + 10000 // Random UID for anonymous viewers
  }, [userProfile?.uid])

  // Generate Agora token for viewer
  const generateToken = useCallback(async (channel: string, uid: number) => {
    try {
      console.log('🎫 Generating Agora token for viewer, channel:', channel, 'UID:', uid)
      const response = await fetch(`/api/agora/token?channel=${channel}&uid=${uid}&role=subscriber`)
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to generate token')
      }
      
      const data = await response.json()
      console.log('✅ Token generated successfully for viewer UID:', uid)
      return data.token
    } catch (err) {
      console.error('❌ Error generating token:', err)
      throw err
    }
  }, [])

  // Handle emoji reaction
  const handleReaction = useCallback((emoji: string) => {
    setReactionCount(prev => prev + 1)
    console.log('🎉 Emoji reaction:', emoji)
    
    // In a real app, you would send this reaction to other viewers via WebSocket
    // For now, we'll just log it
  }, [])

  // Initialize viewer - this runs only once when component mounts
  useEffect(() => {
    const initViewer = async () => {
      // Prevent multiple initializations
      if (initializedRef.current || !agoraLoaded || !agoraAppId) {
        console.log('🚫 Skipping Agora initialization:', { 
          initialized: initializedRef.current, 
          agoraLoaded, 
          agoraAppId: agoraAppId ? 'present' : 'missing' 
        })
        return
      }

      try {
        initializedRef.current = true
        setIsConnecting(true)
        setError(null)

        console.log('🎬 Initializing Agora client for viewer with App ID:', agoraAppId)
        console.log('🎬 Channel name:', channelName)
        console.log('🎬 Stream ID:', streamId)
        const AgoraRTCModule = await import('agora-rtc-sdk-ng')
        const client = AgoraRTCModule.default.createClient({
          mode: 'rtc',
          codec: 'vp8'
        })
        
        // Add event listeners
        client.on('connection-state-change', (newState, reason) => {
          console.log('🔗 Viewer connection state changed:', newState, reason)
          setConnectionState(newState)
        })

        client.on('user-joined', (user) => {
          console.log('👤 User joined (viewer sees):', user.uid)
        })

        client.on('user-left', (user) => {
          console.log('👤 User left (viewer sees):', user.uid)
        })

        client.on('user-published', async (user, mediaType) => {
          console.log('📺 User published stream:', user.uid, mediaType)
          try {
            await client.subscribe(user, mediaType)
            console.log('✅ Subscribed to user stream:', user.uid, mediaType)
            
            if (mediaType === 'video' && user.videoTrack && videoRef.current) {
              console.log('🎬 Playing remote video stream')
              user.videoTrack.play(videoRef.current)
            }
            
            if (mediaType === 'audio' && user.audioTrack && audioRef.current) {
              console.log('🔊 Playing remote audio stream')
              user.audioTrack.play()
            }
          } catch (err) {
            console.error('❌ Error subscribing to user stream:', err)
          }
        })

        client.on('user-unpublished', (user, mediaType) => {
          console.log('📺 User unpublished stream:', user.uid, mediaType)
        })

        // Handle connection errors gracefully
        client.on('exception', (event) => {
          console.error('❌ Agora connection exception:', event)
          setError(`Agora Error: ${event.code} - ${event.msg || 'Unknown error'}`)
          setIsConnecting(false)
          // Don't treat analytics errors as fatal
          if (String(event.code) === 'CAN_NOT_GET_GATEWAY_SERVER' && event.msg?.includes('statscollector')) {
            console.log('📊 Analytics blocked by browser - this is normal and does not affect functionality')
            setError(null) // Clear error for analytics issues
            return
          }
          // For other errors, show them but don't necessarily fail
          console.warn('Agora exception details:', event)
        })

        // Add error handler for join failures
        client.on('error', (error: any) => {
          console.error('❌ Agora client error:', error)
          setError(`Agora Error: ${error.code} - ${error.message || 'Unknown error'}`)
          setIsConnecting(false)
        })

        clientRef.current = client
        console.log('✅ Agora client created for viewer')

        // Join channel
        console.log('🎯 Joining Agora channel as viewer:', channelName)
        
        // Get consistent numeric UID
        const uid = getNumericUid()
        console.log('👤 Using viewer UID:', uid)
        
        // Generate token with the same UID
        console.log('🎫 Generating token for channel:', channelName, 'UID:', uid)
        const token = await generateToken(channelName, uid)
        console.log('🎫 Token generated successfully, length:', token?.length || 0)
        console.log('🎫 Token preview:', token ? token.substring(0, 50) + '...' : 'null')
        
        // Join the channel as viewer
        console.log('🎯 Attempting to join channel with:', {
          appId: agoraAppId.trim(),
          channelName,
          uid,
          tokenLength: token?.length || 0,
          tokenValid: !!token
        })
        
        try {
          console.log('🚀 Calling client.join()...')
          const joinResult = await client.join(
            agoraAppId.trim(),
            channelName,
            token,
            uid
          )
          
          console.log('✅ Joined channel as viewer successfully, result:', joinResult)
          setIsViewing(true)
          setIsConnecting(false)
        } catch (joinError) {
          console.error('❌ Failed to join channel:', joinError)
          console.error('❌ Join error details:', {
            name: joinError instanceof Error ? joinError.name : 'Unknown',
            message: joinError instanceof Error ? joinError.message : 'Unknown error',
            code: (joinError as any)?.code,
            reason: (joinError as any)?.reason
          })
          setError(`Failed to join channel: ${joinError instanceof Error ? joinError.message : 'Unknown error'}`)
          setIsConnecting(false)
          throw joinError // Re-throw to be caught by outer try-catch
        }

      } catch (err) {
        console.error('❌ Error initializing viewer:', err)
        if (err instanceof Error) {
          setError(err.message)
        } else {
          setError('Failed to start viewing')
        }
        setIsConnecting(false)
        initializedRef.current = false
      }
    }

    initViewer()

    // Cleanup function
    return () => {
      const cleanup = async () => {
        try {
          if (clientRef.current) {
            const client = clientRef.current as { leave: () => Promise<void> }
            await client.leave()
            clientRef.current = null
            initializedRef.current = false
          }
        } catch (err) {
          console.error('Error during cleanup:', err)
        }
      }
      cleanup()
    }
    
  }, [agoraLoaded, agoraAppId, channelName, getNumericUid, generateToken])

  const stopViewing = async () => {
    try {
      if (clientRef.current) {
        const client = clientRef.current as { leave: () => Promise<void> }
        await client.leave()
        clientRef.current = null
        initializedRef.current = false
      }
      setIsViewing(false)
      setViewerCount(0)
      onLeave()
    } catch (err) {
      console.error('Error stopping viewer:', err)
    }
  }

  if (error) {
    return (
      <div className="w-full h-full bg-gray-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="text-red-500 mb-4 text-4xl">⚠️</div>
          <p className="text-lg mb-2">Viewing Error</p>
          <p className="text-sm text-gray-300 mb-4">{error}</p>
          <div className="space-x-2">
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Retry
            </button>
            <button
              onClick={stopViewing}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full h-full bg-gray-900 relative">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={false}
        className="w-full h-full object-cover"
        style={{ transform: 'scaleX(-1)' }} // Mirror the video
      />
      
      {/* Hidden audio element for viewer audio */}
      <audio
        ref={audioRef}
        autoPlay
        playsInline
        muted={false}
        className="hidden"
      />
      
      {/* Emoji Reactions Overlay */}
      <EmojiReactions streamId={streamId} onReaction={handleReaction} />
      
      {isConnecting && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-75">
          <div className="text-center text-white">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-lg">Connecting to Stream...</p>
            <p className="text-sm opacity-75">Channel: {channelName}</p>
            <p className="text-xs opacity-50 mt-2">Note: Analytics errors are normal and do not affect functionality</p>
          </div>
        </div>
      )}

      {!isViewing && !isConnecting && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
          <div className="text-center text-white">
            <div className="text-gray-400 mb-4 text-4xl">📺</div>
            <p className="text-lg mb-2">No Stream Available</p>
            <p className="text-sm text-gray-300">Waiting for streamer to start...</p>
          </div>
        </div>
      )}

      {/* Viewer Controls */}
      <div className="absolute bottom-4 left-4 right-4">
        <div className="flex items-center justify-between bg-black bg-opacity-50 rounded-lg p-3">
          <div className="flex items-center space-x-3">
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-600 text-white">
              <div className="w-2 h-2 bg-white rounded-full mr-1.5 animate-pulse"></div>
              LIVE
            </span>
            <span className="text-white text-sm">Channel: {channelName}</span>
            <span className="text-white text-sm">Viewers: {viewerCount}</span>
            <span className="text-white text-sm">Status: {connectionState}</span>
            {reactionCount > 0 && (
              <span className="text-yellow-400 text-sm">🎉 {reactionCount} reactions</span>
            )}
          </div>

          <button
            onClick={stopViewing}
            className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 flex items-center"
          >
            <span className="mr-2">❌</span>
            Leave
          </button>
        </div>
      </div>
    </div>
  )
}