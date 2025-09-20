'use client'

import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/contexts/AuthContext'

interface AgoraVideoCallProps {
  channelName: string
  onEndCall: () => void
  isHost?: boolean
}

export default function AgoraVideoCall({ channelName, onEndCall }: AgoraVideoCallProps) {
  const { user } = useAuth()
  const [isStreaming, setIsStreaming] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  useEffect(() => {
    const startStream = async () => {
      try {
        // Check if Agora is configured
        if (!process.env.NEXT_PUBLIC_AGORA_APP_ID) {
          throw new Error('Agora App ID not configured')
        }

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
        setError(null)

        // In a real implementation, you would:
        // 1. Initialize Agora RTC client
        // 2. Join the channel
        // 3. Publish the local stream

      } catch (err) {
        console.error('Error starting stream:', err)
        setError(err instanceof Error ? err.message : 'Failed to start stream')
      }
    }

    startStream()

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
        streamRef.current = null
      }
    }
  }, [channelName])

  const stopStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    setIsStreaming(false)
    onEndCall()
  }

  if (error) {
    return (
      <div className="w-full h-full bg-gray-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="text-red-500 mb-4">⚠️</div>
          <p className="text-lg mb-2">Stream Error</p>
          <p className="text-sm text-gray-300">{error}</p>
          <button
            onClick={stopStream}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Close
          </button>
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
      
      {!isStreaming && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-75">
          <div className="text-center text-white">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-lg">Starting Stream...</p>
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
          </div>

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
  )
}
