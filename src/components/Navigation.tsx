'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { Dialog } from '@headlessui/react'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'
import RegistrationModal from './auth/RegistrationModal'
import UserMenu from './user/UserMenu'

const navigation = [
  { name: 'Events', href: '/events' },
  { name: 'About', href: '/about' },
  { name: 'Newsroom', href: '/newsroom' },
  { name: 'Partner with BIG', href: '/partner' },
  { name: 'Live', href: '/live' },
  { name: 'Go Live', href: '/live/stream' },
]

export default function Navigation() {
  const { user, userProfile, isAdmin, isApproved } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(false)

  const canGoLive = user?.email === 'chizz@teambig.io' || isAdmin || userProfile?.role === 'super-admin'

  return (
    <header className="bg-blue-900">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" aria-label="Top">
        <div className="flex w-full items-center justify-between border-b border-blue-500 py-6">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <img
                className="h-10 w-auto"
                src="/Images/BIG Logo image.png"
                alt="BIG"
              />
            </Link>
          </div>
          <div className="ml-10 flex flex-1 items-center justify-between">
            <div className="hidden lg:flex lg:space-x-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-base font-medium text-white hover:text-blue-100"
                >
                  {item.name}
                </Link>
              ))}
            </div>
            <div className="ml-6 flex items-center space-x-4">
              {user ? (
                <div className="flex items-center space-x-4">
                  {canGoLive && (
                    <Link
                      href="/live/stream"
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-900 bg-white hover:bg-blue-50"
                    >
                      🎥 Go Live
                    </Link>
                  )}
                  <UserMenu />
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <Link
                    href="/signin"
                    className="text-base font-medium text-white hover:text-blue-100"
                  >
                    Sign In
                  </Link>
                  <button
                    onClick={() => setIsRegistrationOpen(true)}
                    className="inline-flex items-center px-4 py-2 border border-white text-sm font-medium rounded-md text-white hover:bg-blue-100 hover:text-blue-900"
                  >
                    Membership
                  </button>
                </div>
              )}
            </div>
          </div>
          <div className="ml-6 lg:hidden">
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-md p-2 text-white hover:bg-blue-100 hover:text-blue-900"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <span className="sr-only">Open menu</span>
              <Bars3Icon className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>
        </div>
        <Dialog as="div" className="lg:hidden" open={isMobileMenuOpen} onClose={setIsMobileMenuOpen}>
          <div className="fixed inset-0 z-50" />
          <Dialog.Panel className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-blue-900 px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-white/10">
            <div className="flex items-center justify-between">
              <Link href="/" className="-m-1.5 p-1.5">
                <span className="sr-only">BIG</span>
                <img
                  className="h-8 w-auto"
                  src="/Images/BIG Logo image.png"
                  alt="BIG"
                />
              </Link>
              <button
                type="button"
                className="-m-2.5 rounded-md p-2.5 text-white"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <span className="sr-only">Close menu</span>
                <XMarkIcon className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>
            <div className="mt-6 flow-root">
              <div className="-my-6 divide-y divide-blue-500/25">
                <div className="space-y-2 py-6">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-white hover:bg-blue-100 hover:text-blue-900"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
                <div className="py-6">
                  {user ? (
                    <div className="space-y-4">
                      {canGoLive && (
                        <Link
                          href="/live/stream"
                          className="block w-full text-center px-4 py-2 border border-white text-sm font-medium rounded-md text-white hover:bg-blue-100 hover:text-blue-900"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          🎥 Go Live
                        </Link>
                      )}
                      <UserMenu />
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <Link
                        href="/signin"
                        className="block text-center text-base font-medium text-white hover:text-blue-100"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Sign In
                      </Link>
                      <button
                        onClick={() => {
                          setIsRegistrationOpen(true)
                          setIsMobileMenuOpen(false)
                        }}
                        className="block w-full text-center px-4 py-2 border border-white text-sm font-medium rounded-md text-white hover:bg-blue-100 hover:text-blue-900"
                      >
                        Membership
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Dialog.Panel>
        </Dialog>
      </nav>
      <RegistrationModal
        isOpen={isRegistrationOpen}
        onClose={() => setIsRegistrationOpen(false)}
      />
    </header>
  )
}
