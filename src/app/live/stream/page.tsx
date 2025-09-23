'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { canUserStream, getStreamQuality, getStreamingTier, generateChannelName } from '@/utils/agora'
import { UserRole, UserTier } from '@/contexts/AuthContext'
import AgoraVideoCall from '@/components/live/AgoraVideoCall'
import StreamRequestManager from '@/components/live/StreamRequestManager'

export default function StreamPage() {
  const { user, userProfile } = useAuth()
  const router = useRouter()
  
  const [streamTitle, setStreamTitle] = useState('')
  const [streamDescription, setStreamDescription] = useState('')
  const [channelName, setChannelName] = useState('')
  const [streamId, setStreamId] = useState<string | null>(null)
  const [isStreaming, setIsStreaming] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [viewerCount, setViewerCount] = useState(0)

  useEffect(() => {
    if (!user || !userProfile) {
      router.push('/signin')
      return
    }

    // Check if user can stream
    const canGoLive = canUserStream(userProfile.role as UserRole, userProfile.tier as UserTier)
    if (!canGoLive) {
      router.push('/live')
      return
    }

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
        throw new Error('Agora App ID not configured')
      }

      // Generate a simple stream ID
      const simpleStreamId = `stream_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      setStreamId(simpleStreamId)

      // Start streaming immediately (don't wait for database)
      setIsStreaming(true)
      setViewerCount(0)

      // Try to save to database in background (non-blocking)
      try {
        const idToken = await user?.getIdToken()
        const streamResponse = await fetch('/api/streams', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${idToken}`
          },
          body: JSON.stringify({
            channelName,
            streamerId: user?.uid,
            streamerName: userProfile?.username || 'Unknown',
            title: streamTitle,
            description: streamDescription,
            quality: getStreamQuality(getStreamingTier(userProfile?.role as UserRole, userProfile?.tier as UserTier)).quality,
            category: 'general'
          })
        })

        if (streamResponse.ok) {
          const streamData = await streamResponse.json()
          setStreamId(streamData.id)
          console.log('Stream saved to database successfully')
        } else {
          console.warn('Failed to save stream to database, but continuing with local stream')
        }
      } catch (dbError) {
        console.warn('Database save failed, but continuing with local stream:', dbError)
      }

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

  const stopStream = async () => {
    try {
      // Stop streaming logic here
      setIsStreaming(false)
      setViewerCount(0)
      setStreamId(null)
    } catch (err) {
      console.error('Error stopping stream:', err)
    }
  }

  if (!user || !userProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  const canGoLive = canUserStream(userProfile.role as UserRole, userProfile.tier as UserTier)
  if (!canGoLive) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Streaming Not Available</h1>
          <p className="text-gray-600 mb-6">You need a premium membership to start streaming.</p>
          <button
            onClick={() => router.push('/live')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Back to Live
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Start Live Stream</h1>
          
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          {!isStreaming ? (
            <div className="space-y-6">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  Stream Title *
                </label>
                <input
                  type="text"
                  id="title"
                  value={streamTitle}
                  onChange={(e) => setStreamTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your stream title"
                  required
                />
              </div>
              <StreamRequestManager 
                streamId={streamId || ""}
                onRequestAccepted={(request) => console.log("Request accepted:", request)}
                onRequestRejected={(request) => console.log("Request rejected:", request)}
              />

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  id="description"
                  value={streamDescription}
                  onChange={(e) => setStreamDescription(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Describe your stream"
                />
              </div>
              <StreamRequestManager 
                streamId={streamId || ""}
                onRequestAccepted={(request) => console.log("Request accepted:", request)}
                onRequestRejected={(request) => console.log("Request rejected:", request)}
              />

              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-2">Stream Details</h3>
                <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                  <div>
                    <span className="font-medium">Channel:</span> {channelName}
                  </div>
              <StreamRequestManager 
                streamId={streamId || ""}
                onRequestAccepted={(request) => console.log("Request accepted:", request)}
                onRequestRejected={(request) => console.log("Request rejected:", request)}
              />
                  <div>
                    <span className="font-medium">Quality:</span> {getStreamQuality(getStreamingTier(userProfile.role as UserRole, userProfile.tier as UserTier)).quality}
                  </div>
              <StreamRequestManager 
                streamId={streamId || ""}
                onRequestAccepted={(request) => console.log("Request accepted:", request)}
                onRequestRejected={(request) => console.log("Request rejected:", request)}
              />
                  <div>
                    <span className="font-medium">Category:</span> General
                  </div>
              <StreamRequestManager 
                streamId={streamId || ""}
                onRequestAccepted={(request) => console.log("Request accepted:", request)}
                onRequestRejected={(request) => console.log("Request rejected:", request)}
              />
                  <div>
                    <span className="font-medium">Streamer:</span> {userProfile.username}
                  </div>
              <StreamRequestManager 
                streamId={streamId || ""}
                onRequestAccepted={(request) => console.log("Request accepted:", request)}
                onRequestRejected={(request) => console.log("Request rejected:", request)}
              />
                </div>
              <StreamRequestManager 
                streamId={streamId || ""}
                onRequestAccepted={(request) => console.log("Request accepted:", request)}
                onRequestRejected={(request) => console.log("Request rejected:", request)}
              />
              </div>
              <StreamRequestManager 
                streamId={streamId || ""}
                onRequestAccepted={(request) => console.log("Request accepted:", request)}
                onRequestRejected={(request) => console.log("Request rejected:", request)}
              />

              <div className="flex space-x-4">
                <button
                  onClick={startStream}
                  disabled={loading || !streamTitle.trim()}
                  className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Starting Stream...
                    </>
                  ) : (
                    'Start Stream'
                  )}
                </button>
                <button
                  onClick={() => router.push('/live')}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
              <StreamRequestManager 
                streamId={streamId || ""}
                onRequestAccepted={(request) => console.log("Request accepted:", request)}
                onRequestRejected={(request) => console.log("Request rejected:", request)}
              />
            </div>
          ) : (
            <div className="space-y-6">
              {/* Stream Header */}
              <div className="text-center">
                <div className="bg-red-500 text-white px-4 py-2 rounded-lg inline-block mb-4">
                  🔴 LIVE
                </div>
              <StreamRequestManager 
                streamId={streamId || ""}
                onRequestAccepted={(request) => console.log("Request accepted:", request)}
                onRequestRejected={(request) => console.log("Request rejected:", request)}
              />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{streamTitle}</h2>
                <p className="text-gray-600 mb-4">{streamDescription}</p>
              </div>
              <StreamRequestManager 
                streamId={streamId || ""}
                onRequestAccepted={(request) => console.log("Request accepted:", request)}
                onRequestRejected={(request) => console.log("Request rejected:", request)}
              />

              {/* Video Stream */}
              <div className="bg-black rounded-lg overflow-hidden">
                <AgoraVideoCall
                  channelName={channelName}
                  onStreamEnd={stopStream}
                  
                  isHost={true}
                />
              </div>
              <StreamRequestManager 
                streamId={streamId || ""}
                onRequestAccepted={(request) => console.log("Request accepted:", request)}
                onRequestRejected={(request) => console.log("Request rejected:", request)}
              />

              {/* Stream Info */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Channel:</span> {channelName}
                  </div>
              <StreamRequestManager 
                streamId={streamId || ""}
                onRequestAccepted={(request) => console.log("Request accepted:", request)}
                onRequestRejected={(request) => console.log("Request rejected:", request)}
              />
                  <div>
                    <span className="font-medium">Viewers:</span> {viewerCount}
                  </div>
              <StreamRequestManager 
                streamId={streamId || ""}
                onRequestAccepted={(request) => console.log("Request accepted:", request)}
                onRequestRejected={(request) => console.log("Request rejected:", request)}
              />
                  <div>
                    <span className="font-medium">Quality:</span> {getStreamQuality(getStreamingTier(userProfile.role as UserRole, userProfile.tier as UserTier)).quality}
                  </div>
              <StreamRequestManager 
                streamId={streamId || ""}
                onRequestAccepted={(request) => console.log("Request accepted:", request)}
                onRequestRejected={(request) => console.log("Request rejected:", request)}
              />
                  <div>
                    <span className="font-medium">Stream ID:</span> {streamId}
                  </div>
              <StreamRequestManager 
                streamId={streamId || ""}
                onRequestAccepted={(request) => console.log("Request accepted:", request)}
                onRequestRejected={(request) => console.log("Request rejected:", request)}
              />
                </div>
              <StreamRequestManager 
                streamId={streamId || ""}
                onRequestAccepted={(request) => console.log("Request accepted:", request)}
                onRequestRejected={(request) => console.log("Request rejected:", request)}
              />
              </div>
              <StreamRequestManager 
                streamId={streamId || ""}
                onRequestAccepted={(request) => console.log("Request accepted:", request)}
                onRequestRejected={(request) => console.log("Request rejected:", request)}
              />

              {/* Stream Configuration Status */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-medium text-blue-900 mb-2">Stream Configuration</h3>
                <div className="text-sm text-blue-700 space-y-1">
                  <p>✅ App ID: {process.env.NEXT_PUBLIC_AGORA_APP_ID ? 'Configured' : 'Not configured'}</p>
                  <p>✅ Channel: {channelName}</p>
                  <p>✅ Streamer: {userProfile.username}</p>
                  <p>✅ Quality: {getStreamQuality(getStreamingTier(userProfile.role as UserRole, userProfile.tier as UserTier)).quality}</p>
                </div>
              <StreamRequestManager 
                streamId={streamId || ""}
                onRequestAccepted={(request) => console.log("Request accepted:", request)}
                onRequestRejected={(request) => console.log("Request rejected:", request)}
              />
              </div>
              <StreamRequestManager 
                streamId={streamId || ""}
                onRequestAccepted={(request) => console.log("Request accepted:", request)}
                onRequestRejected={(request) => console.log("Request rejected:", request)}
              />

              {/* Action Buttons */}
              <div className="flex space-x-4">
                <button
                  onClick={() => router.push(`/live/watch/${streamId}`)}
                  className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700"
                >
                  View Stream
                </button>
                <button
                  onClick={stopStream}
                  className="flex-1 bg-red-600 text-white py-3 px-6 rounded-lg hover:bg-red-700"
                >
                  End Stream
                </button>
              </div>
              <StreamRequestManager 
                streamId={streamId || ""}
                onRequestAccepted={(request) => console.log("Request accepted:", request)}
                onRequestRejected={(request) => console.log("Request rejected:", request)}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
