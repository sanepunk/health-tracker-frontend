import React, { createContext, useContext, useState, useEffect } from 'react'
import { authAPI, wellnessAPI } from '../api'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for stored authentication on app load
    checkStoredAuth()
  }, [])

  const checkStoredAuth = async () => {
    try {
      const rememberMe = localStorage.getItem('rememberMe') === 'true'
      
      // Check localStorage first (for persistent login), then sessionStorage (for session-only)
      let accessToken = localStorage.getItem('accessToken')
      let refreshToken = localStorage.getItem('refreshToken')
      let storedUser = localStorage.getItem('user')
      
      // If not in localStorage, check sessionStorage
      if (!accessToken) {
        accessToken = sessionStorage.getItem('accessToken')
        refreshToken = sessionStorage.getItem('refreshToken')
        storedUser = sessionStorage.getItem('user')
      }
      
      // If no tokens found anywhere, exit
      if (!accessToken || !refreshToken) {
        return
      }
      
      try {
        // Try to get current user info with existing token
        const userData = await authAPI.getCurrentUser()
        setUser(userData)
        setIsAuthenticated(true)
        
        // Update stored user data
        if (rememberMe) {
          localStorage.setItem('user', JSON.stringify(userData))
        } else {
          sessionStorage.setItem('user', JSON.stringify(userData))
        }
      } catch (authError) {
        console.log('Access token invalid, attempting refresh...')
        
        // If the access token is invalid, try to refresh
        if (refreshToken) {
          try {
            const refreshResponse = await authAPI.refreshToken(refreshToken)
            
            // Store new token in the same location as the original tokens
            if (rememberMe) {
              localStorage.setItem('accessToken', refreshResponse.access_token)
            } else {
              sessionStorage.setItem('accessToken', refreshResponse.access_token)
            }
            
            // Try getting user data again with new token
            const userData = await authAPI.getCurrentUser()
            setUser(userData)
            setIsAuthenticated(true)
            
            // Update stored user data in the same location
            if (rememberMe) {
              localStorage.setItem('user', JSON.stringify(userData))
            } else {
              sessionStorage.setItem('user', JSON.stringify(userData))
            }
          } catch (refreshError) {
            console.log('Token refresh failed, checking stored user data...')
            
            // If refresh fails but we have stored user data and rememberMe is true, use it
            if (storedUser && rememberMe) {
              try {
                const parsedUser = JSON.parse(storedUser)
                setUser(parsedUser)
                setIsAuthenticated(true)
                console.log('Using stored user data for offline authentication')
              } catch (parseError) {
                console.error('Failed to parse stored user:', parseError)
                clearStoredAuth()
              }
            } else {
              clearStoredAuth()
            }
          }
        } else {
          clearStoredAuth()
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      clearStoredAuth()
    } finally {
      setLoading(false)
    }
  }

  const clearStoredAuth = () => {
    // Clear from both localStorage and sessionStorage
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')
    localStorage.removeItem('rememberMe')
    sessionStorage.removeItem('accessToken')
    sessionStorage.removeItem('refreshToken')
    sessionStorage.removeItem('user')
    setUser(null)
    setIsAuthenticated(false)
  }

  const login = async (credentials, rememberMe = false) => {
    try {
      // Call the real API
      const response = await authAPI.login({
        username: credentials.username || credentials,
        password: credentials.password || credentials
      })
      
      // Store tokens (they come nested in response.tokens)
      if (rememberMe) {
        // For persistent login, store in localStorage
        localStorage.setItem('accessToken', response.tokens.access_token)
        localStorage.setItem('refreshToken', response.tokens.refresh_token)
        localStorage.setItem('user', JSON.stringify(response.user))
        localStorage.setItem('rememberMe', 'true')
      } else {
        // For session-only login, store in sessionStorage
        sessionStorage.setItem('accessToken', response.tokens.access_token)
        sessionStorage.setItem('refreshToken', response.tokens.refresh_token)
        sessionStorage.setItem('user', JSON.stringify(response.user))
        localStorage.setItem('rememberMe', 'false')
      }
      
      // Use user data from login response instead of making another API call
      setUser(response.user)
      setIsAuthenticated(true)
      
      return { success: true }
    } catch (error) {
      console.error('Login failed:', error)
      return { success: false, error: error.message }
    }
  }

  const logout = async () => {
    try {
      await authAPI.logout()
    } catch (error) {
      console.error('Logout API call failed:', error)
    } finally {
      // Always clear local state and storage
      clearStoredAuth()
    }
  }

  const register = async (userData) => {
    try {
      // Call the real API
      const response = await authAPI.register(userData)
      
      return { success: true, data: response }
    } catch (error) {
      console.error('Registration failed:', error)
      return { success: false, error: error.message }
    }
  }

  // Legacy function for compatibility - now uses API
  const validateUser = async (username, password) => {
    try {
      const result = await login({ username, password })
      return result.success ? user : null
    } catch (error) {
      return null
    }
  }

  const refreshUserData = async () => {
    try {
      // Refresh user data to get updated stats
      const userData = await authAPI.getCurrentUser()
      setUser(userData)
      
      // Update stored user data in appropriate storage
      const rememberMe = localStorage.getItem('rememberMe') === 'true'
      if (rememberMe) {
        localStorage.setItem('user', JSON.stringify(userData))
      } else {
        sessionStorage.setItem('user', JSON.stringify(userData))
      }
      
      return { success: true }
    } catch (error) {
      console.error('Failed to refresh user data:', error)
      return { success: false, error: error.message }
    }
  }

  // Legacy function for compatibility
  const updateUserProgress = refreshUserData

  // Legacy function for compatibility
  const getStoredUsers = () => {
    // This function is no longer needed with API backend
    // Return empty array for compatibility
    return []
  }

  const value = {
    isAuthenticated,
    user,
    loading,
    login,
    logout,
    register,
    validateUser,
    updateUserProgress,
    getStoredUsers
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
} 