'use client'

import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Calendar, Clock, Users, MapPin } from 'lucide-react'
import { 
  slotsStorage, 
  bookingsStorage, 
  playersStorage,
  formatTime 
} from '@/utils/localStorage'
import { TimeSlot, Booking, Player } from '@/types'

interface CalendarEvent {
  id: string
  title: string
  date: string
  startTime: string
  endTime: string
  type: 'available' | 'booked' | 'completed'
  slot?: TimeSlot
  booking?: Booking
  players?: Player[]
}

export default function CalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)

  useEffect(() => {
    loadCalendarEvents()
  }, [currentDate])

  const loadCalendarEvents = () => {
    const slots = slotsStorage.get()
    const bookings = bookingsStorage.get()
    const players = playersStorage.get()

    const calendarEvents: CalendarEvent[] = []

    // Add available slots
    slots.forEach(slot => {
      const slotDate = new Date(slot.date)
      const booking = bookings.find(b => b.slotId === slot.id && b.status !== 'cancelled')
      
      if (isDateInCurrentMonth(slotDate)) {
        if (booking) {
          // Booked session
          const eventPlayers = players.filter(p => booking.playerIds.includes(p.id))
          const isPast = slotDate < new Date()
          
          calendarEvents.push({
            id: slot.id,
            title: `${slot.type === 'individual' ? '1-on-1' : 'Group'} Session`,
            date: slot.date,
            startTime: slot.startTime,
            endTime: slot.endTime,
            type: isPast ? 'completed' : 'booked',
            slot,
            booking,
            players: eventPlayers
          })
        } else if (slot.isAvailable) {
          // Available slot
          calendarEvents.push({
            id: slot.id,
            title: `Available ${slot.type === 'individual' ? '1-on-1' : 'Group'}`,
            date: slot.date,
            startTime: slot.startTime,
            endTime: slot.endTime,
            type: 'available',
            slot
          })
        }
      }
    })

    setEvents(calendarEvents)
  }

  const isDateInCurrentMonth = (date: Date) => {
    return date.getMonth() === currentDate.getMonth() && 
           date.getFullYear() === currentDate.getFullYear()
  }

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }

    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day))
    }

    return days
  }

  const getEventsForDate = (date: Date | null) => {
    if (!date) return []
    const dateString = date.toISOString().split('T')[0]
    return events.filter(event => event.date === dateString)
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate)
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1)
    } else {
      newDate.setMonth(newDate.getMonth() + 1)
    }
    setCurrentDate(newDate)
  }

  const getEventColor = (type: string) => {
    switch (type) {
      case 'available':
        return 'bg-green-100 text-green-700 border-green-200'
      case 'booked':
        return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'completed':
        return 'bg-gray-100 text-gray-700 border-gray-200'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const days = getDaysInMonth(currentDate)
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-secondary-900">Calendar View</h2>
          <p className="text-secondary-600 mt-1">View and manage training sessions by month</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigateMonth('prev')}
            className="p-2 hover:bg-secondary-100 rounded-lg transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          
          <h3 className="text-xl font-semibold text-secondary-900 min-w-[200px] text-center">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h3>
          
          <button
            onClick={() => navigateMonth('next')}
            className="p-2 hover:bg-secondary-100 rounded-lg transition-colors"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="card">
        {/* Day Headers */}
        <div className="grid grid-cols-7 gap-1 mb-4">
          {dayNames.map(day => (
            <div key={day} className="p-3 text-center font-medium text-secondary-600 text-sm">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-1">
          {days.map((date, index) => {
            const dayEvents = getEventsForDate(date)
            const isToday = date && 
              date.toDateString() === new Date().toDateString()

            return (
              <div
                key={index}
                className={`min-h-[120px] p-2 border border-secondary-100 ${
                  date ? 'bg-white hover:bg-secondary-25' : 'bg-secondary-50'
                } ${isToday ? 'ring-2 ring-primary-300' : ''} transition-colors`}
              >
                {date && (
                  <>
                    <div className={`text-sm font-medium mb-2 ${
                      isToday ? 'text-primary-600' : 'text-secondary-900'
                    }`}>
                      {date.getDate()}
                    </div>
                    
                    <div className="space-y-1">
                      {dayEvents.slice(0, 3).map(event => (
                        <button
                          key={event.id}
                          onClick={() => setSelectedEvent(event)}
                          className={`w-full text-left p-1 rounded text-xs border ${getEventColor(event.type)} hover:opacity-80 transition-opacity`}
                        >
                          <div className="font-medium truncate">{event.title}</div>
                          <div className="text-xs opacity-75">
                            {formatTime(event.startTime)}
                          </div>
                        </button>
                      ))}
                      
                      {dayEvents.length > 3 && (
                        <div className="text-xs text-secondary-500 text-center">
                          +{dayEvents.length - 3} more
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center space-x-6 text-sm">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-green-100 border border-green-200 rounded"></div>
          <span>Available</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-blue-100 border border-blue-200 rounded"></div>
          <span>Booked</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-gray-100 border border-gray-200 rounded"></div>
          <span>Completed</span>
        </div>
      </div>

      {/* Event Details Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-secondary-900">
                Session Details
              </h3>
              <button
                onClick={() => setSelectedEvent(null)}
                className="text-secondary-500 hover:text-secondary-700"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Calendar className="text-primary-600" size={20} />
                <div>
                  <p className="font-medium text-secondary-900">{selectedEvent.title}</p>
                  <p className="text-sm text-secondary-600">
                    {new Date(selectedEvent.date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Clock className="text-primary-600" size={20} />
                <div>
                  <p className="text-sm text-secondary-900">
                    {formatTime(selectedEvent.startTime)} - {formatTime(selectedEvent.endTime)}
                  </p>
                </div>
              </div>

              {selectedEvent.slot && (
                <>
                  <div className="flex items-center space-x-3">
                    <MapPin className="text-primary-600" size={20} />
                    <div>
                      <p className="text-sm text-secondary-900">{selectedEvent.slot.location}</p>
                      <p className="text-sm text-secondary-600">${selectedEvent.slot.price}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Users className="text-primary-600" size={20} />
                    <div>
                      <p className="text-sm text-secondary-900">
                        {selectedEvent.slot.type === 'individual' ? '1-on-1 Training' : `Group Training (max ${selectedEvent.slot.maxPlayers})`}
                      </p>
                    </div>
                  </div>
                </>
              )}

              {selectedEvent.booking && selectedEvent.players && (
                <div className="border-t border-secondary-200 pt-4">
                  <h4 className="font-medium text-secondary-900 mb-2">Booking Details</h4>
                  <div className="space-y-2">
                    <p className="text-sm">
                      <span className="font-medium">Parent:</span> {selectedEvent.booking.parentName}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Players:</span>{' '}
                      {selectedEvent.players.map(p => p.name).join(', ')}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Status:</span>{' '}
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        selectedEvent.booking.status === 'confirmed' 
                          ? 'bg-green-100 text-green-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {selectedEvent.booking.status}
                      </span>
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Payment:</span>{' '}
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        selectedEvent.booking.paymentStatus === 'paid' 
                          ? 'bg-green-100 text-green-700'
                          : 'bg-orange-100 text-orange-700'
                      }`}>
                        {selectedEvent.booking.paymentStatus}
                      </span>
                    </p>
                  </div>
                </div>
              )}

              {selectedEvent.slot?.description && (
                <div className="border-t border-secondary-200 pt-4">
                  <h4 className="font-medium text-secondary-900 mb-2">Description</h4>
                  <p className="text-sm text-secondary-600">{selectedEvent.slot.description}</p>
                </div>
              )}
            </div>

            <div className="mt-6">
              <button
                onClick={() => setSelectedEvent(null)}
                className="w-full btn-secondary"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}