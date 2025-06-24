import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { wellnessAPI } from '../api'
import { 
  TrendingUp, Calendar, Award, LogOut, User, 
  ChevronLeft, ChevronRight, Plus, Check 
} from 'lucide-react'
import './Dashboard.css'

// Timezone-safe date formatting function
const formatDateKey = (date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const Dashboard = () => {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [progressData, setProgressData] = useState({})
  const [motivationalQuote, setMotivationalQuote] = useState('')
  const [showProgressModal, setShowProgressModal] = useState(false)

  const navigate = useNavigate()
  const { user, logout, updateUserProgress, loading } = useAuth()

  // Redirect to login if not authenticated and not loading
  useEffect(() => {
    if (!loading && !user) {
      navigate('/login')
    }
  }, [loading, user, navigate])

  const motivationalQuotes = [
    "Progress is progress, no matter how small.",
    "Your journey to wellness is uniquely yours.",
    "Every healthy choice is a step toward your best self.",
    "Consistency beats perfection every time.",
    "Small steps daily lead to big changes yearly.",
    "Your body is your temple. Keep it pure and clean for the soul to reside in.",
    "Take care of your body. It's the only place you have to live.",
    "The greatest wealth is health.",
    "A healthy outside starts from the inside.",
    "Your health is an investment, not an expense."
  ]

  useEffect(() => {
    // Set random motivational quote
    const randomQuote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)]
    setMotivationalQuote(randomQuote)

    // Load progress data only when user is available
    if (user) {
      loadProgressData()
    }
  }, [user])

  const loadProgressData = async () => {
    try {
      if (!user?.id) {
        console.log('User ID not available for loading progress data')
        return
      }
      
      // Load progress data from API
      const progressList = await wellnessAPI.getUserProgress()
      
      // Convert array to object for easy lookup
      const progressMap = {}
      progressList.forEach(entry => {
        if (entry.completed) {
          progressMap[entry.date] = {
            completed: true,
            timestamp: entry.created_at
          }
        }
      })
      
      setProgressData(progressMap)
    } catch (error) {
      console.error('Failed to load progress data:', error)
      // Fallback to empty data
      setProgressData({})
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const markProgress = async (date) => {
    if (!user) {
      console.error('User not authenticated')
      return
    }

    const dateKey = formatDateKey(date)
    const isCurrentlyCompleted = !!progressData[dateKey]

    try {
      // Call the API to mark progress
      const result = await wellnessAPI.markProgress({
        date: dateKey,
        completed: !isCurrentlyCompleted, // Toggle completion
        notes: null
      })

      console.log('Progress marked successfully:', result)
      
      // Update local state immediately for better UX
      const newProgressData = { ...progressData }
      if (isCurrentlyCompleted) {
        delete newProgressData[dateKey]
      } else {
        newProgressData[dateKey] = {
          completed: true,
          timestamp: new Date().toISOString()
        }
      }
      
      setProgressData(newProgressData)
      
      // Refresh user data to get updated stats from server
      try {
        await updateUserProgress()
        console.log('User data refreshed successfully')
        
        // Also reload progress data to ensure synchronization
        await loadProgressData()
        console.log('Progress data reloaded successfully')
      } catch (refreshError) {
        console.error('Failed to refresh user data:', refreshError)
        // Don't revert local state - the progress was still marked on server
      }
      
    } catch (error) {
      console.error('Failed to mark progress:', error)
      
      // Optionally: Show a user-friendly error message
      // For now, just log the error and don't update local state
      alert('Failed to save progress. Please try again.')
    }
  }

  const getDaysInMonth = (date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day))
    }
    
    return days
  }

  const isDateCompleted = (date) => {
    if (!date) return false
    const dateKey = formatDateKey(date)
    return !!progressData[dateKey]
  }

  const isToday = (date) => {
    if (!date) return false
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate)
    newDate.setMonth(currentDate.getMonth() + direction)
    setCurrentDate(newDate)
  }

  const getCompletedDaysThisMonth = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    
    return Object.keys(progressData).filter(dateKey => {
      // Parse date string safely (YYYY-MM-DD format)
      const [dateYear, dateMonth, dateDay] = dateKey.split('-').map(Number)
      return dateYear === year && (dateMonth - 1) === month
    }).length
  }

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading-state">
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  // Don't render if user is not available
  if (!user) {
    return null
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div className="user-info">
          <div className="user-avatar">
            <User size={24} />
          </div>
          <div>
            <h2>Welcome back, {user?.username}!</h2>
            <p>Continue your wellness journey</p>
          </div>
        </div>
        
        <div className="header-actions">
          <button 
            onClick={() => navigate('/achievements')}
            className="achievements-button"
          >
            <Award size={20} />
            Achievements
          </button>
          <button onClick={handleLogout} className="logout-button">
            <LogOut size={20} />
          </button>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="stats-section">
          <div className="stat-card current-streak">
            <div className="stat-icon">
              <TrendingUp size={24} />
            </div>
            <div className="stat-content">
              <h3>Current Streak</h3>
              <p className="stat-number">{user?.current_streak || 0} days</p>
            </div>
          </div>

          <div className="stat-card best-streak">
            <div className="stat-icon">
              <Award size={24} />
            </div>
            <div className="stat-content">
              <h3>Personal Best</h3>
              <p className="stat-number">{user?.best_streak || 0} days</p>
            </div>
          </div>

          <div className="stat-card monthly-progress">
            <div className="stat-icon">
              <Calendar size={24} />
            </div>
            <div className="stat-content">
              <h3>This Month</h3>
              <p className="stat-number">{getCompletedDaysThisMonth()} days</p>
            </div>
          </div>
        </div>

        <div className="progress-section">
          <button 
            onClick={() => markProgress(new Date())}
            className={`progress-button ${isDateCompleted(new Date()) ? 'completed' : ''}`}
          >
            <div className="progress-icon">
              {isDateCompleted(new Date()) ? <Check size={32} /> : <Plus size={32} />}
            </div>
            <span>
              {isDateCompleted(new Date()) ? 'Completed Today!' : 'Mark Today\'s Progress'}
            </span>
          </button>
        </div>

        <div className="quote-section">
          <div className="quote-card">
            <h4>Daily Inspiration</h4>
            <blockquote>"{motivationalQuote}"</blockquote>
          </div>
        </div>

        <div className="calendar-section">
          <div className="calendar-header">
            <button 
              onClick={() => navigateMonth(-1)}
              className="calendar-nav"
            >
              <ChevronLeft size={20} />
            </button>
            
            <h3>
              {currentDate.toLocaleDateString('en-US', { 
                month: 'long', 
                year: 'numeric' 
              })}
            </h3>
            
            <button 
              onClick={() => navigateMonth(1)}
              className="calendar-nav"
            >
              <ChevronRight size={20} />
            </button>
          </div>

          <div className="calendar-grid">
            <div className="calendar-days-header">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="calendar-day-header">{day}</div>
              ))}
            </div>
            
            <div className="calendar-days">
              {getDaysInMonth(currentDate).map((date, index) => (
                <div
                  key={index}
                  className={`calendar-day ${
                    date ? 'has-date' : 'empty'
                  } ${
                    date && isToday(date) ? 'today' : ''
                  } ${
                    date && isDateCompleted(date) ? 'completed' : ''
                  }`}
                >
                  {date && (
                    <>
                      <span className="day-number">{date.getDate()}</span>
                      {isDateCompleted(date) && (
                        <Check size={12} className="completion-check" />
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard 