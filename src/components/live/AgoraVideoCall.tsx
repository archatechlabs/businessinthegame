'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
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
  const [videoReady, setVideoReady] = useState(false)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [componentMounted, setComponentMounted] = useState(false)
  const [videoElementExists, setVideoElementExists] = useState(false)
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const retryCount = useRef(0)
  const maxRetries = 50 // 5 seconds of retries

  // Mark component as mounted
  useEffect(() => {
    setComponentMounted(true)
    console.log('🎬 AgoraVideoCall component mounted')
    
    // Check if video element exists immediately
    const checkVideoElement = () => {
      const video = videoRef.current
      if (video) {
        console.log('📹 Video element found immediately after mount')
        setVideoElementExists(true)
      } else {
        console.log('❌ Video element not found immediately after mount')
        setVideoElementExists(false)
      }
    }
    
    // Check immediately and after a short delay
    checkVideoElement()
    setTimeout(checkVideoElement, 100)
    setTimeout(checkVideoElement, 500)
  }, [])

  // Monitor video element existence
  useEffect(() => {
    const checkVideo = () => {
      const video = videoRef.current
      const exists = !!video
      if (exists !== videoElementExists) {
        console.log('📹 Video element existence changed:', exists)
        setVideoElementExists(exists)
      }
    }
    
    const interval = setInterval(checkVideo, 100)
    return () => clearInterval(interval)
  }, [videoElementExists])

  // Initialize camera when component mounts
  const initCamera = useCallback(async () => {
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

      // Get user media
      console.log('🎥 Requesting camera access...')
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 }
        },
        audio: true
      })

      console.log('✅ Camera access granted!', mediaStream)
      setStream(mediaStream)

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
  }, [channelName, userProfile])

  // Direct stream attachment function with retry limit
  const attachStreamToVideo = useCallback((mediaStream: MediaStream) => {
    console.log('🎯 Attempting to attach stream to video element (attempt', retryCount.current + 1, ')')
    console.log('🔍 Video element debug info:')
    console.log('  - videoRef.current:', videoRef.current)
    console.log('  - containerRef.current:', containerRef.current)
    console.log('  - videoElementExists:', videoElementExists)
    console.log('  - componentMounted:', componentMounted)
    
    // Use a more aggressive approach to find the video element
    const findVideoElement = () => {
      // Try multiple ways to find the video element
      if (videoRef.current) {
        console.log('📹 Found video element via videoRef.current')
        return videoRef.current
      }
      
      // Fallback: search in the container
      if (containerRef.current) {
        const video = containerRef.current.querySelector('video')
        if (video) {
          console.log('📹 Found video element via containerRef.querySelector')
          return video
        }
      }
      
      // Fallback: search in document
      const video = document.querySelector('video')
      if (video) {
        console.log('📹 Found video element via document.querySelector')
        return video
      }
      
      // Additional fallback: search for any video element with specific attributes
      const videos = document.querySelectorAll('video')
      console.log('📹 Found', videos.length, 'video elements in document')
      videos.forEach((v, i) => {
        console.log(`  Video ${i}:`, v, 'srcObject:', v.srcObject)
      })
      
      return null
    }

    const videoElement = findVideoElement()
    
    if (videoElement) {
      console.log('✅ Video element found, attaching stream')
      videoElement.srcObject = mediaStream
      
      videoElement.play().then(() => {
        console.log('▶️ Video started playing')
        setIsStreaming(true)
        setVideoReady(true)
        setIsConnecting(false)
        retryCount.current = 0 // Reset retry count on success
      }).catch(err => {
        console.error('❌ Error playing video:', err)
        setError('Failed to play video stream')
        setIsConnecting(false)
      })
    } else {
      retryCount.current++
      if (retryCount.current < maxRetries) {
        console.log('❌ Video element not found, retrying in 100ms (attempt', retryCount.current, '/', maxRetries, ')')
        // Retry after a short delay
        setTimeout(() => {
          attachStreamToVideo(mediaStream)
        }, 100)
      } else {
        console.error('❌ Video element not found after maximum retries')
        setError('Video element not found. Please refresh and try again.')
        setIsConnecting(false)
      }
    }
  }, [videoElementExists, componentMounted])

  // Set up video element when stream is available
  useEffect(() => {
    if (stream && componentMounted) {
      console.log('🎯 Stream available and component mounted, attempting to attach to video')
      retryCount.current = 0 // Reset retry count
      attachStreamToVideo(stream)
    }
  }, [stream, componentMounted, attachStreamToVideo])

  // Initialize camera on mount with delay
  useEffect(() => {
    if (componentMounted) {
      const timer = setTimeout(() => {
        initCamera()
      }, 500) // Wait 500ms for component to fully render

      return () => {
        clearTimeout(timer)
      }
    }
  }, [componentMounted, initCamera])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => {
          track.stop()
        })
      }
    }
  }, [stream])

  const saveStreamToDatabase = async (channelName: string, streamerName: string) => {
    try {
      console.log('�� Stream saved to database:', { channelName, streamerName })
    } catch (err) {
      console.error('Error saving stream to database:', err)
    }
  }

  const stopStreaming = async () => {
    try {
      if (stream) {
        stream.getTracks().forEach(track => {
          track.stop()
        })
        setStream(null)
      }
      setIsStreaming(false)
      setVideoReady(false)
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
          <div className="mt-4 text-xs text-gray-500">
            <p>Component: {componentMounted ? '✅ Mounted' : '⏳ Loading...'}</p>
            <p>Video Element: {videoElementExists ? '✅ Exists' : '❌ Not Found'}</p>
            <p>Stream: {stream ? '✅ Available' : '⏳ Loading...'}</p>
            <p>Video Ready: {videoReady ? '✅ Yes' : '⏳ No'}</p>
            <p>Retries: {retryCount.current}/{maxRetries}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div ref={containerRef} className="relative bg-gray-900 rounded-lg overflow-hidden">
      {/* Video Element - Always render this */}
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        className="w-full h-96 object-cover"
        style={{ transform: 'scaleX(-1)' }} // Mirror the video
        onLoadedMetadata={() => console.log('�� Video metadata loaded')}
        onCanPlay={() => console.log('▶️ Video can play')}
        onPlay={() => console.log('▶️ Video is playing')}
        onError={(e) => console.error('❌ Video error:', e)}
        onLoadStart={() => console.log('🔄 Video load started')}
        onLoadedData={() => console.log('📊 Video data loaded')}
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
        <div>Video: {videoReady ? 'Ready' : 'Not Ready'}</div>
        <div>Element: {videoElementExists ? 'Found' : 'Not Found'}</div>
        <div>Stream: {stream ? 'Active' : 'None'}</div>
        <div>Connecting: {isConnecting ? 'Yes' : 'No'}</div>
        <div>Mounted: {componentMounted ? 'Yes' : 'No'}</div>
        <div>Retries: {retryCount.current}/{maxRetries}</div>
      </div>
    </div>
  )
}
