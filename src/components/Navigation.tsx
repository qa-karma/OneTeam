'use client'

import { Coach } from '@/types'
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  CalendarDays,
  BookOpen, 
  MessageSquare, 
  Star,
  Menu,
  X
} from 'lucide-react'
import { useState } from 'react'

interface NavigationProps {
  activeTab: string
  setActiveTab: (tab: string) => void
  coach: Coach | null
}

const navItems = [
  { id: 'dashboard', label: 'Your Space', icon: LayoutDashboard },
  { id: 'players', label: 'Squad', icon: Users },
  { id: 'slots', label: 'Time Slots', icon: Calendar },
  { id: 'calendar', label: 'Calendar', icon: CalendarDays },
  { id: 'bookings', label: 'Sessions', icon: BookOpen },
  { id: 'feedback', label: 'Progress', icon: Star },
  { id: 'chat', label: 'Chat', icon: MessageSquare },
]

export default function Navigation({ activeTab, setActiveTab, coach }: NavigationProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-xl shadow-lg"
      >
        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-6">
          {/* Logo & Coach Info */}
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center text-2xl">
                ⚽
              </div>
              <div>
                <h1 className="text-xl font-bold text-secondary-900">OneTeam</h1>
                <p className="text-sm text-secondary-600">Soccer Training</p>
              </div>
            </div>
            
            {coach && (
              <div className="p-4 bg-secondary-50 rounded-xl">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center text-white font-semibold">
                    {coach.avatar || coach.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium text-secondary-900">{coach.name}</p>
                    <p className="text-sm text-secondary-600">{coach.experience}+ years</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Navigation Items */}
          <nav className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = activeTab === item.id
              
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id)
                    setIsMobileMenuOpen(false)
                  }}
                  className={`
                    w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-all duration-200
                    ${isActive 
                      ? 'bg-primary-600 text-white shadow-lg' 
                      : 'text-secondary-700 hover:bg-secondary-100'
                    }
                  `}
                >
                  <Icon size={20} />
                  <span className="font-medium">{item.label}</span>
                </button>
              )
            })}
          </nav>
        </div>
      </div>

      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 z-30 bg-black bg-opacity-50"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  )
}