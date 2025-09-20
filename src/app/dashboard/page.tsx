'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
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
  UsersIcon
} from '@heroicons/react/24/outline'

export default function Dashboard() {
  const { user, userProfile, isAdmin, isApproved } = useAuth()
  const router = useRouter()

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
    { name: 'Edit Profile', href: '/profile/edit', icon: UserIcon },
    { name: 'Messages', href: '/inbox', icon: InboxIcon },
    { name: 'Connections', href: '/friends', icon: UsersIcon },
    { name: 'Settings', href: '/settings', icon: CogIcon }
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
              <p className="mt-2 text-gray-600">Here&apos;s what&apos;s happening with your BIG membership</p>
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
              
              <div className="flex gap-2">
                <Link
                  href="/profile"
                  className="inline-flex items-center px-3 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                >
                  <UserIcon className="h-4 w-4 mr-1" />
                  Profile
                </Link>
                
                <Link
                  href="/settings"
                  className="inline-flex items-center px-3 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                >
                  <CogIcon className="h-4 w-4 mr-1" />
                  Settings
                </Link>
              </div>
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

        {/* Additional Navigation Section */}
        <div className="mt-8 bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">All Menu Options</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <Link
                href="/"
                className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <HomeIcon className="h-8 w-8 text-blue-600 mb-2" />
                <span className="text-sm font-medium text-gray-900">Home Page</span>
              </Link>
              
              <Link
                href="/events"
                className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <CalendarIcon className="h-8 w-8 text-green-600 mb-2" />
                <span className="text-sm font-medium text-gray-900">Events</span>
              </Link>
              
              <Link
                href="/profile"
                className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <UserIcon className="h-8 w-8 text-purple-600 mb-2" />
                <span className="text-sm font-medium text-gray-900">My Profile</span>
              </Link>
              
              <Link
                href="/profile/edit"
                className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <CogIcon className="h-8 w-8 text-orange-600 mb-2" />
                <span className="text-sm font-medium text-gray-900">Edit Profile</span>
              </Link>
              
              <Link
                href="/tickets"
                className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <TicketIcon className="h-8 w-8 text-blue-600 mb-2" />
                <span className="text-sm font-medium text-gray-900">My Tickets</span>
              </Link>
              
              <Link
                href="/inbox"
                className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <InboxIcon className="h-8 w-8 text-green-600 mb-2" />
                <span className="text-sm font-medium text-gray-900">Messages</span>
              </Link>
              
              <Link
                href="/friends"
                className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <UsersIcon className="h-8 w-8 text-purple-600 mb-2" />
                <span className="text-sm font-medium text-gray-900">Connections</span>
              </Link>
              
              <Link
                href="/settings"
                className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <CogIcon className="h-8 w-8 text-gray-600 mb-2" />
                <span className="text-sm font-medium text-gray-900">Settings</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
