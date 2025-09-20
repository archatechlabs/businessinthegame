'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { getPublicProfileByUsername, getProfileStats } from '@/utils/profileManagement'
import { UserProfile } from '@/contexts/AuthContext'
import Link from 'next/link'
import Image from 'next/image'
import { 
  UserIcon, 
  MapPinIcon, 
  LinkIcon, 
  CalendarIcon,
  UserGroupIcon,
  TicketIcon,
  DocumentTextIcon,
  ShareIcon,
  HeartIcon,
  VideoCameraIcon,
  PlayIcon,
  EyeIcon
} from '@heroicons/react/24/outline'

interface LiveStream {
  id: string
  title: string
  description: string
  viewerCount: number
  isLive: boolean
  startedAt: Date
  thumbnail: string
}

export default function PublicProfilePage() {
  const params = useParams()
  const { user } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [stats, setStats] = useState({
    friendsCount: 0,
    eventsAttended: 0,
    postsCount: 0
  })
  const [liveStreams, setLiveStreams] = useState<LiveStream[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadProfile = async () => {
      if (!params.username) return
      
      try {
        setLoading(true)
        console.log('Fetching public profile via API for username:', params.username as string)
        const profileData = await getPublicProfileByUsername(params.username as string)
        
        if (!profileData) {
          setError('Profile not found or not public')
          return
        }
        
        setProfile(profileData)
        
        // Load profile stats
        const profileStats = await getProfileStats(profileData.uid)
        setStats(profileStats)

        // Load user's live streams (mock data for now)
        const mockStreams: LiveStream[] = [
          {
            id: '1',
            title: 'My First Live Stream',
            description: 'Testing out the live streaming feature',
            viewerCount: 15,
            isLive: true,
            startedAt: new Date(Date.now() - 10 * 60 * 1000),
            thumbnail: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=225&fit=crop'
          },
          {
            id: '2',
            title: 'Tech Talk Live',
            description: 'Discussing the latest in technology',
            viewerCount: 0,
            isLive: false,
            startedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
            thumbnail: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400&h=225&fit=crop'
          }
        ]
        setLiveStreams(mockStreams)

      } catch (err: unknown) {
        console.error('Error fetching public profile via API:', err)
        setError('Failed to load profile.')
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [params.username])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Profile Not Found</h1>
          <p className="text-gray-600 mb-8">{error || 'This profile does not exist or is not public.'}</p>
          <Link
            href="/"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
          >
            Go Home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Banner */}
      <div className="relative h-64 bg-gradient-to-r from-blue-600 to-purple-600">
        {profile.banner ? (
          <Image
            src={profile.banner}
            alt="Profile banner"
            fill
            className="object-cover"
            onError={(e) => console.error('Banner image failed to load:', e.currentTarget.src)}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-blue-600 to-purple-600"></div>
        )}
        
        {/* Profile Picture */}
        <div className="absolute -bottom-16 left-8">
          <div className="w-32 h-32 rounded-full border-4 border-white bg-white shadow-lg overflow-hidden">
            {profile.avatar ? (
              <Image
                src={profile.avatar}
                alt={profile.name}
                fill
                className="object-cover"
                onError={(e) => console.error('Avatar image failed to load:', e.currentTarget.src)}
              />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                <UserIcon className="h-16 w-16 text-gray-400" />
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
        {/* Profile Header */}
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{profile.name}</h1>
            {profile.username && (
              <p className="text-lg text-gray-600">@{profile.username}</p>
            )}
            {profile.location && (
              <p className="text-gray-500 flex items-center mt-1">
                <MapPinIcon className="h-4 w-4 mr-1" /> {profile.location}
              </p>
            )}
          </div>
          <div className="flex space-x-3">
            {/* Add buttons for follow, message, share etc. */}
            <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
              <HeartIcon className="h-4 w-4 mr-2" />
              Follow
            </button>
            <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700">
              <ShareIcon className="h-4 w-4 mr-2" />
              Share
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Profile Bio */}
            {profile.bio && (
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">About {profile.name}</h2>
                <p className="text-gray-700">{profile.bio}</p>
              </div>
            )}

            {/* Live Streams Section */}
            {liveStreams.length > 0 && (
              <div className="bg-white shadow rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-900 flex items-center">
                    <VideoCameraIcon className="h-5 w-5 mr-2" />
                    Live Streams
                  </h2>
                  <Link
                    href="/live"
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    View All
                  </Link>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {liveStreams.map((stream) => (
                    <div key={stream.id} className="relative group">
                      <div className="aspect-video bg-gray-200 rounded-lg overflow-hidden">
                        <img
                          src={stream.thumbnail}
                          alt={stream.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        />
                        {stream.isLive && (
                          <div className="absolute top-2 left-2">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-600 text-white">
                              <div className="w-2 h-2 bg-white rounded-full mr-1.5 animate-pulse"></div>
                              LIVE
                            </span>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
                          <PlayIcon className="h-12 w-12 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                        </div>
                      </div>
                      <div className="mt-2">
                        <h3 className="font-medium text-gray-900 line-clamp-2">{stream.title}</h3>
                        <p className="text-sm text-gray-500 mt-1 line-clamp-2">{stream.description}</p>
                        <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                          <span className="flex items-center">
                            <EyeIcon className="h-3 w-3 mr-1" />
                            {stream.viewerCount} viewers
                          </span>
                          <span>
                            {stream.isLive ? 'Live now' : new Date(stream.startedAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Profile Details & Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Details</h2>
                <ul className="space-y-2 text-gray-700">
                  <li><span className="font-medium">Email:</span> {profile.email}</li>
                  {profile.website && (
                    <li>
                      <span className="font-medium">Website:</span>{' '}
                      <Link href={profile.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        {profile.website}
                      </Link>
                    </li>
                  )}
                  {profile.socialLinks?.linkedin && (
                    <li>
                      <span className="font-medium">LinkedIn:</span>{' '}
                      <Link href={profile.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        {profile.socialLinks.linkedin}
                      </Link>
                    </li>
                  )}
                  {profile.socialLinks?.twitter && (
                    <li>
                      <span className="font-medium">Twitter:</span>{' '}
                      <Link href={profile.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        {profile.socialLinks.twitter}
                      </Link>
                    </li>
                  )}
                  {profile.socialLinks?.instagram && (
                    <li>
                      <span className="font-medium">Instagram:</span>{' '}
                      <Link href={profile.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        {profile.socialLinks.instagram}
                      </Link>
                    </li>
                  )}
                </ul>
              </div>

              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Stats</h2>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-center">
                    <UserGroupIcon className="h-5 w-5 text-gray-400 mr-2" />
                    <span className="font-medium">Friends:</span> {stats.friendsCount}
                  </li>
                  <li className="flex items-center">
                    <CalendarIcon className="h-5 w-5 text-gray-400 mr-2" />
                    <span className="font-medium">Events Attended:</span> {stats.eventsAttended}
                  </li>
                  <li className="flex items-center">
                    <DocumentTextIcon className="h-5 w-5 text-gray-400 mr-2" />
                    <span className="font-medium">Posts:</span> {stats.postsCount}
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
