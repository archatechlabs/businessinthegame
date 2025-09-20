'use client'

import { useState, useEffect, useCallback, Fragment } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  XMarkIcon,
  TicketIcon, 
  CalendarIcon, 
  UserGroupIcon,
  ChartBarIcon,
  ClockIcon,
  CheckCircleIcon,
  HomeIcon,
  PencilIcon,
  Cog6ToothIcon,
  ChatBubbleLeftRightIcon,
  GlobeAltIcon,
  CameraIcon,
  PhotoIcon,
  LinkIcon,
  EyeIcon,
  Bars3Icon,
  UserIcon
} from '@heroicons/react/24/outline'
import { Tab } from '@headlessui/react'
import { updateUserProfile, checkUsernameAvailability, validateUsername, uploadProfileImage } from '@/utils/profileManagement'
import Image from 'next/image'
import { Menu, Transition } from '@headlessui/react'

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}

interface FormErrors {
  username?: string
  general?: string
}

export default function Dashboard() {
  const { user, userProfile, isAdmin, isApproved, loading: authLoading } = useAuth()
  const router = useRouter()
  const [selectedTab, setSelectedTab] = useState(0) // 0 for Dashboard, 1 for Edit Profile

  const [formData, setFormData] = useState({
    name: '',
    username: '',
    bio: '',
    location: '',
    website: '',
    twitter: '',
    linkedin: '',
    instagram: '',
    github: '',
    isPublic: true
  })
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [bannerFile, setBannerFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [bannerPreview, setBannerPreview] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [usernameError, setUsernameError] = useState<string | null>(null)
  const [isCheckingUsername, setIsCheckingUsername] = useState(false)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/signin')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (userProfile) {
      setFormData({
        name: userProfile.name || '',
        username: userProfile.username || '',
        bio: userProfile.bio || '',
        location: userProfile.location || '',
        website: userProfile.website || '',
        twitter: userProfile.socialLinks?.twitter || '',
        linkedin: userProfile.socialLinks?.linkedin || '',
        instagram: userProfile.socialLinks?.instagram || '',
        github: userProfile.socialLinks?.github || '',
        isPublic: userProfile.isPublic ?? true
      })
      setAvatarPreview(userProfile.avatar || null)
      setBannerPreview(userProfile.banner || null)
    }
  }, [userProfile])

  // Handle tab change from URL query
  useEffect(() => {
    const queryTab = null; // Simplified for now
    if (queryTab === 'edit-profile') {
      setSelectedTab(1);
    } else {
      setSelectedTab(0);
    }
  }, []);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type, checked } = e.target as HTMLInputElement
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleUsernameChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const username = e.target.value
    setFormData(prev => ({ ...prev, username }))
    
    setUsernameError(null) // Clear previous errors
    
    if (!username) {
      setUsernameError('Username is required')
      return
    }
    
    // Validate username format
    const validation = validateUsername(username)
    if (!validation.valid) {
      setUsernameError(validation.error || 'Invalid username format')
      return
    }
    
    // Check availability
    setIsCheckingUsername(true)
    try {
      if (userProfile?.username !== username) { // Only check if username actually changed
        const isAvailable = await checkUsernameAvailability(username, user?.uid)
        if (!isAvailable) {
          setUsernameError('Username is already taken')
        }
      }
    } catch (err: unknown) {
      setUsernameError('Error checking username availability')
    } finally {
      setIsCheckingUsername(false)
    }
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setAvatarFile(file)
      setAvatarPreview(URL.createObjectURL(file))
    }
  }

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setBannerFile(file)
      setBannerPreview(URL.createObjectURL(file))
    }
  }

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !userProfile) return

    setError(null)
    setSuccess(null)
    setIsLoading(true)

    if (usernameError) {
      setIsLoading(false)
      return
    }

    try {
      let newAvatarUrl = userProfile.avatar
      if (avatarFile) {
        newAvatarUrl = await uploadProfileImage(avatarFile, 'avatar')
      }

      let newBannerUrl = userProfile.banner
      if (bannerFile) {
        newBannerUrl = await uploadProfileImage(bannerFile, 'banner')
      }

      const updates = {
        name: formData.name,
        username: formData.username,
        bio: formData.bio,
        location: formData.location,
        website: formData.website,
        avatar: newAvatarUrl,
        banner: newBannerUrl,
        isPublic: formData.isPublic,
        socialLinks: {
          twitter: formData.twitter,
          linkedin: formData.linkedin,
          instagram: formData.instagram,
          github: formData.github,
        }
      }

      await updateUserProfile(user.uid, updates)
      setSuccess('Profile updated successfully!')
      
      // Switch back to dashboard tab after successful update
      setSelectedTab(0) 
      router.replace('/dashboard'); // Update URL without full reload
    } catch (err: unknown) {
      console.error('Error updating profile:', err)
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('An unexpected error occurred during profile update.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  const stats = [
    { name: 'My Tickets', value: '3', icon: TicketIcon, color: 'bg-blue-500', href: '/tickets' },
    { name: 'Upcoming Events', value: '2', icon: CalendarIcon, color: 'bg-green-500', href: '/events' },
    { name: 'Connections', value: '12', icon: UserGroupIcon, color: 'bg-purple-500', href: '/friends' },
    { name: 'Messages', value: '5', icon: ChatBubbleLeftRightIcon, color: 'bg-orange-500', href: '/inbox' }
  ]

  const recentActivity = [
    { id: 1, action: 'Purchased ticket for BIG Summit 2024', time: '2 hours ago', icon: TicketIcon },
    { id: 2, action: 'Connected with Sarah Johnson', time: '1 day ago', icon: UserGroupIcon },
    { id: 3, action: 'Updated profile information', time: '3 days ago', icon: CheckCircleIcon },
    { id: 4, action: 'Joined BIG Networking Event', time: '1 week ago', icon: CalendarIcon }
  ]

  const menuOptions = [
    { name: 'Home Page', href: '/', icon: HomeIcon, color: 'text-blue-600' },
    { name: 'Events', href: '/events', icon: CalendarIcon, color: 'text-green-600' },
    { name: 'My Profile', href: '/profile', icon: UserIcon, color: 'text-purple-600' },
    { name: 'Edit Profile', href: '/dashboard?tab=edit-profile', icon: PencilIcon, color: 'text-orange-600' },
    { name: 'My Tickets', href: '/tickets', icon: TicketIcon, color: 'text-blue-600' },
    { name: 'Messages', href: '/inbox', icon: ChatBubbleLeftRightIcon, color: 'text-green-600' },
    { name: 'Connections', href: '/friends', icon: UserGroupIcon, color: 'text-purple-600' },
    { name: 'Settings', href: '/settings', icon: Cog6ToothIcon, color: 'text-gray-600' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header with Navigation */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome back, {userProfile?.name || user.displayName || 'User'}!
              </h1>
              <p className="mt-2 text-gray-600">Manage your BIG membership and profile</p>
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
                      {menuOptions.map((option) => (
                        <Menu.Item key={option.name}>
                          {({ active }) => (
                            <Link
                              href={option.href}
                              className={`${
                                active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                              } group flex items-center px-4 py-2 text-sm`}
                            >
                              <option.icon className="h-4 w-4 mr-3" />
                              {option.name}
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

        {/* Status Banner */}
        {!isApproved && (
          <div className="mb-8 bg-yellow-50 border border-yellow-200 rounded-md p-4">
            <div className="flex">
              <ClockIcon className="h-5 w-5 text-yellow-400" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  Account Pending Approval
                </h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>Your account is currently pending admin approval. You&apos;ll receive an email once approved.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <Tab.Group selectedIndex={selectedTab} onChange={setSelectedTab}>
          <Tab.List className="flex space-x-1 rounded-xl bg-blue-900/20 p-1 mb-8">
            <Tab
              className={({ selected }) =>
                classNames(
                  'w-full rounded-lg py-2.5 text-sm font-medium leading-5 text-blue-700',
                  'ring-white/60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2',
                  selected
                    ? 'bg-white shadow'
                    : 'text-blue-100 hover:bg-white/[0.12] hover:text-white'
                )
              }
            >
              Dashboard
            </Tab>
            <Tab
              className={({ selected }) =>
                classNames(
                  'w-full rounded-lg py-2.5 text-sm font-medium leading-5 text-blue-700',
                  'ring-white/60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2',
                  selected
                    ? 'bg-white shadow'
                    : 'text-blue-100 hover:bg-white/[0.12] hover:text-white'
                )
              }
            >
              Edit Profile
            </Tab>
          </Tab.List>
          <Tab.Panels className="mt-2">
            <Tab.Panel
              className={classNames(
                'rounded-xl bg-white p-3',
                'ring-white/60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2'
              )}
            >
              {/* Dashboard Content */}
              <div className="p-6">
                {/* Stats */}
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
                  {stats.map((stat) => (
                    <Link href={stat.href} key={stat.name} className="bg-white overflow-hidden shadow rounded-lg hover:shadow-lg transition-shadow">
                      <div className="p-5">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <div className={`p-3 rounded-md ${stat.color}`}>
                              <stat.icon className="h-6 w-6 text-white" />
                            </div>
                          </div>
                          <div className="ml-5 w-0 flex-1">
                            <dl>
                              <dt className="text-sm font-medium text-gray-500 truncate">{stat.name}</dt>
                              <dd className="text-lg font-medium text-gray-900">{stat.value}</dd>
                            </dl>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Recent Activity */}
                  <div className="bg-white shadow rounded-lg">
                    <div className="px-6 py-4 border-b border-gray-200">
                      <h2 className="text-lg font-medium text-gray-900">Recent Activity</h2>
                    </div>
                    <div className="divide-y divide-gray-200">
                      {recentActivity.map((activity) => (
                        <div key={activity.id} className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="flex-shrink-0">
                              <activity.icon className="h-5 w-5 text-gray-400" />
                            </div>
                            <div className="ml-3 flex-1">
                              <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                              <p className="text-sm text-gray-500">{activity.time}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* All Menu Options */}
                  <div className="bg-white shadow rounded-lg">
                    <div className="px-6 py-4 border-b border-gray-200">
                      <h2 className="text-lg font-medium text-gray-900">All Menu Options</h2>
                    </div>
                    <div className="p-6">
                      <div className="grid grid-cols-2 gap-4">
                        {menuOptions.map((option) => (
                          <Link
                            key={option.name}
                            href={option.href}
                            className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                          >
                            <option.icon className={`h-8 w-8 ${option.color} mb-2`} />
                            <span className="text-sm font-medium text-gray-900 text-center">{option.name}</span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Admin Section */}
                {isAdmin && (
                  <div className="mt-8 bg-white shadow rounded-lg">
                    <div className="px-6 py-4 border-b border-gray-200">
                      <h2 className="text-lg font-medium text-gray-900">Admin Panel</h2>
                    </div>
                    <div className="p-6">
                      <p className="text-sm text-gray-600 mb-4">
                        You have admin privileges. Manage users, events, and platform settings.
                      </p>
                      <button
                        onClick={() => router.push('/admin')}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                      >
                        Go to Admin Panel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </Tab.Panel>
            <Tab.Panel
              className={classNames(
                'rounded-xl bg-white p-3',
                'ring-white/60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2'
              )}
            >
              {/* Edit Profile Content */}
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Edit Your Profile</h2>
                {success && (
                  <div className="mb-4 rounded-md bg-green-50 p-4">
                    <div className="flex">
                      <CheckCircleIcon className="h-5 w-5 text-green-400" aria-hidden="true" />
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-green-800">Success</h3>
                        <p className="mt-2 text-sm text-green-700">{success}</p>
                      </div>
                    </div>
                  </div>
                )}
                {error && (
                  <div className="mb-4 rounded-md bg-red-50 p-4">
                    <div className="flex">
                      <XMarkIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-red-800">Error</h3>
                        <p className="mt-2 text-sm text-red-700">{error}</p>
                      </div>
                    </div>
                  </div>
                )}
                <form onSubmit={handleProfileSubmit} className="space-y-6">
                  {/* Profile Picture and Banner */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Profile Picture</label>
                      <div className="mt-1 flex items-center space-x-4">
                        <div className="flex-shrink-0 h-24 w-24 rounded-full overflow-hidden bg-gray-100">
                          {avatarPreview ? (
                            <Image src={avatarPreview} alt="Avatar Preview" width={96} height={96} className="h-full w-full object-cover" />
                          ) : (
                            <UserIcon className="h-full w-full text-gray-400" />
                          )}
                        </div>
                        <label htmlFor="avatar-upload" className="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                          <CameraIcon className="h-5 w-5 inline-block mr-2" />
                          Change Avatar
                          <input id="avatar-upload" name="avatar" type="file" className="sr-only" accept="image/*" onChange={handleAvatarChange} />
                        </label>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Banner Image</label>
                      <div className="mt-1 flex items-center space-x-4">
                        <div className="flex-shrink-0 h-32 w-full rounded-md overflow-hidden bg-gray-100">
                          {bannerPreview ? (
                            <Image src={bannerPreview} alt="Banner Preview" width={600} height={128} className="h-full w-full object-cover" />
                          ) : (
                            <PhotoIcon className="h-full w-full text-gray-400" />
                          )}
                        </div>
                        <label htmlFor="banner-upload" className="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                          <PhotoIcon className="h-5 w-5 inline-block mr-2" />
                          Change Banner
                          <input id="banner-upload" name="banner" type="file" className="sr-only" accept="image/*" onChange={handleBannerChange} />
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Basic Information */}
                  <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                    <div className="sm:col-span-3">
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                        Full Name
                      </label>
                      <div className="mt-1">
                        <input
                          type="text"
                          name="name"
                          id="name"
                          value={formData.name}
                          onChange={handleFormChange}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        />
                      </div>
                    </div>

                    <div className="sm:col-span-3">
                      <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                        Username
                      </label>
                      <div className="mt-1 relative">
                        <input
                          type="text"
                          name="username"
                          id="username"
                          value={formData.username}
                          onChange={handleUsernameChange}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        />
                        {isCheckingUsername && (
                          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                            <svg className="animate-spin h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                          </div>
                        )}
                      </div>
                      {usernameError && <p className="mt-2 text-sm text-red-600">{usernameError}</p>}
                    </div>

                    <div className="sm:col-span-6">
                      <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
                        Bio
                      </label>
                      <div className="mt-1">
                        <textarea
                          id="bio"
                          name="bio"
                          rows={3}
                          value={formData.bio}
                          onChange={handleFormChange}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        ></textarea>
                      </div>
                    </div>

                    <div className="sm:col-span-3">
                      <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                        Location
                      </label>
                      <div className="mt-1">
                        <input
                          type="text"
                          name="location"
                          id="location"
                          value={formData.location}
                          onChange={handleFormChange}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        />
                      </div>
                    </div>

                    <div className="sm:col-span-3">
                      <label htmlFor="website" className="block text-sm font-medium text-gray-700">
                        Website
                      </label>
                      <div className="mt-1">
                        <input
                          type="text"
                          name="website"
                          id="website"
                          value={formData.website}
                          onChange={handleFormChange}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Social Links */}
                  <div className="pt-6">
                    <h3 className="text-lg font-medium leading-6 text-gray-900">Social Links</h3>
                    <p className="mt-1 text-sm text-gray-500">Links to your social media profiles.</p>
                    <div className="mt-4 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                      <div className="sm:col-span-3">
                        <label htmlFor="twitter" className="block text-sm font-medium text-gray-700">
                          Twitter
                        </label>
                        <div className="mt-1 flex rounded-md shadow-sm">
                          <span className="inline-flex items-center rounded-l-md border border-r-0 border-gray-300 bg-gray-50 px-3 text-gray-500 sm:text-sm">
                            https://twitter.com/
                          </span>
                          <input
                            type="text"
                            name="twitter"
                            id="twitter"
                            value={formData.twitter}
                            onChange={handleFormChange}
                            className="block w-full flex-1 rounded-none rounded-r-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                          />
                        </div>
                      </div>

                      <div className="sm:col-span-3">
                        <label htmlFor="linkedin" className="block text-sm font-medium text-gray-700">
                          LinkedIn
                        </label>
                        <div className="mt-1 flex rounded-md shadow-sm">
                          <span className="inline-flex items-center rounded-l-md border border-r-0 border-gray-300 bg-gray-50 px-3 text-gray-500 sm:text-sm">
                            https://linkedin.com/in/
                          </span>
                          <input
                            type="text"
                            name="linkedin"
                            id="linkedin"
                            value={formData.linkedin}
                            onChange={handleFormChange}
                            className="block w-full flex-1 rounded-none rounded-r-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                          />
                        </div>
                      </div>

                      <div className="sm:col-span-3">
                        <label htmlFor="instagram" className="block text-sm font-medium text-gray-700">
                          Instagram
                        </label>
                        <div className="mt-1 flex rounded-md shadow-sm">
                          <span className="inline-flex items-center rounded-l-md border border-r-0 border-gray-300 bg-gray-50 px-3 text-gray-500 sm:text-sm">
                            https://instagram.com/
                          </span>
                          <input
                            type="text"
                            name="instagram"
                            id="instagram"
                            value={formData.instagram}
                            onChange={handleFormChange}
                            className="block w-full flex-1 rounded-none rounded-r-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                          />
                        </div>
                      </div>

                      <div className="sm:col-span-3">
                        <label htmlFor="github" className="block text-sm font-medium text-gray-700">
                          GitHub
                        </label>
                        <div className="mt-1 flex rounded-md shadow-sm">
                          <span className="inline-flex items-center rounded-l-md border border-r-0 border-gray-300 bg-gray-50 px-3 text-gray-500 sm:text-sm">
                            https://github.com/
                          </span>
                          <input
                            type="text"
                            name="github"
                            id="github"
                            value={formData.github}
                            onChange={handleFormChange}
                            className="block w-full flex-1 rounded-none rounded-r-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Privacy Settings */}
                  <div className="pt-6">
                    <h3 className="text-lg font-medium leading-6 text-gray-900">Privacy Settings</h3>
                    <p className="mt-1 text-sm text-gray-500">Control who can see your profile.</p>
                    <div className="mt-4 space-y-4">
                      <div className="flex items-center">
                        <input
                          id="isPublic"
                          name="isPublic"
                          type="checkbox"
                          checked={formData.isPublic}
                          onChange={handleFormChange}
                          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <label htmlFor="isPublic" className="ml-3 block text-sm font-medium text-gray-700">
                          Make my profile public
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="pt-5">
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={isLoading || isCheckingUsername || !!usernameError}
                        className="ml-3 inline-flex justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isLoading ? 'Saving...' : 'Save Changes'}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </Tab.Panel>
          </Tab.Panels>
        </Tab.Group>
      </div>
    </div>
  )
}
