'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { 
  PencilIcon, 
  UserIcon, 
  EnvelopeIcon, 
  PhoneIcon, 
  MapPinIcon, 
  BriefcaseIcon,
  GlobeAltIcon,
  LinkIcon
} from '@heroicons/react/24/outline'

interface UserProfile {
  displayName?: string
  email?: string
  phone?: string
  location?: string
  bio?: string
  company?: string
  jobTitle?: string
  website?: string
  linkedin?: string
  twitter?: string
  instagram?: string
  createdAt?: unknown
  updatedAt?: unknown
}

export default function Profile() {
  const { user, userProfile } = useAuth()
  const router = useRouter()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  const loadProfile = useCallback(async () => {
    if (!user) return

    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid))
      if (userDoc.exists()) {
        setProfile(userDoc.data() as UserProfile)
      } else {
        // Create basic profile if it doesn't exist
        setProfile({
          displayName: userProfile?.name || user.displayName || '',
          email: user.email || ''
        })
      }
    } catch (error) {
      console.error('Error loading profile:', error)
    } finally {
      setLoading(false)
    }
  }, [user, userProfile])

  useEffect(() => {
    if (user) {
      loadProfile()
    } else {
      setLoading(false)
    }
  }, [user, loadProfile])

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

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Please log in to view your profile</h1>
          <button
            onClick={() => router.push('/')}
            className="mt-4 text-blue-600 hover:text-blue-800"
          >
            Go to Home
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
          <p className="mt-2 text-gray-600">Your personal information and preferences</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-white shadow rounded-lg p-6">
              <div className="text-center">
                <div className="h-24 w-24 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white text-2xl font-bold">
                    {profile?.displayName?.charAt(0) || userProfile?.name?.charAt(0) || user.displayName?.charAt(0) || user.email?.charAt(0) || 'U'}
                  </span>
                </div>
                <h2 className="text-xl font-bold text-gray-900">
                  {profile?.displayName || userProfile?.name || user.displayName || 'User'}
                </h2>
                <p className="text-gray-600">{profile?.email || user.email}</p>
                {profile?.jobTitle && (
                  <p className="text-sm text-gray-500 mt-1">{profile.jobTitle}</p>
                )}
                {profile?.company && (
                  <p className="text-sm text-gray-500">{profile.company}</p>
                )}
              </div>
              
              <div className="mt-6">
                <button
                  onClick={() => router.push('/profile/edit')}
                  className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  <PencilIcon className="h-4 w-4 mr-2" />
                  Edit Profile
                </button>
              </div>
            </div>
          </div>

          {/* Profile Details */}
          <div className="lg:col-span-2">
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Profile Information</h3>
              </div>
              <div className="p-6 space-y-6">
                {/* Basic Information */}
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-4">Basic Information</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex items-center">
                      <UserIcon className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Display Name</p>
                        <p className="text-sm text-gray-600">{profile?.displayName || userProfile?.name || user.displayName || 'Not set'}</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <EnvelopeIcon className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Email</p>
                        <p className="text-sm text-gray-600">{profile?.email || user.email}</p>
                      </div>
                    </div>
                    {profile?.phone && (
                      <div className="flex items-center">
                        <PhoneIcon className="h-5 w-5 text-gray-400 mr-3" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">Phone</p>
                          <p className="text-sm text-gray-600">{profile.phone}</p>
                        </div>
                      </div>
                    )}
                    {profile?.location && (
                      <div className="flex items-center">
                        <MapPinIcon className="h-5 w-5 text-gray-400 mr-3" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">Location</p>
                          <p className="text-sm text-gray-600">{profile.location}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Professional Information */}
                {(profile?.company || profile?.jobTitle) && (
                  <div>
                    <h4 className="text-md font-medium text-gray-900 mb-4">Professional Information</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {profile?.company && (
                        <div className="flex items-center">
                          <BriefcaseIcon className="h-5 w-5 text-gray-400 mr-3" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">Company</p>
                            <p className="text-sm text-gray-600">{profile.company}</p>
                          </div>
                        </div>
                      )}
                      {profile?.jobTitle && (
                        <div className="flex items-center">
                          <BriefcaseIcon className="h-5 w-5 text-gray-400 mr-3" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">Job Title</p>
                            <p className="text-sm text-gray-600">{profile.jobTitle}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Bio */}
                {profile?.bio && (
                  <div>
                    <h4 className="text-md font-medium text-gray-900 mb-2">Bio</h4>
                    <p className="text-sm text-gray-600">{profile.bio}</p>
                  </div>
                )}

                {/* Social Links */}
                {(profile?.website || profile?.linkedin || profile?.twitter || profile?.instagram) && (
                  <div>
                    <h4 className="text-md font-medium text-gray-900 mb-4">Social Links</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {profile?.website && (
                        <div className="flex items-center">
                          <GlobeAltIcon className="h-5 w-5 text-gray-400 mr-3" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">Website</p>
                            <a 
                              href={profile.website} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-sm text-blue-600 hover:text-blue-800"
                            >
                              {profile.website}
                            </a>
                          </div>
                        </div>
                      )}
                      {profile?.linkedin && (
                        <div className="flex items-center">
                          <LinkIcon className="h-5 w-5 text-gray-400 mr-3" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">LinkedIn</p>
                            <a 
                              href={profile.linkedin} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-sm text-blue-600 hover:text-blue-800"
                            >
                              {profile.linkedin}
                            </a>
                          </div>
                        </div>
                      )}
                      {profile?.twitter && (
                        <div className="flex items-center">
                          <LinkIcon className="h-5 w-5 text-gray-400 mr-3" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">Twitter</p>
                            <a 
                              href={`https://twitter.com/${profile.twitter.replace('@', '')}`} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-sm text-blue-600 hover:text-blue-800"
                            >
                              {profile.twitter}
                            </a>
                          </div>
                        </div>
                      )}
                      {profile?.instagram && (
                        <div className="flex items-center">
                          <LinkIcon className="h-5 w-5 text-gray-400 mr-3" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">Instagram</p>
                            <a 
                              href={`https://instagram.com/${profile.instagram.replace('@', '')}`} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-sm text-blue-600 hover:text-blue-800"
                            >
                              {profile.instagram}
                            </a>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
