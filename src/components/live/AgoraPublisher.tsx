'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'

interface AgoraPublisherProps {
  channelName: string
  streamId: string
  onJoinComplete?: () => void
  onJoinError?: (error: string) => void
  onLeave?: () => void
}

export default function AgoraPublisher({ 
  channelName, 
  streamId, 
  onJoinComplete, 
  onJoinError,
  onLeave 
}: AgoraPublisherProps) {
  const { userProfile } = useAuth()
  const [isPublishing, setIsPublishing] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [cameraEnabled, setCameraEnabled] = useState(true)
  const [microphoneEnabled, setMicrophoneEnabled] = useState(true)
  const [agoraLoaded, setAgoraLoaded] = useState(false)
  const [connectionState, setConnectionState] = useState<string>('disconnected')
  
  const clientRef = useRef<unknown>(null)
  const videoTrackRef = useRef<unknown>(null)
  const audioTrackRef = useRef<unknown>(null)
  const videoElementRef = useRef<HTMLVideoElement>(null)
  const audioElementRef = useRef<HTMLAudioElement>(null)
  const initializedRef = useRef(false)

  // Check Agora App ID availability
  const agoraAppId = process.env.NEXT_PUBLIC_AGORA_APP_ID?.trim()

  // Load Agora SDK
  useEffect(() => {
    const loadAgora = async () => {
      try {
        await import('agora-rtc-sdk-ng')
        console.log('✅ Agora SDK loaded for publisher')
        setAgoraLoaded(true)
      } catch (err) {
        console.error('❌ Failed to load Agora SDK:', err)
        setError('Failed to load video streaming SDK')
      }
    }
    
    loadAgora()
  }, [])

  // Generate a consistent numeric UID for publisher
  const getNumericUid = useCallback(() => {
    if (userProfile?.uid) {
      // Try to convert string UID to number, fallback to hash
      const numericUid = parseInt(userProfile.uid, 10)
      if (!isNaN(numericUid) && numericUid > 0) {
        return numericUid + 20000 // Add different offset to differentiate from streamer and viewers
      }
      // If string UID can't be converted to number, create a hash
      let hash = 0
      for (let i = 0; i < userProfile.uid.length; i++) {
        const char = userProfile.uid.charCodeAt(i)
        hash = ((hash << 5) - hash) + char
        hash = hash & hash // Convert to 32-bit integer
      }
      return Math.abs(hash) + 20000
    }
    return Math.floor(Math.random() * 100000) + 20000 // Random UID for anonymous publishers
  }, [userProfile?.uid])

  // Generate Agora token for publisher
  const generateToken = useCallback(async (channel: string, uid: number) => {
    try {
      console.log('🎫 Generating Agora token for publisher, channel:', channel, 'UID:', uid)
      const response = await fetch(`/api/agora/token?channel=${channel}&uid=${uid}&role=publisher`)
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to generate token')
      }
      
      const data = await response.json()
      console.log('✅ Token generated successfully for publisher UID:', uid)
      return data.token
    } catch (err) {
      console.error('❌ Error generating token:', err)
      throw err
    }
  }, [])

  // Initialize publisher - this runs only once when component mounts
  useEffect(() => {
    const initPublisher = async () => {
      // Prevent multiple initializations
      if (initializedRef.current || !agoraLoaded || !agoraAppId) {
        console.log('🚫 Skipping Agora publisher initialization:', { 
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

        console.log('🎬 Initializing Agora client for publisher with App ID:', agoraAppId)
        console.log('🎬 Channel name:', channelName)
        console.log('🎬 Stream ID:', streamId)
        const AgoraRTCModule = await import('agora-rtc-sdk-ng')
        const client = AgoraRTCModule.default.createClient({
          mode: 'rtc',
          codec: 'vp8'
        })
        
        // Add event listeners
        client.on('connection-state-change', (newState, reason) => {
          console.log('🔗 Publisher connection state changed:', newState, reason)
          setConnectionState(newState)
        })

        client.on('user-joined', (user) => {
          console.log('👤 User joined (publisher sees):', user.uid)
        })

        client.on('user-left', (user) => {
          console.log('👤 User left (publisher sees):', user.uid)
        })

        client.on('user-published', async (user, mediaType) => {
          console.log('📺 User published stream (publisher sees):', user.uid, mediaType)
          try {
            // Add a small delay to ensure the stream is fully ready
            await new Promise(resolve => setTimeout(resolve, 100))
            await client.subscribe(user, mediaType)
            console.log('✅ Subscribed to user stream (publisher):', user.uid, mediaType)
          } catch (err) {
            console.error('❌ Error subscribing to user stream (publisher):', err)
            // Don't treat subscription errors as fatal - the stream might not be ready yet
            console.log('⚠️ Stream subscription failed, will retry on next publish event')
          }
        })

        client.on('user-unpublished', (user, mediaType) => {
          console.log('📺 User unpublished stream (publisher sees):', user.uid, mediaType)
        })

        // Handle connection errors gracefully
        client.on('exception', (event) => {
          console.error('❌ Agora publisher connection exception:', event)
          // Don't treat analytics errors as fatal
          if (String(event.code) === 'CAN_NOT_GET_GATEWAY_SERVER' && event.msg?.includes('statscollector')) {
            console.log('📊 Analytics blocked by browser - this is normal and does not affect functionality')
            return
          }
          // For other errors, show them but don't necessarily fail
          console.warn('Agora publisher exception details:', event)
          // Only set error for critical issues, not analytics or network issues
          if (String(event.code) !== 'CAN_NOT_GET_GATEWAY_SERVER') {
            setError(`Agora Error: ${event.code} - ${event.msg || 'Unknown error'}`)
            setIsConnecting(false)
          }
        })

        // Add error handler for join failures
        client.on('error', (error: any) => {
          console.error('❌ Agora publisher client error:', error)
          setError(`Agora Error: ${error.code} - ${error.message || 'Unknown error'}`)
          setIsConnecting(false)
        })

        clientRef.current = client
        console.log('✅ Agora client created for publisher')

        // Create video and audio tracks
        console.log('📹 Creating video and audio tracks for publisher')
        const [videoTrack, audioTrack] = await Promise.all([
          AgoraRTCModule.default.createCameraVideoTrack({
            encoderConfig: {
              bitrateMin: 1000,
              bitrateMax: 3000,
              width: 1280,
              height: 720,
              frameRate: 30
            }
          }),
          AgoraRTCModule.default.createMicrophoneAudioTrack()
        ])

        videoTrackRef.current = videoTrack
        audioTrackRef.current = audioTrack
        console.log('✅ Video and audio tracks created for publisher')

        // Join channel
        console.log('🎯 Joining Agora channel as publisher:', channelName)
        
        // Get consistent numeric UID
        const uid = getNumericUid()
        console.log('👤 Using publisher UID:', uid)
        
        // Generate token with the same UID
        console.log('🎫 Generating token for channel:', channelName, 'UID:', uid)
        const token = await generateToken(channelName, uid)
        console.log('🎫 Token generated successfully, length:', token?.length || 0)
        
        // Join the channel as publisher
        console.log('🎯 Attempting to join channel with:', {
          appId: agoraAppId.trim(),
          channelName,
          uid,
          tokenLength: token?.length || 0,
          tokenValid: !!token
        })
        
        try {
          console.log('🚀 Calling client.join() for publisher...')
          const joinResult = await client.join(
            agoraAppId.trim(),
            channelName,
            token,
            uid
          )
          
          console.log('✅ Joined channel as publisher successfully, result:', joinResult)

          // Publish tracks
          console.log('📡 Publishing video and audio tracks for publisher')
          await client.publish([videoTrack, audioTrack])
          console.log('✅ Tracks published successfully for publisher')

          // Play video track immediately after publishing
          if (videoElementRef.current) {
            console.log('🎬 Playing publisher video track')
            videoTrack.play(videoElementRef.current)
          } else {
            console.warn('⚠️ Video element not found for publisher playback')
          }

          // Play audio track for publisher to hear themselves
          if (audioElementRef.current) {
            console.log('🔊 Playing publisher audio track')
            audioTrack.play()
          } else {
            console.warn('⚠️ Audio element not found for publisher playback')
          }

          setIsPublishing(true)
          setIsConnecting(false)
          
          if (onJoinComplete) {
            onJoinComplete()
          }
        } catch (joinError) {
          console.error('❌ Failed to join channel as publisher:', joinError)
          console.error('❌ Join error details:', {
            name: joinError instanceof Error ? joinError.name : 'Unknown',
            message: joinError instanceof Error ? joinError.message : 'Unknown error',
            code: (joinError as any)?.code,
            reason: (joinError as any)?.reason
          })
          setError(`Failed to join channel: ${joinError instanceof Error ? joinError.message : 'Unknown error'}`)
          setIsConnecting(false)
          if (onJoinError) {
            onJoinError(joinError instanceof Error ? joinError.message : 'Unknown error')
          }
          throw joinError // Re-throw to be caught by outer try-catch
        }

      } catch (err) {
        console.error('❌ Error initializing publisher:', err)
        if (err instanceof Error) {
          setError(err.message)
          if (onJoinError) {
            onJoinError(err.message)
          }
        } else {
          setError('Failed to start publishing')
          if (onJoinError) {
            onJoinError('Failed to start publishing')
          }
        }
        setIsConnecting(false)
        initializedRef.current = false
      }
    }

    initPublisher()

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
          if (videoTrackRef.current) {
            const videoTrack = videoTrackRef.current as { close: () => void }
            videoTrack.close()
            videoTrackRef.current = null
          }
          if (audioTrackRef.current) {
            const audioTrack = audioTrackRef.current as { close: () => void }
            audioTrack.close()
            audioTrackRef.current = null
          }
        } catch (err) {
          console.error('Error during publisher cleanup:', err)
        }
      }
      cleanup()
    }
    
  }, [agoraLoaded, agoraAppId, channelName, getNumericUid, generateToken, onJoinComplete, onJoinError])

  const stopPublishing = async () => {
    try {
      if (clientRef.current) {
        const client = clientRef.current as { leave: () => Promise<void> }
        await client.leave()
        clientRef.current = null
        initializedRef.current = false
      }
      if (videoTrackRef.current) {
        const videoTrack = videoTrackRef.current as { close: () => void }
        videoTrack.close()
        videoTrackRef.current = null
      }
      if (audioTrackRef.current) {
        const audioTrack = audioTrackRef.current as { close: () => void }
        audioTrack.close()
        audioTrackRef.current = null
      }
      setIsPublishing(false)
      if (onLeave) {
        onLeave()
      }
    } catch (err) {
      console.error('Error stopping publisher:', err)
    }
  }

  const toggleCamera = async () => {
    if (videoTrackRef.current) {
      const videoTrack = videoTrackRef.current as { setEnabled: (enabled: boolean) => Promise<void> }
      await videoTrack.setEnabled(!cameraEnabled)
      setCameraEnabled(!cameraEnabled)
    }
  }

  const toggleMicrophone = async () => {
    if (audioTrackRef.current) {
      const audioTrack = audioTrackRef.current as { setEnabled: (enabled: boolean) => Promise<void> }
      await audioTrack.setEnabled(!microphoneEnabled)
      setMicrophoneEnabled(!microphoneEnabled)
    }
  }

  if (error) {
    return (
      <div className="w-full h-full bg-gray-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="text-red-500 mb-4 text-4xl">⚠️</div>
          <p className="text-lg mb-2">Publishing Error</p>
          <p className="text-sm text-gray-300 mb-4">{error}</p>
          <div className="space-x-2">
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Retry
            </button>
            <button
              onClick={stopPublishing}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Leave
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full h-full bg-gray-900 relative">
      <video
        ref={videoElementRef}
        autoPlay
        playsInline
        muted={false}
        className="w-full h-full object-cover"
        style={{ transform: 'scaleX(-1)' }} // Mirror the video
      />
      
      {/* Hidden audio element for publisher to hear themselves */}
      <audio
        ref={audioElementRef}
        autoPlay
        playsInline
        muted={false}
        className="hidden"
      />
      
      {isConnecting && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-75">
          <div className="text-center text-white">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-lg">Joining Stream...</p>
            <p className="text-sm opacity-75">Channel: {channelName}</p>
            <p className="text-xs opacity-50 mt-2">Note: Analytics errors are normal and do not affect functionality</p>
          </div>
        </div>
      )}

      {!isPublishing && !isConnecting && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
          <div className="text-center text-white">
            <div className="text-gray-400 mb-4 text-4xl">📹</div>
            <p className="text-lg mb-2">Ready to Join</p>
            <p className="text-sm text-gray-300">Connecting to stream...</p>
          </div>
        </div>
      )}

      {/* Publisher Controls */}
      <div className="absolute bottom-4 left-4 right-4">
        <div className="flex items-center justify-between bg-black bg-opacity-50 rounded-lg p-3">
          <div className="flex items-center space-x-3">
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-600 text-white">
              <div className="w-2 h-2 bg-white rounded-full mr-1.5 animate-pulse"></div>
              JOINED
            </span>
            <span className="text-white text-sm">Channel: {channelName}</span>
            <span className="text-white text-sm">Status: {connectionState}</span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={toggleCamera}
              className={`p-2 rounded-md ${cameraEnabled ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'} text-white`}
            >
              {cameraEnabled ? '📹' : '📷'}
            </button>
            <button
              onClick={toggleMicrophone}
              className={`p-2 rounded-md ${microphoneEnabled ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'} text-white`}
            >
              {microphoneEnabled ? '🎤' : '🔇'}
            </button>
            <button
              onClick={stopPublishing}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 flex items-center"
            >
              <span className="mr-2">❌</span>
              Leave
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
