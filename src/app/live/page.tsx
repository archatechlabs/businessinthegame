'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  VideoCameraIcon, 
  PlayIcon, 
  UserGroupIcon, 
  ClockIcon,
  EyeIcon,
  PlusIcon,
  ShoppingCartIcon
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

export default function LiveStreamingPage() {
  const { user, userProfile, isAdmin, isSuperAdmin } = useAuth()
  const router = useRouter()
  const [liveStreams, setLiveStreams] = useState<LiveStream[]>([])
  const [loading, setLoading] = useState(true)
  const [showPurchaseModal, setShowPurchaseModal] = useState(false)

  // Mock data for now - in production this would come from your database
  useEffect(() => {
    const mockStreams: LiveStream[] = [
      {
        id: '1',
        title: 'BIG Community Welcome Stream',
        description: 'Join us for our weekly community check-in and updates',
        streamerName: 'BIG Admin',
        streamerUsername: 'bigadmin',
        streamerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
        viewerCount: 42,
        isLive: true,
        startedAt: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
        thumbnail: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=450&fit=crop',
        isAdminStream: true
      },
      {
        id: '2',
        title: 'Tech Talk: Building the Future',
        description: 'Discussion about the latest in technology and entrepreneurship',
        streamerName: 'Tech Expert',
        streamerUsername: 'techexpert',
        streamerAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
        viewerCount: 28,
        isLive: true,
        startedAt: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
        thumbnail: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&h=450&fit=crop',
        isAdminStream: true
      }
    ]
    
    setLiveStreams(mockStreams)
    setLoading(false)
  }, [])

  const canStream = isAdmin || isSuperAdmin || userProfile?.tier === 'premium' || userProfile?.tier === 'vip'

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading live streams...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <VideoCameraIcon className="h-8 w-8 mr-3 text-blue-600" />
                Live Streaming
              </h1>
              <p className="mt-2 text-gray-600">
                Watch live streams from BIG community members and admins
              </p>
            </div>
            
            <div className="mt-4 sm:mt-0 flex space-x-3">
              {canStream ? (
                <Link
                  href="/live/stream"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Start Streaming
                </Link>
              ) : (
                <button
                  onClick={() => setShowPurchaseModal(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  <ShoppingCartIcon className="h-4 w-4 mr-2" />
                  Purchase Streaming
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Live Streams Grid */}
        {liveStreams.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {liveStreams.map((stream) => (
              <div key={stream.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                {/* Thumbnail */}
                <div className="relative">
                  <img
                    src={stream.thumbnail}
                    alt={stream.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-600 text-white">
                      <div className="w-2 h-2 bg-white rounded-full mr-1.5 animate-pulse"></div>
                      LIVE
                    </span>
                  </div>
                  <div className="absolute top-4 right-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-black bg-opacity-50 text-white">
                      <EyeIcon className="h-3 w-3 mr-1" />
                      {stream.viewerCount}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                    {stream.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {stream.description}
                  </p>

                  {/* Streamer Info */}
                  <div className="flex items-center mb-4">
                    <img
                      src={stream.streamerAvatar}
                      alt={stream.streamerName}
                      className="h-8 w-8 rounded-full object-cover"
                    />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">
                        {stream.streamerName}
                      </p>
                      <p className="text-xs text-gray-500">
                        @{stream.streamerUsername}
                      </p>
                    </div>
                  </div>

                  {/* Stream Info */}
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center">
                      <ClockIcon className="h-4 w-4 mr-1" />
                      {formatTimeAgo(stream.startedAt)}
                    </div>
                    {stream.isAdminStream && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Admin Stream
                      </span>
                    )}
                  </div>

                  {/* Watch Button */}
                  <div className="mt-4">
                    <Link
                      href={`/live/watch/${stream.id}`}
                      className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <PlayIcon className="h-4 w-4 mr-2" />
                      Watch Now
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <VideoCameraIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Live Streams</h3>
            <p className="text-gray-600 mb-6">
              There are no live streams at the moment. Check back later!
            </p>
            {canStream && (
              <Link
                href="/live/stream"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Start the First Stream
              </Link>
            )}
          </div>
        )}

        {/* Purchase Modal */}
        {showPurchaseModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Purchase Live Streaming
                </h3>
                <div className="space-y-4">
                  <div className="border rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900">Premium Streaming</h4>
                    <p className="text-sm text-gray-600 mb-2">
                      Get access to live streaming capabilities
                    </p>
                    <p className="text-2xl font-bold text-green-600">$29.99/month</p>
                  </div>
                  <div className="flex space-x-3">
                    <button
                      onClick={() => setShowPurchaseModal(false)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        // Handle purchase logic here
                        setShowPurchaseModal(false)
                        alert('Purchase functionality coming soon!')
                      }}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
                    >
                      Purchase
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
