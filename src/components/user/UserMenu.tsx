'use client'

import { Fragment } from 'react'
import { Menu, Transition } from '@headlessui/react'
import { 
  UserIcon, 
  TicketIcon, 
  ChatBubbleLeftRightIcon,
  UserPlusIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}

export default function UserMenu() {
  const { currentUser, logout } = useAuth()
  const router = useRouter()

  const handleLogout = async () => {
    await logout()
    router.push('/')
  }

  const menuItems = [
    {
      name: 'Profile',
      href: '/profile',
      icon: UserIcon,
      description: 'Edit your profile information'
    },
    {
      name: 'My Tickets',
      href: '/tickets',
      icon: TicketIcon,
      description: 'View your event tickets'
    },
    {
      name: 'Inbox',
      href: '/inbox',
      icon: ChatBubbleLeftRightIcon,
      description: 'Messages and notifications'
    },
    {
      name: 'Friends',
      href: '/friends',
      icon: UserPlusIcon,
      description: 'Manage connections'
    },
    {
      name: 'Settings',
      href: '/settings',
      icon: Cog6ToothIcon,
      description: 'Account preferences'
    }
  ]

  if (!currentUser) return null

  return (
    <Menu as="div" className="relative ml-3">
      <div>
        <Menu.Button className="flex max-w-xs items-center rounded-full bg-blue-900 text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-900">
          <span className="sr-only">Open user menu</span>
          <div className="h-8 w-8 rounded-full bg-blue-700 flex items-center justify-center">
            <span className="text-white font-medium text-sm">
              {currentUser.displayName?.charAt(0) || currentUser.email?.charAt(0) || 'U'}
            </span>
          </div>
        </Menu.Button>
      </div>
      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 z-10 mt-2 w-80 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          {/* User Info Header */}
          <div className="px-4 py-3 border-b border-gray-200">
            <p className="text-sm font-medium text-gray-900">
              {currentUser.displayName || 'User'}
            </p>
            <p className="text-sm text-gray-500 truncate">
              {currentUser.email}
            </p>
          </div>

          {/* Menu Items */}
          {menuItems.map((item) => (
            <Menu.Item key={item.name}>
              {({ active }) => (
                <button
                  onClick={() => router.push(item.href)}
                  className={classNames(
                    active ? 'bg-gray-100' : '',
                    'flex w-full items-center px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-100'
                  )}
                >
                  <item.icon className="mr-3 h-5 w-5 text-gray-400" />
                  <div>
                    <div className="font-medium">{item.name}</div>
                    <div className="text-xs text-gray-500">{item.description}</div>
                  </div>
                </button>
              )}
            </Menu.Item>
          ))}

          {/* Logout */}
          <Menu.Item>
            {({ active }) => (
              <button
                onClick={handleLogout}
                className={classNames(
                  active ? 'bg-gray-100' : '',
                  'flex w-full items-center px-4 py-3 text-left text-sm text-red-600 hover:bg-gray-100'
                )}
              >
                <ArrowRightOnRectangleIcon className="mr-3 h-5 w-5" />
                <div>
                  <div className="font-medium">Sign out</div>
                  <div className="text-xs text-gray-500">End your session</div>
                </div>
              </button>
            )}
          </Menu.Item>
        </Menu.Items>
      </Transition>
    </Menu>
  )
}
