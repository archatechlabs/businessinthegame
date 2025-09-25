'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'

interface StreamJoinRequestProps {
  streamId: string
  streamerName: string
  onRequestSent?: () => void
}

export default function StreamJoinRequest({ streamId, streamerName, onRequestSent }: StreamJoinRequestProps) {
  const { user, userProfile } = useAuth()
  const [isRequesting, setIsRequesting] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [message, setMessage] = useState('')
  const [requestStatus, setRequestStatus] = useState<'idle' | 'success' | 'error'>('idle')

  // Debug logging - this should always appear
  console.log('🎯 StreamJoinRequest rendered:', {
    user: user ? { uid: user.uid, email: user.email } : null,
    userProfile: userProfile ? { name: userProfile.name, role: userProfile.role } : null,
    streamId,
    streamerName
  })

  const handleRequestJoin = async () => {
    if (!user || !userProfile) {
      alert('Please sign in to request to join the stream')
      return
    }

    console.log('🎯 StreamJoinRequest - Starting request with data:', {
      streamId,
      requesterId: user.uid,
      requesterName: userProfile.name || user.displayName || 'Anonymous',
      requesterAvatar: userProfile.avatar || user.photoURL || null,
      message: message.trim()
    })

    setIsRequesting(true)
    setRequestStatus('idle')

    try {
      const response = await fetch('/api/stream-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          streamId,
          requesterId: user.uid,
          requesterName: userProfile.name || user.displayName || 'Anonymous',
          requesterAvatar: userProfile.avatar || user.photoURL || null,
          message: message.trim()
        })
      })

      console.log('🎯 StreamJoinRequest - API response status:', response.status)
      const data = await response.json()
      console.log('🎯 StreamJoinRequest - API response data:', data)

      if (response.ok) {
        console.log('✅ StreamJoinRequest - Request sent successfully')
        setRequestStatus('success')
        setShowModal(false)
        setMessage('')
        if (onRequestSent) {
          onRequestSent()
        }
      } else {
        console.error('❌ StreamJoinRequest - Error sending request:', data.error)
        setRequestStatus('error')
      }
    } catch (error) {
      console.error('❌ StreamJoinRequest - Network error:', error)
      setRequestStatus('error')
    } finally {
      setIsRequesting(false)
    }
  }

  return (
    <>
      {/* Request Join Button - Always visible and more prominent */}
      <div className="absolute bottom-4 left-4 z-40">
        <button
          onClick={() => {
            console.log('🎯 Request button clicked:', { user: !!user, userProfile: !!userProfile })
            if (!user) {
              alert('Please sign in to request to join the stream')
              return
            }
            setShowModal(true)
          }}
          className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 shadow-lg flex items-center gap-2 text-lg"
          style={{
            minWidth: '200px',
            height: '50px',
            fontSize: '16px',
            fontWeight: 'bold'
          }}
        >
          <span className="text-2xl">🎤</span>
          <span>Request to Join Live</span>
        </button>
        
        {/* Debug info */}
        <div className="mt-2 text-xs text-white bg-black bg-opacity-50 p-2 rounded">
          <div>User: {user ? '✅' : '❌'}</div>
          <div>Profile: {userProfile ? '✅' : '❌'}</div>
          <div>Stream: {streamId}</div>
        </div>
      </div>

      {/* Request Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-xl font-semibold mb-4">
              Request to Join {streamerName}&apos;s Stream
            </h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message (optional)
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Tell the streamer why you&apos;d like to join..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={3}
                maxLength={200}
              />
              <div className="text-xs text-gray-500 mt-1">
                {message.length}/200 characters
              </div>
            </div>

            {requestStatus === 'success' && (
              <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg">
                ✅ Request sent successfully! The streamer will be notified.
              </div>
            )}

            {requestStatus === 'error' && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                ❌ Failed to send request. Please try again.
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={handleRequestJoin}
                disabled={isRequesting}
                className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white py-2 px-4 rounded-lg font-medium transition-colors duration-200"
              >
                {isRequesting ? 'Sending...' : 'Send Request'}
              </button>
              <button
                onClick={() => {
                  setShowModal(false)
                  setMessage('')
                  setRequestStatus('idle')
                }}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-4 rounded-lg font-medium transition-colors duration-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
