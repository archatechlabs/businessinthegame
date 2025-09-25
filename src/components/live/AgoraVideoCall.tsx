'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import EmojiReactions from './EmojiReactions'

interface AgoraVideoCallProps {
  channelName: string
  onStreamEnd: () => void
  isHost?: boolean
}

export default function AgoraVideoCall({ channelName, onStreamEnd, isHost = true }: AgoraVideoCallProps) {
  const { userProfile } = useAuth()
  const [isStreaming, setIsStreaming] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [cameraEnabled, setCameraEnabled] = useState(true)
  const [microphoneEnabled, setMicrophoneEnabled] = useState(true)
  const [viewerCount, setViewerCount] = useState(0)
  const [agoraLoaded, setAgoraLoaded] = useState(false)
  const [connectionState, setConnectionState] = useState<string>('disconnected')
  const [componentMounted, setComponentMounted] = useState(false)
  const [reactionCount, setReactionCount] = useState(0)
  const [streamSaved, setStreamSaved] = useState(false)
  const [currentStreamId, setCurrentStreamId] = useState<string | null>(null)
  const [remoteUsers, setRemoteUsers] = useState<Map<number, { videoTrack?: any, audioTrack?: any, name?: string }>>(new Map())
  
  const clientRef = useRef<unknown>(null)
  const videoTrackRef = useRef<unknown>(null)
  const audioTrackRef = useRef<unknown>(null)
  const videoElementRef = useRef<HTMLVideoElement>(null)
  const audioElementRef = useRef<HTMLAudioElement>(null)
  const remoteVideoRefs = useRef<Map<number, HTMLVideoElement>>(new Map())
  const initializedRef = useRef(false)

  // Check Agora App ID availability
  const agoraAppId = process.env.NEXT_PUBLIC_AGORA_APP_ID?.trim()

  if (!agoraAppId) {
    console.error('❌ Agora App ID not configured')
  }

  // Load Agora SDK
  useEffect(() => {
    const loadAgora = async () => {
      try {
        await import('agora-rtc-sdk-ng')
        console.log('✅ Agora SDK loaded for streamer')
        setAgoraLoaded(true)
      } catch (err) {
        console.error('❌ Failed to load Agora SDK:', err)
        setError('Failed to load video streaming SDK')
      }
    }
    
    loadAgora()
  }, [])

  // Generate a consistent numeric UID for streamer
  const getNumericUid = useCallback(() => {
    if (userProfile?.uid) {
      // Try to convert string UID to number, fallback to hash
      const numericUid = parseInt(userProfile.uid, 10)
      if (!isNaN(numericUid) && numericUid > 0) {
        return numericUid
      }
      // If string UID can't be converted to number, create a hash
      let hash = 0
      for (let i = 0; i < userProfile.uid.length; i++) {
        const char = userProfile.uid.charCodeAt(i)
        hash = ((hash << 5) - hash) + char
        hash = hash & hash // Convert to 32-bit integer
      }
      return Math.abs(hash)
    }
    return Math.floor(Math.random() * 100000) // Random UID for anonymous streamers
  }, [userProfile?.uid])

  // Generate Agora token for streamer
  const generateToken = useCallback(async (channel: string, uid: number) => {
    try {
      console.log('🎫 Generating Agora token for streamer, channel:', channel, 'UID:', uid)
      const response = await fetch(`/api/agora/token?channel=${channel}&uid=${uid}&role=publisher`)
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to generate token')
      }
      
      const data = await response.json()
      console.log('✅ Token generated successfully for streamer UID:', uid)
      return data.token
    } catch (err) {
      console.error('❌ Error generating token:', err)
      throw err
    }
  }, [])

  // Save stream to database
  const saveStreamToDatabase = useCallback(async (streamData: Record<string, unknown>) => {
    try {
      console.log('💾 Saving stream to database:', streamData)
      const response = await fetch('/api/streams', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(streamData),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ Stream save failed:', response.status, errorText)
        throw new Error(`Failed to save stream: ${response.status} ${errorText}`)
      }

      const result = await response.json()
      console.log('✅ Stream saved successfully:', result)
      setStreamSaved(true)
      return result
    } catch (err) {
      console.error('❌ Error saving stream:', err)
      // Don't throw the error, just log it and continue streaming
      console.warn('⚠️ Stream will continue without database save')
      setStreamSaved(false)
      return null
    }
  }, [])

  // Handle emoji reaction
  const handleReaction = useCallback((emoji: string) => {
    setReactionCount(prev => prev + 1)
    console.log('🎉 Emoji reaction received:', emoji)
    
    // In a real app, you would broadcast this reaction to all viewers via WebSocket
    // For now, we'll just log it
  }, [])

  // Initialize streamer - this runs only once when component mounts
  useEffect(() => {
    const initStreamer = async () => {
      // Prevent multiple initializations
      if (initializedRef.current || !agoraLoaded || !agoraAppId) {
        return
      }

      try {
        initializedRef.current = true
        setIsConnecting(true)
        setError(null)

        console.log('🎬 Initializing Agora client for streamer with App ID:', agoraAppId)
        const AgoraRTCModule = await import('agora-rtc-sdk-ng')
        const client = AgoraRTCModule.default.createClient({
          mode: 'rtc',
          codec: 'vp8'
        })
        
        // Add event listeners
        client.on('connection-state-change', (newState, reason) => {
          console.log('�� Streamer connection state changed:', newState, reason)
          setConnectionState(newState)
        })

        client.on('user-joined', (user) => {
          console.log('👤 User joined (streamer sees):', user.uid)
          setViewerCount(prev => prev + 1)
        })

        client.on('user-left', (user) => {
          console.log('👤 User left (streamer sees):', user.uid)
          setViewerCount(prev => Math.max(0, prev - 1))
          // Remove user from remote users
          setRemoteUsers(prev => {
            const newMap = new Map(prev)
            newMap.delete(user.uid)
            return newMap
          })
        })

        // Handle remote user streams
        client.on('user-published', async (user, mediaType) => {
          console.log('📺 User published stream (streamer sees):', user.uid, mediaType)
          try {
            // Add a small delay to ensure the stream is fully ready
            await new Promise(resolve => setTimeout(resolve, 100))
            await client.subscribe(user, mediaType)
            console.log('✅ Subscribed to user stream (streamer):', user.uid, mediaType)
            
            // Update remote users state
            setRemoteUsers(prev => {
              const newMap = new Map(prev)
              const existingUser = newMap.get(user.uid) || {}
              if (mediaType === 'video') {
                existingUser.videoTrack = user.videoTrack
              }
              if (mediaType === 'audio') {
                existingUser.audioTrack = user.audioTrack
              }
              newMap.set(user.uid, existingUser)
              return newMap
            })
          } catch (err) {
            console.error('❌ Error subscribing to user stream (streamer):', err)
          }
        })

        client.on('user-unpublished', (user, mediaType) => {
          console.log('📺 User unpublished stream (streamer sees):', user.uid, mediaType)
          setRemoteUsers(prev => {
            const newMap = new Map(prev)
            const existingUser = newMap.get(user.uid)
            if (existingUser) {
              if (mediaType === 'video') {
                existingUser.videoTrack = undefined
              }
              if (mediaType === 'audio') {
                existingUser.audioTrack = undefined
              }
              if (!existingUser.videoTrack && !existingUser.audioTrack) {
                newMap.delete(user.uid)
              } else {
                newMap.set(user.uid, existingUser)
              }
            }
            return newMap
          })
        })

        // Handle connection errors gracefully
        client.on('exception', (event) => {
          console.warn('⚠️ Agora connection exception:', event)
          // Don't treat analytics errors as fatal
          if (String(event.code) === 'CAN_NOT_GET_GATEWAY_SERVER' && event.msg?.includes('statscollector')) {
            console.log('📊 Analytics blocked by browser - this is normal and does not affect functionality')
            return
          }
          // For other errors, show them but don't necessarily fail
          console.warn('Agora exception details:', event)
        })

        clientRef.current = client
        console.log('✅ Agora client created for streamer')

        // Create video and audio tracks
        console.log('📹 Creating video and audio tracks')
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
        console.log('✅ Video and audio tracks created')

        // Join channel
        console.log('🎯 Joining Agora channel as streamer:', channelName)
        
        // Get consistent numeric UID
        const uid = getNumericUid()
        console.log('👤 Using streamer UID:', uid)
        
        // Generate token with the same UID
        const token = await generateToken(channelName, uid)
        
        // Join the channel as streamer
        await client.join(
          agoraAppId.trim(),
          channelName,
          token,
          uid
        )
        
        console.log('✅ Joined channel as streamer successfully')

        // Publish tracks
        console.log('📡 Publishing video and audio tracks')
        await client.publish([videoTrack, audioTrack])
        console.log('✅ Tracks published successfully')

        // Play video track immediately after publishing
        if (videoElementRef.current) {
          console.log('🎬 Playing video track')
          videoTrack.play(videoElementRef.current)
        } else {
          console.warn('⚠️ Video element not found for playback')
        }

        // Play audio track for streamer to hear themselves
        if (audioElementRef.current) {
          console.log('🔊 Playing audio track for streamer')
          audioTrack.play()
        } else {
          console.warn('⚠️ Audio element not found for playback')
        }

        // Try to save stream to database (non-blocking)
        const streamData = {
          title: `Live Stream - ${userProfile?.name || 'Anonymous'}`,
          description: `Live stream from ${userProfile?.name || 'Anonymous'}`,
          channelName: channelName,
          streamerName: userProfile?.name || 'Anonymous',
          streamerUsername: userProfile?.username || 'anonymous',
          streamerAvatar: userProfile?.avatar || '',
          startTime: new Date(),
          endTime: null,
          thumbnail: userProfile?.avatar || '',
          tags: ['live', 'streaming'],
          category: 'general',
          quality: 'HD',
          isLive: true,
          isAdminStream: userProfile?.role === 'super-admin',
          viewerCount: 0
        }

        // Save stream asynchronously - don't block streaming if it fails
        saveStreamToDatabase(streamData).then(result => {
          if (result) {
            console.log('✅ Stream saved to database with ID:', result.id)
          } else {
            console.warn('⚠️ Stream not saved to database, but streaming continues')
          }
        }).catch(err => {
          console.warn('⚠️ Stream save failed, but streaming continues:', err)
        })

        setIsStreaming(true)
        setIsConnecting(false)
        setComponentMounted(true)

      } catch (err) {
        console.error('❌ Error initializing streamer:', err)
        if (err instanceof Error) {
          setError(err.message)
        } else {
          setError('Failed to start streaming')
        }
        setIsConnecting(false)
        initializedRef.current = false
      }
    }

    initStreamer()

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
          console.error('Error during cleanup:', err)
        }
      }
      cleanup()
    }
  }, [agoraLoaded, agoraAppId, channelName, getNumericUid, generateToken, saveStreamToDatabase])

  const stopStreaming = async () => {
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
      setIsStreaming(false)
      setViewerCount(0)
      onStreamEnd()
    } catch (err) {
      console.error('Error stopping stream:', err)
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

  // Handle playing remote video tracks when they become available
  useEffect(() => {
    remoteUsers.forEach((user, uid) => {
      if (user.videoTrack) {
        const videoElement = remoteVideoRefs.current.get(uid)
        if (videoElement) {
          user.videoTrack.play(videoElement)
        }
      }
    })
  }, [remoteUsers])

  if (error) {
    return (
      <div className="w-full h-full bg-gray-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="text-red-500 mb-4 text-4xl">⚠️</div>
          <p className="text-lg mb-2">Streaming Error</p>
          <p className="text-sm text-gray-300 mb-4">{error}</p>
          <div className="space-x-2">
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Retry
            </button>
            <button
              onClick={stopStreaming}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Stop Stream
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full h-full bg-gray-900 relative">
      {remoteUsers.size > 0 ? (
        // Split screen view when someone joins
        <div className="grid grid-cols-2 gap-2 h-full">
          {/* Streamer's video */}
          <div className="relative">
            <video
              ref={videoElementRef}
              autoPlay
              playsInline
              muted={false}
              className="w-full h-full object-cover"
              style={{ transform: 'scaleX(-1)' }} // Mirror the video
            />
            <div className="absolute top-2 left-2 bg-blue-600 text-white px-2 py-1 rounded text-sm">
              You (Host)
            </div>
          </div>
          
          {/* Remote users' videos */}
          <div className="relative">
            {Array.from(remoteUsers.entries()).map(([uid, user]) => (
              <div key={uid} className="w-full h-full">
                <video
                  ref={(el) => {
                    if (el) {
                      remoteVideoRefs.current.set(uid, el)
                      // Play the video track when element is ready
                      if (user.videoTrack) {
                        user.videoTrack.play(el)
                      }
                    }
                  }}
                  autoPlay
                  playsInline
                  muted={false}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 left-2 bg-green-600 text-white px-2 py-1 rounded text-sm">
                  User {uid}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        // Single streamer view when no one has joined
        <video
          ref={videoElementRef}
          autoPlay
          playsInline
          muted={false}
          className="w-full h-full object-cover"
          style={{ transform: 'scaleX(-1)' }} // Mirror the video
        />
      )}
      
      {/* Hidden audio element for streamer to hear themselves */}
      <audio
        ref={audioElementRef}
        autoPlay
        playsInline
        muted={false}
        className="hidden"
      />
      
      {/* Emoji Reactions Overlay */}
      <EmojiReactions streamId={currentStreamId || ""} onReaction={handleReaction} />
      
      {isConnecting && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-75">
          <div className="text-center text-white">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-lg">Starting Stream...</p>
            <p className="text-sm opacity-75">Channel: {channelName}</p>
            <p className="text-xs opacity-50 mt-2">Note: Analytics errors are normal and do not affect functionality</p>
          </div>
        </div>
      )}

      {!isStreaming && !isConnecting && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
          <div className="text-center text-white">
            <div className="text-gray-400 mb-4 text-4xl">📹</div>
            <p className="text-lg mb-2">Ready to Stream</p>
            <p className="text-sm text-gray-300">Click start to begin your live stream</p>
          </div>
        </div>
      )}

      {/* Streamer Controls */}
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
            {!streamSaved && (
              <span className="text-orange-400 text-sm">⚠️ DB save failed</span>
            )}
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
              onClick={stopStreaming}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 flex items-center"
            >
              <span className="mr-2">⏹️</span>
              End Stream
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
