'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { XMarkIcon, EyeIcon, EyeSlashIcon, CheckIcon } from '@heroicons/react/24/outline'
import { useAuth } from '@/contexts/AuthContext'

interface RegistrationModalProps {
  isOpen: boolean
  onClose: () => void
}

interface FormErrors {
  name?: string
  email?: string
  password?: string
  confirmPassword?: string
  general?: string
}

interface PasswordStrength {
  score: number
  feedback: string
  color: string
}

export default function RegistrationModal({ isOpen, onClose }: RegistrationModalProps) {
  const router = useRouter()
  const { signUp } = useAuth()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    bio: '',
    termsAccepted: false
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
  const [success, setSuccess] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>({ score: 0, feedback: '', color: '' })

  // Password strength calculation
  const calculatePasswordStrength = (password: string): PasswordStrength => {
    let score = 0
    let feedback = ''
    
    if (password.length >= 8) score += 1
    if (password.length >= 12) score += 1
    if (/[a-z]/.test(password)) score += 1
    if (/[A-Z]/.test(password)) score += 1
    if (/[0-9]/.test(password)) score += 1
    if (/[^A-Za-z0-9]/.test(password)) score += 1

    if (score <= 2) {
      feedback = 'Weak password'
      return { score, feedback, color: 'text-red-500' }
    } else if (score <= 4) {
      feedback = 'Medium strength'
      return { score, feedback, color: 'text-yellow-500' }
    } else {
      feedback = 'Strong password'
      return { score, feedback, color: 'text-green-500' }
    }
  }

  // Real-time validation
  const validateField = (name: string, value: string) => {
    const newErrors = { ...errors }
    
    switch (name) {
      case 'name':
        if (!value.trim()) {
          newErrors.name = 'Name is required'
        } else if (value.trim().length < 2) {
          newErrors.name = 'Name must be at least 2 characters'
        } else {
          delete newErrors.name
        }
        break
      
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!value.trim()) {
          newErrors.email = 'Email is required'
        } else if (!emailRegex.test(value)) {
          newErrors.email = 'Please enter a valid email address'
        } else {
          delete newErrors.email
        }
        break
      
      case 'password':
        if (!value) {
          newErrors.password = 'Password is required'
        } else if (value.length < 6) {
          newErrors.password = 'Password must be at least 6 characters'
        } else {
          delete newErrors.password
        }
        setPasswordStrength(calculatePasswordStrength(value))
        break
      
      case 'confirmPassword':
        if (!value) {
          newErrors.confirmPassword = 'Please confirm your password'
        } else if (value !== formData.password) {
          newErrors.confirmPassword = 'Passwords do not match'
        } else {
          delete newErrors.confirmPassword
        }
        break
    }
    
    setErrors(newErrors)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))

    // Real-time validation
    if (name !== 'bio' && name !== 'termsAccepted') {
      validateField(name, value)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrors({})

    // Final validation
    const newErrors: FormErrors = {}
    
    if (!formData.name.trim()) newErrors.name = 'Name is required'
    if (!formData.email.trim()) newErrors.email = 'Email is required'
    if (!formData.password) newErrors.password = 'Password is required'
    if (!formData.confirmPassword) newErrors.confirmPassword = 'Please confirm your password'
    if (!formData.termsAccepted) newErrors.general = 'You must accept the terms and conditions'
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }
    
    if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      setLoading(false)
      return
    }

    try {
      await signUp(formData.email, formData.password, formData.name, formData.bio)
      setSuccess(true)
      
      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        onClose()
        router.push('/dashboard')
      }, 2000)
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create account'
      setErrors({ general: errorMessage })
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      bio: '',
      termsAccepted: false
    })
    setErrors({})
    setPasswordStrength({ score: 0, feedback: '', color: '' })
    setSuccess(false)
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  useEffect(() => {
    if (!isOpen) {
      resetForm()
    }
  }, [isOpen])

  if (!isOpen) return null

  if (success) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg max-w-md w-full p-8 text-center">
          <div className="text-green-600 text-6xl mb-4">✓</div>
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Registration Successful!</h3>
          <p className="text-gray-600 mb-6">
            Your account has been created and is pending admin approval. 
            Redirecting you to your dashboard...
          </p>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-900 mx-auto"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-gray-900">Join BIG</h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                errors.name ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Enter your full name"
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name}</p>
            )}
          </div>

          {/* Email Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                errors.email ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Enter your email"
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email}</p>
            )}
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password *
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className={`w-full px-3 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                  errors.password ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Create a password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showPassword ? (
                  <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                ) : (
                  <EyeIcon className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </div>
            {formData.password && (
              <div className="mt-1">
                <div className="flex items-center space-x-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        passwordStrength.score <= 2 ? 'bg-red-500' :
                        passwordStrength.score <= 4 ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${(passwordStrength.score / 6) * 100}%` }}
                    />
                  </div>
                  <span className={`text-sm ${passwordStrength.color}`}>
                    {passwordStrength.feedback}
                  </span>
                </div>
              </div>
            )}
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password}</p>
            )}
          </div>

          {/* Confirm Password Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirm Password *
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className={`w-full px-3 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                  errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Confirm your password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showConfirmPassword ? (
                  <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                ) : (
                  <EyeIcon className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </div>
            {formData.confirmPassword && formData.password === formData.confirmPassword && (
              <div className="flex items-center space-x-1 mt-1">
                <CheckIcon className="h-4 w-4 text-green-500" />
                <span className="text-green-500 text-sm">Passwords match</span>
              </div>
            )}
            {errors.confirmPassword && (
              <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
            )}
          </div>

          {/* Bio Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bio (Optional)
            </label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              placeholder="Tell us about yourself..."
            />
          </div>

          {/* Terms and Conditions */}
          <div className="flex items-start space-x-2">
            <input
              type="checkbox"
              name="termsAccepted"
              checked={formData.termsAccepted}
              onChange={handleChange}
              className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label className="text-sm text-gray-600">
              I agree to the{' '}
              <a href="#" className="text-blue-600 hover:text-blue-800 underline">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="#" className="text-blue-600 hover:text-blue-800 underline">
                Privacy Policy
              </a>
            </label>
          </div>

          {/* General Error */}
          {errors.general && (
            <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">
              {errors.general}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !formData.termsAccepted}
            className="w-full bg-blue-900 text-white py-3 px-4 rounded-lg hover:bg-blue-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
          >
            {loading && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            )}
            <span>{loading ? 'Creating Account...' : 'Create Account'}</span>
          </button>
        </form>

        <p className="text-xs text-gray-500 mt-4 text-center">
          Your account will be reviewed by our admin team before approval.
        </p>
      </div>
    </div>
  )
}
