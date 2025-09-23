'use client'

import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/contexts/AuthContext'

interface EmojiReaction {
  id: string
  emoji: string
  x: number
  y: number
  timestamp: number
  userId: string
  username: string
  userAvatar?: string
}

interface EmojiReactionsProps {
  streamId: string
  onReaction?: (emoji: string) => void
}

const EMOJI_OPTIONS = ['❤️', '😂', '😮', '😢', '😡', '👏', '🔥', '💯', '🎉', '👍']

export default function EmojiReactions({ streamId, onReaction }: EmojiReactionsProps) {
  const { user, userProfile } = useAuth()
  const [reactions, setReactions] = useState<EmojiReaction[]>([])
  const [showPicker, setShowPicker] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const lastClickTime = useRef<number>(0)
  const pollInterval = useRef<NodeJS.Timeout | null>(null)

  // Debug: Log when component mounts
  useEffect(() => {
    console.log('🎭 EmojiReactions component mounted for stream:', streamId)
  }, [streamId])

  // Share emoji reaction with all viewers
  const shareReaction = async (emoji: string) => {
    if (!user || !userProfile || !streamId) return

    try {
      const response = await fetch('/api/emoji-reactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          streamId,
          emoji,
          userId: user.uid,
          username: userProfile.name || user.displayName || 'Anonymous',
          userAvatar: userProfile.avatar || user.photoURL || null
        })
      })

      if (response.ok) {
        console.log('🎭 Emoji reaction shared successfully:', emoji)
      } else {
        console.error('❌ Failed to share emoji reaction')
      }
    } catch (error) {
      console.error('❌ Error sharing emoji reaction:', error)
    }
  }

  // Add a new reaction locally and share it
  const addReaction = (emoji: string) => {
    if (!containerRef.current) return

    const rect = containerRef.current.getBoundingClientRect()
    const x = Math.random() * (rect.width - 80) + 40
    const y = Math.random() * (rect.height - 80) + 40

    const newReaction: EmojiReaction = {
      id: `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      emoji,
      x,
      y,
      timestamp: Date.now(),
      userId: user?.uid || 'local',
      username: userProfile?.name || 'You',
      userAvatar: userProfile?.avatar || null
    }

    // Add locally for immediate display
    setReactions(prev => [...prev, newReaction])
    setIsAnimating(true)
    
    // Share with all viewers
    shareReaction(emoji)
    
    // Call the onReaction callback
    if (onReaction) {
      onReaction(emoji)
    }

    // Remove the reaction after animation
    setTimeout(() => {
      setReactions(prev => prev.filter(r => r.id !== newReaction.id))
      setIsAnimating(false)
    }, 2500)
  }

  // Fetch reactions from server
  const fetchReactions = async () => {
    if (!streamId) return

    try {
      const response = await fetch(`/api/emoji-reactions?streamId=${streamId}&limit=20`)
      if (response.ok) {
        const serverReactions = await response.json()
        
        // Filter out reactions that are already displayed locally
        const localIds = reactions.map(r => r.id)
        const newReactions = serverReactions.filter((r: EmojiReaction) => 
          !localIds.includes(r.id) && 
          r.userId !== user?.uid && // Don't show our own reactions from server
          Date.now() - r.timestamp.getTime() < 5000 // Only show recent reactions (5 seconds)
        )

        if (newReactions.length > 0) {
          console.log('🎭 Adding new reactions from server:', newReactions.length)
          
          // Add new reactions with proper positioning
          const rect = containerRef.current?.getBoundingClientRect()
          if (rect) {
            const positionedReactions = newReactions.map((reaction: EmojiReaction) => ({
              ...reaction,
              x: Math.random() * (rect.width - 80) + 40,
              y: Math.random() * (rect.height - 80) + 40
            }))

            setReactions(prev => [...prev, ...positionedReactions])

            // Remove after animation
            setTimeout(() => {
              setReactions(prev => prev.filter(r => 
                !positionedReactions.some(nr => nr.id === r.id)
              ))
            }, 2500)
          }
        }
      }
    } catch (error) {
      console.error('❌ Error fetching reactions:', error)
    }
  }

  // Handle click on emoji picker - optimized for rapid clicking
  const handleEmojiClick = (emoji: string) => {
    const now = Date.now()
    const timeSinceLastClick = now - lastClickTime.current
    
    // Allow rapid clicking - no rate limiting
    lastClickTime.current = now
    
    console.log('🎭 Emoji clicked:', emoji, 'Time since last click:', timeSinceLastClick)
    addReaction(emoji)
  }

  // Handle double-click on video area for quick heart reaction
  const handleDoubleClick = (e: React.MouseEvent) => {
    if (e.detail === 2) {
      console.log('🎭 Double-click detected, adding heart reaction')
      addReaction('❤️')
    }
  }

  // Poll for new reactions from other users
  useEffect(() => {
    if (!streamId) return

    // Initial fetch
    fetchReactions()

    // Poll every 2 seconds for new reactions
    pollInterval.current = setInterval(fetchReactions, 2000)

    return () => {
      if (pollInterval.current) {
        clearInterval(pollInterval.current)
      }
    }
  }, [streamId, user?.uid])

  return (
    <div 
      ref={containerRef}
      className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none"
      onDoubleClick={handleDoubleClick}
    >
      {/* Floating Reactions */}
      {reactions.map((reaction) => (
        <div
          key={reaction.id}
          className="absolute pointer-events-none select-none z-10"
          style={{
            left: `${reaction.x}px`,
            top: `${reaction.y}px`,
            animation: 'emojiFloat 2.5s ease-out forwards',
            fontSize: '2.5rem',
            textShadow: '3px 3px 6px rgba(0,0,0,0.8)',
            zIndex: 20
          }}
        >
          {reaction.emoji}
        </div>
      ))}

      {/* Emoji Picker Button - Make it more visible and always on top */}
      <div className="absolute top-4 right-4 z-50 pointer-events-auto">
        <button
          onClick={() => {
            console.log('🎭 Emoji button clicked, showPicker:', !showPicker)
            setShowPicker(!showPicker)
          }}
          className="bg-red-500 hover:bg-red-600 text-white rounded-full p-4 transition-all duration-200 hover:scale-110 shadow-2xl border-2 border-white"
          title="Add Emoji Reaction"
          style={{
            minWidth: '60px',
            minHeight: '60px',
            fontSize: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <span className="text-3xl">😀</span>
        </button>

        {/* Emoji Picker - Optimized for rapid clicking */}
        {showPicker && (
          <div 
            className="absolute top-20 right-0 bg-white bg-opacity-95 backdrop-blur-sm rounded-lg p-6 shadow-2xl border-2 border-gray-300 pointer-events-auto"
            style={{ zIndex: 60, minWidth: '320px' }}
          >
            <div className="text-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Add Reaction</h3>
              <p className="text-sm text-gray-600">Tap rapidly to spam! 🚀</p>
            </div>
            
            <div className="grid grid-cols-5 gap-3 mb-4">
              {EMOJI_OPTIONS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => handleEmojiClick(emoji)}
                  className="text-3xl hover:scale-125 transition-transform duration-150 p-3 rounded-lg hover:bg-gray-200 border border-transparent hover:border-gray-300 active:scale-110"
                  title={`Tap rapidly to spam ${emoji} reactions!`}
                >
                  {emoji}
                </button>
              ))}
            </div>
            
            <div className="text-center">
              <div className="text-sm text-gray-600 mb-2">
                💡 <strong>Pro tip:</strong> Double-click video for ❤️
              </div>
              <button
                onClick={() => setShowPicker(false)}
                className="text-xs text-gray-500 hover:text-gray-700 underline"
              >
                Close picker
              </button>
            </div>
          </div>
        )}
      </div>

      {/* CSS Animation - Faster and more dynamic */}
      <style jsx>{`
        @keyframes emojiFloat {
          0% {
            opacity: 1;
            transform: translateY(0) scale(0.3) rotate(0deg);
          }
          10% {
            opacity: 1;
            transform: translateY(-20px) scale(1.1) rotate(5deg);
          }
          20% {
            opacity: 1;
            transform: translateY(-40px) scale(1) rotate(-3deg);
          }
          100% {
            opacity: 0;
            transform: translateY(-120px) scale(0.8) rotate(0deg);
          }
        }
      `}</style>
    </div>
  )
}
