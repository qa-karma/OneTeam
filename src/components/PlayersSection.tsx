'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, User, Mail, Phone, Award, Search } from 'lucide-react'
import { playersStorage, generateId } from '@/utils/localStorage'
import { Player } from '@/types'

export default function PlayersSection() {
  const [players, setPlayers] = useState<Player[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    age: 8,
    position: '',
    parentName: '',
    parentEmail: '',
    parentPhone: '',
    skillLevel: 'Beginner' as 'Beginner' | 'Intermediate' | 'Advanced',
    notes: ''
  })

  useEffect(() => {
    setPlayers(playersStorage.get())
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const newPlayer: Player = {
      id: editingPlayer?.id || generateId(),
      ...formData,
      avatar: getPlayerEmoji(formData.position)
    }

    let updatedPlayers
    if (editingPlayer) {
      updatedPlayers = playersStorage.update(editingPlayer.id, newPlayer)
    } else {
      updatedPlayers = playersStorage.add(newPlayer)
    }
    
    setPlayers(updatedPlayers)
    closeModal()
  }

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to remove this player?')) {
      const updatedPlayers = playersStorage.delete(id)
      setPlayers(updatedPlayers)
    }
  }

  const openModal = (player?: Player) => {
    if (player) {
      setEditingPlayer(player)
      setFormData({
        name: player.name,
        age: player.age,
        position: player.position,
        parentName: player.parentName,
        parentEmail: player.parentEmail,
        parentPhone: player.parentPhone,
        skillLevel: player.skillLevel,
        notes: player.notes || ''
      })
    } else {
      setEditingPlayer(null)
      setFormData({
        name: '',
        age: 8,
        position: '',
        parentName: '',
        parentEmail: '',
        parentPhone: '',
        skillLevel: 'Beginner',
        notes: ''
      })
    }
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingPlayer(null)
  }

  const getPlayerEmoji = (position: string): string => {
    const emojis: { [key: string]: string } = {
      'goalkeeper': '🥅',
      'defender': '🛡️',
      'midfielder': '⚡',
      'forward': '🎯',
      'striker': '⚽'
    }
    return emojis[position.toLowerCase()] || '👤'
  }

  const getSkillLevelColor = (level: string): string => {
    const colors: { [key: string]: string } = {
      'Beginner': 'bg-green-100 text-green-700',
      'Intermediate': 'bg-yellow-100 text-yellow-700',
      'Advanced': 'bg-red-100 text-red-700'
    }
    return colors[level] || 'bg-gray-100 text-gray-700'
  }

  const filteredPlayers = players.filter(player =>
    player.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    player.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
    player.parentName.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-secondary-900">Your Squad</h1>
          <p className="text-secondary-600 mt-2">Manage player profiles and information</p>
        </div>
        <button 
          onClick={() => openModal()}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus size={20} />
          <span>Add Player</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="bg-blue-100 text-blue-600 p-3 rounded-xl">
              <User size={24} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-secondary-600">Total Players</p>
              <p className="text-2xl font-bold text-secondary-900">{players.length}</p>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center">
            <div className="bg-green-100 text-green-600 p-3 rounded-xl">
              <Award size={24} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-secondary-600">Beginners</p>
              <p className="text-2xl font-bold text-secondary-900">
                {players.filter(p => p.skillLevel === 'Beginner').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center">
            <div className="bg-yellow-100 text-yellow-600 p-3 rounded-xl">
              <Award size={24} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-secondary-600">Intermediate</p>
              <p className="text-2xl font-bold text-secondary-900">
                {players.filter(p => p.skillLevel === 'Intermediate').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center">
            <div className="bg-red-100 text-red-600 p-3 rounded-xl">
              <Award size={24} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-secondary-600">Advanced</p>
              <p className="text-2xl font-bold text-secondary-900">
                {players.filter(p => p.skillLevel === 'Advanced').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="card">
        <div className="relative">
          <Search className="absolute left-3 top-3 text-secondary-400" size={20} />
          <input
            type="text"
            placeholder="Search players by name, position, or parent..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-10"
          />
        </div>
      </div>

      {/* Players Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPlayers.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <User className="mx-auto text-secondary-400 mb-4" size={64} />
            <h3 className="text-xl font-semibold text-secondary-900 mb-2">
              {searchTerm ? 'No players found' : 'No players yet'}
            </h3>
            <p className="text-secondary-600 mb-4">
              {searchTerm ? 'Try adjusting your search terms' : 'Add your first player to get started'}
            </p>
            {!searchTerm && (
              <button onClick={() => openModal()} className="btn-primary">
                Add First Player
              </button>
            )}
          </div>
        ) : (
          filteredPlayers.map(player => (
            <div key={player.id} className="card hover:shadow-xl transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center text-2xl">
                    {player.avatar}
                  </div>
                  <div>
                    <h3 className="font-semibold text-secondary-900">{player.name}</h3>
                    <p className="text-sm text-secondary-600">{player.age} years old</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => openModal(player)}
                    className="p-2 text-secondary-600 hover:text-primary-600 rounded-lg hover:bg-primary-50"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(player.id)}
                    className="p-2 text-secondary-600 hover:text-red-600 rounded-lg hover:bg-red-50"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-secondary-600">Position</span>
                  <span className="text-sm font-medium text-secondary-900">
                    {player.position || 'Not specified'}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-secondary-600">Skill Level</span>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getSkillLevelColor(player.skillLevel)}`}>
                    {player.skillLevel}
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-secondary-200">
                <p className="text-sm font-medium text-secondary-900 mb-2">Parent Contact</p>
                <div className="space-y-2">
                  <div className="flex items-center text-secondary-600">
                    <User size={14} className="mr-2" />
                    <span className="text-sm">{player.parentName}</span>
                  </div>
                  <div className="flex items-center text-secondary-600">
                    <Mail size={14} className="mr-2" />
                    <span className="text-sm">{player.parentEmail}</span>
                  </div>
                  <div className="flex items-center text-secondary-600">
                    <Phone size={14} className="mr-2" />
                    <span className="text-sm">{player.parentPhone}</span>
                  </div>
                </div>
              </div>

              {player.notes && (
                <div className="mt-3 p-3 bg-secondary-50 rounded-lg">
                  <p className="text-sm text-secondary-600">{player.notes}</p>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-secondary-900 mb-4">
              {editingPlayer ? 'Edit Player' : 'Add New Player'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Player Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input-field"
                  placeholder="Enter player's full name"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Age
                  </label>
                  <input
                    type="number"
                    min="4"
                    max="18"
                    required
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) })}
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Position
                  </label>
                  <select
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    className="input-field"
                  >
                    <option value="">Select position</option>
                    <option value="Goalkeeper">Goalkeeper</option>
                    <option value="Defender">Defender</option>
                    <option value="Midfielder">Midfielder</option>
                    <option value="Forward">Forward</option>
                    <option value="Striker">Striker</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Skill Level
                </label>
                <select
                  value={formData.skillLevel}
                  onChange={(e) => setFormData({ ...formData, skillLevel: e.target.value as any })}
                  className="input-field"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>

              <div className="border-t border-secondary-200 pt-4">
                <h3 className="font-medium text-secondary-900 mb-3">Parent/Guardian Information</h3>
                
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
                    placeholder="Full name"
                  />
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.parentEmail}
                    onChange={(e) => setFormData({ ...formData, parentEmail: e.target.value })}
                    className="input-field"
                    placeholder="parent@email.com"
                  />
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.parentPhone}
                    onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })}
                    className="input-field"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
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
                  placeholder="Special considerations, goals, medical info, etc."
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
                  {editingPlayer ? 'Update Player' : 'Add Player'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}