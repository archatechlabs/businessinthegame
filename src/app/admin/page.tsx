'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { 
  getAllUsers, 
  updateUserRole, 
  updateUserTier, 
  updateUserStatus,
  canModifyUser,
  AVAILABLE_ROLES,
  AVAILABLE_TIERS,
  UserManagementData
} from '@/utils/userManagement'
import { 
  UserIcon, 
  ShieldCheckIcon, 
  UserGroupIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import { UserRole, UserTier } from '@/contexts/AuthContext'

export default function AdminPanel() {
  const { user, userProfile, canManageUsers } = useAuth()
  const [users, setUsers] = useState<UserManagementData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filterRole, setFilterRole] = useState<string>('all')
  const [filterTier, setFilterTier] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')

  useEffect(() => {
    if (user && canManageUsers) {
      loadUsers()
    }
  }, [user, canManageUsers])

  const loadUsers = async () => {
    try {
      setLoading(true)
      const usersData = await getAllUsers()
      setUsers(usersData)
    } catch (err) {
      setError('Failed to load users')
      console.error('Error loading users:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleRoleChange = async (uid: string, newRole: string) => {
    if (!userProfile) return
    
    try {
      await updateUserRole(uid, newRole as UserRole, userProfile.uid)
      await loadUsers()
    } catch (err) {
      setError('Failed to update user role')
      console.error('Error updating role:', err)
    }
  }

  const handleTierChange = async (uid: string, newTier: string) => {
    if (!userProfile) return
    
    try {
      await updateUserTier(uid, newTier as UserTier, userProfile.uid)
      await loadUsers()
    } catch (err) {
      setError('Failed to update user tier')
      console.error('Error updating tier:', err)
    }
  }

  const handleStatusChange = async (uid: string, newStatus: string) => {
    if (!userProfile) return
    
    try {
      await updateUserStatus(uid, newStatus as 'active' | 'inactive' | 'suspended' | 'pending', userProfile.uid)
      await loadUsers()
    } catch (err) {
      setError('Failed to update user status')
      console.error('Error updating status:', err)
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'super-admin': return 'bg-red-100 text-red-800'
      case 'admin': return 'bg-purple-100 text-purple-800'
      case 'moderator': return 'bg-blue-100 text-blue-800'
      case 'user': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'founder': return 'bg-yellow-100 text-yellow-800'
      case 'vip': return 'bg-purple-100 text-purple-800'
      case 'premium': return 'bg-blue-100 text-blue-800'
      case 'member': return 'bg-green-100 text-green-800'
      case 'non-member': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircleIcon className="h-5 w-5 text-green-500" />
      case 'inactive': return <XCircleIcon className="h-5 w-5 text-gray-500" />
      case 'suspended': return <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
      case 'pending': return <ClockIcon className="h-5 w-5 text-yellow-500" />
      default: return <ClockIcon className="h-5 w-5 text-gray-500" />
    }
  }

  const filteredUsers = users.filter(user => {
    const roleMatch = filterRole === 'all' || user.role === filterRole
    const tierMatch = filterTier === 'all' || user.tier === filterTier
    const statusMatch = filterStatus === 'all' || user.status === filterStatus
    return roleMatch && tierMatch && statusMatch
  })

  if (!user || !canManageUsers) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ShieldCheckIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600">You don&apos;t have permission to access the admin panel.</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading users...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="mt-2 text-gray-600">Manage user roles, tiers, and permissions</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <UserGroupIcon className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{users.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <CheckCircleIcon className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Active Users</p>
                <p className="text-2xl font-bold text-gray-900">
                  {users.filter(u => u.status === 'active').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <ClockIcon className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Pending Approval</p>
                <p className="text-2xl font-bold text-gray-900">
                  {users.filter(u => u.status === 'pending').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <ShieldCheckIcon className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Admins</p>
                <p className="text-2xl font-bold text-gray-900">
                  {users.filter(u => u.role === 'admin' || u.role === 'super-admin').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Filters</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Roles</option>
                {AVAILABLE_ROLES.map(role => (
                  <option key={role} value={role}>
                    {role.charAt(0).toUpperCase() + role.slice(1).replace('-', ' ')}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tier</label>
              <select
                value={filterTier}
                onChange={(e) => setFilterTier(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Tiers</option>
                {AVAILABLE_TIERS.map(tier => (
                  <option key={tier} value={tier}>
                    {tier.charAt(0).toUpperCase() + tier.slice(1).replace('-', ' ')}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
                <option value="pending">Pending</option>
              </select>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Users ({filteredUsers.length})</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tier
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Login
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user.uid} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <UserIcon className="h-8 w-8 text-gray-400 mr-3" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={user.role}
                        onChange={(e) => handleRoleChange(user.uid, e.target.value)}
                        disabled={!canModifyUser(userProfile?.role || 'user', user.role)}
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)} ${
                          !canModifyUser(userProfile?.role || 'user', user.role) 
                            ? 'cursor-not-allowed opacity-50' 
                            : 'cursor-pointer'
                        }`}
                      >
                        {AVAILABLE_ROLES.map(role => (
                          <option key={role} value={role}>
                            {role.charAt(0).toUpperCase() + role.slice(1).replace('-', ' ')}
                          </option>
                        ))}
                      </select>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={user.tier}
                        onChange={(e) => handleTierChange(user.uid, e.target.value)}
                        disabled={!canModifyUser(userProfile?.role || 'user', user.role)}
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getTierColor(user.tier)} ${
                          !canModifyUser(userProfile?.role || 'user', user.role) 
                            ? 'cursor-not-allowed opacity-50' 
                            : 'cursor-pointer'
                        }`}
                      >
                        {AVAILABLE_TIERS.map(tier => (
                          <option key={tier} value={tier}>
                            {tier.charAt(0).toUpperCase() + tier.slice(1).replace('-', ' ')}
                          </option>
                        ))}
                      </select>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getStatusIcon(user.status)}
                        <select
                          value={user.status}
                          onChange={(e) => handleStatusChange(user.uid, e.target.value)}
                          disabled={!canModifyUser(userProfile?.role || 'user', user.role)}
                          className="ml-2 px-2 py-1 rounded text-xs font-medium ${
                            !canModifyUser(userProfile?.role || 'user', user.role) 
                              ? 'cursor-not-allowed opacity-50' 
                              : 'cursor-pointer'
                          }"
                        >
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                          <option value="suspended">Suspended</option>
                          <option value="pending">Pending</option>
                        </select>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.lastLoginAt 
                        ? new Date(user.lastLoginAt).toLocaleDateString()
                        : 'Never'
                      }
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button className="text-blue-600 hover:text-blue-900">
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-600">{error}</p>
          </div>
        )}
      </div>
    </div>
  )
}
