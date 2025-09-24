'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { 
  UserGroupIcon, 
  ClockIcon,
  HeartIcon,
  ShareIcon,
  ChatBubbleLeftRightIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline'
import AgoraViewer from '@/components/live/AgoraViewer'
import StreamJoinRequest from '@/components/live/StreamJoinRequest'

interface LiveStream {
  id: string
  title: string
  description: string
  streamerName: string
  streamerUsername: string
  streamerAvatar: string
  viewerCount: number
  isLive: boolean
  startedAt: Date
  thumbnail: string
  isAdminStream: boolean
  channelName: string
}

export default function WatchStreamPage() {
  const params = useParams()
  const router = useRouter()
  const [stream, setStream] = useState<LiveStream | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [viewerCount, setViewerCount] = useState(0)
  const [isLiked, setIsLiked] = useState(false)
  const [chatMessage, setChatMessage] = useState('')
  const [chatMessages, setChatMessages] = useState<Array<{
    id: string
    username: string
    message: string
    timestamp: Date
  }>>([])
  const [isViewing, setIsViewing] = useState(false)

  useEffect(() => {
    const loadStream = async () => {
      if (!params.id) {
        setLoading(false)
        return
      }

      try {
        const response = await fetch(`/api/streams?id=${params.id}`)
        if (!response.ok) {
          throw new Error('Failed to fetch stream')
        }
        const streamData: LiveStream = await response.json()
        setStream({
          ...streamData,
          startedAt: new Date(streamData.startedAt), // Ensure Date object
        })
        setViewerCount(streamData.viewerCount)
        console.log('🔍 Setting isViewing to true, streamData:', streamData)
        setIsViewing(true) // Automatically start viewing if stream data is loaded
      } catch (err) {
        console.error('Error loading stream:', err)
        // router.push('/live') // Redirect to live page if stream not found or error
      } finally {
        setLoading(false)
      }
    }

    loadStream()

    // Simulate viewer count updates (can be replaced with real-time updates later)
    const viewerInterval = setInterval(() => {
      setViewerCount(prev => prev + Math.floor(Math.random() * 3))
    }, 10000)

    return () => {
      clearInterval(viewerInterval)
    }
  }, [params.id])

  const handleStartViewing = () => {
    setIsViewing(true)
  }

  const handleStopViewing = () => {
    setIsViewing(false)
  }

  const handleLike = () => {
    setIsLiked(!isLiked)
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: stream?.title || 'Live Stream',
        text: `Check out this live stream: ${stream?.title}`,
        url: window.location.href
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      alert('Link copied to clipboard!')
    }
  }

  const handleSendMessage = () => {
    if (chatMessage.trim()) {
      const newMessage = {
        id: Date.now().toString(),
        username: 'You',
        message: chatMessage,
        timestamp: new Date()
      }
      setChatMessages(prev => [...prev, newMessage])
      setChatMessage('')
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage()
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading stream...</p>
        </div>
      </div>
    )
  }

  if (error || !stream) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="text-gray-400 mb-4 text-6xl">❌</div>
          <h2 className="text-2xl font-semibold mb-2">Stream Not Found</h2>
          <p className="text-gray-300 mb-4">This stream may have ended or doesndoesn'tapos;t exist.</p>
          <Link
            href="/live"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back to Live Streams
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <Link
          href="/live"
          className="inline-flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Back to Live Streams
        </Link>
        <img src="/Images/BIG Logo image.png" alt="BIG Logo" className="h-20 w-auto mr-4" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Video Area */}
          <div className="lg:col-span-2">
            <div className="bg-black rounded-lg overflow-hidden shadow-lg relative">
              {(() => {
                console.log('🔍 Render state check:', { isViewing, hasStream: !!stream, streamId: stream?.id })
                return null
              })()}
              {isViewing ? (
                <>
                  <AgoraViewer 
                    streamId={stream.id}
                    channelName={stream.channelName} 
                    onLeave={handleStopViewing}
                  />
                  <StreamJoinRequest 
                    streamId={stream.id || ''}
                    streamerName={stream.streamerName || 'Unknown Streamer'}
                    onRequestSent={() => console.log('Join request sent!')}
                  />
                </>
              ) : (
                <div className="aspect-video bg-gray-800 flex items-center justify-center">
                  <div className="text-center text-white">
                    <div className="text-gray-400 mb-4 text-6xl">📺</div>
                    <h3 className="text-xl font-semibold mb-2">{stream.title}</h3>
                    <p className="text-gray-300 mb-4">Click below to start watching</p>
                    <button
                      onClick={handleStartViewing}
                      className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center mx-auto"
                    >
                      <div className="w-3 h-3 bg-white rounded-full mr-2 animate-pulse"></div>
                      Watch Live Stream
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Stream Info */}
            <div className="mt-4 bg-gray-800 rounded-lg p-4">
              <h1 className="text-2xl font-bold text-white mb-2">{stream.title}</h1>
              <p className="text-gray-300 mb-4">{stream.description}</p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-6 text-gray-400">
                  <div className="flex items-center">
                    <UserGroupIcon className="h-5 w-5 mr-2" />
                    <span>{viewerCount} viewers</span>
                  </div>
                  <div className="flex items-center">
                    <ClockIcon className="h-5 w-5 mr-2" />
                    <span>Started {stream.startedAt.toLocaleTimeString()}</span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <button
                    onClick={handleLike}
                    className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                      isLiked 
                        ? 'bg-red-500 text-white' 
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    <HeartIcon className={`h-5 w-5 mr-2 ${isLiked ? 'fill-current' : ''}`} />
                    Like
                  </button>
                  <button
                    onClick={handleShare}
                    className="flex items-center px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    <ShareIcon className="h-5 w-5 mr-2" />
                    Share
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Streamer Profile */}
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-gray-600 rounded-full flex items-center justify-center">
                  {stream.streamerAvatar ? (
                    <img
                      src={stream.streamerAvatar}
                      alt={stream.streamerName}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-gray-300 text-lg">
                      {stream.streamerName?.charAt(0)?.toUpperCase() || '?'}
                    </span>
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">{stream.streamerName || 'Unknown Streamer'}</h3>
                  <p className="text-gray-400">@{stream.streamerUsername || 'unknown'}</p>
                </div>
              </div>
              
              <div className="flex space-x-2">
                <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors">
                  Follow
                </button>
                <button className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg font-medium transition-colors">
                  Share
                </button>
              </div>
            </div>

            {/* Live Chat */}
            <div className="bg-gray-800 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <ChatBubbleLeftRightIcon className="h-5 w-5 mr-2" />
                Live Chat
              </h3>
              
              <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                {chatMessages.length === 0 ? (
                  <div className="text-center text-gray-400 py-4">
                    <p>No messages yet. Be the first to chat!</p>
                  </div>
                ) : (
                  chatMessages.map((msg) => (
                    <div key={msg.id} className="text-sm">
                      <span className="text-blue-400 font-medium">{msg.username}:</span>
                      <span className="text-gray-300 ml-2">{msg.message}</span>
                    </div>
                  ))
                )}
              </div>
              
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type a message..."
                  className="flex-1 bg-gray-700 text-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleSendMessage}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
