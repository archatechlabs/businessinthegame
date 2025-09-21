'use client'

import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/contexts/AuthContext'

interface AgoraVideoCallProps {
  channelName: string
  onEndCall: () => void
  isHost?: boolean
}

export default function AgoraVideoCall({ channelName, onEndCall, isHost = false }: AgoraVideoCallProps) {
  const { user, userProfile } = useAuth()
  const [isStreaming, setIsStreaming] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [viewerCount, setViewerCount] = useState(0)
  const [cameraPermission, setCameraPermission] = useState<'granted' | 'denied' | 'prompt' | 'unknown'>('unknown')
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  useEffect(() => {
    const initCamera = async () => {
      try {
        console.log('🎥 Starting camera initialization...')
        setIsConnecting(true)
        setError(null)

        // Check if we're in a secure context
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error('Camera access not supported in this browser')
        }

        // Check camera permissions first
        try {
          const permission = await navigator.permissions.query({ name: 'camera' as PermissionName })
          setCameraPermission(permission.state)
          console.log('📷 Camera permission state:', permission.state)
        } catch (permError) {
          console.log('📷 Could not check camera permission:', permError)
        }

        // Get user media with better error handling
        console.log('🎥 Requesting camera access...')
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            frameRate: { ideal: 30 }
          },
          audio: true
        })

        console.log('✅ Camera access granted!', stream)
        streamRef.current = stream

        // Wait for video element to be available with retry mechanism
        const waitForVideoElement = () => {
          return new Promise<HTMLVideoElement>((resolve, reject) => {
            let attempts = 0
            const maxAttempts = 50 // 5 seconds max wait
            
            const checkVideo = () => {
              attempts++
              console.log(`🔍 Checking for video element (attempt ${attempts}/${maxAttempts})`)
              
              if (videoRef.current) {
                console.log('✅ Video element found!')
                resolve(videoRef.current)
              } else if (attempts >= maxAttempts) {
                reject(new Error('Video element not found after maximum attempts'))
              } else {
                setTimeout(checkVideo, 100) // Check every 100ms
              }
            }
            
            checkVideo()
          })
        }

        // Wait for video element and then set up the stream
        const videoElement = await waitForVideoElement()
        
        // Display the stream in the video element
        videoElement.srcObject = stream
        videoElement.play().then(() => {
          console.log('▶️ Video started playing')
          setIsStreaming(true)
          setIsConnecting(false)
        }).catch(err => {
          console.error('❌ Error playing video:', err)
          setError('Failed to play video stream')
          setIsConnecting(false)
        })

        // In a real implementation, you would:
        // 1. Initialize Agora RTC client
        // 2. Join the channel
        // 3. Publish the local stream

        // Save stream to database
        await saveStreamToDatabase(channelName, userProfile?.username || 'Unknown')

      } catch (err) {
        console.error('❌ Error initializing camera:', err)
        if (err instanceof Error) {
          if (err.name === 'NotAllowedError') {
            setError('Camera access denied. Please allow camera access and try again.')
            setCameraPermission('denied')
          } else if (err.name === 'NotFoundError') {
            setError('No camera found. Please connect a camera and try again.')
          } else if (err.name === 'NotReadableError') {
            setError('Camera is being used by another application. Please close other apps and try again.')
          } else {
            setError(err.message)
          }
        } else {
          setError('Failed to start stream')
        }
        setIsConnecting(false)
      }
    }

    // Add a small delay to ensure the component is fully rendered
    const timer = setTimeout(() => {
      initCamera()
    }, 100)

    return () => {
      clearTimeout(timer)
      cleanup()
    }
  }, [channelName, user, userProfile])

  const cleanup = async () => {
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => {
          track.stop()
        })
        streamRef.current = null
      }
      setIsStreaming(false)
    } catch (err) {
      console.error('Error during cleanup:', err)
    }
  }

  const saveStreamToDatabase = async (channelName: string, streamerName: string) => {
    try {
      // This would save the stream to your database
      console.log('💾 Stream saved to database:', { channelName, streamerName })
    } catch (err) {
      console.error('Error saving stream to database:', err)
    }
  }

  const stopStreaming = async () => {
    try {
      await cleanup()
      onEndCall()
    } catch (err) {
      console.error('Error stopping stream:', err)
    }
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-900 rounded-lg">
        <div className="text-center text-white p-6">
          <div className="text-red-400 text-6xl mb-4">⚠️</div>
          <h3 className="text-xl font-semibold mb-2">Stream Error</h3>
          <p className="text-gray-300 mb-4">{error}</p>
          {cameraPermission === 'denied' && (
            <div className="text-sm text-gray-400 mb-4">
              <p>To fix this:</p>
              <ol className="list-decimal list-inside space-y-1 mt-2">
                <li>Click the camera icon in your browser&apos;s address bar</li>
                <li>Select &quot;Allow&quot; for camera access</li>
                <li>Refresh the page and try again</li>
              </ol>
            </div>
          )}
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  if (isConnecting) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-900 rounded-lg">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-lg">Starting camera...</p>
          <p className="text-sm text-gray-400 mt-2">Please allow camera access when prompted</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative bg-gray-900 rounded-lg overflow-hidden">
      {/* Video Element */}
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        className="w-full h-96 object-cover"
        style={{ transform: 'scaleX(-1)' }} // Mirror the video
        onLoadedMetadata={() => console.log('📹 Video metadata loaded')}
        onCanPlay={() => console.log('▶️ Video can play')}
        onPlay={() => console.log('▶️ Video is playing')}
        onError={(e) => console.error('❌ Video error:', e)}
      />
      
      {/* Overlay Controls */}
      <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <div className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
            🔴 LIVE
          </div>
          <div className="bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
            👥 {viewerCount} viewers
          </div>
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={stopStreaming}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center space-x-2"
          >
            <span>⏹️</span>
            <span>End Stream</span>
          </button>
        </div>
      </div>

      {/* Stream Info Overlay */}
      <div className="absolute top-4 left-4 bg-black bg-opacity-50 text-white p-3 rounded-lg">
        <div className="text-sm">
          <div><strong>Channel:</strong> {channelName}</div>
          <div><strong>Streamer:</strong> {userProfile?.username || 'Unknown'}</div>
          <div><strong>Quality:</strong> {process.env.NEXT_PUBLIC_AGORA_APP_ID ? 'HD' : 'Not configured'}</div>
        </div>
      </div>

      {/* Debug Info */}
      <div className="absolute top-4 right-4 bg-black bg-opacity-50 text-white p-2 rounded text-xs">
        <div>Status: {isStreaming ? 'Streaming' : 'Not Streaming'}</div>
        <div>Camera: {cameraPermission}</div>
        <div>Video: {videoRef.current ? 'Ready' : 'Not Ready'}</div>
      </div>
    </div>
  )
}
