'use client'

import { useState, useEffect } from 'react'
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Calendar,
  User,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react'
import { 
  playersStorage, 
  bookingsStorage, 
  slotsStorage,
  attendanceStorage,
  generateId,
  formatDate,
  formatTime 
} from '@/utils/localStorage'
import { Player, Booking, TimeSlot, SessionAttendance } from '@/types'

export default function AttendanceSection() {
  const [players, setPlayers] = useState<Player[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [slots, setSlots] = useState<TimeSlot[]>([])
  const [attendance, setAttendance] = useState<SessionAttendance[]>([])
  const [selectedBooking, setSelectedBooking] = useState<string>('')
  const [showMarkModal, setShowMarkModal] = useState(false)
  const [currentPlayer, setCurrentPlayer] = useState<{ playerId: string; playerName: string } | null>(null)
  const [attendanceForm, setAttendanceForm] = useState({
    status: 'present' as 'present' | 'absent' | 'late',
    arrivalTime: '',
    minutesLate: 0,
    reason: '',
    notes: ''
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = () => {
    setPlayers(playersStorage.get())
    setBookings(bookingsStorage.get())
    setSlots(slotsStorage.get())
    setAttendance(attendanceStorage.get())
  }

  // Get upcoming and recent bookings
  const today = new Date().toISOString().split('T')[0]
  const relevantBookings = bookings.filter(booking => {
    const slot = slots.find(s => s.id === booking.slotId)
    if (!slot) return false
    const bookingDate = new Date(slot.date)
    const todayDate = new Date(today)
    const daysDiff = Math.floor((bookingDate.getTime() - todayDate.getTime()) / (1000 * 60 * 60 * 24))
    return daysDiff >= -7 && daysDiff <= 7 && booking.status === 'confirmed'
  })

  const getBookingSlot = (bookingId: string): TimeSlot | undefined => {
    const booking = bookings.find(b => b.id === bookingId)
    return booking ? slots.find(s => s.id === booking.slotId) : undefined
  }

  const getBookingPlayers = (bookingId: string): Player[] => {
    const booking = bookings.find(b => b.id === bookingId)
    if (!booking) return []
    return players.filter(p => booking.playerIds.includes(p.id))
  }

  const getPlayerAttendance = (bookingId: string, playerId: string): SessionAttendance | undefined => {
    return attendance.find(a => a.bookingId === bookingId && a.playerId === playerId)
  }

  const calculateAttendanceRate = (playerId: string): number => {
    const playerAttendance = attendanceStorage.getByPlayer(playerId)
    if (playerAttendance.length === 0) return 100
    const presentCount = playerAttendance.filter(a => a.status === 'present').length
    return Math.round((presentCount / playerAttendance.length) * 100)
  }

  const calculateAttendanceStats = () => {
    const totalRecords = attendance.length
    if (totalRecords === 0) {
      return {
        presentCount: 0,
        absentCount: 0,
        lateCount: 0,
        presentRate: 0,
        absentRate: 0,
        lateRate: 0,
        avgMinutesLate: 0
      }
    }

    const presentCount = attendance.filter(a => a.status === 'present').length
    const absentCount = attendance.filter(a => a.status === 'absent').length
    const lateCount = attendance.filter(a => a.status === 'late').length
    const lateRecords = attendance.filter(a => a.status === 'late' && a.minutesLate)
    const avgMinutesLate = lateRecords.length > 0 
      ? Math.round(lateRecords.reduce((sum, a) => sum + (a.minutesLate || 0), 0) / lateRecords.length)
      : 0

    return {
      presentCount,
      absentCount,
      lateCount,
      presentRate: Math.round((presentCount / totalRecords) * 100),
      absentRate: Math.round((absentCount / totalRecords) * 100),
      lateRate: Math.round((lateCount / totalRecords) * 100),
      avgMinutesLate
    }
  }

  const handleMarkAttendance = (bookingId: string, playerId: string, playerName: string) => {
    const existing = getPlayerAttendance(bookingId, playerId)
    if (existing) {
      setAttendanceForm({
        status: existing.status,
        arrivalTime: existing.arrivalTime || '',
        minutesLate: existing.minutesLate || 0,
        reason: existing.reason || '',
        notes: existing.notes || ''
      })
    } else {
      setAttendanceForm({
        status: 'present',
        arrivalTime: '',
        minutesLate: 0,
        reason: '',
        notes: ''
      })
    }
    setCurrentPlayer({ playerId, playerName })
    setSelectedBooking(bookingId)
    setShowMarkModal(true)
  }

  const saveAttendance = () => {
    if (!currentPlayer) return

    const existing = getPlayerAttendance(selectedBooking, currentPlayer.playerId)
    const now = new Date().toISOString()

    const attendanceRecord: SessionAttendance = {
      id: existing?.id || generateId(),
      bookingId: selectedBooking,
      playerId: currentPlayer.playerId,
      status: attendanceForm.status,
      arrivalTime: attendanceForm.status === 'late' ? attendanceForm.arrivalTime : undefined,
      minutesLate: attendanceForm.status === 'late' ? attendanceForm.minutesLate : undefined,
      reason: attendanceForm.status === 'absent' ? attendanceForm.reason : undefined,
      markedBy: 'Coach John', // In a real app, get from auth
      markedAt: now,
      notes: attendanceForm.notes
    }

    if (existing) {
      attendanceStorage.update(existing.id, attendanceRecord)
    } else {
      attendanceStorage.add(attendanceRecord)
    }

    loadData()
    setShowMarkModal(false)
    setCurrentPlayer(null)
  }

  const stats = calculateAttendanceStats()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-secondary-900">Session Attendance</h1>
        <p className="text-secondary-600 mt-2">Track player attendance for training sessions</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-secondary-600">Present Rate</p>
              <p className="text-2xl font-bold text-green-600">{stats.presentRate}%</p>
              <p className="text-xs text-secondary-500 mt-1">{stats.presentCount} sessions</p>
            </div>
            <CheckCircle className="text-green-600" size={32} />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-secondary-600">Late Rate</p>
              <p className="text-2xl font-bold text-orange-600">{stats.lateRate}%</p>
              <p className="text-xs text-secondary-500 mt-1">{stats.lateCount} sessions</p>
            </div>
            <Clock className="text-orange-600" size={32} />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-secondary-600">Absent Rate</p>
              <p className="text-2xl font-bold text-red-600">{stats.absentRate}%</p>
              <p className="text-xs text-secondary-500 mt-1">{stats.absentCount} sessions</p>
            </div>
            <XCircle className="text-red-600" size={32} />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-secondary-600">Avg Late Time</p>
              <p className="text-2xl font-bold text-secondary-900">{stats.avgMinutesLate}min</p>
              <p className="text-xs text-secondary-500 mt-1">When late</p>
            </div>
            <AlertTriangle className="text-orange-600" size={32} />
          </div>
        </div>
      </div>

      {/* Sessions List */}
      <div className="card">
        <h2 className="text-xl font-semibold text-secondary-900 mb-4">Recent & Upcoming Sessions</h2>
        
        {relevantBookings.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="mx-auto text-secondary-400 mb-3" size={48} />
            <p className="text-secondary-600">No sessions to track</p>
          </div>
        ) : (
          <div className="space-y-4">
            {relevantBookings.map(booking => {
              const slot = getBookingSlot(booking.id)
              const bookingPlayers = getBookingPlayers(booking.id)
              
              if (!slot) return null

              const isPast = slot.date < today
              const isToday = slot.date === today

              return (
                <div key={booking.id} className={`border rounded-lg p-4 ${
                  isToday ? 'border-primary-500 bg-primary-50' : 'border-secondary-200'
                }`}>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-secondary-900">
                          {formatDate(slot.date)} - {formatTime(slot.startTime)}
                        </h3>
                        {isToday && (
                          <span className="px-2 py-1 text-xs font-medium bg-primary-600 text-white rounded-full">
                            Today
                          </span>
                        )}
                        {isPast && (
                          <span className="px-2 py-1 text-xs font-medium bg-secondary-400 text-white rounded-full">
                            Past
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-secondary-600 mt-1">
                        {slot.type === 'individual' ? '1-on-1 Training' : `Group Training`} • {slot.location}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {bookingPlayers.map(player => {
                      const playerAttendance = getPlayerAttendance(booking.id, player.id)
                      const attendanceRate = calculateAttendanceRate(player.id)

                      return (
                        <div key={player.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-secondary-200">
                          <div className="flex items-center gap-3">
                            <User className="text-secondary-400" size={20} />
                            <div>
                              <p className="font-medium text-secondary-900">{player.name}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <p className="text-xs text-secondary-600">
                                  Attendance: {attendanceRate}%
                                </p>
                                {attendanceRate >= 90 && <TrendingUp size={14} className="text-green-600" />}
                                {attendanceRate < 70 && <TrendingDown size={14} className="text-red-600" />}
                                {attendanceRate >= 70 && attendanceRate < 90 && <Minus size={14} className="text-orange-600" />}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            {playerAttendance ? (
                              <div className="flex items-center gap-2">
                                {playerAttendance.status === 'present' && (
                                  <span className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                                    <CheckCircle size={16} />
                                    Present
                                  </span>
                                )}
                                {playerAttendance.status === 'late' && (
                                  <span className="flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium">
                                    <Clock size={16} />
                                    Late ({playerAttendance.minutesLate}min)
                                  </span>
                                )}
                                {playerAttendance.status === 'absent' && (
                                  <span className="flex items-center gap-1 px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
                                    <XCircle size={16} />
                                    Absent
                                  </span>
                                )}
                                <button
                                  onClick={() => handleMarkAttendance(booking.id, player.id, player.name)}
                                  className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                                >
                                  Edit
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => handleMarkAttendance(booking.id, player.id, player.name)}
                                className="btn-primary text-sm"
                              >
                                Mark Attendance
                              </button>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Mark Attendance Modal */}
      {showMarkModal && currentPlayer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-semibold text-secondary-900 mb-4">
              Mark Attendance: {currentPlayer.playerName}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Status
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setAttendanceForm({ ...attendanceForm, status: 'present' })}
                    className={`p-3 rounded-lg border-2 flex flex-col items-center gap-1 transition ${
                      attendanceForm.status === 'present'
                        ? 'border-green-500 bg-green-50'
                        : 'border-secondary-200 hover:border-secondary-300'
                    }`}
                  >
                    <CheckCircle className="text-green-600" size={24} />
                    <span className="text-sm font-medium">Present</span>
                  </button>
                  <button
                    onClick={() => setAttendanceForm({ ...attendanceForm, status: 'late' })}
                    className={`p-3 rounded-lg border-2 flex flex-col items-center gap-1 transition ${
                      attendanceForm.status === 'late'
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-secondary-200 hover:border-secondary-300'
                    }`}
                  >
                    <Clock className="text-orange-600" size={24} />
                    <span className="text-sm font-medium">Late</span>
                  </button>
                  <button
                    onClick={() => setAttendanceForm({ ...attendanceForm, status: 'absent' })}
                    className={`p-3 rounded-lg border-2 flex flex-col items-center gap-1 transition ${
                      attendanceForm.status === 'absent'
                        ? 'border-red-500 bg-red-50'
                        : 'border-secondary-200 hover:border-secondary-300'
                    }`}
                  >
                    <XCircle className="text-red-600" size={24} />
                    <span className="text-sm font-medium">Absent</span>
                  </button>
                </div>
              </div>

              {attendanceForm.status === 'late' && (
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Minutes Late
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={attendanceForm.minutesLate}
                    onChange={(e) => setAttendanceForm({ ...attendanceForm, minutesLate: parseInt(e.target.value) || 0 })}
                    className="input-primary w-full"
                    placeholder="e.g., 15"
                  />
                </div>
              )}

              {attendanceForm.status === 'absent' && (
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Reason for Absence
                  </label>
                  <input
                    type="text"
                    value={attendanceForm.reason}
                    onChange={(e) => setAttendanceForm({ ...attendanceForm, reason: e.target.value })}
                    className="input-primary w-full"
                    placeholder="e.g., Sick, Family emergency"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  value={attendanceForm.notes}
                  onChange={(e) => setAttendanceForm({ ...attendanceForm, notes: e.target.value })}
                  className="input-primary w-full"
                  rows={3}
                  placeholder="Additional notes..."
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowMarkModal(false)
                  setCurrentPlayer(null)
                }}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                onClick={saveAttendance}
                className="btn-primary flex-1"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

