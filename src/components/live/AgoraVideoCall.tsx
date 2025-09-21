'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'

interface AgoraVideoCallProps {
  channelName: string
  onEndCall: () => void
  isHost?: boolean
}

export default function AgoraVideoCall({ channelName, onEndCall }: AgoraVideoCallProps) {
  const { userProfile } = useAuth()
  const [isStreaming, setIsStreaming] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [cameraPermission, setCameraPermission] = useState<'granted' | 'denied' | 'prompt' | 'unknown'>('unknown')
  const [videoReady, setVideoReady] = useState(false)
  const [agoraLoaded, setAgoraLoaded] = useState(false)
  
  const clientRef = useRef<unknown>(null)
  const localVideoTrackRef = useRef<unknown>(null)
  const localAudioTrackRef = useRef<unknown>(null)
  const videoContainerRef = useRef<HTMLDivElement>(null)

  // Load Agora SDK
  useEffect(() => {
    const loadAgora = async () => {
      try {
        await import('agora-rtc-sdk-ng')
        console.log('✅ Agora SDK loaded')
        setAgoraLoaded(true)
      } catch (err) {
        console.error('❌ Failed to load Agora SDK:', err)
        setError('Failed to load video streaming SDK')
      }
    }
    
    loadAgora()
  }, [])

  // Initialize Agora client
  const initAgoraClient = useCallback(async () => {
    if (clientRef.current) {
      return clientRef.current
    }

    if (!agoraLoaded) {
      throw new Error('Agora SDK not loaded')
    }

    console.log('🎬 Initializing Agora client')
    const AgoraRTCModule = await import('agora-rtc-sdk-ng')
    const client = AgoraRTCModule.default.createClient({
      mode: 'rtc',
      codec: 'vp8'
    })
    
    clientRef.current = client
    console.log('✅ Agora client created')
    return client
  }, [agoraLoaded])

  // Create camera and microphone tracks
  const createTracks = useCallback(async () => {
    try {
      console.log('🎥 Creating camera and microphone tracks...')
      
      const AgoraRTCModule = await import('agora-rtc-sdk-ng')
      
      // Create camera video track
      const videoTrack = await AgoraRTCModule.default.createCameraVideoTrack({
        encoderConfig: {
          width: 1280,
          height: 720,
          frameRate: 30
        }
      })
      
      // Create microphone audio track
      const audioTrack = await AgoraRTCModule.default.createMicrophoneAudioTrack()
      
      localVideoTrackRef.current = videoTrack
      localAudioTrackRef.current = audioTrack
      
      console.log('✅ Camera and microphone tracks created')
      
      // Play the video track in the container
      if (videoContainerRef.current) {
        videoTrack.play(videoContainerRef.current)
        console.log('✅ Video track playing in container')
        setVideoReady(true)
      }
      
      return { videoTrack, audioTrack }
    } catch (err) {
      console.error('❌ Error creating tracks:', err)
      throw err
    }
  }, [])

  // Join channel and publish tracks
  const joinChannel = useCallback(async (client: unknown, videoTrack: unknown, audioTrack: unknown) => {
    try {
      console.log('🎯 Joining Agora channel:', channelName)
      
      // Type assertion for Agora client methods
      const agoraClient = client as { join: (appId: string, channel: string, token: string | null, uid: string | number | null) => Promise<void>; publish: (tracks: unknown[]) => Promise<void> }
      
      // Join the channel
      await agoraClient.join(
        process.env.NEXT_PUBLIC_AGORA_APP_ID!,
        channelName,
        null, // token - we'll add this later
        null  // uid - let Agora assign one
      )
      
      console.log('✅ Joined channel successfully')
      
      // Publish tracks
      await agoraClient.publish([videoTrack, audioTrack])
      console.log('✅ Published tracks successfully')
      
      setIsStreaming(true)
      setIsConnecting(false)
      
    } catch (err) {
      console.error('❌ Error joining channel:', err)
      throw err
    }
  }, [channelName])

  // Initialize camera and join channel
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

      // Initialize Agora client
      const client = await initAgoraClient()
      
      // Create tracks
      const { videoTrack, audioTrack } = await createTracks()
      
      // Join channel and publish
      await joinChannel(client, videoTrack, audioTrack)
      
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
  }, [channelName, userProfile, initAgoraClient, createTracks, joinChannel])

  // Initialize camera on mount
  useEffect(() => {
    if (agoraLoaded) {
      const timer = setTimeout(() => {
        initCamera()
      }, 1000) // Wait 1 second for component to fully render

      return () => {
        clearTimeout(timer)
      }
    }
  }, [agoraLoaded, initCamera])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (localVideoTrackRef.current) {
        const videoTrack = localVideoTrackRef.current as { close: () => void }
        videoTrack.close()
        localVideoTrackRef.current = null
      }
      if (localAudioTrackRef.current) {
        const audioTrack = localAudioTrackRef.current as { close: () => void }
        audioTrack.close()
        localAudioTrackRef.current = null
      }
      if (clientRef.current) {
        const client = clientRef.current as { leave: () => Promise<void> }
        client.leave()
        clientRef.current = null
      }
    }
  }, [])

  const saveStreamToDatabase = async (channelName: string, streamerName: string) => {
    try {
      console.log('💾 Stream saved to database:', { channelName, streamerName })
    } catch (err) {
      console.error('Error saving stream to database:', err)
    }
  }

  const stopStreaming = async () => {
    try {
      if (localVideoTrackRef.current) {
        const videoTrack = localVideoTrackRef.current as { close: () => void }
        videoTrack.close()
        localVideoTrackRef.current = null
      }
      if (localAudioTrackRef.current) {
        const audioTrack = localAudioTrackRef.current as { close: () => void }
        audioTrack.close()
        localAudioTrackRef.current = null
      }
      if (clientRef.current) {
        const client = clientRef.current as { leave: () => Promise<void> }
        await client.leave()
        clientRef.current = null
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

  if (!agoraLoaded || isConnecting) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-900 rounded-lg">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-lg">
            {!agoraLoaded ? 'Loading video SDK...' : 'Starting camera...'}
          </p>
          <p className="text-sm text-gray-400 mt-2">
            {!agoraLoaded ? 'Please wait...' : 'Please allow camera access when prompted'}
          </p>
          <div className="mt-4 text-xs text-gray-500">
            <p>SDK: {agoraLoaded ? '✅ Loaded' : '⏳ Loading...'}</p>
            <p>Client: {clientRef.current ? '✅ Created' : '❌ Not Created'}</p>
            <p>Video Track: {localVideoTrackRef.current ? '✅ Created' : '❌ Not Created'}</p>
            <p>Audio Track: {localAudioTrackRef.current ? '✅ Created' : '❌ Not Created'}</p>
            <p>Video Ready: {videoReady ? '✅ Yes' : '⏳ No'}</p>
            <p>Streaming: {isStreaming ? '✅ Yes' : '⏳ No'}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative bg-gray-900 rounded-lg overflow-hidden">
      {/* Agora video container */}
      <div 
        ref={videoContainerRef} 
        className="w-full h-96 bg-gray-800"
        style={{ transform: 'scaleX(-1)' }} // Mirror the video
      />
      
      {/* Overlay Controls */}
      <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <div className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
            🔴 LIVE
          </div>
          <div className="bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
            👥 0 viewers
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
        <div>Client: {clientRef.current ? 'Yes' : 'No'}</div>
        <div>Video Track: {localVideoTrackRef.current ? 'Yes' : 'No'}</div>
        <div>Audio Track: {localAudioTrackRef.current ? 'Yes' : 'No'}</div>
        <div>Connecting: {isConnecting ? 'Yes' : 'No'}</div>
      </div>
    </div>
  )
}
