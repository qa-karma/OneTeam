import { Player, TimeSlot, Booking, Feedback, ChatMessage, Coach } from '@/types'

const STORAGE_KEYS = {
  PLAYERS: 'oneteam_players',
  SLOTS: 'oneteam_slots',
  BOOKINGS: 'oneteam_bookings',
  FEEDBACK: 'oneteam_feedback',
  MESSAGES: 'oneteam_messages',
  COACH: 'oneteam_coach',
} as const

// Generic storage functions
const getFromStorage = <T>(key: string, defaultValue: T): T => {
  if (typeof window === 'undefined') return defaultValue
  
  try {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : defaultValue
  } catch (error) {
    console.error(`Error reading from localStorage for key ${key}:`, error)
    return defaultValue
  }
}

const saveToStorage = <T>(key: string, value: T): void => {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (error) {
    console.error(`Error saving to localStorage for key ${key}:`, error)
  }
}

// Specific storage functions
export const playersStorage = {
  get: (): Player[] => getFromStorage(STORAGE_KEYS.PLAYERS, []),
  save: (players: Player[]) => saveToStorage(STORAGE_KEYS.PLAYERS, players),
  add: (player: Player) => {
    const players = playersStorage.get()
    const updated = [...players, player]
    playersStorage.save(updated)
    return updated
  },
  update: (id: string, updates: Partial<Player>) => {
    const players = playersStorage.get()
    const updated = players.map(p => p.id === id ? { ...p, ...updates } : p)
    playersStorage.save(updated)
    return updated
  },
  delete: (id: string) => {
    const players = playersStorage.get()
    const updated = players.filter(p => p.id !== id)
    playersStorage.save(updated)
    return updated
  }
}

export const slotsStorage = {
  get: (): TimeSlot[] => getFromStorage(STORAGE_KEYS.SLOTS, []),
  save: (slots: TimeSlot[]) => saveToStorage(STORAGE_KEYS.SLOTS, slots),
  add: (slot: TimeSlot) => {
    const slots = slotsStorage.get()
    const updated = [...slots, slot]
    slotsStorage.save(updated)
    return updated
  },
  update: (id: string, updates: Partial<TimeSlot>) => {
    const slots = slotsStorage.get()
    const updated = slots.map(s => s.id === id ? { ...s, ...updates } : s)
    slotsStorage.save(updated)
    return updated
  },
  delete: (id: string) => {
    const slots = slotsStorage.get()
    const updated = slots.filter(s => s.id !== id)
    slotsStorage.save(updated)
    return updated
  }
}

export const bookingsStorage = {
  get: (): Booking[] => getFromStorage(STORAGE_KEYS.BOOKINGS, []),
  save: (bookings: Booking[]) => saveToStorage(STORAGE_KEYS.BOOKINGS, bookings),
  add: (booking: Booking) => {
    const bookings = bookingsStorage.get()
    const updated = [...bookings, booking]
    bookingsStorage.save(updated)
    return updated
  },
  update: (id: string, updates: Partial<Booking>) => {
    const bookings = bookingsStorage.get()
    const updated = bookings.map(b => b.id === id ? { ...b, ...updates } : b)
    bookingsStorage.save(updated)
    return updated
  },
  delete: (id: string) => {
    const bookings = bookingsStorage.get()
    const updated = bookings.filter(b => b.id !== id)
    bookingsStorage.save(updated)
    return updated
  }
}

export const feedbackStorage = {
  get: (): Feedback[] => getFromStorage(STORAGE_KEYS.FEEDBACK, []),
  save: (feedback: Feedback[]) => saveToStorage(STORAGE_KEYS.FEEDBACK, feedback),
  add: (item: Feedback) => {
    const feedback = feedbackStorage.get()
    const updated = [...feedback, item]
    feedbackStorage.save(updated)
    return updated
  },
  update: (id: string, updates: Partial<Feedback>) => {
    const feedback = feedbackStorage.get()
    const updated = feedback.map(f => f.id === id ? { ...f, ...updates } : f)
    feedbackStorage.save(updated)
    return updated
  }
}

export const messagesStorage = {
  get: (): ChatMessage[] => getFromStorage(STORAGE_KEYS.MESSAGES, []),
  save: (messages: ChatMessage[]) => saveToStorage(STORAGE_KEYS.MESSAGES, messages),
  add: (message: ChatMessage) => {
    const messages = messagesStorage.get()
    const updated = [...messages, message]
    messagesStorage.save(updated)
    return updated
  },
  markAsRead: (messageId: string) => {
    const messages = messagesStorage.get()
    const updated = messages.map(m => m.id === messageId ? { ...m, isRead: true } : m)
    messagesStorage.save(updated)
    return updated
  }
}

export const coachStorage = {
  get: (): Coach | null => getFromStorage(STORAGE_KEYS.COACH, null),
  save: (coach: Coach) => saveToStorage(STORAGE_KEYS.COACH, coach),
}

// Utility functions
export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

export const formatDate = (date: Date | string): string => {
  const d = new Date(date)
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

export const formatTime = (time: string): string => {
  const [hours, minutes] = time.split(':')
  const hour = parseInt(hours)
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const displayHour = hour % 12 || 12
  return `${displayHour}:${minutes} ${ampm}`
}