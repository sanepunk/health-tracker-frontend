import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, ArrowLeft, CheckCircle, XCircle, Key, Eye, EyeOff, Lock } from 'lucide-react'
import { authAPI } from '../api'
import './PasswordRecovery.css'

const PasswordRecovery = () => {
  const [formData, setFormData] = useState({
    email: '',
    recoveryKey: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState('')
  const [remainingKeys, setRemainingKeys] = useState(null)

  const navigate = useNavigate()

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    if (error) {
      setError('')
    }
  }

  const validateForm = () => {
    if (!formData.email.trim()) {
      setError('Email address is required')
      return false
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Please enter a valid email address')
      return false
    }

    if (!formData.recoveryKey.trim()) {
      setError('Recovery key is required')
      return false
    }

    if (!formData.newPassword) {
      setError('New password is required')
      return false
    }

    if (formData.newPassword.length < 8) {
      setError('Password must be at least 8 characters long')
      return false
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError('Passwords do not match')
      return false
    }

    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      const result = await authAPI.recoverPassword({
        email: formData.email,
        recoveryKey: formData.recoveryKey,
        newPassword: formData.newPassword
      })
      
      setRemainingKeys(result.total_recovery_keys)
      setIsSuccess(true)
    } catch (error) {
      setError(error.message || 'Password recovery failed')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="password-recovery-container">
        <div className="password-recovery-card">
          <div className="success-icon">
            <CheckCircle size={48} />
          </div>
          
          <div className="recovery-header">
            <h1>Password Reset Successful</h1>
            <p>Your password has been updated successfully!</p>
          </div>

          <div className="recovery-info">
            <div className="info-box success">
              <p><strong>Recovery key used successfully</strong></p>
              <p>Total recovery keys: <strong>{remainingKeys}</strong></p>
              <p className="info">
                ✨ Your recovery keys can be used multiple times for password recovery.
              </p>
            </div>
          </div>

          <div className="recovery-actions">
            <button 
              onClick={() => navigate('/login')}
              className="continue-button"
            >
              Continue to Sign In
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="password-recovery-container">
      <div className="password-recovery-card">
        <div className="recovery-header">
          <h1>Reset Your Password</h1>
          <p>Use one of your recovery keys to reset your password</p>
        </div>

        <form onSubmit={handleSubmit} className="recovery-form">
          {error && (
            <div className="error-message">
              <XCircle size={16} />
              {error}
            </div>
          )}

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
                placeholder="Enter your email address"
                className={error && !formData.email ? 'error' : ''}
                autoComplete="email"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="recoveryKey">Recovery Key</label>
            <div className="input-wrapper">
              <Key className="input-icon" size={20} />
              <input
                type="text"
                id="recoveryKey"
                name="recoveryKey"
                value={formData.recoveryKey}
                onChange={handleInputChange}
                placeholder="XXXX-XXXX-XXXX-XXXX"
                className={error && !formData.recoveryKey ? 'error' : ''}
                style={{ fontFamily: 'monospace', letterSpacing: '1px' }}
              />
            </div>
            <small className="help-text">
              Enter one of the recovery keys you saved during registration
            </small>
          </div>

          <div className="form-group">
            <label htmlFor="newPassword">New Password</label>
            <div className="input-wrapper">
              <Lock className="input-icon" size={20} />
              <input
                type={showPassword ? 'text' : 'password'}
                id="newPassword"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleInputChange}
                placeholder="Enter your new password"
                className={error && !formData.newPassword ? 'error' : ''}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm New Password</label>
            <div className="input-wrapper">
              <Lock className="input-icon" size={20} />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="Confirm your new password"
                className={error && formData.newPassword !== formData.confirmPassword ? 'error' : ''}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <div className="recovery-warning">
            <div className="warning-content">
              <Key size={20} />
              <div>
                <strong>Important:</strong> Recovery keys can be used multiple times. 
                Make sure you have your recovery keys stored safely.
              </div>
            </div>
          </div>

          <button 
            type="submit" 
            className="submit-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Resetting Password...' : 'Reset Password'}
          </button>
        </form>

        <div className="recovery-footer">
          <Link to="/login" className="back-to-login">
            <ArrowLeft size={16} />
            Back to Sign In
          </Link>
          
          <span className="divider">or</span>
          
          <Link to="/register" className="create-account">
            Create New Account
          </Link>
        </div>
      </div>
    </div>
  )
}

export default PasswordRecovery 