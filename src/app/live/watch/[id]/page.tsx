'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  UserGroupIcon, 
  ClockIcon,
  HeartIcon,
  ShareIcon,
  ChatBubbleLeftRightIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline'

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
}

export default function WatchStreamPage() {
  const params = useParams()
  const router = useRouter()
  const [stream, setStream] = useState<LiveStream | null>(null)
  const [loading, setLoading] = useState(true)
  const [viewerCount, setViewerCount] = useState(0)
  const [isLiked, setIsLiked] = useState(false)
  const [chatMessage, setChatMessage] = useState('')
  const [chatMessages, setChatMessages] = useState<Array<{
    id: string
    username: string
    message: string
    timestamp: Date
  }>>([])

  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const loadStream = async () => {
      if (!params.id) return

      // Mock stream data - in production this would come from your API
      const mockStream: LiveStream = {
        id: params.id as string,
        title: 'BIG Community Welcome Stream',
        description: 'Join us for our weekly community check-in and updates',
        streamerName: 'BIG Admin',
        streamerUsername: 'bigadmin',
        streamerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
        viewerCount: 42,
        isLive: true,
        startedAt: new Date(Date.now() - 30 * 60 * 1000),
        thumbnail: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=450&fit=crop',
        isAdminStream: true
      }

      setStream(mockStream)
      setViewerCount(mockStream.viewerCount)
      setLoading(false)

      // Simulate viewer count updates
      const viewerInterval = setInterval(() => {
        setViewerCount(prev => prev + Math.floor(Math.random() * 3))
      }, 10000)

      // Simulate chat messages
      const chatInterval = setInterval(() => {
        const messages = [
          'Great stream!',
          'Thanks for the content!',
          'This is awesome!',
          'Keep it up!',
          'Love this community!'
        ]
        const randomMessage = messages[Math.floor(Math.random() * messages.length)]
        const randomUsername = `user${Math.floor(Math.random() * 1000)}`
        
        setChatMessages(prev => [...prev, {
          id: Date.now().toString(),
          username: randomUsername,
          message: randomMessage,
          timestamp: new Date()
        }])
      }, 15000)

      return () => {
        clearInterval(viewerInterval)
        clearInterval(chatInterval)
      }
    }

    loadStream()
  }, [params.id])

  const formatTimeAgo = (date: Date) => {
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    
    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `${diffInHours}h ago`
    
    const diffInDays = Math.floor(diffInHours / 24)
    return `${diffInDays}d ago`
  }

  const sendChatMessage = () => {
    if (!chatMessage.trim()) return

    const newMessage = {
      id: Date.now().toString(),
      username: 'You',
      message: chatMessage,
      timestamp: new Date()
    }

    setChatMessages(prev => [...prev, newMessage])
    setChatMessage('')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading stream...</p>
        </div>
      </div>
    )
  }

  if (!stream) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Stream Not Found</h1>
          <p className="text-gray-600 mb-8">The stream you&apos;re looking for doesn&apos;t exist or has ended.</p>
          <Link
            href="/live"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back to Live Streams
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/live"
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back to Live Streams
          </Link>
          
          <h1 className="text-2xl font-bold text-gray-900">{stream.title}</h1>
          <p className="text-gray-600 mt-1">{stream.description}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Video Player */}
          <div className="lg:col-span-3">
            <div className="bg-black rounded-lg overflow-hidden">
              <div className="relative aspect-video">
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  poster={stream.thumbnail}
                  controls
                >
                  <source src="" type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
                
                {/* Live Indicator */}
                <div className="absolute top-4 left-4">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-600 text-white">
                    <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></div>
                    LIVE
                  </span>
                </div>

                {/* Viewer Count */}
                <div className="absolute top-4 right-4">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-black bg-opacity-50 text-white">
                    <UserGroupIcon className="h-4 w-4 mr-1" />
                    {viewerCount} watching
                  </span>
                </div>
              </div>
            </div>

            {/* Stream Info */}
            <div className="bg-white rounded-lg shadow-md p-6 mt-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center">
                  <img
                    src={stream.streamerAvatar}
                    alt={stream.streamerName}
                    className="h-12 w-12 rounded-full object-cover"
                  />
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {stream.streamerName}
                    </h3>
                    <p className="text-sm text-gray-500">
                      @{stream.streamerUsername}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setIsLiked(!isLiked)}
                    className={`flex items-center px-4 py-2 rounded-md ${
                      isLiked 
                        ? 'bg-red-100 text-red-600' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <HeartIcon className="h-4 w-4 mr-2" />
                    Like
                  </button>
                  
                  <button className="flex items-center px-4 py-2 bg-gray-100 text-gray-600 rounded-md hover:bg-gray-200">
                    <ShareIcon className="h-4 w-4 mr-2" />
                    Share
                  </button>
                </div>
              </div>

              <div className="mt-4 flex items-center text-sm text-gray-500">
                <ClockIcon className="h-4 w-4 mr-2" />
                Started {formatTimeAgo(stream.startedAt)}
                {stream.isAdminStream && (
                  <span className="ml-4 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Admin Stream
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Chat Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md h-96 flex flex-col">
              <div className="p-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <ChatBubbleLeftRightIcon className="h-5 w-5 mr-2" />
                  Live Chat
                </h3>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {chatMessages.map((message) => (
                  <div key={message.id} className="text-sm">
                    <div className="flex items-start">
                      <span className="font-medium text-gray-900 mr-2">
                        {message.username}:
                      </span>
                      <span className="text-gray-700">{message.message}</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {message.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                ))}
              </div>

              {/* Chat Input */}
              <div className="p-4 border-t border-gray-200">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
                  />
                  <button
                    onClick={sendChatMessage}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
                  >
                    Send
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
