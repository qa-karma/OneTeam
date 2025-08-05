'use client'

import { useState, useEffect, useRef } from 'react'
import { Send, MessageSquare, Users, Search, Phone, Mail } from 'lucide-react'
import { 
  messagesStorage, 
  bookingsStorage, 
  playersStorage,
  generateId 
} from '@/utils/localStorage'
import { ChatMessage, Booking, Player } from '@/types'

export default function ChatSection() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [players, setPlayers] = useState<Player[]>([])
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [messageText, setMessageText] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMessages(messagesStorage.get())
    setBookings(bookingsStorage.get())
    setPlayers(playersStorage.get())
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, selectedBooking])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!messageText.trim() || !selectedBooking) return

    const newMessage: ChatMessage = {
      id: generateId(),
      bookingId: selectedBooking.id,
      senderId: 'coach_1',
      senderName: 'Coach Martinez',
      senderType: 'coach',
      message: messageText.trim(),
      timestamp: new Date().toISOString(),
      isRead: true
    }

    const updatedMessages = messagesStorage.add(newMessage)
    setMessages(updatedMessages)
    setMessageText('')
  }

  // Mock parent reply (for demo purposes)
  const sendMockParentReply = (bookingId: string, parentName: string) => {
    const replies = [
      "Thank you for the feedback! We're very pleased with the progress.",
      "Great session today! My child loved the training.",
      "When is the next available slot?",
      "Could we schedule a follow-up session?",
      "Thanks for the detailed feedback. Very helpful!",
      "My child is really enjoying the training sessions.",
      "What should we practice at home?"
    ]

    const randomReply = replies[Math.floor(Math.random() * replies.length)]

    const parentMessage: ChatMessage = {
      id: generateId(),
      bookingId: bookingId,
      senderId: 'parent_' + bookingId,
      senderName: parentName,
      senderType: 'parent',
      message: randomReply,
      timestamp: new Date(Date.now() + 30000).toISOString(), // 30 seconds later
      isRead: false
    }

    setTimeout(() => {
      const updatedMessages = messagesStorage.add(parentMessage)
      setMessages(updatedMessages)
    }, 2000)
  }

  // Get conversations (unique bookings with messages)
  const conversations = bookings.filter(booking => 
    messages.some(msg => msg.bookingId === booking.id) ||
    ['confirmed', 'completed'].includes(booking.status)
  ).filter(booking => {
    if (!searchTerm) return true
    const player = players.find(p => booking.playerIds.includes(p.id))
    return (
      booking.parentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      player?.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })

  // Get messages for selected booking
  const selectedMessages = selectedBooking 
    ? messages.filter(msg => msg.bookingId === selectedBooking.id)
        .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
    : []

  // Mark messages as read when conversation is selected
  useEffect(() => {
    if (selectedBooking) {
      const unreadMessages = messages.filter(
        msg => msg.bookingId === selectedBooking.id && !msg.isRead && msg.senderType === 'parent'
      )
      unreadMessages.forEach(msg => {
        messagesStorage.markAsRead(msg.id)
      })
      if (unreadMessages.length > 0) {
        setMessages(messagesStorage.get())
      }
    }
  }, [selectedBooking])

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
    
    if (diffInDays === 0) {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    } else if (diffInDays === 1) {
      return 'Yesterday'
    } else if (diffInDays < 7) {
      return date.toLocaleDateString('en-US', { weekday: 'short' })
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }
  }

  const getUnreadCount = (bookingId: string) => {
    return messages.filter(
      msg => msg.bookingId === bookingId && !msg.isRead && msg.senderType === 'parent'
    ).length
  }

  const totalUnreadCount = messages.filter(
    msg => !msg.isRead && msg.senderType === 'parent'
  ).length

  return (
    <div className="h-[calc(100vh-8rem)] flex">
      {/* Conversations List */}
      <div className="w-80 bg-white border-r border-secondary-200 flex flex-col">
        <div className="p-4 border-b border-secondary-200">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold text-secondary-900">Messages</h1>
            {totalUnreadCount > 0 && (
              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                {totalUnreadCount}
              </span>
            )}
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-3 text-secondary-400" size={16} />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-secondary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="p-6 text-center">
              <MessageSquare className="mx-auto text-secondary-400 mb-3" size={48} />
              <p className="text-secondary-600 text-sm">No conversations yet</p>
              <p className="text-secondary-500 text-xs mt-1">
                Messages will appear when you have confirmed bookings
              </p>
            </div>
          ) : (
            conversations.map(booking => {
              const player = players.find(p => booking.playerIds.includes(p.id))
              const lastMessage = messages
                .filter(msg => msg.bookingId === booking.id)
                .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0]
              const unreadCount = getUnreadCount(booking.id)
              
              return (
                <button
                  key={booking.id}
                  onClick={() => setSelectedBooking(booking)}
                  className={`w-full p-4 text-left border-b border-secondary-100 hover:bg-secondary-50 transition-colors ${
                    selectedBooking?.id === booking.id ? 'bg-primary-50 border-primary-200' : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <p className="font-medium text-secondary-900 truncate">
                          {booking.parentName}
                        </p>
                        {unreadCount > 0 && (
                          <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                            {unreadCount}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-secondary-600 truncate">
                        {player?.name}
                      </p>
                      {lastMessage && (
                        <p className="text-xs text-secondary-500 truncate mt-1">
                          {lastMessage.senderType === 'coach' ? 'You: ' : ''}{lastMessage.message}
                        </p>
                      )}
                    </div>
                    <div className="ml-2 text-xs text-secondary-500">
                      {lastMessage && formatTime(lastMessage.timestamp)}
                    </div>
                  </div>
                </button>
              )
            })
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedBooking ? (
          <>
            {/* Chat Header */}
            <div className="p-4 bg-white border-b border-secondary-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                    <Users size={20} className="text-primary-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-secondary-900">{selectedBooking.parentName}</h3>
                    <p className="text-sm text-secondary-600">
                      Player: {players.find(p => selectedBooking.playerIds.includes(p.id))?.name}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button className="p-2 text-secondary-600 hover:bg-secondary-100 rounded-lg">
                    <Phone size={16} />
                  </button>
                  <button className="p-2 text-secondary-600 hover:bg-secondary-100 rounded-lg">
                    <Mail size={16} />
                  </button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 p-4 overflow-y-auto bg-secondary-25 space-y-4">
              {selectedMessages.length === 0 ? (
                <div className="text-center py-8">
                  <MessageSquare className="mx-auto text-secondary-400 mb-3" size={48} />
                  <p className="text-secondary-600">Start the conversation</p>
                  <p className="text-sm text-secondary-500 mt-1">
                    Send a message to {selectedBooking.parentName}
                  </p>
                  <button
                    onClick={() => sendMockParentReply(selectedBooking.id, selectedBooking.parentName)}
                    className="mt-3 text-xs text-primary-600 hover:text-primary-700 underline"
                  >
                    Simulate parent reply (demo)
                  </button>
                </div>
              ) : (
                selectedMessages.map(message => (
                  <div
                    key={message.id}
                    className={`flex ${message.senderType === 'coach' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                        message.senderType === 'coach'
                          ? 'bg-primary-600 text-white'
                          : 'bg-white text-secondary-900 border border-secondary-200'
                      }`}
                    >
                      <p className="text-sm">{message.message}</p>
                      <p className={`text-xs mt-1 ${
                        message.senderType === 'coach' ? 'text-primary-100' : 'text-secondary-500'
                      }`}>
                        {formatTime(message.timestamp)}
                      </p>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <form onSubmit={sendMessage} className="p-4 bg-white border-t border-secondary-200">
              <div className="flex space-x-3">
                <input
                  type="text"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 px-4 py-2 border border-secondary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                <button
                  type="submit"
                  disabled={!messageText.trim()}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Send size={16} />
                </button>
              </div>
              
              {selectedMessages.length > 0 && (
                <button
                  type="button"
                  onClick={() => sendMockParentReply(selectedBooking.id, selectedBooking.parentName)}
                  className="mt-2 text-xs text-primary-600 hover:text-primary-700 underline"
                >
                  Simulate parent reply (demo)
                </button>
              )}
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-secondary-25">
            <div className="text-center">
              <MessageSquare className="mx-auto text-secondary-400 mb-4" size={64} />
              <h3 className="text-xl font-semibold text-secondary-900 mb-2">Select a conversation</h3>
              <p className="text-secondary-600">
                Choose a conversation from the left to start messaging
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}