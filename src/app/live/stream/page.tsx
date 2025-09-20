'use client'

import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  VideoCameraIcon, 
  StopIcon, 
  MicrophoneIcon,
  UserGroupIcon,
  Cog6ToothIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import { canUserStream, getStreamingTier, getStreamQuality, generateChannelName } from '@/utils/agora'
import AgoraVideoCall from '@/components/live/AgoraVideoCall'

export default function StreamPage() {
  const { user, userProfile } = useAuth()
  const router = useRouter()
  const [isStreaming, setIsStreaming] = useState(false)
  const [streamTitle, setStreamTitle] = useState('')
  const [streamDescription, setStreamDescription] = useState('')
  const [viewerCount, setViewerCount] = useState(0)
  const [streamingTier, setStreamingTier] = useState<'free' | 'premium' | 'vip'>('free')
  const [channelName, setChannelName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!user || !userProfile) {
      router.push('/signin')
      return
    }

    // Check if user can stream
    if (!canUserStream(userProfile.role, userProfile.tier)) {
      router.push('/live')
      return
    }

    // Set streaming tier
    setStreamingTier(getStreamingTier(userProfile.role, userProfile.tier))
    
    // Generate channel name
    setChannelName(generateChannelName())
  }, [user, userProfile, router])

  const startStream = async () => {
    if (!streamTitle.trim()) {
      setError('Please enter a stream title')
      return
    }

    setLoading(true)
    setError('')

    try {
      // Check if Agora is configured
      if (!process.env.NEXT_PUBLIC_AGORA_APP_ID) {
        throw new Error('Agora is not configured. Please check your environment variables.')
      }

      // Start streaming
      setIsStreaming(true)
      setViewerCount(0)

      // Simulate viewer count updates
      const viewerInterval = setInterval(() => {
        setViewerCount(prev => prev + Math.floor(Math.random() * 3))
      }, 5000)

      return () => clearInterval(viewerInterval)

    } catch (err) {
      console.error('Error starting stream:', err)
      setError(err instanceof Error ? err.message : 'Failed to start stream.')
    } finally {
      setLoading(false)
    }
  }

  const stopStream = () => {
    setIsStreaming(false)
    setViewerCount(0)
  }

  const streamQuality = getStreamQuality(streamingTier)

  if (!user || !userProfile) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <VideoCameraIcon className="h-8 w-8 mr-3 text-blue-600" />
                Live Streaming
              </h1>
              <p className="mt-2 text-gray-600">
                {streamingTier === 'free' ? 'Admin Stream' : `${streamingTier.charAt(0).toUpperCase() + streamingTier.slice(1)} Stream`}
              </p>
            </div>
            
            <Link
              href="/live"
              className="text-gray-600 hover:text-gray-900"
            >
              ← Back to Live Streams
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Stream Preview */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="relative">
                {isStreaming ? (
                  <div className="w-full h-96 bg-gray-900">
                    <AgoraVideoCall
                      channelName={channelName}
                      onEndCall={stopStream}
                      isHost={true}
                    />
                  </div>
                ) : (
                  <div className="w-full h-96 bg-gray-900 flex items-center justify-center">
                    <div className="text-center text-white">
                      <VideoCameraIcon className="h-16 w-16 mx-auto mb-4 opacity-50" />
                      <p className="text-lg">Ready to Stream</p>
                      <p className="text-sm opacity-75">Start streaming to go live</p>
                    </div>
                  </div>
                )}

                {/* Stream Controls Overlay */}
                {isStreaming && (
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="flex items-center justify-between bg-black bg-opacity-50 rounded-lg p-3">
                      <div className="flex items-center space-x-3">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-600 text-white">
                          <div className="w-2 h-2 bg-white rounded-full mr-1.5 animate-pulse"></div>
                          LIVE
                        </span>
                      </div>

                      <div className="flex items-center text-white">
                        <UserGroupIcon className="h-5 w-5 mr-2" />
                        <span className="text-sm font-medium">{viewerCount} viewers</span>
                      </div>

                      <button
                        onClick={stopStream}
                        className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 flex items-center"
                      >
                        <StopIcon className="h-4 w-4 mr-2" />
                        End Stream
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Stream Info */}
              <div className="p-6">
                {!isStreaming ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Stream Title *
                      </label>
                      <input
                        type="text"
                        value={streamTitle}
                        onChange={(e) => setStreamTitle(e.target.value)}
                        placeholder="Enter your stream title"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description
                      </label>
                      <textarea
                        value={streamDescription}
                        onChange={(e) => setStreamDescription(e.target.value)}
                        placeholder="Describe your stream (optional)"
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    {error && (
                      <div className="text-red-600 text-sm">{error}</div>
                    )}

                    <button
                      onClick={startStream}
                      disabled={loading}
                      className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? 'Starting Stream...' : 'Start Stream'}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{streamTitle}</h3>
                      {streamDescription && (
                        <p className="text-gray-600 mt-1">{streamDescription}</p>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-sm text-gray-500">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          <div className="w-2 h-2 bg-red-600 rounded-full mr-1.5 animate-pulse"></div>
                          LIVE
                        </span>
                        <span className="ml-3">Channel: {channelName}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Stream Settings */}
          <div className="space-y-6">
            {/* Stream Quality */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Cog6ToothIcon className="h-5 w-5 mr-2" />
                Stream Quality
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Resolution</span>
                  <span className="text-sm font-medium">{streamQuality.width}x{streamQuality.height}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Frame Rate</span>
                  <span className="text-sm font-medium">{streamQuality.frameRate} FPS</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Bitrate</span>
                  <span className="text-sm font-medium">{streamQuality.bitrate} kbps</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Tier</span>
                  <span className="text-sm font-medium capitalize">{streamingTier}</span>
                </div>
              </div>
            </div>

            {/* Agora Status */}
            <div className="bg-green-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-green-900 mb-2">Agora Status</h3>
              <div className="text-sm text-green-800">
                <p>✅ App ID: {process.env.NEXT_PUBLIC_AGORA_APP_ID ? 'Configured' : 'Not configured'}</p>
                <p>📡 Channel: {channelName}</p>
                <p>🔧 Mode: {isStreaming ? 'Live Streaming' : 'Ready'}</p>
              </div>
            </div>

            {/* Stream Tips */}
            <div className="bg-blue-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-4">Streaming Tips</h3>
              <ul className="space-y-2 text-sm text-blue-800">
                <li>• Ensure good lighting for better video quality</li>
                <li>• Use a good microphone for clear audio</li>
                <li>• Test your setup before going live</li>
                <li>• Engage with your audience in the chat</li>
                <li>• Keep your stream title descriptive and engaging</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
