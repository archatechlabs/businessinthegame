'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { updateUserProfile, checkUsernameAvailability, validateUsername, uploadProfileImage } from '@/utils/profileManagement'
import { ArrowLeftIcon, CameraIcon, PhotoIcon } from '@heroicons/react/24/outline'

export default function EditProfilePage() {
  const { user, userProfile, loading } = useAuth()
  const router = useRouter()
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
  }, [user, userProfile, loading, router])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))

    // Clear errors when user starts typing
    if (error) setError(null)
    if (usernameError) setUsernameError(null)
  }

  const handleUsernameChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const username = e.target.value
    setFormData(prev => ({ ...prev, username }))
    
    // Clear previous errors
    setUsernameError(null)
    
    if (!username) return
    
    // Validate username format
    const validation = validateUsername(username)
    if (!validation.valid) {
      setUsernameError(validation.error || 'Invalid username')
      return
    }
    
    // Check availability
    setIsCheckingUsername(true)
    try {
      const isAvailable = await checkUsernameAvailability(username, user?.uid)
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
      const imageUrl = await uploadProfileImage(file, type)
      if (type === 'avatar') {
        setAvatar(imageUrl)
      } else {
        setBanner(imageUrl)
      }
    } catch (err: unknown) {
      setError('Failed to upload image')
    }
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      setError('You must be logged in to edit your profile.')
      return
    }

    if (usernameError) {
      setError('Please fix the username error before saving.')
      return
    }

    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const updates = {
        name: formData.name,
        username: formData.username.toLowerCase(),
        bio: formData.bio,
        location: formData.location,
        website: formData.website,
        socialLinks: {
          twitter: formData.twitter,
          linkedin: formData.linkedin,
          instagram: formData.instagram,
          github: formData.github
        },
        avatar,
        banner,
        isPublic: formData.isPublic
      }

      await updateUserProfile(user.uid, updates)
      setSuccess('Profile updated successfully!')
      setTimeout(() => {
        router.push('/profile')
      }, 1500)
    } catch (err: unknown) {
      console.error('Error updating profile:', err)
      setError(err instanceof Error ? err.message : 'Failed to update profile.')
    } finally {
      setIsLoading(false)
    }
  }

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen bg-gray-900 text-white">Loading profile...</div>
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => router.back()}
          className="flex items-center text-blue-600 hover:text-blue-800 mb-6"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-2" /> Back to Profile
        </button>

        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">Edit Profile</h1>
            <p className="mt-1 text-sm text-gray-600">Update your profile information and settings.</p>
          </div>

          <form onSubmit={handleSaveProfile} className="p-6 space-y-6">
            {/* Profile Images */}
            <div className="space-y-6">
              {/* Banner */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Banner Image</label>
                <div className="relative">
                  <div className="h-32 w-full bg-gray-200 rounded-lg overflow-hidden">
                    {banner ? (
                      <img src={banner} alt="Banner" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                        <PhotoIcon className="h-8 w-8 text-white" />
                      </div>
                    )}
                  </div>
                  <label className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 hover:opacity-100 transition-opacity cursor-pointer">
                    <CameraIcon className="h-6 w-6 text-white" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'banner')}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Avatar */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Profile Picture</label>
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <div className="h-20 w-20 rounded-full bg-gray-200 overflow-hidden">
                      {avatar ? (
                        <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                          <PhotoIcon className="h-8 w-8 text-gray-500" />
                        </div>
                      )}
                    </div>
                    <label className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 hover:opacity-100 transition-opacity cursor-pointer rounded-full">
                      <CameraIcon className="h-4 w-4 text-white" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'avatar')}
                        className="hidden"
                      />
                    </label>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Click to upload a new profile picture</p>
                    <p className="text-xs text-gray-500">Recommended: 400x400px or larger</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="profile-name" className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
                <input
                  type="text"
                  id="profile-name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="profile-username" className="block text-sm font-medium text-gray-700 mb-2">Username *</label>
                <input
                  type="text"
                  id="profile-username"
                  name="username"
                  value={formData.username}
                  onChange={handleUsernameChange}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                    usernameError ? 'border-red-300' : 'border-gray-300'
                  }`}
                  required
                />
                {isCheckingUsername && (
                  <p className="mt-1 text-sm text-blue-600">Checking availability...</p>
                )}
                {usernameError && (
                  <p className="mt-1 text-sm text-red-600">{usernameError}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">This will be your public username (e.g., @username)</p>
              </div>
            </div>

            <div>
              <label htmlFor="profile-bio" className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
              <textarea
                id="profile-bio"
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Tell us about yourself..."
              />
              <p className="mt-1 text-xs text-gray-500">Brief description about yourself (max 160 characters)</p>
            </div>

            {/* Location and Website */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="City, Country"
                />
              </div>

              <div>
                <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-2">Website</label>
                <input
                  type="url"
                  id="website"
                  name="website"
                  value={formData.website}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="https://yourwebsite.com"
                />
              </div>
            </div>

            {/* Social Links */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Social Links</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="twitter" className="block text-sm font-medium text-gray-700 mb-2">Twitter</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">@</span>
                    </div>
                    <input
                      type="text"
                      id="twitter"
                      name="twitter"
                      value={formData.twitter}
                      onChange={handleInputChange}
                      className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="username"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="linkedin" className="block text-sm font-medium text-gray-700 mb-2">LinkedIn</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">linkedin.com/in/</span>
                    </div>
                    <input
                      type="text"
                      id="linkedin"
                      name="linkedin"
                      value={formData.linkedin}
                      onChange={handleInputChange}
                      className="w-full pl-24 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="username"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="instagram" className="block text-sm font-medium text-gray-700 mb-2">Instagram</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">@</span>
                    </div>
                    <input
                      type="text"
                      id="instagram"
                      name="instagram"
                      value={formData.instagram}
                      onChange={handleInputChange}
                      className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="username"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="github" className="block text-sm font-medium text-gray-700 mb-2">GitHub</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">github.com/</span>
                    </div>
                    <input
                      type="text"
                      id="github"
                      name="github"
                      value={formData.github}
                      onChange={handleInputChange}
                      className="w-full pl-20 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="username"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Privacy Settings */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Privacy Settings</h3>
              <div className="flex items-center">
                <input
                  id="isPublic"
                  name="isPublic"
                  type="checkbox"
                  checked={formData.isPublic}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="isPublic" className="ml-2 block text-sm text-gray-900">
                  Make my profile public
                </label>
              </div>
              <p className="mt-1 text-sm text-gray-500">
                When enabled, your profile will be visible to other users and searchable by username.
              </p>
            </div>

            {/* Error and Success Messages */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 rounded-md p-4">
                <p className="text-green-600 text-sm">{success}</p>
              </div>
            )}

            {/* Save Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isLoading || !!usernameError}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Saving...' : 'Save Profile'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
