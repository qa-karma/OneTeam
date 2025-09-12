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
  const [showAddGoal, setShowAddGoal] = useState(false)
  const [showAddProgress, setShowAddProgress] = useState(false)
  const [newGoal, setNewGoal] = useState({
    metricId: '',
    targetValue: 0,
    deadline: '',
    notes: ''
  })
  const [newProgress, setNewProgress] = useState({
    overallRating: 5,
    coachNotes: '',
    playerSelfAssessment: 5,
    nextSessionFocus: [''],
    metrics: [] as { metricId: string; value: number; notes: string }[]
  })

  useEffect(() => {
    setPlayers(playersStorage.get())
    setMetrics(progressMetricsStorage.get())
    setGoals(progressGoalsStorage.get())
    setProgress(sessionProgressStorage.get())
    if (players.length > 0 && !selectedPlayer) {
      setSelectedPlayer(players[0].id)
    }
  }, [players.length, selectedPlayer])

  const handleAddGoal = () => {
    if (!selectedPlayer || !newGoal.metricId || !newGoal.targetValue || !newGoal.deadline) return

    const goal: ProgressGoal = {
      id: generateId(),
      playerId: selectedPlayer,
      metricId: newGoal.metricId,
      targetValue: newGoal.targetValue,
      currentValue: 0,
      deadline: newGoal.deadline,
      status: 'active',
      notes: newGoal.notes,
      createdAt: new Date().toISOString().split('T')[0]
    }

    const updatedGoals = progressGoalsStorage.add(goal)
    setGoals(updatedGoals)
    setNewGoal({ metricId: '', targetValue: 0, deadline: '', notes: '' })
    setShowAddGoal(false)
  }

  const handleAddProgress = () => {
    if (!selectedPlayer || !newProgress.coachNotes) return

    const progressEntry: SessionProgress = {
      id: generateId(),
      playerId: selectedPlayer,
      bookingId: `progress_${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      metrics: newProgress.metrics,
      overallRating: newProgress.overallRating,
      coachNotes: newProgress.coachNotes,
      playerSelfAssessment: newProgress.playerSelfAssessment,
      nextSessionFocus: newProgress.nextSessionFocus.filter(f => f.trim()),
      createdAt: new Date().toISOString()
    }

    const updatedProgress = sessionProgressStorage.add(progressEntry)
    setProgress(updatedProgress)
    setNewProgress({
      overallRating: 5,
      coachNotes: '',
      playerSelfAssessment: 5,
      nextSessionFocus: [''],
      metrics: []
    })
    setShowAddProgress(false)
  }

  const updateGoalStatus = (goalId: string, status: 'active' | 'achieved' | 'missed') => {
    const updatedGoals = progressGoalsStorage.update(goalId, { status })
    setGoals(updatedGoals)
  }

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
          <div className="flex space-x-2">
            <button 
              onClick={() => setShowAddGoal(true)}
              className="btn-primary"
            >
              <Plus size={16} className="mr-2" />
              Add Goal
            </button>
            <button 
              onClick={() => setShowAddProgress(true)}
              className="btn-secondary"
            >
              <Plus size={16} className="mr-2" />
              Add Progress
            </button>
          </div>
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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Active Goals */}
            <div className="card">
              <div className="flex items-center mb-4">
                <Target className="text-primary-600 mr-3" size={24} />
                <h2 className="text-xl font-semibold text-secondary-900">Active Goals</h2>
              </div>
              
              {getPlayerGoals(selectedPlayer).filter(g => g.status === 'active').length === 0 ? (
                <div className="text-center py-8">
                  <Target className="mx-auto text-secondary-400 mb-3" size={48} />
                  <p className="text-secondary-600">No active goals</p>
                  <p className="text-sm text-secondary-500 mt-1">Set some goals to track progress!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {getPlayerGoals(selectedPlayer)
                    .filter(g => g.status === 'active')
                    .map(goal => {
                      const metric = metrics.find(m => m.id === goal.metricId)
                      const progress = Math.min((goal.currentValue / goal.targetValue) * 100, 100)
                      
                      return (
                        <div key={goal.id} className="p-4 border border-secondary-200 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-medium text-secondary-900">
                              {metric?.name || 'Unknown Metric'}
                            </h3>
                            <div className="flex space-x-2">
                              <button
                                onClick={() => updateGoalStatus(goal.id, 'achieved')}
                                className="p-1 text-green-600 hover:bg-green-50 rounded"
                                title="Mark as achieved"
                              >
                                <CheckCircle size={16} />
                              </button>
                              <button
                                onClick={() => updateGoalStatus(goal.id, 'missed')}
                                className="p-1 text-red-600 hover:bg-red-50 rounded"
                                title="Mark as missed"
                              >
                                <AlertCircle size={16} />
                              </button>
                            </div>
                          </div>
                          
                          <div className="mb-2">
                            <div className="flex justify-between text-sm text-secondary-600 mb-1">
                              <span>Progress: {goal.currentValue} / {goal.targetValue} {metric?.unit}</span>
                              <span>{Math.round(progress)}%</span>
                            </div>
                            <div className="w-full bg-secondary-200 rounded-full h-2">
                              <div 
                                className="bg-primary-500 h-2 rounded-full transition-all"
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                          </div>
                          
                          <p className="text-sm text-secondary-600 mb-2">{goal.notes}</p>
                          <p className="text-xs text-secondary-500">
                            Deadline: {formatDate(goal.deadline)}
                          </p>
                        </div>
                      )
                    })}
                </div>
              )}
            </div>

            {/* Recent Progress */}
            <div className="card">
              <div className="flex items-center mb-4">
                <TrendingUp className="text-green-600 mr-3" size={24} />
                <h2 className="text-xl font-semibold text-secondary-900">Recent Progress</h2>
              </div>
              
              {getPlayerProgress(selectedPlayer).length === 0 ? (
                <div className="text-center py-8">
                  <BarChart3 className="mx-auto text-secondary-400 mb-3" size={48} />
                  <p className="text-secondary-600">No progress recorded</p>
                  <p className="text-sm text-secondary-500 mt-1">Start tracking session progress!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {getPlayerProgress(selectedPlayer).slice(0, 3).map(progressEntry => (
                    <div key={progressEntry.id} className="p-3 border border-secondary-200 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-secondary-900">
                          {formatDate(progressEntry.date)}
                        </span>
                        <div className="flex items-center">
                          <Star size={16} className="text-yellow-500 mr-1" />
                          <span className="text-sm font-medium">{progressEntry.overallRating}/5</span>
                        </div>
                      </div>
                      
                      <p className="text-sm text-secondary-600 mb-2 line-clamp-2">
                        {progressEntry.coachNotes}
                      </p>
                      
                      {progressEntry.metrics.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {progressEntry.metrics.slice(0, 3).map((metric, index) => (
                            <span 
                              key={index}
                              className="inline-block px-2 py-1 bg-secondary-100 text-secondary-700 text-xs rounded"
                            >
                              {getMetricName(metric.metricId)}: {metric.value}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Add Goal Modal */}
      {showAddGoal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">Add New Goal</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">
                  Metric
                </label>
                <select
                  value={newGoal.metricId}
                  onChange={(e) => setNewGoal({ ...newGoal, metricId: e.target.value })}
                  className="w-full p-2 border border-secondary-300 rounded-md"
                >
                  <option value="">Select a metric</option>
                  {metrics.map(metric => (
                    <option key={metric.id} value={metric.id}>
                      {metric.name} ({metric.unit})
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">
                  Target Value
                </label>
                <input
                  type="number"
                  value={newGoal.targetValue}
                  onChange={(e) => setNewGoal({ ...newGoal, targetValue: Number(e.target.value) })}
                  className="w-full p-2 border border-secondary-300 rounded-md"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">
                  Deadline
                </label>
                <input
                  type="date"
                  value={newGoal.deadline}
                  onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })}
                  className="w-full p-2 border border-secondary-300 rounded-md"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">
                  Notes
                </label>
                <textarea
                  value={newGoal.notes}
                  onChange={(e) => setNewGoal({ ...newGoal, notes: e.target.value })}
                  className="w-full p-2 border border-secondary-300 rounded-md"
                  rows={3}
                />
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowAddGoal(false)}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                onClick={handleAddGoal}
                className="btn-primary flex-1"
              >
                Add Goal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Progress Modal */}
      {showAddProgress && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Add Session Progress</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">
                  Overall Rating
                </label>
                <div className="flex space-x-2">
                  {[1, 2, 3, 4, 5].map(rating => (
                    <button
                      key={rating}
                      onClick={() => setNewProgress({ ...newProgress, overallRating: rating })}
                      className={`p-2 rounded-full ${
                        newProgress.overallRating === rating
                          ? 'bg-primary-500 text-white'
                          : 'bg-secondary-100 text-secondary-600 hover:bg-secondary-200'
                      }`}
                    >
                      {rating}
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">
                  Coach Notes
                </label>
                <textarea
                  value={newProgress.coachNotes}
                  onChange={(e) => setNewProgress({ ...newProgress, coachNotes: e.target.value })}
                  className="w-full p-2 border border-secondary-300 rounded-md"
                  rows={4}
                  placeholder="Describe the session, player performance, and areas for improvement..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">
                  Player Self-Assessment
                </label>
                <div className="flex space-x-2">
                  {[1, 2, 3, 4, 5].map(rating => (
                    <button
                      key={rating}
                      onClick={() => setNewProgress({ ...newProgress, playerSelfAssessment: rating })}
                      className={`p-2 rounded-full ${
                        newProgress.playerSelfAssessment === rating
                          ? 'bg-green-500 text-white'
                          : 'bg-secondary-100 text-secondary-600 hover:bg-secondary-200'
                      }`}
                    >
                      {rating}
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">
                  Next Session Focus
                </label>
                {newProgress.nextSessionFocus.map((focus, index) => (
                  <div key={index} className="flex space-x-2 mb-2">
                    <input
                      type="text"
                      value={focus}
                      onChange={(e) => {
                        const updated = [...newProgress.nextSessionFocus]
                        updated[index] = e.target.value
                        setNewProgress({ ...newProgress, nextSessionFocus: updated })
                      }}
                      className="flex-1 p-2 border border-secondary-300 rounded-md"
                      placeholder="e.g., Improve first touch control"
                    />
                    {index === newProgress.nextSessionFocus.length - 1 && (
                      <button
                        onClick={() => setNewProgress({
                          ...newProgress,
                          nextSessionFocus: [...newProgress.nextSessionFocus, '']
                        })}
                        className="btn-secondary px-3"
                      >
                        +
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowAddProgress(false)}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                onClick={handleAddProgress}
                className="btn-primary flex-1"
              >
                Add Progress
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
