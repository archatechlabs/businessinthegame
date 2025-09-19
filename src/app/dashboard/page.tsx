'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { 
  UserIcon, 
  TicketIcon, 
  CalendarIcon, 
  CogIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon
} from '@heroicons/react/24/outline'

export default function Dashboard() {
  const { user, userProfile, loading, isApproved, isAdmin } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/')
        return
      }
      
      if (userProfile?.role === 'pending') {
        // User is pending approval, show pending state
        return
      }
      
      if (!isApproved) {
        router.push('/')
        return
      }
    }
  }, [user, userProfile, loading, isApproved, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect
  }

  if (userProfile?.role === 'pending') {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <ClockIcon className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Account Pending Approval</h1>
            <p className="text-gray-600 mb-6">
              Your account is currently being reviewed by our admin team. 
              You&apos;ll receive an email notification once your membership is approved.
            </p>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-yellow-800 text-sm">
                <strong>What happens next?</strong><br />
                Our team will review your application and approve your membership within 24-48 hours. 
                Once approved, you&apos;ll have full access to all BIG features.
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!isApproved) {
    return null // Will redirect
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Welcome back, {userProfile?.name}!</h1>
          <p className="text-gray-600 mt-2">Here&apos;s what&apos;s happening in your BIG community</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <TicketIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">My Tickets</p>
                <p className="text-2xl font-bold text-gray-900">3</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CalendarIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Upcoming Events</p>
                <p className="text-2xl font-bold text-gray-900">2</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <UserIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Connections</p>
                <p className="text-2xl font-bold text-gray-900">12</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <CheckCircleIcon className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Account approved</p>
                    <p className="text-xs text-gray-500">2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <TicketIcon className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Purchased ticket for BIG Networking Mixer</p>
                    <p className="text-xs text-gray-500">1 day ago</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <UserIcon className="h-5 w-5 text-purple-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Profile updated</p>
                    <p className="text-xs text-gray-500">3 days ago</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                <a
                  href="/events"
                  className="flex items-center justify-between p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <CalendarIcon className="h-5 w-5 text-blue-600" />
                    <span className="text-sm font-medium text-blue-900">Browse Events</span>
                  </div>
                  <span className="text-blue-600">→</span>
                </a>
                
                <a
                  href="/tickets"
                  className="flex items-center justify-between p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <TicketIcon className="h-5 w-5 text-green-600" />
                    <span className="text-sm font-medium text-green-900">View My Tickets</span>
                  </div>
                  <span className="text-green-600">→</span>
                </a>
                
                <a
                  href="/profile"
                  className="flex items-center justify-between p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <UserIcon className="h-5 w-5 text-purple-600" />
                    <span className="text-sm font-medium text-purple-900">Edit Profile</span>
                  </div>
                  <span className="text-purple-600">→</span>
                </a>

                {isAdmin && (
                  <a
                    href="/admin"
                    className="flex items-center justify-between p-3 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <CogIcon className="h-5 w-5 text-red-600" />
                      <span className="text-sm font-medium text-red-900">Admin Dashboard</span>
                    </div>
                    <span className="text-red-600">→</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Welcome Message */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-start space-x-3">
            <CheckCircleIcon className="h-6 w-6 text-blue-600 mt-0.5" />
            <div>
              <h3 className="text-lg font-semibold text-blue-900">Welcome to BIG!</h3>
              <p className="text-blue-800 mt-1">
                You&apos;re now part of the community where multi-hyphenates connect, collaborate, and thrive. 
                Start by exploring upcoming events or updating your profile.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
