'use client'

import { useState } from 'react'
import { Dialog } from '@headlessui/react'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'
import { useAuth } from '@/contexts/AuthContext'
import RegistrationModal from './auth/RegistrationModal'
import UserMenu from './user/UserMenu'

const navigation = [
  { name: 'Events', href: '/events' },
  { name: 'About', href: '/about' },
  { name: 'Newsroom', href: '/newsroom' },
  { name: 'Partner with BIG', href: '/partner' },
]

export default function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(false)
  const { currentUser } = useAuth()

  return (
    <header className="bg-blue-900">
      <nav className="mx-auto flex max-w-7xl items-center justify-between p-6 lg:px-8" aria-label="Global">
        <div className="flex lg:flex-1">
          <a href="#" className="-m-1.5 p-1.5">
            <span className="sr-only">BIC</span>
            <div className="flex items-center">
              <div className="h-8 w-8 bg-white rounded flex items-center justify-center">
                <span className="text-blue-900 font-bold text-sm">BIC</span>
              </div>
              <span className="ml-2 text-white text-sm font-medium">BUSINESS INSIDE THE GAME</span>
            </div>
          </a>
        </div>
        <div className="flex lg:hidden">
          <button
            type="button"
            className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-white"
            onClick={() => setMobileMenuOpen(true)}
          >
            <span className="sr-only">Open main menu</span>
            <Bars3Icon className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>
        <div className="hidden lg:flex lg:gap-x-12">
          {navigation.map((item) => (
            <a key={item.name} href={item.href} className="text-sm font-semibold leading-6 text-white hover:text-blue-200">
              {item.name}
            </a>
          ))}
        </div>
        <div className="hidden lg:flex lg:flex-1 lg:justify-end lg:items-center lg:gap-4">
          {currentUser ? (
            <UserMenu />
          ) : (
            <button
              onClick={() => setIsRegistrationOpen(true)}
              className="rounded-md bg-transparent px-3.5 py-2 text-sm font-semibold text-white shadow-sm ring-1 ring-inset ring-white hover:bg-white hover:text-blue-900 transition-colors"
            >
              Membership
            </button>
          )}
        </div>
      </nav>
      <Dialog as="div" className="lg:hidden" open={mobileMenuOpen} onClose={setMobileMenuOpen}>
        <div className="fixed inset-0 z-10" />
        <Dialog.Panel className="fixed inset-y-0 right-0 z-10 w-full overflow-y-auto bg-blue-900 px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-white/10">
          <div className="flex items-center justify-between">
            <a href="#" className="-m-1.5 p-1.5">
              <span className="sr-only">BIC</span>
              <div className="flex items-center">
                <div className="h-8 w-8 bg-white rounded flex items-center justify-center">
                  <span className="text-blue-900 font-bold text-sm">BIC</span>
                </div>
                <span className="ml-2 text-white text-sm font-medium">BUSINESS INSIDE THE GAME</span>
              </div>
            </a>
            <button
              type="button"
              className="-m-2.5 rounded-md p-2.5 text-white"
              onClick={() => setMobileMenuOpen(false)}
            >
              <span className="sr-only">Close menu</span>
              <XMarkIcon className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>
          <div className="mt-6 flow-root">
            <div className="-my-6 divide-y divide-white/10">
              <div className="space-y-2 py-6">
                {navigation.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-white hover:bg-white/10"
                  >
                    {item.name}
                  </a>
                ))}
              </div>
              <div className="py-6">
                {currentUser ? (
                  <div className="space-y-2">
                    <div className="px-3 py-2">
                      <p className="text-sm text-white font-medium">{currentUser.displayName || 'User'}</p>
                      <p className="text-xs text-blue-200">{currentUser.email}</p>
                    </div>
                    <a
                      href="/profile"
                      className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-white hover:bg-white/10"
                    >
                      Profile
                    </a>
                    <a
                      href="/tickets"
                      className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-white hover:bg-white/10"
                    >
                      My Tickets
                    </a>
                    <a
                      href="/inbox"
                      className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-white hover:bg-white/10"
                    >
                      Inbox
                    </a>
                    <a
                      href="/friends"
                      className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-white hover:bg-white/10"
                    >
                      Friends
                    </a>
                    <a
                      href="/settings"
                      className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-white hover:bg-white/10"
                    >
                      Settings
                    </a>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setIsRegistrationOpen(true)
                      setMobileMenuOpen(false)
                    }}
                    className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-white hover:bg-white/10"
                  >
                    Membership
                  </button>
                )}
              </div>
            </div>
          </div>
        </Dialog.Panel>
      </Dialog>

      <RegistrationModal 
        isOpen={isRegistrationOpen} 
        onClose={() => setIsRegistrationOpen(false)} 
      />
    </header>
  )
}
