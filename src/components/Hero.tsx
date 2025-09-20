'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import RegistrationModal from '@/components/auth/RegistrationModal'

export default function Hero() {
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(false)
  const { user } = useAuth()
  const router = useRouter()

  const handleSignIn = async () => {
    if (user) {
      // User is already signed in, redirect to dashboard
      router.push('/dashboard')
    } else {
      // Open sign-in modal or redirect to sign-in page
      router.push('/signin')
    }
  }

  return (
    <div className="bg-white">
      {/* Hero Image Section - Full height with just the image */}
      <div className="relative h-screen w-full">
        <img
          src="/hero-image.webp"
          alt="BIG Center Stage Hero - Locker Room"
          className="w-full h-full object-cover object-center"
        />
      </div>

      {/* Text Section - Match exact reference styling */}
      <div className="bg-white py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            {/* Main heading - Match exact styling */}
            <h1 className="hero-text hero-text-medium text-blue-900 mb-4">
              THE COMMUNITY WHERE
            </h1>
            
            {/* Sub heading - Match exact styling */}
            <h2 className="hero-text hero-text-large text-blue-900 mb-16">
              MULTI—HYPHENATES CONNECT
            </h2>
            
            {/* CTA Buttons - Now includes both Sign In and Explore Membership */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button 
                onClick={handleSignIn}
                className="bg-blue-900 hover:bg-blue-800 text-white px-12 py-5 text-2xl font-bold rounded-lg transition-colors shadow-lg border-2 border-blue-900"
              >
                {user ? 'Go to Dashboard' : 'Sign In'}
              </button>
              
              <button 
                onClick={() => setIsRegistrationOpen(true)}
                className="bg-blue-300 hover:bg-blue-400 text-blue-900 px-12 py-5 text-2xl font-bold rounded-lg transition-colors shadow-lg border-2 border-blue-300"
              >
                Explore Membership
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Learn the game section - Dark blue background */}
      <div className="bg-blue-900 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 tracking-tight">
              LEARN THE GAME
            </h2>
            <h3 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-300 mb-8 tracking-tight">
              ON AND OFF THE FIELD
            </h3>
            
            <p className="text-lg md:text-xl text-white mb-8 max-w-4xl mx-auto">
              The membership community for athletes, entrepreneurs, creators, and investors. 
              Experience unparalleled networking through our curated events.
            </p>

            <button 
              onClick={() => setIsRegistrationOpen(true)}
              className="bg-white text-blue-900 px-8 py-4 text-lg font-semibold rounded-lg hover:bg-gray-100 transition-colors"
            >
              Our Vision
            </button>
          </div>
        </div>
      </div>

      {/* Registration Modal */}
      <RegistrationModal 
        isOpen={isRegistrationOpen} 
        onClose={() => setIsRegistrationOpen(false)} 
      />
    </div>
  )
}
