'use client'

import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { db } from '@/lib/firebase'
import { collection, addDoc, query, orderBy, limit, onSnapshot } from 'firebase/firestore'

interface ChatMessage {
  id: string
  username: string
  message: string
  timestamp: Date
  userId: string
  isModerator?: boolean
  isStreamer?: boolean
}

interface LiveChatProps {
  channelName: string
  streamerId: string
}

export default function LiveChat({ channelName, streamerId }: LiveChatProps) {
  const { user, userProfile } = useAuth()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!channelName) return

    // Set up real-time chat listener
    const chatQuery = query(
      collection(db, 'chat', channelName, 'messages'),
      orderBy('timestamp', 'desc'),
      limit(50)
    )

    const unsubscribe = onSnapshot(chatQuery, (snapshot) => {
      const chatMessages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate() || new Date()
      })) as ChatMessage[]

      setMessages(chatMessages.reverse())
    }, (error) => {
      console.error('Chat error:', error)
      setError('Failed to load chat messages')
    })

    return () => unsubscribe()
  }, [channelName])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !user || !userProfile) return

    setIsLoading(true)
    setError(null)

    try {
      const messageData = {
        username: userProfile.username || 'Anonymous',
        message: newMessage.trim(),
        userId: user.uid,
        timestamp: new Date(),
        isModerator: userProfile.role === 'moderator' || userProfile.role === 'admin' || userProfile.role === 'super-admin',
        isStreamer: user.uid === streamerId
      }

      await addDoc(collection(db, 'chat', channelName, 'messages'), messageData)
      setNewMessage('')
    } catch (err) {
      console.error('Error sending message:', err)
      setError('Failed to send message')
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const formatTime = (timestamp: Date) => {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-md">
      {/* Chat Header */}
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <span className="w-3 h-3 bg-red-500 rounded-full mr-2 animate-pulse"></span>
          Live Chat
        </h3>
        <p className="text-sm text-gray-500">{messages.length} messages</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {error && (
          <div className="text-red-600 text-sm bg-red-50 p-2 rounded">
            {error}
          </div>
        )}

        {messages.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <p>No messages yet. Be the first to chat!</p>
          </div>
        ) : (
          messages.map((message) => (
            <div key={message.id} className="text-sm">
              <div className="flex items-start">
                <div className="flex-1">
                  <div className="flex items-center mb-1">
                    <span className={`font-medium mr-2 ${
                      message.isStreamer ? 'text-red-600' : 
                      message.isModerator ? 'text-blue-600' : 
                      'text-gray-900'
                    }`}>
                      {message.username}
                      {message.isStreamer && ' 👑'}
                      {message.isModerator && ' 🛡️'}
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatTime(message.timestamp)}
                    </span>
                  </div>
                  <p className="text-gray-700 break-words">{message.message}</p>
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading || !user}
          />
          <button
            onClick={sendMessage}
            disabled={isLoading || !newMessage.trim() || !user}
            className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? '...' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  )
}
