'use client'

import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/contexts/AuthContext'

interface AgoraViewerProps {
  channelName: string
  onLeave: () => void
}

export default function AgoraViewer({ channelName, onLeave }: AgoraViewerProps) {
  const { user } = useAuth()
  const [isViewing, setIsViewing] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [viewerCount, setViewerCount] = useState(0)
  
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const initAgora = async () => {
      try {
        // Check if Agora is configured
        if (!process.env.NEXT_PUBLIC_AGORA_APP_ID) {
          throw new Error('Agora App ID not configured')
        }

        setIsConnecting(true)
        setError(null)

        // In a real implementation, you would:
        // 1. Initialize Agora RTC client
        // 2. Join the channel
        // 3. Subscribe to remote streams

        setIsViewing(true)
        setIsConnecting(false)

      } catch (err) {
        console.error('Error initializing Agora viewer:', err)
        setError(err instanceof Error ? err.message : 'Failed to start viewing')
        setIsConnecting(false)
      }
    }

    initAgora()

    return () => {
      cleanup()
    }
  }, [channelName, user])

  const cleanup = async () => {
    try {
      // Cleanup logic here
    } catch (err) {
      console.error('Error during cleanup:', err)
    }
  }

  const stopViewing = async () => {
    try {
      await cleanup()
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
        className="w-full h-full object-cover"
      />
      
      {isConnecting && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-75">
          <div className="text-center text-white">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-lg">Connecting to Stream...</p>
            <p className="text-sm opacity-75">Channel: {channelName}</p>
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
