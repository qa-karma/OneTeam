export interface Player {
  id: string;
  name: string;
  age: number;
  position: string;
  parentName: string;
  parentEmail: string;
  parentPhone: string;
  skillLevel: 'Beginner' | 'Intermediate' | 'Advanced';
  notes?: string;
  avatar?: string;
}

export interface TimeSlot {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  type: 'individual' | 'group';
  maxPlayers: number;
  isAvailable: boolean;
  price: number;
  location: string;
  description?: string;
}

export interface Booking {
  id: string;
  slotId: string;
  playerIds: string[];
  parentName: string;
  parentEmail: string;
  parentPhone: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  paymentStatus: 'pending' | 'paid' | 'refunded';
  totalAmount: number;
  bookingDate: string;
  notes?: string;
}

export interface Feedback {
  id: string;
  playerId: string;
  bookingId: string;
  coachName: string;
  rating: number; // 1-5
  strengths: string[];
  areasForImprovement: string[];
  sessionGoals: string[];
  nextSessionFocus: string;
  parentNotes?: string;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  bookingId: string;
  senderId: string;
  senderName: string;
  senderType: 'coach' | 'parent';
  message: string;
  timestamp: string;
  isRead: boolean;
}

export interface Coach {
  id: string;
  name: string;
  email: string;
  phone: string;
  bio: string;
  specialties: string[];
  experience: number;
  avatar?: string;
}

// New interfaces for Session Progress Tracking
export interface ProgressMetric {
  id: string;
  name: string;
  category: 'Technical' | 'Tactical' | 'Physical' | 'Mental';
  unit: string;
  minValue: number;
  maxValue: number;
  description: string;
}

export interface ProgressGoal {
  id: string;
  playerId: string;
  metricId: string;
  targetValue: number;
  currentValue: number;
  deadline: string;
  status: 'active' | 'achieved' | 'missed';
  notes?: string;
  createdAt: string;
}

export interface SessionProgress {
  id: string;
  playerId: string;
  bookingId: string;
  date: string;
  metrics: {
    metricId: string;
    value: number;
    notes?: string;
  }[];
  overallRating: number; // 1-5
  coachNotes: string;
  playerSelfAssessment?: number; // 1-5
  nextSessionFocus: string[];
  createdAt: string;
}