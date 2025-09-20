'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { 
  UserIcon, 
  CalendarIcon, 
  MapPinIcon,
  BriefcaseIcon,
  LinkIcon,
  TicketIcon,
  VideoCameraIcon,
  PlayIcon
} from '@heroicons/react/24/outline'
import { getPublicProfileByUsername } from '@/utils/profileManagement'

interface UserProfile {
  id: string
  username: string
  email: string
  displayName: string
  bio: string
  profilePictureUrl?: string
  bannerImageUrl?: string
  location?: string
  website?: string
  jobTitle?: string
  company?: string
  isPublic: boolean
  role: string
  tier: string
  createdAt: Date
  updatedAt: Date
}

export default function PublicProfilePage() {
  const params = useParams()
  const router = useRouter()
  const { user, userProfile } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Special permission for chizz@teambig.io
  const canGoLive = user?.email === 'chizz@teambig.io' || userProfile?.role === 'super-admin' || userProfile?.role === 'admin'

  useEffect(() => {
    const loadProfile = async () => {
      if (!params.username) return

      try {
        setLoading(true)
        const response = await fetch(`/api/profile/${params.username}`)
        
        if (!response.ok) {
          throw new Error('Profile not found')
        }

        const profileData = await response.json()
        setProfile(profileData)
      } catch (err) {
        console.error('Error loading profile:', err)
        setError(err instanceof Error ? err.message : 'Failed to load profile')
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
          <p className="text-gray-600 mb-8">{error || 'The profile you are looking for does not exist.'}</p>
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

  const isOwnProfile = user?.uid === profile.id

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            ← Back to Home
          </Link>
        </div>

        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Banner */}
          <div className="h-48 bg-gradient-to-r from-blue-500 to-purple-600 relative">
            {profile.bannerImageUrl && (
              <img
                src={profile.bannerImageUrl}
                alt="Banner"
                className="w-full h-full object-cover"
                onError={(e) => {
                  console.error('Banner image failed to load:', e)
                  e.currentTarget.style.display = 'none'
                }}
              />
            )}
          </div>

          {/* Profile Info */}
          <div className="px-6 pb-6">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between -mt-16 relative">
              {/* Profile Picture */}
              <div className="flex items-end space-x-4">
                <div className="relative">
                  <div className="h-32 w-32 rounded-full bg-gray-300 flex items-center justify-center overflow-hidden border-4 border-white">
                    {profile.profilePictureUrl ? (
                      <img
                        src={profile.profilePictureUrl}
                        alt={profile.displayName}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          console.error('Profile image failed to load:', e)
                          e.currentTarget.style.display = 'none'
                        }}
                      />
                    ) : (
                      <UserIcon className="h-16 w-16 text-gray-400" />
                    )}
                  </div>
                </div>
                <div className="pb-4">
                  <h1 className="text-2xl font-bold text-gray-900">{profile.displayName}</h1>
                  <p className="text-gray-600">@{profile.username}</p>
                  {profile.bio && (
                    <p className="mt-2 text-gray-700">{profile.bio}</p>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 mt-4 sm:mt-0">
                {isOwnProfile && canGoLive && (
                  <Link
                    href="/live/stream"
                    className="inline-flex items-center px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700"
                  >
                    <VideoCameraIcon className="h-4 w-4 mr-2" />
                    Go Live
                  </Link>
                )}
                {isOwnProfile && (
                  <Link
                    href="/profile/edit"
                    className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-50"
                  >
                    Edit Profile
                  </Link>
                )}
              </div>
            </div>

            {/* Profile Details */}
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {profile.location && (
                <div className="flex items-center text-gray-600">
                  <MapPinIcon className="h-5 w-5 mr-2" />
                  <span>{profile.location}</span>
                </div>
              )}
              {profile.website && (
                <div className="flex items-center text-gray-600">
                  <LinkIcon className="h-5 w-5 mr-2" />
                  <a
                    href={profile.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800"
                  >
                    {profile.website}
                  </a>
                </div>
              )}
              {profile.jobTitle && (
                <div className="flex items-center text-gray-600">
                  <BriefcaseIcon className="h-5 w-5 mr-2" />
                  <span>{profile.jobTitle}</span>
                </div>
              )}
              <div className="flex items-center text-gray-600">
                <CalendarIcon className="h-5 w-5 mr-2" />
                <span>Joined {new Date(profile.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Live Streams Section */}
        {isOwnProfile && canGoLive && (
          <div className="mt-8 bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <VideoCameraIcon className="h-6 w-6 mr-2" />
              Live Streams
            </h2>
            <div className="text-center py-8">
              <VideoCameraIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Live Streams Yet</h3>
              <p className="text-gray-600 mb-4">Start your first live stream to connect with your audience</p>
              <Link
                href="/live/stream"
                className="inline-flex items-center px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700"
              >
                <PlayIcon className="h-4 w-4 mr-2" />
                Start Streaming
              </Link>
            </div>
          </div>
        )}

        {/* Recent Activity */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
          <div className="text-center py-8">
            <p className="text-gray-600">No recent activity to show</p>
          </div>
        </div>
      </div>
    </div>
  )
}
