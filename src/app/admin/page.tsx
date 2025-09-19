'use client'

import { useState, useEffect } from 'react'
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuth } from '@/contexts/AuthContext'
import { CheckIcon, XMarkIcon, UserIcon } from '@heroicons/react/24/outline'

interface UserProfile {
  uid: string
  email: string
  name: string
  bio?: string
  role: 'pending' | 'member' | 'admin'
  status: 'active' | 'inactive'
  createdAt: Date
  updatedAt: Date
}

export default function AdminDashboard() {
  const { isAdmin, loading: authLoading } = useAuth()
  const [users, setUsers] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isAdmin) {
      fetchPendingUsers()
    }
  }, [isAdmin])

  const fetchPendingUsers = async () => {
    try {
      const q = query(collection(db, 'users'), where('role', '==', 'pending'))
      const querySnapshot = await getDocs(q)
      const usersData: UserProfile[] = []
      
      querySnapshot.forEach((doc) => {
        const data = doc.data()
        usersData.push({
          ...data,
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate()
        } as UserProfile)
      })
      
      setUsers(usersData)
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  const approveUser = async (uid: string) => {
    try {
      await updateDoc(doc(db, 'users', uid), {
        role: 'member',
        updatedAt: new Date()
      })
      setUsers(users.filter(user => user.uid !== uid))
    } catch (error) {
      console.error('Error approving user:', error)
    }
  }

  const rejectUser = async (uid: string) => {
    try {
      await updateDoc(doc(db, 'users', uid), {
        status: 'inactive',
        updatedAt: new Date()
      })
      setUsers(users.filter(user => user.uid !== uid))
    } catch (error) {
      console.error('Error rejecting user:', error)
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600">You need admin privileges to access this page.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage user registrations and approvals</p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading users...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-12">
            <UserIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No pending users</h3>
            <p className="text-gray-600">All user registrations have been processed.</p>
          </div>
        ) : (
          <div className="bg-white shadow-sm rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Pending Approvals ({users.length})
              </h2>
            </div>
            <div className="divide-y divide-gray-200">
              {users.map((user) => (
                <div key={user.uid} className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                          <UserIcon className="h-6 w-6 text-gray-400" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{user.name}</h3>
                          <p className="text-gray-600">{user.email}</p>
                          {user.bio && (
                            <p className="text-sm text-gray-500 mt-1">{user.bio}</p>
                          )}
                          <p className="text-xs text-gray-400 mt-1">
                            Registered: {user.createdAt.toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => approveUser(user.uid)}
                        className="flex items-center space-x-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                      >
                        <CheckIcon className="h-4 w-4" />
                        <span>Approve</span>
                      </button>
                      <button
                        onClick={() => rejectUser(user.uid)}
                        className="flex items-center space-x-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                      >
                        <XMarkIcon className="h-4 w-4" />
                        <span>Reject</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
