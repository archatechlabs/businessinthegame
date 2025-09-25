'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import JoinStreamPrompt from './JoinStreamPrompt'

interface RequestStatusCheckerProps {
  streamId: string
  channelName: string
  streamerName: string
}

export default function RequestStatusChecker({ 
  streamId, 
  channelName, 
  streamerName 
}: RequestStatusCheckerProps) {
  const { user } = useAuth()
  const [acceptedRequest, setAcceptedRequest] = useState<any>(null)
  const [showJoinPrompt, setShowJoinPrompt] = useState(false)
  const [processedRequestIds, setProcessedRequestIds] = useState<Set<string>>(new Set())

  // Check for accepted requests
  useEffect(() => {
    if (!user || !streamId) return

    const checkRequestStatus = async () => {
      try {
        const response = await fetch(`/api/stream-requests?requesterId=${user.uid}&status=accepted`)
        if (response.ok) {
          const requests = await response.json()
          const acceptedRequest = requests.find((req: any) => req.streamId === streamId)
          
          // Only show join prompt if:
          // 1. The request was actually accepted by the streamer
          // 2. We haven't already shown the prompt
          // 3. We haven't already processed this specific request
          // 4. The request was accepted recently (within last 5 minutes)
          if (acceptedRequest && !showJoinPrompt && acceptedRequest.status === 'accepted' && !processedRequestIds.has(acceptedRequest.id)) {
            const acceptedTime = new Date(acceptedRequest.updatedAt || acceptedRequest.createdAt)
            const now = new Date()
            const timeDiff = now.getTime() - acceptedTime.getTime()
            const fiveMinutes = 5 * 60 * 1000 // 5 minutes in milliseconds
            
            if (timeDiff < fiveMinutes) {
              console.log('🎉 Request accepted by streamer!', acceptedRequest)
              setAcceptedRequest(acceptedRequest)
              setShowJoinPrompt(true)
              setProcessedRequestIds(prev => new Set([...prev, acceptedRequest.id]))
            }
          }
        }
      } catch (error) {
        console.error('Error checking request status:', error)
      }
    }

    // Check immediately
    checkRequestStatus()

    // Check every 3 seconds
    const interval = setInterval(checkRequestStatus, 3000)

    return () => clearInterval(interval)
  }, [user, streamId])

  const handleJoinComplete = () => {
    console.log('✅ Successfully joined stream')
    setShowJoinPrompt(false)
    setAcceptedRequest(null)
  }

  const handleJoinCancel = () => {
    console.log('❌ User cancelled joining stream')
    setShowJoinPrompt(false)
    setAcceptedRequest(null)
  }

  if (!showJoinPrompt || !acceptedRequest) {
    return null
  }

  return (
    <JoinStreamPrompt
      streamId={streamId}
      channelName={channelName}
      streamerName={streamerName}
      onJoinComplete={handleJoinComplete}
      onJoinCancel={handleJoinCancel}
    />
  )
}
