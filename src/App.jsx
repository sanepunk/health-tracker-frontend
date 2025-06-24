import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import './App.css'

// Import components
import Registration from './components/Registration'
import Login from './components/Login'
import Dashboard from './components/Dashboard'
import AchievementBoard from './components/AchievementBoard'
import PasswordRecovery from './components/PasswordRecovery'

// Context for user authentication
import { AuthProvider, useAuth } from './context/AuthContext'

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app">
          <Routes>
            <Route path="/login" element={
              <AuthRedirect>
                <Login />
              </AuthRedirect>
            } />
            <Route path="/register" element={
              <AuthRedirect>
                <Registration />
              </AuthRedirect>
            } />
            <Route path="/password-recovery" element={
              <AuthRedirect>
                <PasswordRecovery />
              </AuthRedirect>
            } />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/achievements" element={
              <ProtectedRoute>
                <AchievementBoard />
              </ProtectedRoute>
            } />
            <Route path="/" element={<RootRedirect />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  )
}

// Protected Route Component - Requires authentication
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()
  
  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    )
  }
  
  return isAuthenticated ? children : <Navigate to="/login" replace />
}

// Auth Redirect Component - Redirects authenticated users away from auth pages
function AuthRedirect({ children }) {
  const { isAuthenticated, loading } = useAuth()
  
  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    )
  }
  
  // If authenticated, redirect to dashboard
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : children
}

// Root Redirect Component - Smart redirect based on auth status
function RootRedirect() {
  const { isAuthenticated, loading } = useAuth()
  
  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    )
  }
  
  // Redirect based on authentication status
  return <Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />
}

export default App
