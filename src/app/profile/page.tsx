'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
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
  LinkIcon,
  ArrowLeftIcon,
  Bars3Icon,
  HomeIcon,
  CogIcon,
  TicketIcon,
  InboxIcon,
  UsersIcon,
  CalendarIcon,
  EyeIcon
} from '@heroicons/react/24/outline'
import { Menu, Transition } from '@headlessui/react'
import { Fragment } from 'react'

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
  username?: string
  isPublic?: boolean
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

  const menuItems = [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
    { name: 'Edit Profile', href: '/profile/edit', icon: PencilIcon },
    { name: 'Settings', href: '/settings', icon: CogIcon },
    { name: 'My Tickets', href: '/tickets', icon: TicketIcon },
    { name: 'Messages', href: '/inbox', icon: InboxIcon },
    { name: 'Connections', href: '/friends', icon: UsersIcon },
    { name: 'Events', href: '/events', icon: CalendarIcon },
    { name: 'Main Website', href: '/', icon: HomeIcon }
  ]

  // Get the username for the public profile URL
  const username = userProfile?.username || profile?.username || user.email?.split('@')[0] || 'user'

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header with Navigation */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center space-x-4">
              {/* Back Button */}
              <button
                onClick={() => router.back()}
                className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <ArrowLeftIcon className="h-4 w-4 mr-2" />
                Back
              </button>
              
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
                <p className="mt-2 text-gray-600">Your personal information and preferences</p>
              </div>
            </div>
            
            {/* Menu Button */}
            <div className="mt-4 sm:mt-0">
              <Menu as="div" className="relative inline-block text-left">
                <div>
                  <Menu.Button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                    <Bars3Icon className="h-4 w-4 mr-2" />
                    Menu
                  </Menu.Button>
                </div>

                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-100"
                  enterFrom="transform opacity-0 scale-95"
                  enterTo="transform opacity-100 scale-100"
                  leave="transition ease-in duration-75"
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="transform opacity-0 scale-95"
                >
                  <Menu.Items className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                    <div className="py-1">
                      {menuItems.map((item) => (
                        <Menu.Item key={item.name}>
                          {({ active }) => (
                            <Link
                              href={item.href}
                              className={`${
                                active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                              } group flex items-center px-4 py-2 text-sm`}
                            >
                              <item.icon className="h-4 w-4 mr-3" />
                              {item.name}
                            </Link>
                          )}
                        </Menu.Item>
                      ))}
                    </div>
                  </Menu.Items>
                </Transition>
              </Menu>
            </div>
          </div>
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
                
                {/* Username display */}
                {username && (
                  <p className="text-sm text-blue-600 mt-1">@{username}</p>
                )}
              </div>
              
              <div className="mt-6 space-y-3">
                <button
                  onClick={() => router.push('/profile/edit')}
                  className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  <PencilIcon className="h-4 w-4 mr-2" />
                  Edit Profile
                </button>
                
                <Link
                  href={`/profile/${username}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                >
                  <EyeIcon className="h-4 w-4 mr-2" />
                  View Public Profile
                </Link>
              </div>
              
              {/* Profile Status */}
              <div className="mt-4 p-3 bg-gray-50 rounded-md">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Profile Status</span>
                  <span className={`text-sm font-medium ${
                    profile?.isPublic !== false ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {profile?.isPublic !== false ? 'Public' : 'Private'}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {profile?.isPublic !== false 
                    ? 'Your profile is visible to other users' 
                    : 'Your profile is private and not visible to other users'
                  }
                </p>
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
                        <p className="text-sm font-medium text-gray-500">Name</p>
                        <p className="text-sm text-gray-900">
                          {profile?.displayName || userProfile?.name || user.displayName || 'Not provided'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <EnvelopeIcon className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">Email</p>
                        <p className="text-sm text-gray-900">{profile?.email || user.email}</p>
                      </div>
                    </div>
                    
                    {profile?.phone && (
                      <div className="flex items-center">
                        <PhoneIcon className="h-5 w-5 text-gray-400 mr-3" />
                        <div>
                          <p className="text-sm font-medium text-gray-500">Phone</p>
                          <p className="text-sm text-gray-900">{profile.phone}</p>
                        </div>
                      </div>
                    )}
                    
                    {profile?.location && (
                      <div className="flex items-center">
                        <MapPinIcon className="h-5 w-5 text-gray-400 mr-3" />
                        <div>
                          <p className="text-sm font-medium text-gray-500">Location</p>
                          <p className="text-sm text-gray-900">{profile.location}</p>
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
                      {profile?.jobTitle && (
                        <div className="flex items-center">
                          <BriefcaseIcon className="h-5 w-5 text-gray-400 mr-3" />
                          <div>
                            <p className="text-sm font-medium text-gray-500">Job Title</p>
                            <p className="text-sm text-gray-900">{profile.jobTitle}</p>
                          </div>
                        </div>
                      )}
                      
                      {profile?.company && (
                        <div className="flex items-center">
                          <BriefcaseIcon className="h-5 w-5 text-gray-400 mr-3" />
                          <div>
                            <p className="text-sm font-medium text-gray-500">Company</p>
                            <p className="text-sm text-gray-900">{profile.company}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Bio */}
                {profile?.bio && (
                  <div>
                    <h4 className="text-md font-medium text-gray-900 mb-4">About</h4>
                    <p className="text-sm text-gray-900">{profile.bio}</p>
                  </div>
                )}

                {/* Social Links */}
                {(profile?.website || profile?.linkedin || profile?.twitter || profile?.instagram) && (
                  <div>
                    <h4 className="text-md font-medium text-gray-900 mb-4">Social Links</h4>
                    <div className="space-y-3">
                      {profile?.website && (
                        <div className="flex items-center">
                          <GlobeAltIcon className="h-5 w-5 text-gray-400 mr-3" />
                          <div>
                            <p className="text-sm font-medium text-gray-500">Website</p>
                            <a 
                              href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`}
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
                            <p className="text-sm font-medium text-gray-500">LinkedIn</p>
                            <a 
                              href={`https://linkedin.com/in/${profile.linkedin}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-blue-600 hover:text-blue-800"
                            >
                              linkedin.com/in/{profile.linkedin}
                            </a>
                          </div>
                        </div>
                      )}
                      
                      {profile?.twitter && (
                        <div className="flex items-center">
                          <LinkIcon className="h-5 w-5 text-gray-400 mr-3" />
                          <div>
                            <p className="text-sm font-medium text-gray-500">Twitter</p>
                            <a 
                              href={`https://twitter.com/${profile.twitter}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-blue-600 hover:text-blue-800"
                            >
                              @{profile.twitter}
                            </a>
                          </div>
                        </div>
                      )}
                      
                      {profile?.instagram && (
                        <div className="flex items-center">
                          <LinkIcon className="h-5 w-5 text-gray-400 mr-3" />
                          <div>
                            <p className="text-sm font-medium text-gray-500">Instagram</p>
                            <a 
                              href={`https://instagram.com/${profile.instagram}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-blue-600 hover:text-blue-800"
                            >
                              @{profile.instagram}
                            </a>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Account Information */}
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-4">Account Information</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Member Since</p>
                      <p className="text-sm text-gray-900">
                        {profile?.createdAt ? new Date(profile.createdAt as string).toLocaleDateString() : 'Unknown'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Last Updated</p>
                      <p className="text-sm text-gray-900">
                        {profile?.updatedAt ? new Date(profile.updatedAt as string).toLocaleDateString() : 'Unknown'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
