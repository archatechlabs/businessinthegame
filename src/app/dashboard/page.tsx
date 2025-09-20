'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { updateUserProfile, checkUsernameAvailability, validateUsername, uploadProfileImage } from '@/utils/profileManagement'
import { 
  TicketIcon, 
  CalendarIcon, 
  UserGroupIcon,
  ChartBarIcon,
  ClockIcon,
  CheckCircleIcon,
  HomeIcon,
  CogIcon,
  UserIcon,
  InboxIcon,
  UsersIcon,
  CameraIcon,
  PhotoIcon,
  ArrowLeftIcon,
  PencilIcon
} from '@heroicons/react/24/outline'

export default function Dashboard() {
  const { user, userProfile, isAdmin, isApproved, loading } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'dashboard' | 'profile'>('dashboard')
  
  // Profile editing state
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
  const [avatar, setAvatar] = useState('')
  const [banner, setBanner] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [usernameError, setUsernameError] = useState<string | null>(null)
  const [isCheckingUsername, setIsCheckingUsername] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
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
      setAvatar(userProfile.avatar || '')
      setBanner(userProfile.banner || '')
    }
  }, [userProfile, user, loading, router])

  const stats = [
    { name: 'My Tickets', value: '3', icon: TicketIcon, color: 'bg-blue-500' },
    { name: 'Upcoming Events', value: '2', icon: CalendarIcon, color: 'bg-green-500' },
    { name: 'Connections', value: '12', icon: UserGroupIcon, color: 'bg-purple-500' },
    { name: 'Messages', value: '5', icon: ChartBarIcon, color: 'bg-orange-500' }
  ]

  const recentActivity = [
    { id: 1, action: 'Purchased ticket for BIG Summit 2024', time: '2 hours ago', icon: TicketIcon },
    { id: 2, action: 'Connected with Sarah Johnson', time: '1 day ago', icon: UserGroupIcon },
    { id: 3, action: 'Updated profile information', time: '3 days ago', icon: CheckCircleIcon },
    { id: 4, action: 'Joined BIG Networking Event', time: '1 week ago', icon: CalendarIcon }
  ]

  const quickActions = [
    { name: 'Browse Events', href: '/events', icon: CalendarIcon },
    { name: 'View Tickets', href: '/tickets', icon: TicketIcon },
    { name: 'Messages', href: '/inbox', icon: InboxIcon },
    { name: 'Connections', href: '/friends', icon: UsersIcon }
  ]

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    if (name === 'username') {
      setUsernameError(null)
    }
  }

  const handleUsernameChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const username = e.target.value
    setFormData(prev => ({ ...prev, username }))
    setUsernameError(null)
    
    if (!username) return
    
    const validation = validateUsername(username)
    if (!validation.valid) {
      setUsernameError(validation.error || "Invalid username")
      return
    }
    
    setIsCheckingUsername(true)
    try {
      const isAvailable = await checkUsernameAvailability(username, user!.uid)
      if (!isAvailable) {
        setUsernameError('Username is already taken')
      }
    } catch (err: unknown) {
      setUsernameError('Error checking username availability')
    } finally {
      setIsCheckingUsername(false)
    }
  }

  const handleImageUpload = async (file: File, type: 'avatar' | 'banner') => {
    try {
      const url = await uploadProfileImage(file, type)
      if (type === 'avatar') {
        setAvatar(url)
      } else {
        setBanner(url)
      }
    } catch (err: unknown) {
      setError('Failed to upload image')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const profileData = {
        name: formData.name,
        username: formData.username,
        bio: formData.bio,
        location: formData.location,
        website: formData.website,
        socialLinks: {
          twitter: formData.twitter,
          linkedin: formData.linkedin,
          instagram: formData.instagram,
          github: formData.github
        },
        avatar: avatar,
        banner: banner,
        isPublic: formData.isPublic
      }

      await updateUserProfile(user!.uid, profileData)
      setSuccess('Profile updated successfully!')
      
      // Switch back to dashboard tab after successful update
      setTimeout(() => {
        setActiveTab('dashboard')
        setSuccess(null)
      }, 2000)
    } catch (err: unknown) {
      setError('Failed to update profile')
    } finally {
      setIsLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Please log in to view your dashboard</h1>
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
            
            {/* Main Website Navigation */}
            <div className="mt-4 sm:mt-0 flex flex-col sm:flex-row gap-3">
              <Link
                href="/"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors shadow-sm"
              >
                <HomeIcon className="h-4 w-4 mr-2" />
                Main Website
              </Link>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'dashboard'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center">
                  <ChartBarIcon className="h-4 w-4 mr-2" />
                  Dashboard
                </div>
              </button>
              <button
                onClick={() => setActiveTab('profile')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'profile'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center">
                  <PencilIcon className="h-4 w-4 mr-2" />
                  Edit Profile
                </div>
              </button>
            </nav>
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

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <>
            {/* Stats */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
              {stats.map((stat) => (
                <div key={stat.name} className="bg-white overflow-hidden shadow rounded-lg">
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
                </div>
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

              {/* Quick Actions */}
              <div className="bg-white shadow rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900">Quick Actions</h2>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-2 gap-4">
                    {quickActions.map((action) => (
                      <button
                        key={action.name}
                        onClick={() => router.push(action.href)}
                        className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <action.icon className="h-8 w-8 text-gray-400 mb-2" />
                        <span className="text-sm font-medium text-gray-900">{action.name}</span>
                      </button>
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
          </>
        )}

        {/* Profile Edit Tab */}
        {activeTab === 'profile' && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Edit Profile</h2>
                <p className="text-sm text-gray-600">Update your personal information and preferences</p>
              </div>
              
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
                    {error}
                  </div>
                )}
                
                {success && (
                  <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-md text-sm">
                    {success}
                  </div>
                )}

                {/* Profile Images */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Avatar */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Profile Picture</label>
                    <div className="flex items-center space-x-4">
                      <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                        {avatar ? (
                          <img src={avatar} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                          <UserIcon className="h-8 w-8 text-gray-400" />
                        )}
                      </div>
                      <div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) handleImageUpload(file, 'avatar')
                          }}
                          className="hidden"
                          id="avatar-upload"
                        />
                        <label
                          htmlFor="avatar-upload"
                          className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
                        >
                          <CameraIcon className="h-4 w-4 mr-2" />
                          Upload Photo
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Banner */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Banner Image</label>
                    <div className="flex items-center space-x-4">
                      <div className="w-32 h-16 rounded overflow-hidden bg-gray-200 flex items-center justify-center">
                        {banner ? (
                          <img src={banner} alt="Banner" className="w-full h-full object-cover" />
                        ) : (
                          <PhotoIcon className="h-6 w-6 text-gray-400" />
                        )}
                      </div>
                      <div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) handleImageUpload(file, 'banner')
                          }}
                          className="hidden"
                          id="banner-upload"
                        />
                        <label
                          htmlFor="banner-upload"
                          className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
                        >
                          <CameraIcon className="h-4 w-4 mr-2" />
                          Upload Banner
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      id="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>

                  <div>
                    <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                      Username *
                    </label>
                    <input
                      type="text"
                      name="username"
                      id="username"
                      value={formData.username}
                      onChange={handleUsernameChange}
                      required
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                    {isCheckingUsername && (
                      <p className="mt-1 text-sm text-gray-500">Checking availability...</p>
                    )}
                    {usernameError && (
                      <p className="mt-1 text-sm text-red-600">{usernameError}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
                    Bio
                  </label>
                  <textarea
                    name="bio"
                    id="bio"
                    rows={3}
                    value={formData.bio}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Tell us about yourself"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                      Location
                    </label>
                    <input
                      type="text"
                      name="location"
                      id="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="City, Country"
                    />
                  </div>

                  <div>
                    <label htmlFor="website" className="block text-sm font-medium text-gray-700">
                      Website
                    </label>
                    <input
                      type="url"
                      name="website"
                      id="website"
                      value={formData.website}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="https://yourwebsite.com"
                    />
                  </div>
                </div>

                {/* Social Links */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Social Links</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="twitter" className="block text-sm font-medium text-gray-700">
                        Twitter
                      </label>
                      <input
                        type="text"
                        name="twitter"
                        id="twitter"
                        value={formData.twitter}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="@username"
                      />
                    </div>

                    <div>
                      <label htmlFor="linkedin" className="block text-sm font-medium text-gray-700">
                        LinkedIn
                      </label>
                      <input
                        type="text"
                        name="linkedin"
                        id="linkedin"
                        value={formData.linkedin}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="username"
                      />
                    </div>

                    <div>
                      <label htmlFor="instagram" className="block text-sm font-medium text-gray-700">
                        Instagram
                      </label>
                      <input
                        type="text"
                        name="instagram"
                        id="instagram"
                        value={formData.instagram}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="@username"
                      />
                    </div>

                    <div>
                      <label htmlFor="github" className="block text-sm font-medium text-gray-700">
                        GitHub
                      </label>
                      <input
                        type="text"
                        name="github"
                        id="github"
                        value={formData.github}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="username"
                      />
                    </div>
                  </div>
                </div>

                {/* Privacy Settings */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Privacy Settings</h3>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="isPublic"
                      id="isPublic"
                      checked={formData.isPublic}
                      onChange={(e) => setFormData(prev => ({ ...prev, isPublic: e.target.checked }))}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="isPublic" className="ml-2 block text-sm text-gray-900">
                      Make my profile public
                    </label>
                  </div>
                  <p className="mt-1 text-sm text-gray-500">
                    When enabled, other users can find and view your profile
                  </p>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
