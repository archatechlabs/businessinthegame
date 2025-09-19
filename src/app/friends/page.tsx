'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  deleteDoc,
  doc, 
  getDoc,
  getDocs,
  serverTimestamp 
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { 
  UserPlusIcon, 
  UserMinusIcon, 
  MagnifyingGlassIcon,
  UserCircleIcon,
  ChatBubbleLeftRightIcon,
  MapPinIcon,
  BriefcaseIcon
} from '@heroicons/react/24/outline'

interface User {
  id: string
  displayName: string
  email: string
  bio?: string
  company?: string
  jobTitle?: string
  location?: string
  profileImage?: string
}

interface FriendRequest {
  id: string
  fromUserId: string
  toUserId: string
  status: 'pending' | 'accepted' | 'declined'
  createdAt: any
  fromUserName?: string
  toUserName?: string
}

interface Friend {
  id: string
  userId: string
  userName: string
  userEmail: string
  addedAt: any
}

export default function Friends() {
  const { currentUser } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'friends' | 'requests' | 'discover'>('friends')
  const [friends, setFriends] = useState<Friend[]>([])
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([])
  const [allUsers, setAllUsers] = useState<User[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (currentUser) {
      loadFriends()
      loadFriendRequests()
      loadAllUsers()
    } else {
      setLoading(false)
    }
  }, [currentUser])

  const loadFriends = async () => {
    if (!currentUser) return

    try {
      const friendsRef = collection(db, 'friends')
      const q = query(
        friendsRef,
        where('userId', '==', currentUser.uid),
        orderBy('addedAt', 'desc')
      )

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const friendsList: Friend[] = []
        snapshot.docs.forEach(doc => {
          friendsList.push({
            id: doc.id,
            ...doc.data()
          } as Friend)
        })
        setFriends(friendsList)
        setLoading(false)
      })

      return () => unsubscribe()
    } catch (error) {
      console.error('Error loading friends:', error)
      setLoading(false)
    }
  }

  const loadFriendRequests = async () => {
    if (!currentUser) return

    try {
      const requestsRef = collection(db, 'friendRequests')
      const q = query(
        requestsRef,
        where('toUserId', '==', currentUser.uid),
        where('status', '==', 'pending'),
        orderBy('createdAt', 'desc')
      )

      const unsubscribe = onSnapshot(q, async (snapshot) => {
        const requestsList: FriendRequest[] = []
        
        for (const doc of snapshot.docs) {
          const data = doc.data()
          const fromUserDoc = await getDoc(doc(db, 'users', data.fromUserId))
          const fromUserName = fromUserDoc.exists() 
            ? fromUserDoc.data().displayName || fromUserDoc.data().email
            : 'Unknown User'

          requestsList.push({
            id: doc.id,
            ...data,
            fromUserName
          } as FriendRequest)
        }
        
        setFriendRequests(requestsList)
      })

      return () => unsubscribe()
    } catch (error) {
      console.error('Error loading friend requests:', error)
    }
  }

  const loadAllUsers = async () => {
    if (!currentUser) return

    try {
      const usersRef = collection(db, 'users')
      const snapshot = await getDocs(usersRef)
      const usersList: User[] = []
      
      snapshot.docs.forEach(doc => {
        if (doc.id !== currentUser.uid) {
          usersList.push({
            id: doc.id,
            ...doc.data()
          } as User)
        }
      })
      
      setAllUsers(usersList)
    } catch (error) {
      console.error('Error loading users:', error)
    }
  }

  const sendFriendRequest = async (toUserId: string) => {
    if (!currentUser) return

    try {
      await addDoc(collection(db, 'friendRequests'), {
        fromUserId: currentUser.uid,
        toUserId,
        status: 'pending',
        createdAt: serverTimestamp()
      })
    } catch (error) {
      console.error('Error sending friend request:', error)
    }
  }

  const respondToFriendRequest = async (requestId: string, status: 'accepted' | 'declined') => {
    if (!currentUser) return

    try {
      const requestRef = doc(db, 'friendRequests', requestId)
      await updateDoc(requestRef, { status })

      if (status === 'accepted') {
        // Add to friends collection for both users
        const requestDoc = await getDoc(requestRef)
        const requestData = requestDoc.data()
        
        if (requestData) {
          // Add friend for current user
          await addDoc(collection(db, 'friends'), {
            userId: currentUser.uid,
            friendId: requestData.fromUserId,
            addedAt: serverTimestamp()
          })

          // Add friend for the other user
          await addDoc(collection(db, 'friends'), {
            userId: requestData.fromUserId,
            friendId: currentUser.uid,
            addedAt: serverTimestamp()
          })
        }
      }
    } catch (error) {
      console.error('Error responding to friend request:', error)
    }
  }

  const removeFriend = async (friendId: string) => {
    if (!currentUser) return

    try {
      // Remove from both users' friends lists
      const friendsRef = collection(db, 'friends')
      const q1 = query(friendsRef, where('userId', '==', currentUser.uid), where('friendId', '==', friendId))
      const q2 = query(friendsRef, where('userId', '==', friendId), where('friendId', '==', currentUser.uid))
      
      const [snapshot1, snapshot2] = await Promise.all([
        getDocs(q1),
        getDocs(q2)
      ])

      // Delete both friend relationships
      const deletePromises = []
      snapshot1.docs.forEach(doc => deletePromises.push(deleteDoc(doc.ref)))
      snapshot2.docs.forEach(doc => deletePromises.push(deleteDoc(doc.ref)))
      
      await Promise.all(deletePromises)
    } catch (error) {
      console.error('Error removing friend:', error)
    }
  }

  const startMessage = (userId: string) => {
    router.push(`/inbox?user=${userId}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading friends...</p>
        </div>
      </div>
    )
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Please log in to view your friends</h1>
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
      <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Friends & Connections</h1>
          <p className="mt-2 text-gray-600">Connect with other BIG members</p>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'friends', name: 'My Friends', count: friends.length },
                { id: 'requests', name: 'Requests', count: friendRequests.length },
                { id: 'discover', name: 'Discover', count: allUsers.length }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.name}
                  {tab.count > 0 && (
                    <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2.5 rounded-full text-xs">
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search people..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Content */}
        <div className="bg-white shadow rounded-lg">
          {activeTab === 'friends' && (
            <div className="p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">My Friends ({friends.length})</h2>
              {friends.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <UserPlusIcon className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                  <p>No friends yet</p>
                  <p className="text-sm">Start connecting with other members!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {friends
                    .filter(friend => 
                      friend.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      friend.userEmail.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                    .map((friend) => (
                      <div key={friend.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <UserCircleIcon className="h-10 w-10 text-gray-400 mr-3" />
                            <div>
                              <p className="font-medium text-gray-900">{friend.userName}</p>
                              <p className="text-sm text-gray-500">{friend.userEmail}</p>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => startMessage(friend.userId)}
                              className="p-2 text-gray-400 hover:text-blue-600"
                              title="Send message"
                            >
                              <ChatBubbleLeftRightIcon className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => removeFriend(friend.userId)}
                              className="p-2 text-gray-400 hover:text-red-600"
                              title="Remove friend"
                            >
                              <UserMinusIcon className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'requests' && (
            <div className="p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Friend Requests ({friendRequests.length})</h2>
              {friendRequests.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <UserPlusIcon className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                  <p>No pending requests</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {friendRequests.map((request) => (
                    <div key={request.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <UserCircleIcon className="h-10 w-10 text-gray-400 mr-3" />
                          <div>
                            <p className="font-medium text-gray-900">{request.fromUserName}</p>
                            <p className="text-sm text-gray-500">Wants to connect with you</p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => respondToFriendRequest(request.id, 'accepted')}
                            className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => respondToFriendRequest(request.id, 'declined')}
                            className="px-4 py-2 bg-gray-300 text-gray-700 text-sm rounded-md hover:bg-gray-400"
                          >
                            Decline
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'discover' && (
            <div className="p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Discover People ({allUsers.length})</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {allUsers
                  .filter(user => 
                    user.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    (user.company && user.company.toLowerCase().includes(searchTerm.toLowerCase()))
                  )
                  .map((user) => (
                    <div key={user.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center">
                          <UserCircleIcon className="h-10 w-10 text-gray-400 mr-3" />
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{user.displayName}</p>
                            <p className="text-sm text-gray-500">{user.email}</p>
                            {user.company && (
                              <div className="flex items-center mt-1">
                                <BriefcaseIcon className="h-3 w-3 text-gray-400 mr-1" />
                                <p className="text-xs text-gray-500">{user.company}</p>
                              </div>
                            )}
                            {user.location && (
                              <div className="flex items-center mt-1">
                                <MapPinIcon className="h-3 w-3 text-gray-400 mr-1" />
                                <p className="text-xs text-gray-500">{user.location}</p>
                              </div>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => sendFriendRequest(user.id)}
                          className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
                        >
                          <UserPlusIcon className="h-4 w-4" />
                        </button>
                      </div>
                      {user.bio && (
                        <p className="mt-2 text-sm text-gray-600">{user.bio}</p>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
