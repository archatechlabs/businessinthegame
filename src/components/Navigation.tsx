'use client'

import { useState } from 'react'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'

export default function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navigation = [
    { name: 'Events', href: '/events' },
    { name: 'About', href: '#about' },
    { name: 'Newsroom', href: '#newsroom' },
    { name: 'Partner with BIG', href: '#partner' },
  ]

  return (
    <nav className="bg-blue-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 justify-between items-center">
          {/* Logo - BIC with Business Inside the Game */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <div className="flex items-center space-x-3">
                  {/* BIC Logo placeholder - you'll add the actual logo later */}
                  <div className="w-12 h-12 bg-white rounded flex items-center justify-center">
                    <span className="text-blue-900 font-bold text-xl">BIC</span>
                  </div>
                  <div className="text-white">
                    <div className="text-sm font-medium">BUSINESS INSIDE THE GAME</div>
                  </div>
                </div>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-white hover:text-blue-200 px-3 py-2 text-sm font-medium transition-colors"
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Right side buttons */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            <Link
              href="/profile"
              className="text-white hover:text-blue-200 text-sm font-medium"
            >
              Profile
            </Link>
            <Link
              href="/tickets"
              className="text-white hover:text-blue-200 text-sm font-medium"
            >
              My Tickets
            </Link>
            <button className="bg-blue-900 border-2 border-white text-white px-6 py-2 text-sm font-medium hover:bg-blue-800 transition-colors">
              Membership
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              type="button"
              className="text-white hover:text-blue-200"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <span className="sr-only">Open main menu</span>
              {mobileMenuOpen ? (
                <XMarkIcon className="h-6 w-6" aria-hidden="true" />
              ) : (
                <Bars3Icon className="h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-blue-900">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-white hover:text-blue-200 block px-3 py-2 text-base font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            <div className="pt-4 space-y-2">
              <Link
                href="/profile"
                className="text-white hover:text-blue-200 block px-3 py-2 text-base font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Profile
              </Link>
              <Link
                href="/tickets"
                className="text-white hover:text-blue-200 block px-3 py-2 text-base font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                My Tickets
              </Link>
              <button className="w-full bg-blue-900 border-2 border-white text-white px-6 py-2 text-sm font-medium hover:bg-blue-800 transition-colors">
                Membership
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
