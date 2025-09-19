'use client'

import { useState } from 'react'
import { UserIcon, PencilIcon, CameraIcon } from '@heroicons/react/24/outline'

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false)
  const [profile, setProfile] = useState({
    name: 'John Doe',
    email: 'john@example.com',
    bio: 'Athlete, Entrepreneur, Creator',
    avatar: null
  })

  const handleSave = () => {
    // TODO: Implement save functionality
    setIsEditing(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-6 py-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-3xl font-bold text-blue-900">Profile</h1>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="flex items-center space-x-2 bg-blue-900 text-white px-4 py-2 rounded-lg hover:bg-blue-800 transition-colors"
              >
                <PencilIcon className="h-4 w-4" />
                <span>{isEditing ? 'Cancel' : 'Edit Profile'}</span>
              </button>
            </div>

            {/* Profile Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Avatar Section */}
              <div className="lg:col-span-1">
                <div className="text-center">
                  <div className="relative inline-block">
                    <div className="w-32 h-32 bg-gray-200 rounded-full flex items-center justify-center">
                      {profile.avatar ? (
                        <img
                          src={profile.avatar}
                          alt="Profile"
                          className="w-32 h-32 rounded-full object-cover"
                        />
                      ) : (
                        <UserIcon className="w-16 h-16 text-gray-400" />
                      )}
                    </div>
                    {isEditing && (
                      <button className="absolute bottom-0 right-0 bg-blue-900 text-white p-2 rounded-full hover:bg-blue-800 transition-colors">
                        <CameraIcon className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  <h2 className="mt-4 text-xl font-semibold text-gray-900">
                    {profile.name}
                  </h2>
                  <p className="text-gray-600">{profile.email}</p>
                </div>
              </div>

              {/* Profile Details */}
              <div className="lg:col-span-2">
                <div className="space-y-6">
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={profile.name}
                        onChange={(e) => setProfile({...profile, name: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="text-gray-900">{profile.name}</p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    {isEditing ? (
                      <input
                        type="email"
                        value={profile.email}
                        onChange={(e) => setProfile({...profile, email: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="text-gray-900">{profile.email}</p>
                    )}
                  </div>

                  {/* Bio */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bio
                    </label>
                    {isEditing ? (
                      <textarea
                        value={profile.bio}
                        onChange={(e) => setProfile({...profile, bio: e.target.value})}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Tell us about yourself..."
                      />
                    ) : (
                      <p className="text-gray-900">{profile.bio}</p>
                    )}
                  </div>

                  {/* Save Button */}
                  {isEditing && (
                    <div className="pt-4">
                      <button
                        onClick={handleSave}
                        className="bg-blue-900 text-white px-6 py-2 rounded-lg hover:bg-blue-800 transition-colors"
                      >
                        Save Changes
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
