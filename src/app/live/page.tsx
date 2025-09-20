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
  channelName: string
}

export default function LiveStreamingPage() {
  const { user, userProfile, isAdmin, isSuperAdmin } = useAuth()
  const router = useRouter()
  const [liveStreams, setLiveStreams] = useState<LiveStream[]>([])
  const [loading, setLoading] = useState(true)
  const [showPurchaseModal, setShowPurchaseModal] = useState(false)

  // Fetch live streams from API
  useEffect(() => {
    const fetchLiveStreams = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/streams')
        if (response.ok) {
          const streams = await response.json()
          // Filter only live streams
          const liveStreams = streams.filter((stream: LiveStream) => stream.isLive)
          setLiveStreams(liveStreams)
        } else {
          console.error('Failed to fetch streams')
          // Fallback to empty array
          setLiveStreams([])
        }
      } catch (error) {
        console.error('Error fetching streams:', error)
        // Fallback to empty array
        setLiveStreams([])
      } finally {
        setLoading(false)
      }
    }

    fetchLiveStreams()
  }, [])

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

  const canUserStream = () => {
    if (!userProfile) return false
    return userProfile.role === 'super-admin' || userProfile.role === 'admin' || userProfile.role === 'moderator'
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Please Sign In</h1>
          <p className="text-gray-600 mb-6">You need to be signed in to view live streams.</p>
          <button
            onClick={() => router.push('/signin')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Sign In
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Live Streaming</h1>
              <p className="mt-2 text-gray-600">Watch and interact with live streams from the BIG community</p>
            </div>
            {canUserStream() && (
              <Link
                href="/live/stream"
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
              >
                <VideoCameraIcon className="h-5 w-5" />
                <span>Start Stream</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading live streams...</p>
          </div>
        ) : liveStreams.length === 0 ? (
          <div className="text-center py-12">
            <VideoCameraIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Live Streams</h3>
            <p className="text-gray-600 mb-6">There are no live streams at the moment.</p>
            {canUserStream() && (
              <Link
                href="/live/stream"
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 inline-flex items-center space-x-2"
              >
                <VideoCameraIcon className="h-5 w-5" />
                <span>Start the First Stream</span>
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {liveStreams.map((stream) => (
              <div key={stream.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                {/* Stream Thumbnail */}
                <div className="relative aspect-video bg-gray-900">
                  {stream.thumbnail ? (
                    <img
                      src={stream.thumbnail}
                      alt={stream.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <VideoCameraIcon className="h-16 w-16 text-gray-600" />
                    </div>
                  )}
                  
                  {/* Live Badge */}
                  <div className="absolute top-4 left-4">
                    <div className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center space-x-1">
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                      <span>LIVE</span>
                    </div>
                  </div>

                  {/* Viewer Count */}
                  <div className="absolute top-4 right-4">
                    <div className="bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm flex items-center space-x-1">
                      <EyeIcon className="h-4 w-4" />
                      <span>{stream.viewerCount}</span>
                    </div>
                  </div>

                  {/* Play Button Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Link
                      href={`/live/watch/${stream.id}`}
                      className="bg-white bg-opacity-90 hover:bg-opacity-100 rounded-full p-4 transition-all transform hover:scale-110"
                    >
                      <PlayIcon className="h-8 w-8 text-gray-900" />
                    </Link>
                  </div>
                </div>

                {/* Stream Info */}
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                    {stream.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {stream.description || 'No description available'}
                  </p>

                  {/* Streamer Info */}
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                      {stream.streamerAvatar ? (
                        <img
                          src={stream.streamerAvatar}
                          alt={stream.streamerName}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-gray-600 font-semibold">
                          {stream.streamerName.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{stream.streamerName}</p>
                      <p className="text-sm text-gray-500">@{stream.streamerUsername}</p>
                    </div>
                  </div>

                  {/* Stream Stats */}
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <ClockIcon className="h-4 w-4" />
                      <span>{formatTimeAgo(stream.startedAt)}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <UserGroupIcon className="h-4 w-4" />
                      <span>{stream.viewerCount} watching</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
