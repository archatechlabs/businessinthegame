'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'

interface JoinStreamPromptProps {
  streamId: string
  channelName: string
  streamerName: string
  onJoinComplete?: () => void
  onJoinCancel?: () => void
}

export default function JoinStreamPrompt({ 
  streamId, 
  channelName, 
  streamerName, 
  onJoinComplete, 
  onJoinCancel 
}: JoinStreamPromptProps) {
  const { user, userProfile } = useAuth()
  const [isJoining, setIsJoining] = useState(false)
  const [cameraEnabled, setCameraEnabled] = useState(false)
  const [micEnabled, setMicEnabled] = useState(false)
  const [permissionsGranted, setPermissionsGranted] = useState(false)

  // Check for camera and mic permissions
  useEffect(() => {
    const checkPermissions = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: true, 
          audio: true 
        })
        
        // Stop the stream immediately after checking permissions
        stream.getTracks().forEach(track => track.stop())
        
        setCameraEnabled(true)
        setMicEnabled(true)
        setPermissionsGranted(true)
      } catch (error) {
        console.log('Permissions not granted yet:', error)
        setPermissionsGranted(false)
      }
    }

    checkPermissions()
  }, [])

  const requestPermissions = async () => {
    try {
      setIsJoining(true)
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      })
      
      // Stop the test stream
      stream.getTracks().forEach(track => track.stop())
      
      setCameraEnabled(true)
      setMicEnabled(true)
      setPermissionsGranted(true)
    } catch (error) {
      console.error('Error requesting permissions:', error)
      alert('Please allow camera and microphone access to join the stream.')
    } finally {
      setIsJoining(false)
    }
  }

  const handleJoinStream = async () => {
    if (!permissionsGranted) {
      await requestPermissions()
      return
    }

    try {
      setIsJoining(true)
      
      // Here we would integrate with Agora to join as a publisher
      // For now, we'll just simulate the join process
      console.log('🎤 Joining stream as publisher:', {
        streamId,
        channelName,
        streamerName,
        userId: user?.uid
      })

      // Simulate join process
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      if (onJoinComplete) {
        onJoinComplete()
      }
    } catch (error) {
      console.error('Error joining stream:', error)
      alert('Failed to join stream. Please try again.')
    } finally {
      setIsJoining(false)
    }
  }

  const handleCancel = () => {
    if (onJoinCancel) {
      onJoinCancel()
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 w-full max-w-md mx-4">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🎉</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Request Accepted!
          </h2>
          <p className="text-gray-600">
            {streamerName} has accepted your request to join the stream.
          </p>
        </div>

        <div className="space-y-4 mb-6">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <span className="text-2xl">📹</span>
              <span className="font-medium">Camera</span>
            </div>
            <div className={`px-3 py-1 rounded-full text-sm ${
              cameraEnabled ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {cameraEnabled ? 'Enabled' : 'Disabled'}
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🎤</span>
              <span className="font-medium">Microphone</span>
            </div>
            <div className={`px-3 py-1 rounded-full text-sm ${
              micEnabled ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {micEnabled ? 'Enabled' : 'Disabled'}
            </div>
          </div>
        </div>

        {!permissionsGranted && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800 text-sm">
              <strong>Note:</strong> You'll need to allow camera and microphone access to join the stream.
            </p>
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={handleJoinStream}
            disabled={isJoining}
            className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white py-3 px-4 rounded-lg font-medium transition-colors duration-200"
          >
            {isJoining ? 'Joining...' : 'Join Stream'}
          </button>
          <button
            onClick={handleCancel}
            disabled={isJoining}
            className="flex-1 bg-gray-300 hover:bg-gray-400 disabled:bg-gray-200 text-gray-700 py-3 px-4 rounded-lg font-medium transition-colors duration-200"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
