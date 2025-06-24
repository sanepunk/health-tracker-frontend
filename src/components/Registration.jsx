import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { User, Mail, Lock, Eye, EyeOff, CheckCircle, XCircle } from 'lucide-react'
import { authAPI, apiUtils } from '../api'
import RecoveryKeys from './RecoveryKeys'
import './Registration.css'

const Registration = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    feedback: []
  })
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [motivationalQuote, setMotivationalQuote] = useState('')
  const [showRecoveryKeys, setShowRecoveryKeys] = useState(false)
  const [recoveryKeys, setRecoveryKeys] = useState([])

  const navigate = useNavigate()
  const { login } = useAuth()

  const motivationalQuotes = [
    "Every journey begins with a single step toward wellness.",
    "Your commitment to growth creates ripples of positive change.",
    "Progress, not perfection, is the path to lasting transformation.",
    "Each day offers a fresh opportunity to nurture your well-being.",
    "Small consistent actions lead to extraordinary results.",
    "Your wellness journey is uniquely yours—embrace every moment.",
    "Building healthy habits is the greatest gift you can give yourself.",
    "Every choice toward wellness is an investment in your future self."
  ]

  useEffect(() => {
    // Set random motivational quote
    const randomQuote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)]
    setMotivationalQuote(randomQuote)
  }, [])

  const checkPasswordStrength = (password) => {
    let score = 0
    const feedback = []

    if (password.length >= 8) {
      score += 1
    } else {
      feedback.push('At least 8 characters')
    }

    if (/[a-z]/.test(password)) {
      score += 1
    } else {
      feedback.push('Include lowercase letters')
    }

    if (/[A-Z]/.test(password)) {
      score += 1
    } else {
      feedback.push('Include uppercase letters')
    }

    if (/\d/.test(password)) {
      score += 1
    } else {
      feedback.push('Include numbers')
    }

    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      score += 1
    } else {
      feedback.push('Include special characters')
    }

    return { score, feedback }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))

    // Clear specific error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }

    // Check password strength in real-time
    if (name === 'password') {
      setPasswordStrength(checkPasswordStrength(value))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    // Username validation
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required'
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters'
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username = 'Username can only contain letters, numbers, and underscores'
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (passwordStrength.score < 3) {
      newErrors.password = 'Password is too weak'
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password'
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
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
      const userData = {
        username: formData.username.trim(),
        email: formData.email.trim(),
        password: formData.password
      }

      const result = await authAPI.register(userData)
      
      // Store tokens and user data
      apiUtils.storeTokens(result.tokens)
      apiUtils.storeUser(result.user)
      
      // Show recovery keys
      setRecoveryKeys(result.recovery_keys)
      setShowRecoveryKeys(true)
      
    } catch (error) {
      setErrors({ submit: error.message || 'Registration failed' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const getPasswordStrengthColor = () => {
    switch (passwordStrength.score) {
      case 0:
      case 1: return '#ff4757'
      case 2: return '#ffa502'
      case 3: return '#ff6b35'
      case 4: return '#5f27cd'
      case 5: return '#00d2d3'
      default: return '#ddd'
    }
  }

  const getPasswordStrengthText = () => {
    switch (passwordStrength.score) {
      case 0:
      case 1: return 'Very Weak'
      case 2: return 'Weak'
      case 3: return 'Fair'
      case 4: return 'Strong'
      case 5: return 'Very Strong'
      default: return ''
    }
  }

  const handleRecoveryKeysContinue = async () => {
    setShowRecoveryKeys(false)
    // Auto-login the user since they just registered
    try {
      const result = await login({
        username: formData.username.trim(),
        password: formData.password
      }, false) // Don't remember me for auto-login after registration
      
      if (result.success) {
        navigate('/dashboard')
      } else {
        console.error('Auto-login failed:', result.error)
        // Still navigate to dashboard if tokens were stored during registration
        navigate('/dashboard')
      }
    } catch (error) {
      console.error('Auto-login error:', error)
      navigate('/dashboard')
    }
  }

  return (
    <div className="registration-container">
      <div className="registration-card">
        <div className="registration-header">
          <h1>Begin Your Wellness Journey</h1>
          <p className="motivational-quote">"{motivationalQuote}"</p>
        </div>

        <form onSubmit={handleSubmit} className="registration-form">
          {errors.submit && (
            <div className="error-message">
              <XCircle size={16} />
              {errors.submit}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="username">Username</label>
            <div className="input-wrapper">
              <User className="input-icon" size={20} />
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                placeholder="Choose a unique username"
                className={errors.username ? 'error' : ''}
              />
            </div>
            {errors.username && <span className="error-text">{errors.username}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <div className="input-wrapper">
              <Mail className="input-icon" size={20} />
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="your.email@example.com"
                className={errors.email ? 'error' : ''}
              />
            </div>
            {errors.email && <span className="error-text">{errors.email}</span>}
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
                placeholder="Create a strong password"
                className={errors.password ? 'error' : ''}
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
            
            {formData.password && (
              <div className="password-strength">
                <div className="strength-bar">
                  <div 
                    className="strength-fill"
                    style={{ 
                      width: `${(passwordStrength.score / 5) * 100}%`,
                      backgroundColor: getPasswordStrengthColor()
                    }}
                  ></div>
                </div>
                <span className="strength-text" style={{ color: getPasswordStrengthColor() }}>
                  {getPasswordStrengthText()}
                </span>
                {passwordStrength.feedback.length > 0 && (
                  <ul className="strength-feedback">
                    {passwordStrength.feedback.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <div className="input-wrapper">
              <Lock className="input-icon" size={20} />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="Confirm your password"
                className={errors.confirmPassword ? 'error' : ''}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
          </div>

          <button 
            type="submit" 
            className="submit-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creating Account...' : 'Start Your Journey'}
          </button>
        </form>

        <div className="registration-footer">
          <p>Already have an account? <Link to="/login">Sign in here</Link></p>
        </div>
      </div>

      {showRecoveryKeys && (
        <RecoveryKeys 
          keys={recoveryKeys}
          onContinue={handleRecoveryKeysContinue}
        />
      )}
    </div>
  )
}

export default Registration 