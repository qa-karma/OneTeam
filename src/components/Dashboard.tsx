'use client'

import { useState, useEffect } from 'react'
import { 
  Calendar, 
  Users, 
  TrendingUp, 
  DollarSign,
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react'
import { 
  playersStorage, 
  slotsStorage, 
  bookingsStorage, 
  feedbackStorage,
  formatDate,
  formatTime 
} from '@/utils/localStorage'
import { Player, TimeSlot, Booking, Feedback } from '@/types'

export default function Dashboard() {
  const [players, setPlayers] = useState<Player[]>([])
  const [slots, setSlots] = useState<TimeSlot[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [feedback, setFeedback] = useState<Feedback[]>([])

  useEffect(() => {
    setPlayers(playersStorage.get())
    setSlots(slotsStorage.get())
    setBookings(bookingsStorage.get())
    setFeedback(feedbackStorage.get())
  }, [])

  const today = new Date().toISOString().split('T')[0]
  const todaySlots = slots.filter(slot => slot.date === today && slot.isAvailable)
  const upcomingBookings = bookings.filter(booking => {
    const slot = slots.find(s => s.id === booking.slotId)
    return slot && slot.date >= today && booking.status === 'confirmed'
  }).slice(0, 3)

  const stats = [
    {
      title: 'Active Players',
      value: players.length,
      icon: Users,
      color: 'text-blue-600',
      bg: 'bg-blue-100'
    },
    {
      title: 'Today\'s Sessions',
      value: todaySlots.length,
      icon: Calendar,
      color: 'text-green-600',
      bg: 'bg-green-100'
    },
    {
      title: 'This Month',
      value: `$${bookings.filter(b => b.paymentStatus === 'paid').reduce((sum, b) => sum + b.totalAmount, 0)}`,
      icon: DollarSign,
      color: 'text-purple-600',
      bg: 'bg-purple-100'
    },
    {
      title: 'Feedback Given',
      value: feedback.length,
      icon: TrendingUp,
      color: 'text-orange-600',
      bg: 'bg-orange-100'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-secondary-900">Welcome back, Coach!</h1>
        <p className="text-secondary-600 mt-2">Here's what's happening with your training sessions today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <div key={index} className="card">
              <div className="flex items-center">
                <div className={`${stat.bg} ${stat.color} p-3 rounded-xl`}>
                  <Icon size={24} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-secondary-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-secondary-900">{stat.value}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Schedule */}
        <div className="card">
          <div className="flex items-center mb-4">
            <Clock className="text-primary-600 mr-3" size={24} />
            <h2 className="text-xl font-semibold text-secondary-900">Today's Schedule</h2>
          </div>
          
          {todaySlots.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="mx-auto text-secondary-400 mb-3" size={48} />
              <p className="text-secondary-600">No sessions scheduled for today</p>
              <p className="text-sm text-secondary-500 mt-1">Time to relax or plan ahead!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {todaySlots.map(slot => (
                <div key={slot.id} className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg">
                  <div>
                    <p className="font-medium text-secondary-900">
                      {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                    </p>
                    <p className="text-sm text-secondary-600">
                      {slot.type === 'individual' ? '1-on-1 Training' : `Group Training (max ${slot.maxPlayers})`}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-primary-600">${slot.price}</p>
                    <p className="text-xs text-secondary-500">{slot.location}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming Bookings */}
        <div className="card">
          <div className="flex items-center mb-4">
            <CheckCircle2 className="text-green-600 mr-3" size={24} />
            <h2 className="text-xl font-semibold text-secondary-900">Upcoming Sessions</h2>
          </div>
          
          {upcomingBookings.length === 0 ? (
            <div className="text-center py-8">
              <AlertCircle className="mx-auto text-secondary-400 mb-3" size={48} />
              <p className="text-secondary-600">No upcoming bookings</p>
              <p className="text-sm text-secondary-500 mt-1">Check your availability slots!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingBookings.map(booking => {
                const slot = slots.find(s => s.id === booking.slotId)
                const player = players.find(p => booking.playerIds.includes(p.id))
                
                return (
                  <div key={booking.id} className="p-3 border border-secondary-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-secondary-900">{booking.parentName}</p>
                        <p className="text-sm text-secondary-600">
                          {slot ? formatDate(slot.date) : 'Date TBD'}
                        </p>
                        {player && (
                          <p className="text-xs text-secondary-500">Player: {player.name}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          booking.paymentStatus === 'paid' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {booking.paymentStatus}
                        </span>
                        <p className="text-sm font-semibold text-secondary-900 mt-1">
                          ${booking.totalAmount}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h2 className="text-xl font-semibold text-secondary-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="btn-primary text-center">
            Create New Slot
          </button>
          <button className="btn-secondary text-center">
            Add Player
          </button>
          <button className="btn-accent text-center">
            Send Feedback
          </button>
        </div>
      </div>
    </div>
  )
}