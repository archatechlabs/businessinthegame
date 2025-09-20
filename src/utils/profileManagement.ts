import { 
  collection, 
  doc, 
  getDocs, 
  query, 
  where, 
  updateDoc, 
  addDoc 
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { UserProfile } from '@/contexts/AuthContext'

// Check if username is available
export const checkUsernameAvailability = async (username: string, currentUserId?: string): Promise<boolean> => {
  try {
    // Don't check empty usernames
    if (!username || username.trim() === '') return true
    
    // Check if Firebase is properly configured
    if (!db) {
      console.error('Firebase db is not initialized')
      return true // Allow username if Firebase is not configured
    }
    
    const usersRef = collection(db, 'users')
    const q = query(usersRef, where('username', '==', username.toLowerCase()))
    const snapshot = await getDocs(q)
    
    // If no documents found, username is available
    if (snapshot.empty) {
      return true
    }
    
    // If current user is checking their own username, it's available
    if (currentUserId) {
      const userDoc = snapshot.docs.find(doc => doc.id === currentUserId)
      if (userDoc) {
        return true
      }
    }
    
    return false
  } catch (error) {
    console.error('Error checking username availability:', error)
    // Return true to allow username if there's an error (fail open)
    return true
  }
}

// Update user profile
export const updateUserProfile = async (
  userId: string, 
  updates: Partial<UserProfile>
): Promise<void> => {
  try {
    const userRef = doc(db, 'users', userId)
    
    // If username is being updated, check availability
    if (updates.username) {
      const isAvailable = await checkUsernameAvailability(updates.username, userId)
      if (!isAvailable) {
        throw new Error('Username is already taken')
      }
      updates.username = updates.username.toLowerCase()
    }
    
    await updateDoc(userRef, {
      ...updates,
      updatedAt: new Date()
    })
  } catch (error) {
    console.error('Error updating user profile:', error)
    throw error
  }
}

// Get public profile by username - use API route to bypass client-side permissions
export const getPublicProfileByUsername = async (username: string): Promise<UserProfile | null> => {
  try {
    console.log('Fetching public profile via API for username:', username)
    
    const response = await fetch(`/api/profile/${encodeURIComponent(username)}`)
    
    if (!response.ok) {
      if (response.status === 404) {
        console.log('Profile not found for username:', username)
        return null
      }
      if (response.status === 403) {
        console.log('Profile is not public for username:', username)
        return null
      }
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const profile = await response.json()
    console.log('Profile fetched successfully via API:', profile.name)
    
    // Convert ISO strings back to Date objects for consistency
    return {
      ...profile,
      createdAt: new Date(profile.createdAt),
      updatedAt: new Date(profile.updatedAt),
      lastLoginAt: profile.lastLoginAt ? new Date(profile.lastLoginAt) : undefined
    } as UserProfile
    
  } catch (error) {
    console.error('Error fetching public profile via API:', error)
    return null
  }
}

// Get featured profiles for discovery
export const getFeaturedProfiles = async (limit: number = 10): Promise<UserProfile[]> => {
  try {
    const usersRef = collection(db, 'users')
    const q = query(usersRef, where('isPublic', '==', true))
    const snapshot = await getDocs(q)
    
    const profiles: UserProfile[] = []
    
    for (const docSnapshot of snapshot.docs) {
      const data = docSnapshot.data()
      const profile = {
        ...data,
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
        lastLoginAt: data.lastLoginAt?.toDate()
      } as UserProfile
      
      // Prioritize profiles with avatars and complete info
      if (profile.avatar && profile.bio) {
        profiles.push(profile)
      }
      
      if (profiles.length >= limit) break
    }
    
    return profiles
  } catch (error) {
    console.error('Error fetching featured profiles:', error)
    return []
  }
}

// Upload profile image (placeholder - would integrate with Firebase Storage)
export const uploadProfileImage = async (
  file: File,
  _type: 'avatar' | 'banner'
): Promise<string> => {
  // This is a placeholder implementation
  // In a real app, you would upload to Firebase Storage and return the download URL
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = () => {
      resolve(reader.result as string)
    }
    reader.readAsDataURL(file)
  })
}

// Validate username format
export const validateUsername = (username: string): { valid: boolean; error?: string } => {
  if (!username) {
    return { valid: false, error: 'Username is required' }
  }
  
  if (username.length < 3) {
    return { valid: false, error: 'Username must be at least 3 characters long' }
  }
  
  if (username.length > 20) {
    return { valid: false, error: 'Username must be less than 20 characters' }
  }
  
  if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
    return { valid: false, error: 'Username can only contain letters, numbers, hyphens, and underscores' }
  }
  
  if (username.startsWith('-') || username.endsWith('-')) {
    return { valid: false, error: 'Username cannot start or end with a hyphen' }
  }
  
  return { valid: true }
}

// Get profile statistics - return mock data for now to avoid Firebase permissions issues
export const getProfileStats = async (userId: string): Promise<{
  friendsCount: number
  eventsAttended: number
  postsCount: number
}> => {
  try {
    // Return mock stats for now to avoid Firebase permissions issues
    // In a real app, you would query the appropriate collections
    return {
      friendsCount: 42,
      eventsAttended: 8,
      postsCount: 15
    }
  } catch (error) {
    console.error('Error fetching profile stats:', error)
    return {
      friendsCount: 0,
      eventsAttended: 0,
      postsCount: 0
    }
  }
}
