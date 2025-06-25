import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { User, Lock, Eye, EyeOff, CheckCircle, XCircle } from 'lucide-react'
import './Login.css'

const Login = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    rememberMe: true  // Always true now
  })
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const navigate = useNavigate()
  const { login } = useAuth()

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))

    // Clear errors when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.username.trim()) {
      newErrors.username = 'Username or email is required'
    }

    if (!formData.password) {
      newErrors.password = 'Password is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      // Use the new API-based login with remember me always true
      const result = await login({
        username: formData.username.trim(),
        password: formData.password
      }, formData.rememberMe)
      
      if (result.success) {
        navigate('/dashboard')
      } else {
        setErrors({ submit: result.error || 'Invalid username or password' })
      }
    } catch (error) {
      console.error('Login error:', error)
      setErrors({ submit: error.message || 'An unexpected error occurred' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>Welcome Back</h1>
          <p>Continue your wellness journey</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {errors.submit && (
            <div className="error-message">
              <XCircle size={16} />
              {errors.submit}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="username">Username or Email</label>
            <div className="input-wrapper">
              <User className="input-icon" size={20} />
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                placeholder="Enter your username or email"
                className={errors.username ? 'error' : ''}
                autoComplete="username"
              />
            </div>
            {errors.username && <span className="error-text">{errors.username}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="input-wrapper">
              <Lock className="input-icon" size={20} />
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Enter your password"
                className={errors.password ? 'error' : ''}
                autoComplete="current-password"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {errors.password && <span className="error-text">{errors.password}</span>}
          </div>

          <div className="form-options">
            <Link to="/password-recovery" className="forgot-password">
              Forgot password?
            </Link>
          </div>

          <button 
            type="submit" 
            className="submit-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div className="login-footer">
          <p>New to wellness tracking? <Link to="/register">Create an account</Link></p>
        </div>
      </div>
    </div>
  )
}

export default Login 