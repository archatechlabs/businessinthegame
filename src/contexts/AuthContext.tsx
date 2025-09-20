'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { 
  User, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth'
import { doc, setDoc, getDoc } from 'firebase/firestore'
import { auth, db } from '@/lib/firebase'

// Define user tiers that can be dynamically managed
export type UserTier = 'member' | 'non-member' | 'premium' | 'vip' | 'founder'

// Define role hierarchy
export type UserRole = 'super-admin' | 'admin' | 'moderator' | 'user'

export interface UserProfile {
  uid: string
  email: string
  name: string
  username: string // New: unique username
  bio?: string
  avatar?: string // Profile picture URL
  banner?: string // Banner image URL
  location?: string
  website?: string
  socialLinks?: {
    twitter?: string
    linkedin?: string
    instagram?: string
    github?: string
  }
  role: UserRole
  tier: UserTier
  status: 'active' | 'inactive' | 'suspended' | 'pending'
  permissions: string[]
  isPublic: boolean // New: public profile setting
  createdAt: Date
  updatedAt: Date
  lastLoginAt?: Date
  createdBy?: string // For tracking who created the account
}

interface AuthContextType {
  user: User | null
  userProfile: UserProfile | null
  loading: boolean
  signUp: (email: string, password: string, name: string, username: string, bio?: string) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  
  // Role checks
  isSuperAdmin: boolean
  isAdmin: boolean
  isModerator: boolean
  isUser: boolean
  
  // Status checks
  isApproved: boolean
  isActive: boolean
  isPending: boolean
  
  // Permission checks
  hasPermission: (permission: string) => boolean
  canManageUsers: boolean
  canModerateContent: boolean
  canAccessAdminPanel: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Define permissions for each role
const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  'super-admin': [
    'manage_users',
    'manage_roles',
    'manage_tiers',
    'manage_system',
    'access_admin_panel',
    'moderate_content',
    'manage_events',
    'view_analytics',
    'manage_billing',
    'system_settings'
  ],
  'admin': [
    'manage_users',
    'access_admin_panel',
    'moderate_content',
    'manage_events',
    'view_analytics',
    'manage_billing'
  ],
  'moderator': [
    'moderate_content',
    'manage_events',
    'view_analytics'
  ],
  'user': [
    'view_content',
    'create_content',
    'manage_own_profile'
  ]
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if Firebase is properly configured
    if (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY || process.env.NEXT_PUBLIC_FIREBASE_API_KEY === 'demo-key') {
      setLoading(false)
      return
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user)
      
      if (user) {
        // Fetch user profile from Firestore
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid))
          if (userDoc.exists()) {
            const profileData = userDoc.data()
            setUserProfile({
              ...profileData,
              createdAt: profileData.createdAt?.toDate(),
              updatedAt: profileData.updatedAt?.toDate(),
              lastLoginAt: profileData.lastLoginAt?.toDate()
            } as UserProfile)
            
            // Update last login time
            await setDoc(doc(db, 'users', user.uid), {
              lastLoginAt: new Date()
            }, { merge: true })
          }
        } catch (error) {
          console.error('Error fetching user profile:', error)
        }
      } else {
        setUserProfile(null)
      }
      
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const signUp = async (email: string, password: string, name: string, username: string, bio?: string) => {
    if (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY || process.env.NEXT_PUBLIC_FIREBASE_API_KEY === 'demo-key') {
      throw new Error('Firebase not configured. Please set up your Firebase credentials.')
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const user = userCredential.user

      // Create user profile in Firestore with pending approval
      const userProfile: UserProfile = {
        uid: user.uid,
        email: user.email!,
        name,
        username,
        bio,
        role: 'user',
        tier: 'non-member',
        status: 'pending',
        permissions: ROLE_PERMISSIONS.user,
        isPublic: true, // Default to public profile
        createdAt: new Date(),
        updatedAt: new Date()
      }

      await setDoc(doc(db, 'users', user.uid), {
        ...userProfile,
        createdAt: new Date(),
        updatedAt: new Date()
      })

      setUserProfile(userProfile)
    } catch (error) {
      console.error('Error creating user:', error)
      throw error
    }
  }

  const signIn = async (email: string, password: string) => {
    if (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY || process.env.NEXT_PUBLIC_FIREBASE_API_KEY === 'demo-key') {
      throw new Error('Firebase not configured. Please set up your Firebase credentials.')
    }

    try {
      await signInWithEmailAndPassword(auth, email, password)
    } catch (error) {
      console.error('Error signing in:', error)
      throw error
    }
  }

  const logout = async () => {
    if (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY || process.env.NEXT_PUBLIC_FIREBASE_API_KEY === 'demo-key') {
      setUser(null)
      setUserProfile(null)
      return
    }

    try {
      await signOut(auth)
      setUserProfile(null)
    } catch (error) {
      console.error('Error signing out:', error)
      throw error
    }
  }

  // Role checks
  const isSuperAdmin = userProfile?.role === 'super-admin'
  const isAdmin = userProfile?.role === 'admin' || isSuperAdmin
  const isModerator = userProfile?.role === 'moderator' || isAdmin
  const isUser = userProfile?.role === 'user' || isModerator

  // Status checks
  const isApproved = userProfile?.status === 'active'
  const isActive = userProfile?.status === 'active'
  const isPending = userProfile?.status === 'pending'

  // Permission checks
  const hasPermission = (permission: string): boolean => {
    if (!userProfile) return false
    return userProfile.permissions.includes(permission)
  }

  const canManageUsers = hasPermission('manage_users')
  const canModerateContent = hasPermission('moderate_content')
  const canAccessAdminPanel = hasPermission('access_admin_panel')

  const value = {
    user,
    userProfile,
    loading,
    signUp,
    signIn,
    logout,
    isSuperAdmin,
    isAdmin,
    isModerator,
    isUser,
    isApproved,
    isActive,
    isPending,
    hasPermission,
    canManageUsers,
    canModerateContent,
    canAccessAdminPanel
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
