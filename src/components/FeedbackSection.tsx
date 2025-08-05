'use client'

import { useState, useEffect } from 'react'
import { Plus, Star, TrendingUp, Award, MessageSquare, Calendar } from 'lucide-react'
import { 
  feedbackStorage, 
  bookingsStorage, 
  playersStorage, 
  slotsStorage,
  generateId, 
  formatDate 
} from '@/utils/localStorage'
import { Feedback, Booking, Player, TimeSlot } from '@/types'

export default function FeedbackSection() {
  const [feedback, setFeedback] = useState<Feedback[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [players, setPlayers] = useState<Player[]>([])
  const [slots, setSlots] = useState<TimeSlot[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [formData, setFormData] = useState({
    rating: 5,
    strengths: [] as string[],
    areasForImprovement: [] as string[],
    sessionGoals: [] as string[],
    nextSessionFocus: '',
    parentNotes: ''
  })

  useEffect(() => {
    setFeedback(feedbackStorage.get())
    setBookings(bookingsStorage.get())
    setPlayers(playersStorage.get())
    setSlots(slotsStorage.get())
  }, [])

  const completedBookings = bookings.filter(b => 
    b.status === 'completed' && 
    !feedback.some(f => f.bookingId === b.id)
  )

  const commonStrengths = [
    'Ball control', 'Passing accuracy', 'Shooting technique', 'Defensive positioning',
    'Communication', 'Teamwork', 'Speed', 'Agility', 'Game awareness', 'Leadership'
  ]

  const commonImprovements = [
    'First touch', 'Weak foot', 'Heading', 'Crossing', 'Finishing',
    'Tackling', 'Positioning', 'Fitness', 'Concentration', 'Decision making'
  ]

  const commonGoals = [
    'Improve technical skills', 'Build confidence', 'Enhance fitness',
    'Develop game understanding', 'Work on specific techniques', 'Prepare for matches'
  ]

  const handleSubmitFeedback = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedBooking) return

    const player = players.find(p => selectedBooking.playerIds.includes(p.id))
    if (!player) return

    const newFeedback: Feedback = {
      id: generateId(),
      playerId: player.id,
      bookingId: selectedBooking.id,
      coachName: 'Coach Martinez',
      rating: formData.rating,
      strengths: formData.strengths,
      areasForImprovement: formData.areasForImprovement,
      sessionGoals: formData.sessionGoals,
      nextSessionFocus: formData.nextSessionFocus,
      parentNotes: formData.parentNotes,
      createdAt: new Date().toISOString()
    }

    const updatedFeedback = feedbackStorage.add(newFeedback)
    setFeedback(updatedFeedback)
    closeModal()
  }

  const openModal = (booking: Booking) => {
    setSelectedBooking(booking)
    setFormData({
      rating: 5,
      strengths: [],
      areasForImprovement: [],
      sessionGoals: [],
      nextSessionFocus: '',
      parentNotes: ''
    })
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedBooking(null)
  }

  const toggleArrayItem = (array: string[], item: string, setter: (items: string[]) => void) => {
    if (array.includes(item)) {
      setter(array.filter(i => i !== item))
    } else {
      setter([...array, item])
    }
  }

  const renderStars = (rating: number, size = 'w-5 h-5') => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map(star => (
          <Star
            key={star}
            className={`${size} ${star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
          />
        ))}
      </div>
    )
  }

  const stats = [
    {
      title: 'Feedback Given',
      value: feedback.length,
      icon: MessageSquare,
      color: 'text-blue-600',
      bg: 'bg-blue-100'
    },
    {
      title: 'Average Rating',
      value: feedback.length > 0 ? (feedback.reduce((sum, f) => sum + f.rating, 0) / feedback.length).toFixed(1) : '0',
      icon: Star,
      color: 'text-yellow-600',
      bg: 'bg-yellow-100'
    },
    {
      title: 'Awaiting Feedback',
      value: completedBookings.length,
      icon: Award,
      color: 'text-green-600',
      bg: 'bg-green-100'
    },
    {
      title: 'This Month',
      value: feedback.filter(f => {
        const feedbackMonth = new Date(f.createdAt).getMonth()
        const currentMonth = new Date().getMonth()
        return feedbackMonth === currentMonth
      }).length,
      icon: TrendingUp,
      color: 'text-purple-600',
      bg: 'bg-purple-100'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-secondary-900">Player Progress</h1>
          <p className="text-secondary-600 mt-2">Track development and provide feedback</p>
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

      {/* Pending Feedback */}
      {completedBookings.length > 0 && (
        <div className="card">
          <h2 className="text-xl font-semibold text-secondary-900 mb-4 flex items-center">
            <Award className="mr-2 text-green-600" size={24} />
            Sessions Awaiting Feedback
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {completedBookings.map(booking => {
              const slot = slots.find(s => s.id === booking.slotId)
              const player = players.find(p => booking.playerIds.includes(p.id))
              
              return (
                <div key={booking.id} className="p-4 border border-secondary-200 rounded-lg">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-medium text-secondary-900">{player?.name}</h3>
                      <p className="text-sm text-secondary-600">{booking.parentName}</p>
                    </div>
                    <span className="text-xs text-secondary-500">
                      {slot && formatDate(slot.date)}
                    </span>
                  </div>
                  
                  <button
                    onClick={() => openModal(booking)}
                    className="w-full btn-primary text-sm py-2"
                  >
                    <Plus size={16} className="mr-1" />
                    Give Feedback
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Feedback History */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-secondary-900">Feedback History</h2>
        
        {feedback.length === 0 ? (
          <div className="card text-center py-12">
            <MessageSquare className="mx-auto text-secondary-400 mb-4" size={64} />
            <h3 className="text-xl font-semibold text-secondary-900 mb-2">No feedback yet</h3>
            <p className="text-secondary-600">
              Complete some training sessions to start giving feedback
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {feedback.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map(item => {
              const player = players.find(p => p.id === item.playerId)
              const booking = bookings.find(b => b.id === item.bookingId)
              const slot = slots.find(s => s.id === booking?.slotId)
              
              return (
                <div key={item.id} className="card">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                        {player?.avatar || '👤'}
                      </div>
                      <div>
                        <h3 className="font-semibold text-secondary-900">{player?.name}</h3>
                        <p className="text-sm text-secondary-600">
                          {slot && formatDate(slot.date)}
                        </p>
                      </div>
                    </div>
                    {renderStars(item.rating)}
                  </div>

                  <div className="space-y-4">
                    {item.strengths.length > 0 && (
                      <div>
                        <h4 className="font-medium text-green-700 mb-2">✅ Strengths</h4>
                        <div className="flex flex-wrap gap-2">
                          {item.strengths.map(strength => (
                            <span key={strength} className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                              {strength}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {item.areasForImprovement.length > 0 && (
                      <div>
                        <h4 className="font-medium text-orange-700 mb-2">🎯 Areas for Improvement</h4>
                        <div className="flex flex-wrap gap-2">
                          {item.areasForImprovement.map(area => (
                            <span key={area} className="px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs">
                              {area}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {item.sessionGoals.length > 0 && (
                      <div>
                        <h4 className="font-medium text-blue-700 mb-2">🏆 Session Goals</h4>
                        <div className="flex flex-wrap gap-2">
                          {item.sessionGoals.map(goal => (
                            <span key={goal} className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                              {goal}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {item.nextSessionFocus && (
                      <div>
                        <h4 className="font-medium text-purple-700 mb-2">⭐ Next Session Focus</h4>
                        <p className="text-sm text-secondary-700 p-3 bg-purple-50 rounded-lg">
                          {item.nextSessionFocus}
                        </p>
                      </div>
                    )}

                    {item.parentNotes && (
                      <div>
                        <h4 className="font-medium text-secondary-700 mb-2">📝 Notes for Parents</h4>
                        <p className="text-sm text-secondary-700 p-3 bg-secondary-50 rounded-lg">
                          {item.parentNotes}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Feedback Modal */}
      {isModalOpen && selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold text-secondary-900 mb-4">
                Session Feedback
              </h2>
              
              <div className="mb-4 p-4 bg-primary-50 rounded-lg">
                <h3 className="font-medium text-primary-900 mb-2">Session Details</h3>
                {(() => {
                  const slot = slots.find(s => s.id === selectedBooking.slotId)
                  const player = players.find(p => selectedBooking.playerIds.includes(p.id))
                  return (
                    <div className="text-sm text-primary-700">
                      <p>Player: {player?.name}</p>
                      <p>Date: {slot && formatDate(slot.date)}</p>
                      <p>Parent: {selectedBooking.parentName}</p>
                    </div>
                  )
                })()}
              </div>
              
              <form onSubmit={handleSubmitFeedback} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Overall Performance Rating
                  </label>
                  <div className="flex items-center space-x-2">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setFormData({ ...formData, rating: star })}
                        className="focus:outline-none"
                      >
                        <Star
                          className={`w-8 h-8 ${star <= formData.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                        />
                      </button>
                    ))}
                    <span className="ml-2 text-sm text-secondary-600">
                      {formData.rating}/5
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-3">
                    Strengths Demonstrated
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {commonStrengths.map(strength => (
                      <button
                        key={strength}
                        type="button"
                        onClick={() => toggleArrayItem(
                          formData.strengths, 
                          strength, 
                          (items) => setFormData({ ...formData, strengths: items })
                        )}
                        className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                          formData.strengths.includes(strength)
                            ? 'bg-green-100 border-green-300 text-green-700'
                            : 'bg-white border-secondary-200 text-secondary-700 hover:bg-secondary-50'
                        }`}
                      >
                        {strength}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-3">
                    Areas for Improvement
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {commonImprovements.map(improvement => (
                      <button
                        key={improvement}
                        type="button"
                        onClick={() => toggleArrayItem(
                          formData.areasForImprovement, 
                          improvement, 
                          (items) => setFormData({ ...formData, areasForImprovement: items })
                        )}
                        className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                          formData.areasForImprovement.includes(improvement)
                            ? 'bg-orange-100 border-orange-300 text-orange-700'
                            : 'bg-white border-secondary-200 text-secondary-700 hover:bg-secondary-50'
                        }`}
                      >
                        {improvement}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-3">
                    Session Goals Achieved
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {commonGoals.map(goal => (
                      <button
                        key={goal}
                        type="button"
                        onClick={() => toggleArrayItem(
                          formData.sessionGoals, 
                          goal, 
                          (items) => setFormData({ ...formData, sessionGoals: items })
                        )}
                        className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                          formData.sessionGoals.includes(goal)
                            ? 'bg-blue-100 border-blue-300 text-blue-700'
                            : 'bg-white border-secondary-200 text-secondary-700 hover:bg-secondary-50'
                        }`}
                      >
                        {goal}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Next Session Focus
                  </label>
                  <textarea
                    value={formData.nextSessionFocus}
                    onChange={(e) => setFormData({ ...formData, nextSessionFocus: e.target.value })}
                    className="input-field"
                    rows={3}
                    placeholder="What should we focus on in the next training session?"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Notes for Parents
                  </label>
                  <textarea
                    value={formData.parentNotes}
                    onChange={(e) => setFormData({ ...formData, parentNotes: e.target.value })}
                    className="input-field"
                    rows={3}
                    placeholder="Additional feedback or recommendations for parents"
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="btn-secondary flex-1"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary flex-1"
                  >
                    Save Feedback
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}