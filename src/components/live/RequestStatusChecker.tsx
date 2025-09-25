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

  // Check for accepted requests
  useEffect(() => {
    if (!user || !streamId) return

    const checkRequestStatus = async () => {
      try {
        const response = await fetch(`/api/stream-requests?requesterId=${user.uid}&status=accepted`)
        if (response.ok) {
          const requests = await response.json()
          const acceptedRequest = requests.find((req: any) => req.streamId === streamId)
          
          if (acceptedRequest && !showJoinPrompt) {
            console.log('🎉 Request accepted!', acceptedRequest)
            setAcceptedRequest(acceptedRequest)
            setShowJoinPrompt(true)
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
  }, [user, streamId, showJoinPrompt])

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
