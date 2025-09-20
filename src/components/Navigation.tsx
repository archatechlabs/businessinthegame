'use client'

import { useState } from 'react'
import { Dialog } from '@headlessui/react'
import { Bars3Icon, XMarkIcon, VideoCameraIcon } from '@heroicons/react/24/outline'
import { useAuth } from '@/contexts/AuthContext'
import RegistrationModal from './auth/RegistrationModal'
import UserMenu from './user/UserMenu'
import Image from 'next/image'
import Link from 'next/link'

const navigation = [
  { name: 'Events', href: '/events' },
  { name: 'Live', href: '/live' },
  { name: 'About', href: '/about' },
  { name: 'Newsroom', href: '/newsroom' },
  { name: 'Partner with BIG', href: '/partner' },
]

export default function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(false)
  const { user } = useAuth()

  return (
    <header className="bg-blue-900">
      <nav className="mx-auto flex max-w-7xl items-center justify-between p-6 lg:px-8" aria-label="Global">
        <div className="flex lg:flex-1">
          <Link href="/" className="-m-1.5 p-1.5">
            <span className="sr-only">BIG</span>
            <div className="flex items-center">
              <Image
                src="/Images/BIG Logo image.png"
                alt="BIG Logo"
                width={32}
                height={32}
                className="h-8 w-8"
              />
              <span className="ml-2 text-white text-sm font-medium">BUSINESS INSIDE THE GAME</span>
            </div>
          </Link>
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
            <Link
              key={item.name}
              href={item.href}
              className="text-sm font-semibold leading-6 text-white hover:text-blue-300"
            >
              {item.name === 'Live' && <VideoCameraIcon className="h-4 w-4 inline mr-1" />}
              {item.name}
            </Link>
          ))}
        </div>
        <div className="hidden lg:flex lg:flex-1 lg:justify-end">
          {user ? (
            <UserMenu />
          ) : (
            <button
              onClick={() => setIsRegistrationOpen(true)}
              className="text-sm font-semibold leading-6 text-white border border-white px-4 py-2 rounded-md hover:bg-white hover:text-blue-900 transition-colors"
            >
              Membership
            </button>
          )}
        </div>
      </nav>
      <Dialog as="div" className="lg:hidden" open={mobileMenuOpen} onClose={setMobileMenuOpen}>
        <div className="fixed inset-0 z-50" />
        <Dialog.Panel className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-blue-900 px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-white/10">
          <div className="flex items-center justify-between">
            <Link href="/" className="-m-1.5 p-1.5">
              <span className="sr-only">BIG</span>
              <div className="flex items-center">
                <Image
                  src="/Images/BIG Logo image.png"
                  alt="BIG Logo"
                  width={32}
                  height={32}
                  className="h-8 w-8"
                />
                <span className="ml-2 text-white text-sm font-medium">BUSINESS INSIDE THE GAME</span>
              </div>
            </Link>
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
            <div className="-my-6 divide-y divide-white/25">
              <div className="space-y-2 py-6">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-white hover:bg-white/10"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.name === 'Live' && <VideoCameraIcon className="h-4 w-4 inline mr-2" />}
                    {item.name}
                  </Link>
                ))}
              </div>
              <div className="py-6">
                {user ? (
                  <UserMenu />
                ) : (
                  <button
                    onClick={() => {
                      setIsRegistrationOpen(true)
                      setMobileMenuOpen(false)
                    }}
                    className="w-full text-left rounded-lg px-3 py-2 text-base font-semibold leading-7 text-white border border-white hover:bg-white hover:text-blue-900 transition-colors"
                  >
                    Membership
                  </button>
                )}
              </div>
            </div>
          </div>
        </Dialog.Panel>
      </Dialog>

      {/* Registration Modal */}
      <RegistrationModal 
        isOpen={isRegistrationOpen} 
        onClose={() => setIsRegistrationOpen(false)} 
      />
    </header>
  )
}
