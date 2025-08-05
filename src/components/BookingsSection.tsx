'use client'

import { useState, useEffect } from 'react'
import { Calendar, Clock, User, DollarSign, CheckCircle2, XCircle, AlertCircle, Filter } from 'lucide-react'
import { 
  bookingsStorage, 
  slotsStorage, 
  playersStorage, 
  generateId, 
  formatDate, 
  formatTime 
} from '@/utils/localStorage'
import { Booking, TimeSlot, Player } from '@/types'

export default function BookingsSection() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [slots, setSlots] = useState<TimeSlot[]>([])
  const [players, setPlayers] = useState<Player[]>([])
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'cancelled' | 'completed'>('all')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null)
  const [formData, setFormData] = useState({
    playerIds: [] as string[],
    parentName: '',
    parentEmail: '',
    parentPhone: '',
    notes: ''
  })

  useEffect(() => {
    setBookings(bookingsStorage.get())
    setSlots(slotsStorage.get())
    setPlayers(playersStorage.get())
  }, [])

  const availableSlots = slots.filter(slot => 
    slot.isAvailable && 
    new Date(slot.date) >= new Date() &&
    !bookings.some(booking => booking.slotId === slot.id && booking.status !== 'cancelled')
  )

  const handleBookSlot = (slot: TimeSlot) => {
    setSelectedSlot(slot)
    setFormData({
      playerIds: [],
      parentName: '',
      parentEmail: '',
      parentPhone: '',
      notes: ''
    })
    setIsModalOpen(true)
  }

  const handleSubmitBooking = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedSlot || formData.playerIds.length === 0) return

    const newBooking: Booking = {
      id: generateId(),
      slotId: selectedSlot.id,
      playerIds: formData.playerIds,
      parentName: formData.parentName,
      parentEmail: formData.parentEmail,
      parentPhone: formData.parentPhone,
      status: 'pending',
      paymentStatus: 'pending',
      totalAmount: selectedSlot.price * formData.playerIds.length,
      bookingDate: new Date().toISOString().split('T')[0],
      notes: formData.notes
    }

    const updatedBookings = bookingsStorage.add(newBooking)
    setBookings(updatedBookings)
    setIsModalOpen(false)
  }

  const updateBookingStatus = (id: string, status: Booking['status']) => {
    const updatedBookings = bookingsStorage.update(id, { status })
    setBookings(updatedBookings)
  }

  const updatePaymentStatus = (id: string, paymentStatus: Booking['paymentStatus']) => {
    const updatedBookings = bookingsStorage.update(id, { paymentStatus })
    setBookings(updatedBookings)
  }

  const getStatusColor = (status: string): string => {
    const colors: { [key: string]: string } = {
      'pending': 'bg-yellow-100 text-yellow-700',
      'confirmed': 'bg-green-100 text-green-700',
      'cancelled': 'bg-red-100 text-red-700',
      'completed': 'bg-blue-100 text-blue-700'
    }
    return colors[status] || 'bg-gray-100 text-gray-700'
  }

  const getPaymentStatusColor = (status: string): string => {
    const colors: { [key: string]: string } = {
      'pending': 'bg-orange-100 text-orange-700',
      'paid': 'bg-green-100 text-green-700',
      'refunded': 'bg-gray-100 text-gray-700'
    }
    return colors[status] || 'bg-gray-100 text-gray-700'
  }

  const filteredBookings = bookings.filter(booking => 
    filter === 'all' || booking.status === filter
  ).sort((a, b) => {
    const slotA = slots.find(s => s.id === a.slotId)
    const slotB = slots.find(s => s.id === b.slotId)
    if (!slotA || !slotB) return 0
    return new Date(slotA.date + ' ' + slotA.startTime).getTime() - 
           new Date(slotB.date + ' ' + slotB.startTime).getTime()
  })

  const stats = [
    {
      title: 'Total Bookings',
      value: bookings.length,
      icon: Calendar,
      color: 'text-blue-600',
      bg: 'bg-blue-100'
    },
    {
      title: 'Confirmed',
      value: bookings.filter(b => b.status === 'confirmed').length,
      icon: CheckCircle2,
      color: 'text-green-600',
      bg: 'bg-green-100'
    },
    {
      title: 'Pending Payment',
      value: bookings.filter(b => b.paymentStatus === 'pending').length,
      icon: DollarSign,
      color: 'text-orange-600',
      bg: 'bg-orange-100'
    },
    {
      title: 'This Month Revenue',
      value: `$${bookings.filter(b => b.paymentStatus === 'paid').reduce((sum, b) => sum + b.totalAmount, 0)}`,
      icon: DollarSign,
      color: 'text-purple-600',
      bg: 'bg-purple-100'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-secondary-900">Training Sessions</h1>
          <p className="text-secondary-600 mt-2">Manage bookings and schedule sessions</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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

      {/* Available Slots */}
      {availableSlots.length > 0 && (
        <div className="card">
          <h2 className="text-xl font-semibold text-secondary-900 mb-4">Available Time Slots</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {availableSlots.slice(0, 6).map(slot => (
              <div key={slot.id} className="p-4 border border-secondary-200 rounded-lg hover:border-primary-300 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    slot.type === 'individual' 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'bg-green-100 text-green-700'
                  }`}>
                    {slot.type === 'individual' ? '1-on-1' : `Group (${slot.maxPlayers})`}
                  </span>
                  <span className="font-bold text-primary-600">${slot.price}</span>
                </div>
                
                <div className="space-y-2 mb-3">
                  <div className="flex items-center text-sm text-secondary-600">
                    <Calendar size={14} className="mr-2" />
                    {formatDate(slot.date)}
                  </div>
                  <div className="flex items-center text-sm text-secondary-600">
                    <Clock size={14} className="mr-2" />
                    {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                  </div>
                </div>
                
                <button
                  onClick={() => handleBookSlot(slot)}
                  className="w-full btn-primary text-sm py-2"
                >
                  Book Session
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter */}
      <div className="card">
        <div className="flex items-center space-x-4">
          <Filter size={20} className="text-secondary-600" />
          <div className="flex flex-wrap gap-2">
            {(['all', 'pending', 'confirmed', 'cancelled', 'completed'] as const).map(status => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === status
                    ? 'bg-primary-600 text-white'
                    : 'bg-secondary-100 text-secondary-700 hover:bg-secondary-200'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Bookings List */}
      <div className="space-y-4">
        {filteredBookings.length === 0 ? (
          <div className="card text-center py-12">
            <Calendar className="mx-auto text-secondary-400 mb-4" size={64} />
            <h3 className="text-xl font-semibold text-secondary-900 mb-2">
              {filter === 'all' ? 'No bookings yet' : `No ${filter} bookings`}
            </h3>
            <p className="text-secondary-600">
              {filter === 'all' 
                ? 'Bookings will appear here as parents schedule sessions' 
                : `Try changing the filter to see other bookings`
              }
            </p>
          </div>
        ) : (
          filteredBookings.map(booking => {
            const slot = slots.find(s => s.id === booking.slotId)
            const bookedPlayers = players.filter(p => booking.playerIds.includes(p.id))
            
            return (
              <div key={booking.id} className="card">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-secondary-900">
                        {booking.parentName}
                      </h3>
                      <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(booking.status)}`}>
                        {booking.status}
                      </span>
                      <span className={`px-3 py-1 text-sm font-medium rounded-full ${getPaymentStatusColor(booking.paymentStatus)}`}>
                        {booking.paymentStatus}
                      </span>
                    </div>
                    
                    {slot && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="flex items-center text-secondary-600">
                          <Calendar size={16} className="mr-2" />
                          <span className="text-sm">{formatDate(slot.date)}</span>
                        </div>
                        <div className="flex items-center text-secondary-600">
                          <Clock size={16} className="mr-2" />
                          <span className="text-sm">
                            {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                          </span>
                        </div>
                        <div className="flex items-center text-secondary-600">
                          <DollarSign size={16} className="mr-2" />
                          <span className="text-sm font-semibold">${booking.totalAmount}</span>
                        </div>
                      </div>
                    )}
                    
                    <div className="mb-4">
                      <p className="text-sm font-medium text-secondary-700 mb-2">Players:</p>
                      <div className="flex flex-wrap gap-2">
                        {bookedPlayers.map(player => (
                          <span key={player.id} className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm">
                            {player.name} ({player.age}yo)
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div className="text-sm text-secondary-600 space-y-1">
                      <p>📧 {booking.parentEmail}</p>
                      <p>📱 {booking.parentPhone}</p>
                      {booking.notes && (
                        <p className="mt-2 p-3 bg-secondary-50 rounded-lg">
                          <span className="font-medium">Notes: </span>
                          {booking.notes}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2 pt-4 border-t border-secondary-200">
                  {booking.status === 'pending' && (
                    <>
                      <button
                        onClick={() => updateBookingStatus(booking.id, 'confirmed')}
                        className="btn-primary text-sm py-2 px-4"
                      >
                        <CheckCircle2 size={16} className="mr-1" />
                        Confirm
                      </button>
                      <button
                        onClick={() => updateBookingStatus(booking.id, 'cancelled')}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                      >
                        <XCircle size={16} className="mr-1" />
                        Cancel
                      </button>
                    </>
                  )}
                  
                  {booking.status === 'confirmed' && booking.paymentStatus === 'pending' && (
                    <button
                      onClick={() => updatePaymentStatus(booking.id, 'paid')}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      <DollarSign size={16} className="mr-1" />
                      Mark Paid
                    </button>
                  )}
                  
                  {booking.status === 'confirmed' && new Date() > new Date(slot?.date || '') && (
                    <button
                      onClick={() => updateBookingStatus(booking.id, 'completed')}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      Mark Complete
                    </button>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Booking Modal */}
      {isModalOpen && selectedSlot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-secondary-900 mb-4">
              Book Training Session
            </h2>
            
            <div className="mb-4 p-4 bg-primary-50 rounded-lg">
              <h3 className="font-medium text-primary-900 mb-2">Session Details</h3>
              <p className="text-sm text-primary-700">
                {formatDate(selectedSlot.date)} • {formatTime(selectedSlot.startTime)} - {formatTime(selectedSlot.endTime)}
              </p>
              <p className="text-sm text-primary-700">
                {selectedSlot.type === 'individual' ? '1-on-1 Training' : `Group Training (max ${selectedSlot.maxPlayers})`}
              </p>
              <p className="text-sm font-semibold text-primary-900">${selectedSlot.price} per player</p>
            </div>
            
            <form onSubmit={handleSubmitBooking} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Select Players
                </label>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {players.map(player => (
                    <label key={player.id} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.playerIds.includes(player.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            if (selectedSlot.type === 'individual' && formData.playerIds.length >= 1) return
                            if (selectedSlot.type === 'group' && formData.playerIds.length >= selectedSlot.maxPlayers) return
                            setFormData({ 
                              ...formData, 
                              playerIds: [...formData.playerIds, player.id] 
                            })
                          } else {
                            setFormData({ 
                              ...formData, 
                              playerIds: formData.playerIds.filter(id => id !== player.id) 
                            })
                          }
                        }}
                        className="mr-3"
                      />
                      <span className="text-sm">{player.name} ({player.age}yo)</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Parent/Guardian Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.parentName}
                  onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={formData.parentEmail}
                  onChange={(e) => setFormData({ ...formData, parentEmail: e.target.value })}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  required
                  value={formData.parentPhone}
                  onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="input-field"
                  rows={3}
                  placeholder="Special requests, goals, etc."
                />
              </div>

              {formData.playerIds.length > 0 && (
                <div className="p-3 bg-secondary-50 rounded-lg">
                  <p className="text-sm font-medium text-secondary-900">
                    Total: ${selectedSlot.price * formData.playerIds.length}
                  </p>
                </div>
              )}

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formData.playerIds.length === 0}
                  className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Book Session
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}