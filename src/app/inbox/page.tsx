'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  getDoc,
  doc as firestoreDoc,
  serverTimestamp 
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { 
  ChatBubbleLeftRightIcon, 
  PaperAirplaneIcon, 
  UserCircleIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline'

interface Message {
  id: string
  senderId: string
  receiverId: string
  content: string
  timestamp: unknown
  read: boolean
  senderName?: string
  receiverName?: string
}

interface Conversation {
  id: string
  participantId: string
  participantName: string
  lastMessage: string
  lastMessageTime: unknown
  unreadCount: number
}

export default function Inbox() {
  const { user } = useAuth()
  const router = useRouter()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)

  const markMessagesAsRead = useCallback(async (participantId: string) => {
    if (!user) return

    try {
      // This would need to be implemented with a proper conversation document
      // For now, we'll just update the UI
      console.log('Marking messages as read for:', participantId)
    } catch (error) {
      console.error('Error marking messages as read:', error)
    }
  }, [user])

  const loadConversations = useCallback(async () => {
    if (!user) return

    try {
      const messagesRef = collection(db, 'messages')
      const q = query(
        messagesRef,
        where('participants', 'array-contains', user.uid),
        orderBy('lastMessageTime', 'desc')
      )

      const unsubscribe = onSnapshot(q, async (snapshot) => {
        const conversationMap = new Map<string, Conversation>()
        
        for (const docSnapshot of snapshot.docs) {
          const data = docSnapshot.data()
          const otherParticipantId = data.participants.find((id: string) => id !== user.uid)
          
          if (otherParticipantId) {
            // Get participant info
            const participantDoc = await getDoc(firestoreDoc(db, 'users', otherParticipantId))
            const participantName = participantDoc.exists() 
              ? participantDoc.data().displayName || participantDoc.data().email
              : 'Unknown User'

            conversationMap.set(otherParticipantId, {
              id: otherParticipantId,
              participantId: otherParticipantId,
              participantName,
              lastMessage: data.lastMessage || '',
              lastMessageTime: data.lastMessageTime,
              unreadCount: data.unreadCounts?.[user.uid] || 0
            })
          }
        }

        setConversations(Array.from(conversationMap.values()))
        setLoading(false)
      })

      return () => unsubscribe()
    } catch (error) {
      console.error('Error loading conversations:', error)
      setLoading(false)
    }
  }, [user])

  const loadMessages = useCallback(async (participantId: string) => {
    if (!user) return

    try {
      const messagesRef = collection(db, 'messages')
      const q = query(
        messagesRef,
        where('participants', 'array-contains', user.uid),
        orderBy('timestamp', 'asc')
      )

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const conversationMessages: Message[] = []
        
        snapshot.docs.forEach(docSnapshot => {
          const data = docSnapshot.data()
          if (data.participants.includes(participantId)) {
            conversationMessages.push({
              id: docSnapshot.id,
              ...data
            } as Message)
          }
        })

        setMessages(conversationMessages)
        
        // Mark messages as read
        markMessagesAsRead(participantId)
      })

      return () => unsubscribe()
    } catch (error) {
      console.error('Error loading messages:', error)
    }
  }, [user, markMessagesAsRead])

  useEffect(() => {
    if (user) {
      loadConversations()
    } else {
      setLoading(false)
    }
  }, [user, loadConversations])

  useEffect(() => {
    if (selectedConversation && user) {
      loadMessages(selectedConversation)
    }
  }, [selectedConversation, user, loadMessages])

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !selectedConversation || !user) return

    try {
      const messageData = {
        senderId: user.uid,
        receiverId: selectedConversation,
        content: newMessage.trim(),
        participants: [user.uid, selectedConversation],
        timestamp: serverTimestamp(),
        read: false,
        lastMessage: newMessage.trim(),
        lastMessageTime: serverTimestamp()
      }

      await addDoc(collection(db, 'messages'), messageData)
      setNewMessage('')
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }

  const startNewConversation = () => {
    // This would open a modal to search for users
    // For now, we'll just show a placeholder
    alert('User search feature coming soon!')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading inbox...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Please log in to view your inbox</h1>
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
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Inbox</h1>
          <p className="mt-2 text-gray-600">Your messages and conversations</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Conversations List */}
          <div className="lg:col-span-1">
            <div className="bg-white shadow rounded-lg">
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-medium text-gray-900">Conversations</h2>
                  <button
                    onClick={startNewConversation}
                    className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
                  >
                    New Message
                  </button>
                </div>
                <div className="mt-3">
                  <div className="relative">
                    <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search conversations..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
              
              <div className="max-h-96 overflow-y-auto">
                {conversations.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    <ChatBubbleLeftRightIcon className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                    <p>No conversations yet</p>
                    <p className="text-sm">Start a conversation with another member</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {conversations
                      .filter(conv => 
                        conv.participantName.toLowerCase().includes(searchTerm.toLowerCase())
                      )
                      .map((conversation) => (
                        <button
                          key={conversation.id}
                          onClick={() => setSelectedConversation(conversation.id)}
                          className={`w-full p-4 text-left hover:bg-gray-50 ${
                            selectedConversation === conversation.id ? 'bg-blue-50' : ''
                          }`}
                        >
                          <div className="flex items-center">
                            <UserCircleIcon className="h-10 w-10 text-gray-400 mr-3" />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                  {conversation.participantName}
                                </p>
                                {conversation.unreadCount > 0 && (
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                    {conversation.unreadCount}
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-gray-500 truncate">
                                {conversation.lastMessage}
                              </p>
                            </div>
                          </div>
                        </button>
                      ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="lg:col-span-2">
            <div className="bg-white shadow rounded-lg h-96 flex flex-col">
              {selectedConversation ? (
                <>
                  {/* Messages Header */}
                  <div className="p-4 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">
                      {conversations.find(c => c.id === selectedConversation)?.participantName}
                    </h3>
                  </div>

                  {/* Messages List */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.length === 0 ? (
                      <div className="text-center text-gray-500 py-8">
                        <p>No messages yet</p>
                        <p className="text-sm">Start the conversation!</p>
                      </div>
                    ) : (
                      messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${
                            message.senderId === user.uid ? 'justify-end' : 'justify-start'
                          }`}
                        >
                          <div
                            className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                              message.senderId === user.uid
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-200 text-gray-900'
                            }`}
                          >
                            <p className="text-sm">{message.content}</p>
                            <p className={`text-xs mt-1 ${
                              message.senderId === user.uid ? 'text-blue-100' : 'text-gray-500'
                            }`}>
                              {message.timestamp && typeof message.timestamp === 'object' && 'toDate' in message.timestamp
                                ? (message.timestamp as { toDate: () => Date }).toDate().toLocaleTimeString()
                                : 'Just now'}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Message Input */}
                  <div className="p-4 border-t border-gray-200">
                    <form onSubmit={sendMessage} className="flex space-x-2">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        type="submit"
                        disabled={!newMessage.trim()}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                      >
                        <PaperAirplaneIcon className="h-4 w-4" />
                      </button>
                    </form>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <ChatBubbleLeftRightIcon className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                    <p>Select a conversation to start messaging</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
