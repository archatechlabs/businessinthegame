'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { EyeIcon, EyeSlashIcon, CheckIcon, ArrowLeftIcon } from '@heroicons/react/24/outline'
import { useAuth } from '@/contexts/AuthContext'
import { validateUsername, checkUsernameAvailability } from '@/utils/profileManagement'
import Link from 'next/link'
import Image from 'next/image'

interface FormErrors {
  name?: string
  username?: string
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

export default function SignupPage() {
  const router = useRouter()
  const { signUp, user } = useAuth()
  const [formData, setFormData] = useState({
    name: '',
    username: '',
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
  const [isCheckingUsername, setIsCheckingUsername] = useState(false)

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      router.push('/dashboard')
    }
  }, [user, router])

  // Password strength calculation
  const calculatePasswordStrength = (password: string): PasswordStrength => {
    let score = 0
    let feedback = ''
    let color = ''

    if (password.length >= 8) score += 1
    if (/[a-z]/.test(password)) score += 1
    if (/[A-Z]/.test(password)) score += 1
    if (/[0-9]/.test(password)) score += 1
    if (/[^A-Za-z0-9]/.test(password)) score += 1

    if (score <= 2) {
      feedback = 'Weak'
      color = 'text-red-500'
    } else if (score <= 3) {
      feedback = 'Fair'
      color = 'text-yellow-500'
    } else if (score <= 4) {
      feedback = 'Good'
      color = 'text-blue-500'
    } else {
      feedback = 'Strong'
      color = 'text-green-500'
    }

    return { score, feedback, color }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))

    // Clear specific error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }))
    }

    // Calculate password strength
    if (name === 'password') {
      setPasswordStrength(calculatePasswordStrength(value))
    }
  }

  const handleUsernameChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const username = e.target.value
    setFormData(prev => ({ ...prev, username }))
    
    // Clear previous errors
    if (errors.username) {
      setErrors(prev => ({ ...prev, username: undefined }))
    }
    
    if (!username) return
    
    // Validate username format
    const validation = validateUsername(username)
    if (!validation.valid) {
      setErrors(prev => ({ ...prev, username: validation.error }))
      return
    }
    
    // Check availability
    setIsCheckingUsername(true)
    try {
      const isAvailable = await checkUsernameAvailability(username, undefined)
      if (!isAvailable) {
        setErrors(prev => ({ ...prev, username: 'Username is already taken' }))
      }
    } catch (err: unknown) {
      setErrors(prev => ({ ...prev, username: 'Error checking username availability' }))
    } finally {
      setIsCheckingUsername(false)
    }
  }

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    }

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required'
    } else {
      const validation = validateUsername(formData.username)
      if (!validation.valid) {
        newErrors.username = validation.error
      }
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid'
    }

    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters'
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password'
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    if (!formData.termsAccepted) {
      newErrors.general = 'You must accept the terms and conditions'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setLoading(true)
    setErrors({})

    try {
      await signUp(formData.email, formData.password, formData.name, formData.username, formData.bio)
      setSuccess(true)
    } catch (error: unknown) {
      console.error('Signup error:', error)
      setErrors({
        general: error instanceof Error ? error.message : 'An error occurred during signup. Please try again.'
      })
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 text-center">
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <CheckIcon className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-green-800 mb-2">Account Created Successfully!</h2>
            <p className="text-green-700 mb-4">
              Your account has been created and is pending admin approval. You&apos;ll receive an email once your account is approved.
            </p>
            <Link
              href="/"
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              Return to Home
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <Link
            href="/"
            className="flex items-center text-blue-600 hover:text-blue-800 mb-4"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
          
          {/* Logo and Header */}
          <div className="text-center mb-6">
            <div className="flex items-center justify-center mb-4">
              <Image
                src="/Images/BIG Logo image.png"
                alt="BIG Logo"
                width={48}
                height={48}
                className="h-12 w-12"
              />
            </div>
            <h2 className="text-3xl font-bold text-gray-900">Join BIG</h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Create your account to join the community
            </p>
          </div>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
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

            {/* Username Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Username *
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleUsernameChange}
                required
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                  errors.username ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Choose a username"
              />
              {isCheckingUsername && (
                <p className="text-blue-600 text-sm mt-1">Checking availability...</p>
              )}
              {errors.username && (
                <p className="text-red-500 text-sm mt-1">{errors.username}</p>
              )}
              <p className="text-gray-500 text-sm mt-1">This will be your public username (e.g., @username)</p>
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
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
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
                  <div className="flex items-center">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${
                          passwordStrength.score <= 2 ? 'bg-red-500' :
                          passwordStrength.score <= 3 ? 'bg-yellow-500' :
                          passwordStrength.score <= 4 ? 'bg-blue-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                      />
                    </div>
                    <span className={`ml-2 text-sm font-medium ${passwordStrength.color}`}>
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
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
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
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="terms"
                  name="termsAccepted"
                  type="checkbox"
                  checked={formData.termsAccepted}
                  onChange={handleChange}
                  className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="terms" className="text-gray-700">
                  I agree to the{' '}
                  <a href="/terms" className="text-blue-600 hover:text-blue-800">
                    Terms and Conditions
                  </a>{' '}
                  and{' '}
                  <a href="/privacy" className="text-blue-600 hover:text-blue-800">
                    Privacy Policy
                  </a>
                </label>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {errors.general && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-600 text-sm">{errors.general}</p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || isCheckingUsername}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>

          {/* Login Link */}
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link href="/login" className="text-blue-600 hover:text-blue-800 font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}
