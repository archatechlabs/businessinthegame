'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'

interface StreamRequest {
  id: string
  streamId: string
  requesterId: string
  requesterName: string
  requesterAvatar?: string
  message: string
  status: 'pending' | 'accepted' | 'rejected'
  createdAt: Date
  updatedAt: Date
}

interface StreamRequestManagerProps {
  streamId: string
  onRequestAccepted?: (request: StreamRequest) => void
  onRequestRejected?: (request: StreamRequest) => void
}

export default function StreamRequestManager({ 
  streamId, 
  onRequestAccepted, 
  onRequestRejected 
}: StreamRequestManagerProps) {
  const { user } = useAuth()
  const [requests, setRequests] = useState<StreamRequest[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showManager, setShowManager] = useState(false)
  const [pendingCount, setPendingCount] = useState(0)

  // Fetch pending requests
  const fetchRequests = useCallback(async () => {
    if (!streamId) {
      console.log('🔍 StreamRequestManager: No streamId provided')
      return
    }

    console.log('🔍 StreamRequestManager: Fetching requests for streamId:', streamId)
    setIsLoading(true)
    try {
      const response = await fetch(`/api/stream-requests?streamId=${streamId}&status=pending`)
      console.log('🔍 StreamRequestManager: API response status:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log('🔍 StreamRequestManager: Received requests:', data)
        setRequests(data)
        setPendingCount(data.length)
      } else {
        console.error('🔍 StreamRequestManager: API error:', response.status, await response.text())
      }
    } catch (error) {
      console.error('🔍 StreamRequestManager: Error fetching requests:', error)
    } finally {
      setIsLoading(false)
    }
  }, [streamId])

  // Handle request response
  const handleRequestResponse = async (requestId: string, status: 'accepted' | 'rejected') => {
    try {
      console.log('🔍 StreamRequestManager - Handling request response:', { requestId, status })
      
      const response = await fetch('/api/stream-requests', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requestId,
          status,
          streamerId: user?.uid
        })
      })

      if (response.ok) {
        const updatedRequests = requests.filter(req => req.id !== requestId)
        setRequests(updatedRequests)
        setPendingCount(updatedRequests.length)

        const request = requests.find(req => req.id === requestId)
        if (request) {
          if (status === 'accepted' && onRequestAccepted) {
            console.log('✅ StreamRequestManager - Request accepted, calling onRequestAccepted')
            onRequestAccepted(request)
          } else if (status === 'rejected' && onRequestRejected) {
            console.log('❌ StreamRequestManager - Request rejected, calling onRequestRejected')
            onRequestRejected(request)
          }
        }
      } else {
        console.error('❌ StreamRequestManager - Failed to update request status:', response.status)
      }
    } catch (error) {
      console.error('❌ StreamRequestManager - Error responding to request:', error)
    }
  }

  // Poll for new requests
  useEffect(() => {
    fetchRequests()
    const interval = setInterval(fetchRequests, 5000) // Check every 5 seconds
    return () => clearInterval(interval)
  }, [fetchRequests])

  if (!user) return null

  return (
    <>
      {/* Request Manager Button */}
      <div className="absolute top-4 left-4 z-40">
        <button
          onClick={() => setShowManager(!showManager)}
          className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 shadow-lg flex items-center gap-2 relative"
        >
          <span>📋</span>
          <span>Join Requests</span>
          {pendingCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center">
              {pendingCount}
            </span>
          )}
        </button>
      </div>

      {/* Request Manager Modal */}
      {showManager && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">
                Join Requests ({pendingCount})
              </h3>
              <button
                onClick={() => setShowManager(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading requests...</p>
              </div>
            ) : requests.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No pending join requests</p>
              </div>
            ) : (
              <div className="space-y-4">
                {requests.map((request) => (
                  <div key={request.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                        {request.requesterAvatar ? (
                          <img
                            src={request.requesterAvatar}
                            alt={request.requesterName}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-gray-500 text-lg">
                            {request.requesterName.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium text-gray-900">
                              {request.requesterName}
                            </h4>
                            <p className="text-sm text-gray-500">
                              {new Date(request.createdAt).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        
                        {request.message && (
                          <p className="mt-2 text-gray-700 text-sm">
                            &quot;{request.message}&quot;
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2 mt-4">
                      <button
                        onClick={() => handleRequestResponse(request.id, 'accepted')}
                        className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg font-medium transition-colors duration-200"
                      >
                        ✅ Accept
                      </button>
                      <button
                        onClick={() => handleRequestResponse(request.id, 'rejected')}
                        className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg font-medium transition-colors duration-200"
                      >
                        ❌ Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
