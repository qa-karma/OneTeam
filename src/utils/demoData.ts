import { Player, TimeSlot, Booking, Feedback, ChatMessage, ProgressMetric, ProgressGoal, SessionProgress } from '@/types'
import { 
  playersStorage, 
  slotsStorage, 
  bookingsStorage, 
  feedbackStorage, 
  messagesStorage,
  progressMetricsStorage,
  progressGoalsStorage,
  sessionProgressStorage,
  generateId 
} from './localStorage'

export const initializeDemoData = () => {
  // Only initialize if no data exists
  if (playersStorage.get().length > 0) return

  // Demo Players
  const demoPlayers: Player[] = [
    {
      id: 'player_1',
      name: 'Emma Rodriguez',
      age: 12,
      position: 'Midfielder',
      parentName: 'Maria Rodriguez',
      parentEmail: 'maria.rodriguez@email.com',
      parentPhone: '+1 (555) 234-5678',
      skillLevel: 'Intermediate',
      notes: 'Very dedicated player, excellent ball control. Working on shooting accuracy.',
      avatar: '⚡'
    },
    {
      id: 'player_2',
      name: 'Jackson Chen',
      age: 10,
      position: 'Forward',
      parentName: 'David Chen',
      parentEmail: 'david.chen@email.com',
      parentPhone: '+1 (555) 345-6789',
      skillLevel: 'Beginner',
      notes: 'Fast learner, great enthusiasm. Focus on basic technique and positioning.',
      avatar: '🎯'
    },
    {
      id: 'player_3',
      name: 'Sophie Williams',
      age: 14,
      position: 'Defender',
      parentName: 'Jennifer Williams',
      parentEmail: 'jen.williams@email.com',
      parentPhone: '+1 (555) 456-7890',
      skillLevel: 'Advanced',
      notes: 'Strong defensive player, natural leader. Working on distribution and communication.',
      avatar: '🛡️'
    },
    {
      id: 'player_4',
      name: 'Marcus Thompson',
      age: 11,
      position: 'Goalkeeper',
      parentName: 'Robert Thompson',
      parentEmail: 'rob.thompson@email.com',
      parentPhone: '+1 (555) 567-8901',
      skillLevel: 'Intermediate',
      notes: 'Great reflexes and hand-eye coordination. Working on footwork and distribution.',
      avatar: '🥅'
    },
    {
      id: 'player_5',
      name: 'Ava Martinez',
      age: 13,
      position: 'Striker',
      parentName: 'Carmen Martinez',
      parentEmail: 'carmen.martinez@email.com',
      parentPhone: '+1 (555) 678-9012',
      skillLevel: 'Advanced',
      notes: 'Natural goal scorer with good pace. Working on creating space and link-up play.',
      avatar: '⚽'
    }
  ]

  // Demo Time Slots
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  const dayAfter = new Date(today)
  dayAfter.setDate(dayAfter.getDate() + 2)
  
  const demoSlots: TimeSlot[] = [
    // Tomorrow's slots
    {
      id: 'slot_1',
      date: tomorrow.toISOString().split('T')[0],
      startTime: '16:00',
      endTime: '17:00',
      type: 'individual',
      maxPlayers: 1,
      isAvailable: true,
      price: 75,
      location: 'Main Field A',
      description: '1-on-1 technical skills session'
    },
    {
      id: 'slot_2',
      date: tomorrow.toISOString().split('T')[0],
      startTime: '17:30',
      endTime: '18:30',
      type: 'group',
      maxPlayers: 4,
      isAvailable: true,
      price: 45,
      location: 'Main Field A',
      description: 'Small group tactical training'
    },
    // Day after tomorrow's slots
    {
      id: 'slot_3',
      date: dayAfter.toISOString().split('T')[0],
      startTime: '15:00',
      endTime: '16:00',
      type: 'individual',
      maxPlayers: 1,
      isAvailable: false,
      price: 75,
      location: 'Indoor Court',
      description: 'Goalkeeper specific training'
    },
    {
      id: 'slot_4',
      date: dayAfter.toISOString().split('T')[0],
      startTime: '18:00',
      endTime: '19:00',
      type: 'group',
      maxPlayers: 6,
      isAvailable: true,
      price: 40,
      location: 'Main Field B',
      description: 'Group fitness and conditioning'
    },
    // More slots throughout the month
    ...Array.from({ length: 12 }, (_, i) => {
      const futureDate = new Date(today)
      futureDate.setDate(today.getDate() + i + 3)
      const isWeekend = futureDate.getDay() === 0 || futureDate.getDay() === 6
      
      return {
        id: `slot_${i + 5}`,
        date: futureDate.toISOString().split('T')[0],
        startTime: isWeekend ? '09:00' : '16:00',
        endTime: isWeekend ? '10:00' : '17:00',
        type: Math.random() > 0.5 ? 'individual' : 'group' as 'individual' | 'group',
        maxPlayers: Math.random() > 0.5 ? 1 : Math.floor(Math.random() * 4) + 3,
        isAvailable: Math.random() > 0.3,
        price: Math.random() > 0.5 ? 75 : 45,
        location: ['Main Field A', 'Main Field B', 'Indoor Court'][Math.floor(Math.random() * 3)],
        description: [
          'Technical skills training',
          'Tactical development',
          'Fitness and conditioning',
          'Match preparation',
          'Individual coaching session'
        ][Math.floor(Math.random() * 5)]
      }
    })
  ]

  // Demo Bookings
  const demoBookings: Booking[] = [
    {
      id: 'booking_1',
      slotId: 'slot_3',
      playerIds: ['player_4'],
      parentName: 'Robert Thompson',
      parentEmail: 'rob.thompson@email.com',
      parentPhone: '+1 (555) 567-8901',
      status: 'confirmed',
      paymentStatus: 'paid',
      totalAmount: 75,
      bookingDate: today.toISOString().split('T')[0],
      notes: 'Focus on shot stopping and reflexes'
    },
    {
      id: 'booking_2',
      slotId: 'slot_1',
      playerIds: ['player_1'],
      parentName: 'Maria Rodriguez',
      parentEmail: 'maria.rodriguez@email.com',
      parentPhone: '+1 (555) 234-5678',
      status: 'pending',
      paymentStatus: 'pending',
      totalAmount: 75,
      bookingDate: today.toISOString().split('T')[0],
      notes: 'Work on shooting technique and accuracy'
    }
  ]

  // Demo Feedback
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  const demoFeedback: Feedback[] = [
    {
      id: 'feedback_1',
      playerId: 'player_5',
      bookingId: 'booking_completed_1',
      coachName: 'Coach Martinez',
      rating: 5,
      strengths: ['Ball control', 'Shooting technique', 'Game awareness'],
      areasForImprovement: ['Weak foot', 'Defensive tracking'],
      sessionGoals: ['Improve technical skills', 'Build confidence'],
      nextSessionFocus: 'Continue working on weak foot shooting and practice tracking back on defense',
      parentNotes: 'Ava had an excellent session today. Her shooting has improved dramatically and she\'s showing great confidence with the ball. Keep encouraging her to use her left foot at home.',
      createdAt: yesterday.toISOString()
    }
  ]

  // Demo Chat Messages
  const demoMessages: ChatMessage[] = [
    {
      id: 'msg_1',
      bookingId: 'booking_1',
      senderId: 'coach_1',
      senderName: 'Coach Martinez',
      senderType: 'coach',
      message: 'Hi Robert! Looking forward to Marcus\'s goalkeeper session tomorrow. I\'ve prepared some specific drills for shot stopping.',
      timestamp: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
      isRead: true
    },
    {
      id: 'msg_2',
      bookingId: 'booking_1',
      senderId: 'parent_booking_1',
      senderName: 'Robert Thompson',
      senderType: 'parent',
      message: 'Thanks Coach! Marcus is really excited. He\'s been practicing his diving at home.',
      timestamp: new Date(Date.now() - 1800000).toISOString(), // 30 minutes ago
      isRead: true
    },
    {
      id: 'msg_3',
      bookingId: 'booking_1',
      senderId: 'coach_1',
      senderName: 'Coach Martinez',
      senderType: 'coach',
      message: 'That\'s great to hear! We\'ll work on positioning and angle play as well. See you tomorrow at 3 PM.',
      timestamp: new Date(Date.now() - 900000).toISOString(), // 15 minutes ago
      isRead: true
    }
  ]

  // Save demo data
  playersStorage.save(demoPlayers)
  slotsStorage.save(demoSlots)
  bookingsStorage.save(demoBookings)
  feedbackStorage.save(demoFeedback)
  messagesStorage.save(demoMessages)

  // Initialize progress tracking data
  initializeProgressTrackingData()

  console.log('Demo data initialized!')
}

// Initialize progress tracking demo data
export const initializeProgressTrackingData = () => {
  // Only initialize if no data exists
  if (progressMetricsStorage.get().length > 0) return

  // Demo Progress Metrics
  const demoProgressMetrics: ProgressMetric[] = [
    {
      id: 'metric_1',
      name: 'Ball Control',
      category: 'Technical',
      unit: 'seconds',
      minValue: 0,
      maxValue: 60,
      description: 'Time player can keep ball in air without touching ground'
    },
    {
      id: 'metric_2',
      name: 'Shooting Accuracy',
      category: 'Technical',
      unit: 'percentage',
      minValue: 0,
      maxValue: 100,
      description: 'Percentage of shots on target from 10 attempts'
    },
    {
      id: 'metric_3',
      name: 'Passing Accuracy',
      category: 'Technical',
      unit: 'percentage',
      minValue: 0,
      maxValue: 100,
      description: 'Percentage of successful passes in 20 attempts'
    },
    {
      id: 'metric_4',
      name: 'Sprint Speed',
      category: 'Physical',
      unit: 'seconds',
      minValue: 0,
      maxValue: 10,
      description: 'Time to complete 30-meter sprint'
    },
    {
      id: 'metric_5',
      name: 'Tactical Awareness',
      category: 'Tactical',
      unit: 'score',
      minValue: 1,
      maxValue: 5,
      description: 'Coach rating of player\'s game understanding'
    },
    {
      id: 'metric_6',
      name: 'Confidence Level',
      category: 'Mental',
      unit: 'score',
      minValue: 1,
      maxValue: 5,
      description: 'Player self-assessment of confidence during play'
    }
  ]

  // Demo Progress Goals
  const demoProgressGoals: ProgressGoal[] = [
    {
      id: 'goal_1',
      playerId: 'player_1',
      metricId: 'metric_1',
      targetValue: 45,
      currentValue: 30,
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days
      status: 'active',
      notes: 'Emma is working on improving her ball control for better midfield play',
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 7 days ago
    },
    {
      id: 'goal_2',
      playerId: 'player_3',
      metricId: 'metric_5',
      targetValue: 5,
      currentValue: 4,
      deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 14 days
      status: 'active',
      notes: 'Sophie shows great leadership potential, working on tactical communication',
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 3 days ago
    },
    {
      id: 'goal_3',
      playerId: 'player_5',
      metricId: 'metric_2',
      targetValue: 80,
      currentValue: 85,
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days
      status: 'achieved',
      notes: 'Ava exceeded her shooting accuracy goal!',
      createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 14 days ago
    }
  ]

  // Demo Session Progress
  const demoSessionProgress: SessionProgress[] = [
    {
      id: 'progress_1',
      playerId: 'player_1',
      bookingId: 'booking_completed_1',
      date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days ago
      metrics: [
        { metricId: 'metric_1', value: 30, notes: 'Improved from 25 seconds last week' },
        { metricId: 'metric_3', value: 75, notes: 'Good passing under pressure' },
        { metricId: 'metric_6', value: 4, notes: 'More confident with ball at feet' }
      ],
      overallRating: 4,
      coachNotes: 'Emma had a great session today. Her ball control is improving steadily and she\'s showing more confidence in tight spaces. Focus next week on maintaining possession under pressure.',
      playerSelfAssessment: 4,
      nextSessionFocus: ['Maintaining possession under pressure', 'Quick decision making', 'First touch control'],
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'progress_2',
      playerId: 'player_3',
      bookingId: 'booking_completed_2',
      date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 5 days ago
      metrics: [
        { metricId: 'metric_5', value: 4, notes: 'Excellent tactical positioning' },
        { metricId: 'metric_4', value: 4.2, notes: 'Good recovery speed' },
        { metricId: 'metric_6', value: 5, notes: 'Very confident and vocal on field' }
      ],
      overallRating: 5,
      coachNotes: 'Sophie was outstanding today. Her tactical awareness and communication skills are developing rapidly. She\'s becoming a natural leader on the field.',
      playerSelfAssessment: 5,
      nextSessionFocus: ['Advanced tactical scenarios', 'Leadership development', 'Set piece organization'],
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
    }
  ]

  // Save progress tracking demo data
  progressMetricsStorage.save(demoProgressMetrics)
  progressGoalsStorage.save(demoProgressGoals)
  sessionProgressStorage.save(demoSessionProgress)

  console.log('Progress tracking demo data initialized!')
}

// Add a completed booking for feedback demo
export const addCompletedBookingForFeedback = () => {
  const existingBookings = bookingsStorage.get()
  
  const completedBooking: Booking = {
    id: 'booking_completed_1',
    slotId: 'slot_completed_1',
    playerIds: ['player_5'],
    parentName: 'Carmen Martinez',
    parentEmail: 'carmen.martinez@email.com',
    parentPhone: '+1 (555) 678-9012',
    status: 'completed',
    paymentStatus: 'paid',
    totalAmount: 75,
    bookingDate: new Date(Date.now() - 86400000).toISOString().split('T')[0], // Yesterday
    notes: 'Advanced striker training session'
  }

  if (!existingBookings.find(b => b.id === completedBooking.id)) {
    bookingsStorage.add(completedBooking)
  }
}