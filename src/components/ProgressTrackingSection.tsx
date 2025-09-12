'use client'

import { useState, useEffect } from 'react'
import { 
  TrendingUp, 
  Target, 
  BarChart3, 
  Plus, 
  Edit, 
  Trash2, 
  CheckCircle, 
  Clock,
  AlertCircle,
  Star,
  Users,
  Trophy,
  TrendingDown,
  Minus
} from 'lucide-react'
import { 
  playersStorage, 
  progressMetricsStorage, 
  progressGoalsStorage, 
  sessionProgressStorage,
  generateId,
  formatDate 
} from '@/utils/localStorage'
import { 
  Player, 
  ProgressMetric, 
  ProgressGoal, 
  SessionProgress 
} from '@/types'

export default function ProgressTrackingSection() {
  const [players, setPlayers] = useState<Player[]>([])
  const [metrics, setMetrics] = useState<ProgressMetric[]>([])
  const [goals, setGoals] = useState<ProgressGoal[]>([])
  const [progress, setProgress] = useState<SessionProgress[]>([])
  const [selectedPlayer, setSelectedPlayer] = useState<string>('')

  useEffect(() => {
    setPlayers(playersStorage.get())
    setMetrics(progressMetricsStorage.get())
    setGoals(progressGoalsStorage.get())
    setProgress(sessionProgressStorage.get())
    if (players.length > 0 && !selectedPlayer) {
      setSelectedPlayer(players[0].id)
    }
  }, [players.length, selectedPlayer])

  const getPlayerGoals = (playerId: string) => goals.filter(g => g.playerId === playerId)
  const getPlayerProgress = (playerId: string) => progress.filter(p => p.playerId === playerId)
  const getMetricName = (metricId: string) => metrics.find(m => m.id === metricId)?.name || 'Unknown'

  const getProgressStats = (playerId: string) => {
    const playerGoals = getPlayerGoals(playerId)
    const playerProgress = getPlayerProgress(playerId)
    
    // Calculate trend for overall ratings
    let trend = 'stable'
    if (playerProgress.length >= 3) {
      const recentRatings = playerProgress.slice(-3).map(p => p.overallRating)
      const olderRatings = playerProgress.slice(-6, -3).map(p => p.overallRating)
      
      if (olderRatings.length >= 3) {
        const recentAvg = recentRatings.reduce((sum, r) => sum + r, 0) / recentRatings.length
        const olderAvg = olderRatings.reduce((sum, r) => sum + r, 0) / olderRatings.length
        
        if (recentAvg > olderAvg + 0.2) trend = 'improving'
        else if (recentAvg < olderAvg - 0.2) trend = 'declining'
      }
    }
    
    return {
      totalGoals: playerGoals.length,
      achievedGoals: playerGoals.filter(g => g.status === 'achieved').length,
      activeGoals: playerGoals.filter(g => g.status === 'active').length,
      totalSessions: playerProgress.length,
      averageRating: playerProgress.length > 0 
        ? (playerProgress.reduce((sum, p) => sum + p.overallRating, 0) / playerProgress.length).toFixed(1)
        : 'N/A',
      trend
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-secondary-900">Progress Tracking</h1>
        <p className="text-secondary-600 mt-2">Monitor player development and track progress towards goals</p>
      </div>

      {/* Player Selection */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-secondary-900">Select Player</h2>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {players.map(player => (
            <button
              key={player.id}
              onClick={() => setSelectedPlayer(player.id)}
              className={`p-3 rounded-lg border-2 transition-all ${
                selectedPlayer === player.id
                  ? 'border-primary-500 bg-primary-50 text-primary-700'
                  : 'border-secondary-200 hover:border-secondary-300'
              }`}
            >
              <div className="text-2xl mb-2">{player.avatar}</div>
              <div className="text-sm font-medium">{player.name}</div>
              <div className="text-xs text-secondary-500">{player.position}</div>
            </button>
          ))}
        </div>
      </div>

      {selectedPlayer && (
        <>
          {/* Progress Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {(() => {
              const stats = getProgressStats(selectedPlayer)
              const player = players.find(p => p.id === selectedPlayer)
              
              return [
                {
                  title: 'Total Goals',
                  value: stats.totalGoals,
                  icon: Target,
                  color: 'text-blue-600',
                  bg: 'bg-blue-100'
                },
                {
                  title: 'Achieved Goals',
                  value: stats.achievedGoals,
                  icon: Trophy,
                  color: 'text-green-600',
                  bg: 'bg-green-100'
                },
                {
                  title: 'Active Goals',
                  value: stats.activeGoals,
                  icon: Clock,
                  color: 'text-orange-600',
                  bg: 'bg-orange-100'
                },
                {
                  title: 'Avg. Session Rating',
                  value: stats.averageRating,
                  icon: Star,
                  color: 'text-purple-600',
                  bg: 'bg-purple-100',
                  trend: stats.trend
                }
              ].map((stat, index) => {
                const Icon = stat.icon
                return (
                  <div key={index} className="card">
                    <div className="flex items-center">
                      <div className={`${stat.bg} ${stat.color} p-3 rounded-xl`}>
                        <Icon size={24} />
                      </div>
                      <div className="ml-4 flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-secondary-600">{stat.title}</p>
                          {stat.trend && (
                            <div className="flex items-center">
                              {stat.trend === 'improving' && (
                                <TrendingUp size={16} className="text-green-600 mr-1" />
                              )}
                              {stat.trend === 'declining' && (
                                <TrendingDown size={16} className="text-red-600 mr-1" />
                              )}
                              {stat.trend === 'stable' && (
                                <Minus size={16} className="text-gray-600 mr-1" />
                              )}
                              <span className={`text-xs font-medium ${
                                stat.trend === 'improving' ? 'text-green-600' :
                                stat.trend === 'declining' ? 'text-red-600' : 'text-gray-600'
                              }`}>
                                {stat.trend}
                              </span>
                            </div>
                          )}
                        </div>
                        <p className="text-2xl font-bold text-secondary-900">{stat.value}</p>
                      </div>
                    </div>
                  </div>
                )
              })
            })()}
          </div>
        </>
      )}
    </div>
  )
}
