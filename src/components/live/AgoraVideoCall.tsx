'use client'

import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/contexts/AuthContext'

interface AgoraVideoCallProps {
  channelName: string
  onEndCall: () => void
  isHost?: boolean
}

export default function AgoraVideoCall({ channelName, onEndCall }: AgoraVideoCallProps) {
  const { user, userProfile } = useAuth()
  const [isStreaming, setIsStreaming] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [viewerCount, setViewerCount] = useState(0)
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  useEffect(() => {
    const initAgora = async () => {
      try {
        // Check if Agora is configured
        if (!process.env.NEXT_PUBLIC_AGORA_APP_ID) {
          throw new Error('Agora App ID not configured')
        }

        setIsConnecting(true)
        setError(null)

        // Get user media
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            frameRate: { ideal: 30 }
          },
          audio: true
        })

        streamRef.current = stream

        // Display the stream in the video element
        if (videoRef.current) {
          videoRef.current.srcObject = stream
        }

        setIsStreaming(true)
        setIsConnecting(false)

        // In a real implementation, you would:
        // 1. Initialize Agora RTC client
        // 2. Join the channel
        // 3. Publish the local stream

        // Save stream to database
        await saveStreamToDatabase(channelName, userProfile?.username || 'Unknown')

      } catch (err) {
        console.error('Error initializing Agora:', err)
        setError(err instanceof Error ? err.message : 'Failed to start stream')
        setIsConnecting(false)
      }
    }

    initAgora()

    return () => {
      cleanup()
    }
  }, [channelName, user, userProfile])

  const cleanup = async () => {
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
        streamRef.current = null
      }
    } catch (err) {
      console.error('Error during cleanup:', err)
    }
  }

  const stopStream = async () => {
    try {
      await cleanup()
      setIsStreaming(false)
      setViewerCount(0)
      onEndCall()
    } catch (err) {
      console.error('Error stopping stream:', err)
    }
  }

  const toggleMute = async () => {
    if (streamRef.current) {
      const audioTracks = streamRef.current.getAudioTracks()
      audioTracks.forEach(track => {
        track.enabled = !track.enabled
      })
    }
  }

  const toggleVideo = async () => {
    if (streamRef.current) {
      const videoTracks = streamRef.current.getVideoTracks()
      videoTracks.forEach(track => {
        track.enabled = !track.enabled
      })
    }
  }

  const saveStreamToDatabase = async (channel: string, streamer: string) => {
    try {
      // In production, save to your database
      console.log('Saving stream to database:', { channel, streamer, timestamp: new Date() })
      // await db.collection('streams').add({
      //   channelName: channel,
      //   streamer: streamer,
      //   startTime: new Date(),
      //   isLive: true,
      //   viewerCount: 0
      // })
    } catch (err) {
      console.error('Error saving stream to database:', err)
    }
  }

  if (error) {
    return (
      <div className="w-full h-full bg-gray-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="text-red-500 mb-4 text-4xl">⚠️</div>
          <p className="text-lg mb-2">Stream Error</p>
          <p className="text-sm text-gray-300 mb-4">{error}</p>
          <div className="space-x-2">
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Retry
            </button>
            <button
              onClick={stopStream}
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
        muted
        playsInline
        className="w-full h-full object-cover"
      />
      
      {isConnecting && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-75">
          <div className="text-center text-white">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-lg">Connecting to Agora...</p>
            <p className="text-sm opacity-75">Channel: {channelName}</p>
          </div>
        </div>
      )}

      {/* Stream Controls */}
      <div className="absolute bottom-4 left-4 right-4">
        <div className="flex items-center justify-between bg-black bg-opacity-50 rounded-lg p-3">
          <div className="flex items-center space-x-3">
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-600 text-white">
              <div className="w-2 h-2 bg-white rounded-full mr-1.5 animate-pulse"></div>
              LIVE
            </span>
            <span className="text-white text-sm">Channel: {channelName}</span>
            <span className="text-white text-sm">Viewers: {viewerCount}</span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={toggleMute}
              className="p-2 bg-gray-600 text-white rounded hover:bg-gray-700"
              title="Toggle Microphone"
            >
              🎤
            </button>
            <button
              onClick={toggleVideo}
              className="p-2 bg-gray-600 text-white rounded hover:bg-gray-700"
              title="Toggle Camera"
            >
              📹
            </button>
            <button
              onClick={stopStream}
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
