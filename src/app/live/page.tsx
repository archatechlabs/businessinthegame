'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { 
  VideoCameraIcon, 
  PlayIcon, 
  UserGroupIcon, 
  ClockIcon,
  EyeIcon
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

interface StreamData {
  id: string
  title: string
  description: string
  streamerName: string
  streamerUsername: string
  streamerAvatar: string
  viewerCount: number
  isLive: boolean
  startedAt: unknown
  startTime?: unknown
  thumbnail: string
  isAdminStream: boolean
  channelName: string
}

export default function LiveStreamingPage() {
  const { user, userProfile } = useAuth()
  const router = useRouter()
  const [liveStreams, setLiveStreams] = useState<LiveStream[]>([])
  const [loading, setLoading] = useState(true)

  // Helper function to safely convert any timestamp to Date
  const safeConvertToDate = (timestamp: unknown): Date => {
    if (!timestamp) return new Date()
    
    if (timestamp instanceof Date) return timestamp
    
    if (typeof timestamp === 'string') {
      const parsed = new Date(timestamp)
      if (!isNaN(parsed.getTime())) return parsed
    }
    
    if (typeof timestamp === 'number') {
      const timestampMs = timestamp < 10000000000 ? timestamp * 1000 : timestamp
      const parsed = new Date(timestampMs)
      if (!isNaN(parsed.getTime())) return parsed
    }
    
    if (timestamp && typeof timestamp === 'object' && 'toDate' in timestamp) {
      try {
        const firestoreTimestamp = timestamp as { toDate: () => Date }
        if (typeof firestoreTimestamp.toDate === 'function') {
          return firestoreTimestamp.toDate()
        }
      } catch (error) {
        console.warn('Error converting Firestore timestamp:', error)
      }
    }
    
    return new Date()
  }

  // Fetch live streams from API
  useEffect(() => {
    const fetchLiveStreams = async () => {
      try {
        setLoading(true)
        console.log('🔍 Fetching live streams...')
        const response = await fetch('/api/streams')
        console.log('📡 Streams API response:', response.status, response.statusText)
        
        if (response.ok) {
          const data = await response.json()
          console.log('📊 Streams data received:', data)
          
          const streams = Array.isArray(data) ? data : []
          console.log('✅ Processed streams array:', streams)
          
          // Convert all streams and ensure proper date handling
          const liveStreams = streams
            .filter((stream: StreamData) => stream.isLive)
            .map((stream: StreamData) => ({
              ...stream,
              startedAt: safeConvertToDate(stream.startedAt || stream.startTime)
            }))
          
          console.log('🎥 Live streams found:', liveStreams.length)
          setLiveStreams(liveStreams)
        } else {
          console.error('❌ Failed to fetch streams:', response.status, response.statusText)
          const errorData = await response.json().catch(() => ({}))
          console.error('❌ Error details:', errorData)
          setLiveStreams([])
        }
      } catch (error) {
        console.error('❌ Error fetching streams:', error)
        setLiveStreams([])
      } finally {
        setLoading(false)
      }
    }

    fetchLiveStreams()
  }, [])

  const formatTimeAgo = (date: Date) => {
    try {
      const now = new Date()
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
      
      if (diffInMinutes < 1) return 'Just now'
      if (diffInMinutes < 60) return `${diffInMinutes}m ago`
      
      const diffInHours = Math.floor(diffInMinutes / 60)
      if (diffInHours < 24) return `${diffInHours}h ago`
      
      const diffInDays = Math.floor(diffInHours / 24)
      return `${diffInDays}d ago`
    } catch (error) {
      console.error('Error formatting time:', error)
      return 'Unknown'
    }
  }

  const canUserStream = () => {
    if (!userProfile) return false
    return userProfile.role === 'super-admin' || userProfile.role === 'admin' || userProfile.role === 'moderator'
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          {/* BIG Logo */}
          <div className="mb-8">
            <Image
              src="/Images/BIG Logo image.png"
              alt="BIG Logo"
              width={200}
              height={80}
              className="mx-auto"
            />
          </div>
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
            <div className="flex items-center space-x-4">
              {/* BIG Logo */}
              <Image
                src="/Images/BIG Logo image.png"
                alt="BIG Logo"
                width={120}
                height={48}
                className="h-12 w-auto"
              />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Live Streaming</h1>
                <p className="mt-2 text-gray-600">Watch and interact with live streams from the BIG community</p>
              </div>
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
                      <span>{stream.viewerCount || 0}</span>
                    </div>
                  </div>

                  {/* Play Button Overlay - Link to watch page */}
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
                          {stream.streamerName?.charAt(0)?.toUpperCase() || 'U'}
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{stream.streamerName || 'Unknown'}</p>
                      <p className="text-sm text-gray-500">@{stream.streamerUsername || 'unknown'}</p>
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
                      <span>{stream.viewerCount || 0} watching</span>
                    </div>
                  </div>

                  {/* Watch Button */}
                  <div className="mt-4">
                    <Link
                      href={`/live/watch/${stream.id}`}
                      className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center space-x-2"
                    >
                      <PlayIcon className="h-4 w-4" />
                      <span>Watch Live</span>
                    </Link>
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
