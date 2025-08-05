'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, Calendar, Clock, MapPin, Users } from 'lucide-react'
import { slotsStorage, generateId, formatDate, formatTime } from '@/utils/localStorage'
import { TimeSlot } from '@/types'

export default function SlotsSection() {
  const [slots, setSlots] = useState<TimeSlot[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingSlot, setEditingSlot] = useState<TimeSlot | null>(null)
  const [formData, setFormData] = useState({
    date: '',
    startTime: '',
    endTime: '',
    type: 'individual' as 'individual' | 'group',
    maxPlayers: 1,
    price: 50,
    location: 'Main Field',
    description: ''
  })

  useEffect(() => {
    setSlots(slotsStorage.get())
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const newSlot: TimeSlot = {
      id: editingSlot?.id || generateId(),
      ...formData,
      isAvailable: true
    }

    let updatedSlots
    if (editingSlot) {
      updatedSlots = slotsStorage.update(editingSlot.id, newSlot)
    } else {
      updatedSlots = slotsStorage.add(newSlot)
    }
    
    setSlots(updatedSlots)
    closeModal()
  }

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this time slot?')) {
      const updatedSlots = slotsStorage.delete(id)
      setSlots(updatedSlots)
    }
  }

  const toggleAvailability = (id: string) => {
    const slot = slots.find(s => s.id === id)
    if (slot) {
      const updatedSlots = slotsStorage.update(id, { isAvailable: !slot.isAvailable })
      setSlots(updatedSlots)
    }
  }

  const openModal = (slot?: TimeSlot) => {
    if (slot) {
      setEditingSlot(slot)
      setFormData({
        date: slot.date,
        startTime: slot.startTime,
        endTime: slot.endTime,
        type: slot.type,
        maxPlayers: slot.maxPlayers,
        price: slot.price,
        location: slot.location,
        description: slot.description || ''
      })
    } else {
      setEditingSlot(null)
      setFormData({
        date: '',
        startTime: '',
        endTime: '',
        type: 'individual',
        maxPlayers: 1,
        price: 50,
        location: 'Main Field',
        description: ''
      })
    }
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingSlot(null)
  }

  const sortedSlots = [...slots].sort((a, b) => {
    const dateCompare = a.date.localeCompare(b.date)
    if (dateCompare === 0) {
      return a.startTime.localeCompare(b.startTime)
    }
    return dateCompare
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-secondary-900">Time Slots</h1>
          <p className="text-secondary-600 mt-2">Manage your availability for training sessions</p>
        </div>
        <button 
          onClick={() => openModal()}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus size={20} />
          <span>New Slot</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="bg-green-100 text-green-600 p-3 rounded-xl">
              <Calendar size={24} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-secondary-600">Available Slots</p>
              <p className="text-2xl font-bold text-secondary-900">
                {slots.filter(s => s.isAvailable).length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center">
            <div className="bg-blue-100 text-blue-600 p-3 rounded-xl">
              <Users size={24} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-secondary-600">Group Sessions</p>
              <p className="text-2xl font-bold text-secondary-900">
                {slots.filter(s => s.type === 'group').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center">
            <div className="bg-purple-100 text-purple-600 p-3 rounded-xl">
              <Clock size={24} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-secondary-600">This Week</p>
              <p className="text-2xl font-bold text-secondary-900">
                {slots.filter(s => {
                  const slotDate = new Date(s.date)
                  const today = new Date()
                  const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
                  return slotDate >= today && slotDate <= weekFromNow
                }).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Slots List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {sortedSlots.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Calendar className="mx-auto text-secondary-400 mb-4" size={64} />
            <h3 className="text-xl font-semibold text-secondary-900 mb-2">No time slots yet</h3>
            <p className="text-secondary-600 mb-4">Create your first availability slot to start taking bookings</p>
            <button onClick={() => openModal()} className="btn-primary">
              Create First Slot
            </button>
          </div>
        ) : (
          sortedSlots.map(slot => (
            <div key={slot.id} className={`card ${!slot.isAvailable ? 'opacity-60' : ''}`}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${
                    slot.type === 'individual' 
                      ? 'bg-blue-100 text-blue-600' 
                      : 'bg-green-100 text-green-600'
                  }`}>
                    {slot.type === 'individual' ? '1️⃣' : '👥'}
                  </div>
                  <div>
                    <h3 className="font-semibold text-secondary-900">
                      {slot.type === 'individual' ? '1-on-1 Training' : 'Group Training'}
                    </h3>
                    <p className="text-sm text-secondary-600">
                      {slot.type === 'group' && `Max ${slot.maxPlayers} players`}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => openModal(slot)}
                    className="p-2 text-secondary-600 hover:text-primary-600 rounded-lg hover:bg-primary-50"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(slot.id)}
                    className="p-2 text-secondary-600 hover:text-red-600 rounded-lg hover:bg-red-50"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div className="space-y-3">
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
                  <MapPin size={16} className="mr-2" />
                  <span className="text-sm">{slot.location}</span>
                </div>
              </div>

              {slot.description && (
                <p className="text-sm text-secondary-600 mt-3 p-3 bg-secondary-50 rounded-lg">
                  {slot.description}
                </p>
              )}

              <div className="flex items-center justify-between mt-4 pt-4 border-t border-secondary-200">
                <span className="text-lg font-bold text-primary-600">${slot.price}</span>
                <button
                  onClick={() => toggleAvailability(slot.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    slot.isAvailable
                      ? 'bg-green-100 text-green-700 hover:bg-green-200'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {slot.isAvailable ? 'Available' : 'Unavailable'}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-secondary-900 mb-4">
              {editingSlot ? 'Edit Time Slot' : 'Create New Time Slot'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Date
                </label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="input-field"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Start Time
                  </label>
                  <input
                    type="time"
                    required
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    End Time
                  </label>
                  <input
                    type="time"
                    required
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    className="input-field"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Session Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    type: e.target.value as 'individual' | 'group',
                    maxPlayers: e.target.value === 'individual' ? 1 : 6
                  })}
                  className="input-field"
                >
                  <option value="individual">1-on-1 Training</option>
                  <option value="group">Group Training</option>
                </select>
              </div>

              {formData.type === 'group' && (
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Max Players (2-6)
                  </label>
                  <input
                    type="number"
                    min="2"
                    max="6"
                    required
                    value={formData.maxPlayers}
                    onChange={(e) => setFormData({ ...formData, maxPlayers: parseInt(e.target.value) })}
                    className="input-field"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Price ($)
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Location
                </label>
                <input
                  type="text"
                  required
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="input-field"
                  placeholder="e.g., Main Field, Indoor Court"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Description (Optional)
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input-field"
                  rows={3}
                  placeholder="Special focus, equipment needed, etc."
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
                  {editingSlot ? 'Update Slot' : 'Create Slot'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}