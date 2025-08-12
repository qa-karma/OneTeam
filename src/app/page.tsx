'use client'

import { useState, useEffect } from 'react'
import Navigation from '@/components/Navigation'
import Dashboard from '@/components/Dashboard'
import PlayersSection from '@/components/PlayersSection'
import SlotsSection from '@/components/SlotsSection'
import CalendarView from '@/components/CalendarView'
import BookingsSection from '@/components/BookingsSection'
import FeedbackSection from '@/components/FeedbackSection'
import ChatSection from '@/components/ChatSection'
import { coachStorage } from '@/utils/localStorage'
import { initializeDemoData, addCompletedBookingForFeedback } from '@/utils/demoData'
import { Coach } from '@/types'

type ActiveTab = 'dashboard' | 'players' | 'slots' | 'calendar' | 'bookings' | 'feedback' | 'chat'

export default function Home() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard')
  const [coach, setCoach] = useState<Coach | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Initialize demo data
    initializeDemoData()
    addCompletedBookingForFeedback()
    
    // Initialize demo coach if none exists
    const existingCoach = coachStorage.get()
    if (!existingCoach) {
      const demoCoach: Coach = {
        id: 'coach_1',
        name: 'Coach Martinez',
        email: 'coach@oneteam.com',
        phone: '+1 (555) 123-4567',
        bio: 'Professional soccer coach with 10+ years of experience working with youth players.',
        specialties: ['Youth Development', 'Technical Skills', 'Tactical Awareness'],
        experience: 10,
        avatar: '⚽'
      }
      coachStorage.save(demoCoach)
      setCoach(demoCoach)
    } else {
      setCoach(existingCoach)
    }
    setIsLoading(false)
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  const renderActiveSection = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />
      case 'players':
        return <PlayersSection />
      case 'slots':
        return <SlotsSection />
      case 'calendar':
        return <CalendarView />
      case 'bookings':
        return <BookingsSection />
      case 'feedback':
        return <FeedbackSection />
      case 'chat':
        return <ChatSection />
      default:
        return <Dashboard />
    }
  }

  return (
    <div className="min-h-screen">
      <Navigation 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
        coach={coach}
      />
      <main className="lg:ml-64 p-6">
        {renderActiveSection()}
      </main>
    </div>
  )
}