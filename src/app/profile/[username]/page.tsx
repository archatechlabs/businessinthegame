'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { getPublicProfileByUsername, getProfileStats } from '@/utils/profileManagement'
import { UserProfile } from '@/contexts/AuthContext'
import Link from 'next/link'
import { 
  UserIcon, 
  MapPinIcon, 
  LinkIcon, 
  CalendarIcon,
  UserGroupIcon,
  TicketIcon,
  DocumentTextIcon,
  ShareIcon,
  HeartIcon
} from '@heroicons/react/24/outline'

export default function PublicProfilePage() {
  const params = useParams()
  const { user } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [stats, setStats] = useState({
    friendsCount: 0,
    eventsAttended: 0,
    postsCount: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadProfile = async () => {
      if (!params.username) return
      
      try {
        setLoading(true)
        console.log('Loading public profile for username:', params.username)
        
        const profileData = await getPublicProfileByUsername(params.username as string)
        
        console.log('Profile data received:', profileData)
        
        if (!profileData) {
          setError('Profile not found or not public')
          return
        }
        
        setProfile(profileData)
        
        // Load profile stats
        const profileStats = await getProfileStats(profileData.uid)
        setStats(profileStats)
        
      } catch (err: unknown) {
        console.error('Error loading profile:', err)
        setError('Failed to load profile')
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

  console.log('Rendering profile with avatar:', profile.avatar)
  console.log('Rendering profile with banner:', profile.banner)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Banner */}
      <div className="relative h-64 bg-gradient-to-r from-blue-600 to-purple-600">
        {profile.banner ? (
          <img
            src={profile.banner}
            alt="Profile banner"
            className="w-full h-full object-cover"
            onError={(e) => {
              console.error('Banner image failed to load:', profile.banner)
              e.currentTarget.style.display = 'none'
            }}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-blue-600 to-purple-600"></div>
        )}
        
        {/* Profile Picture */}
        <div className="absolute -bottom-16 left-8">
          <div className="w-32 h-32 rounded-full border-4 border-white bg-white shadow-lg overflow-hidden">
            {profile.avatar ? (
              <img
                src={profile.avatar}
                alt={profile.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  console.error('Avatar image failed to load:', profile.avatar)
                  e.currentTarget.style.display = 'none'
                }}
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
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{profile.name}</h1>
              {profile.username && (
                <p className="text-lg text-gray-600">@{profile.username}</p>
              )}
            </div>
            
            <div className="mt-4 sm:mt-0 flex space-x-3">
              <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                <ShareIcon className="h-4 w-4 mr-2" />
                Share
              </button>
              <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
                <HeartIcon className="h-4 w-4 mr-2" />
                Follow
              </button>
            </div>
          </div>
        </div>

        {/* Profile Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Bio */}
            {profile.bio && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">About</h2>
                <p className="text-gray-700">{profile.bio}</p>
              </div>
            )}

            {/* Contact Information */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h2>
              <div className="space-y-3">
                {profile.location && (
                  <div className="flex items-center">
                    <MapPinIcon className="h-5 w-5 text-gray-400 mr-3" />
                    <span className="text-gray-700">{profile.location}</span>
                  </div>
                )}
                {profile.website && (
                  <div className="flex items-center">
                    <LinkIcon className="h-5 w-5 text-gray-400 mr-3" />
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
              </div>
            </div>

            {/* Social Links */}
            {profile.socialLinks && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Social Links</h2>
                <div className="flex space-x-4">
                  {profile.socialLinks.twitter && (
                    <a 
                      href={`https://twitter.com/${profile.socialLinks.twitter}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-600"
                    >
                      Twitter
                    </a>
                  )}
                  {profile.socialLinks.linkedin && (
                    <a 
                      href={`https://linkedin.com/in/${profile.socialLinks.linkedin}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800"
                    >
                      LinkedIn
                    </a>
                  )}
                  {profile.socialLinks.instagram && (
                    <a 
                      href={`https://instagram.com/${profile.socialLinks.instagram}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-pink-600 hover:text-pink-800"
                    >
                      Instagram
                    </a>
                  )}
                  {profile.socialLinks.github && (
                    <a 
                      href={`https://github.com/${profile.socialLinks.github}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-600 hover:text-gray-800"
                    >
                      GitHub
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Stats */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Stats</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <UserGroupIcon className="h-5 w-5 text-gray-400 mr-3" />
                    <span className="text-gray-700">Connections</span>
                  </div>
                  <span className="font-semibold text-gray-900">{stats.friendsCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <TicketIcon className="h-5 w-5 text-gray-400 mr-3" />
                    <span className="text-gray-700">Events Attended</span>
                  </div>
                  <span className="font-semibold text-gray-900">{stats.eventsAttended}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <DocumentTextIcon className="h-5 w-5 text-gray-400 mr-3" />
                    <span className="text-gray-700">Posts</span>
                  </div>
                  <span className="font-semibold text-gray-900">{stats.postsCount}</span>
                </div>
              </div>
            </div>

            {/* Member Since */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Member Since</h2>
              <div className="flex items-center">
                <CalendarIcon className="h-5 w-5 text-gray-400 mr-3" />
                <span className="text-gray-700">
                  {profile.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'Unknown'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
