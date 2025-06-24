import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { wellnessAPI } from '../api'
import { 
  Trophy, Medal, Star, Crown, ArrowLeft, Calendar,
  TrendingUp, Target, Flame, Award, Search
} from 'lucide-react'
import './AchievementBoard.css'

const AchievementBoard = () => {
  const [activeTab, setActiveTab] = useState('daily')
  const [leaderboardData, setLeaderboardData] = useState([])
  const [filteredLeaderboardData, setFilteredLeaderboardData] = useState([])
  const [userAchievements, setUserAchievements] = useState([])
  const [userRank, setUserRank] = useState(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  const navigate = useNavigate()
  const { user } = useAuth()

  const achievements = [
    {
      id: 'first_step',
      name: 'First Step',
      description: 'Complete your first day of wellness tracking',
      icon: <Target size={32} />,
      requirement: 1,
      type: 'streak'
    },
    {
      id: 'week_warrior',
      name: 'Week Warrior',
      description: 'Maintain a 7-day streak',
      icon: <Flame size={32} />,
      requirement: 7,
      type: 'streak'
    },
    {
      id: 'consistency_champion',
      name: 'Consistency Champion',
      description: 'Maintain a 30-day streak',
      icon: <Crown size={32} />,
      requirement: 30,
      type: 'streak'
    },
    {
      id: 'wellness_master',
      name: 'Wellness Master',
      description: 'Maintain a 100-day streak',
      icon: <Trophy size={32} />,
      requirement: 100,
      type: 'streak'
    },
    {
      id: 'monthly_dedication',
      name: 'Monthly Dedication',
      description: 'Complete 25 days in a single month',
      icon: <Calendar size={32} />,
      requirement: 25,
      type: 'monthly'
    },
    {
      id: 'point_collector',
      name: 'Point Collector',
      description: 'Accumulate 500 wellness points',
      icon: <Star size={32} />,
      requirement: 500,
      type: 'points'
    }
  ]

  useEffect(() => {
    if (user) {
      loadData()
    }
  }, [user, activeTab])

  // Filter leaderboard data based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredLeaderboardData(leaderboardData)
    } else {
      const filtered = leaderboardData.filter(entry =>
        entry.username.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredLeaderboardData(filtered)
    }
  }, [leaderboardData, searchTerm])

  const loadData = async () => {
    try {
      setLoading(true)
      
      // Load leaderboard data (increased limit for better search results)
      const leaderboardType = getLeaderboardType()
      const leaderboard = await wellnessAPI.getLeaderboard(leaderboardType, 50)
      setLeaderboardData(leaderboard)
      
      // Load user achievements
      const achievements = await wellnessAPI.getUserAchievements()
      setUserAchievements(achievements)
      
      // Get user rank
      const rankResponse = await wellnessAPI.getUserRank(leaderboardType)
      setUserRank(rankResponse.rank)
      
    } catch (error) {
      console.error('Failed to load achievement board data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    // The filtering is handled by useEffect, so this just prevents form submission
    console.log('Searching for:', searchTerm)
  }

  const handleSearchInputChange = (e) => {
    setSearchTerm(e.target.value)
  }

  const clearSearch = () => {
    setSearchTerm('')
  }

  const getLeaderboardType = () => {
    switch (activeTab) {
      case 'daily':
        return 'current_streak'
      case 'weekly':
        return 'best_streak'
      case 'monthly':
        return 'total_days'
      default:
        return 'current_streak'
    }
  }

  const getLeaderboardByType = () => {
    // Return filtered data instead of raw leaderboard data
    return filteredLeaderboardData
  }

  const getRankIcon = (rank) => {
    switch (rank) {
      case 0: return <Crown className="rank-icon gold" size={20} />
      case 1: return <Medal className="rank-icon silver" size={20} />
      case 2: return <Award className="rank-icon bronze" size={20} />
      default: return <span className="rank-number">{rank + 1}</span>
    }
  }

  const getScoreByType = (entry) => {
    switch (activeTab) {
      case 'daily':
        return `${entry.current_streak || 0} days`
      case 'weekly':
        return `${entry.best_streak || 0} days`
      case 'monthly':
        return `${entry.total_days || 0} days`
      default:
        return '0 days'
    }
  }

  const getTabTitle = () => {
    switch (activeTab) {
      case 'daily':
        return 'Current Streaks'
      case 'weekly':
        return 'Best Streaks'
      case 'monthly':
        return 'Total Days'
      default:
        return 'Rankings'
    }
  }

  return (
    <div className="achievement-board-container">
      <div className="achievement-header">
        <div className="header-left">
          <button 
            onClick={() => navigate('/dashboard')}
            className="back-button"
          >
            <ArrowLeft size={20} />
            Back to Dashboard
          </button>
          <h1>Achievement Board</h1>
        </div>
      </div>

      <div className="achievement-content">
        <div className="user-achievements-section">
          <h2>Your Achievements</h2>
          <div className="achievements-grid">
            {loading ? (
              <div className="loading-message">Loading achievements...</div>
            ) : (
              achievements.map(achievement => {
                const isEarned = userAchievements.some(earned => earned.achievement?.name === achievement.name)
                return (
                  <div 
                    key={achievement.id}
                    className={`achievement-card ${isEarned ? 'earned' : 'locked'}`}
                  >
                    <div className="achievement-icon">
                      {achievement.icon}
                    </div>
                    <div className="achievement-content">
                      <h3>{achievement.name}</h3>
                      <p>{achievement.description}</p>
                      {isEarned && <div className="earned-badge">Earned!</div>}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        <div className="leaderboard-section">
          <div className="leaderboard-header">
            <h2>Community Rankings</h2>
            <div className="leaderboard-tabs">
              <button 
                className={`tab ${activeTab === 'daily' ? 'active' : ''}`}
                onClick={() => setActiveTab('daily')}
              >
                <TrendingUp size={16} />
                Current
              </button>
              <button 
                className={`tab ${activeTab === 'weekly' ? 'active' : ''}`}
                onClick={() => setActiveTab('weekly')}
              >
                <Trophy size={16} />
                Best Ever
              </button>
              <button 
                className={`tab ${activeTab === 'monthly' ? 'active' : ''}`}
                onClick={() => setActiveTab('monthly')}
              >
                <Calendar size={16} />
                Total
              </button>
            </div>
          </div>

          <div className="leaderboard-content">
            <h3>{getTabTitle()}</h3>
            
            {/* Search Bar */}
            <div className="search-section">
              <form onSubmit={handleSearch} className="search-form">
                <div className="search-input-container">
                  <Search size={20} className="search-icon" />
                  <input
                    type="text"
                    placeholder="Search users by username..."
                    value={searchTerm}
                    onChange={handleSearchInputChange}
                    className="search-input"
                  />
                  {searchTerm && (
                    <button
                      type="button"
                      onClick={clearSearch}
                      className="clear-search-button"
                    >
                      ✕
                    </button>
                  )}
                </div>
                <button type="submit" className="search-submit-button">
                  Search
                </button>
              </form>
              
              {searchTerm && (
                <div className="search-results-info">
                  {filteredLeaderboardData.length === 0 ? (
                    <p>No users found matching "{searchTerm}"</p>
                  ) : (
                    <p>Found {filteredLeaderboardData.length} user{filteredLeaderboardData.length !== 1 ? 's' : ''} matching "{searchTerm}"</p>
                  )}
                </div>
              )}
            </div>
            
            <div className="leaderboard-list">
              {loading ? (
                <div className="loading-message">Loading leaderboard...</div>
              ) : (
                getLeaderboardByType().map((entry, index) => (
                  <div 
                    key={entry.user_id}
                    className={`leaderboard-item ${entry.user_id === user?.id ? 'current-user' : ''}`}
                  >
                    <div className="rank">
                      {getRankIcon(index)}
                    </div>
                    <div className="user-info">
                      <span className="username">{entry.username}</span>
                      <span className="join-date">
                        Joined {new Date(entry.join_date).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="score">
                      {getScoreByType(entry)}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="stats-section">
          <div className="stat-card">
            <div className="stat-icon">
              <Trophy size={24} />
            </div>
            <div className="stat-content">
              <h4>Your Current Rank</h4>
              <p className="stat-value">
                {loading ? '...' : (userRank > 0 ? `#${userRank}` : 'Unranked')}
              </p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <Star size={24} />
            </div>
            <div className="stat-content">
              <h4>Achievements Earned</h4>
              <p className="stat-value">
                {userAchievements.length} / {achievements.length}
              </p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <Medal size={24} />
            </div>
            <div className="stat-content">
              <h4>Total Points</h4>
              <p className="stat-value">{user?.total_points || 0}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AchievementBoard 