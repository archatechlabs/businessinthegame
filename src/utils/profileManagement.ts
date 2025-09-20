import { doc, updateDoc, getDoc, collection, query, where, getDocs, addDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { UserProfile } from '@/contexts/AuthContext'

// Check if username is available
export const checkUsernameAvailability = async (username: string, currentUserId?: string): Promise<boolean> => {
  try {
    const usersRef = collection(db, 'users')
    const q = query(usersRef, where('username', '==', username.toLowerCase()))
    const snapshot = await getDocs(q)
    
    // If no documents found, username is available
    if (snapshot.empty) return true
    
    // If current user is checking their own username, it's available
    if (currentUserId) {
      const userDoc = snapshot.docs.find(doc => doc.id === currentUserId)
      if (userDoc) return true
    }
    
    return false
  } catch (error) {
    console.error('Error checking username availability:', error)
    return false
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

// Get public profile by username
export const getPublicProfileByUsername = async (username: string): Promise<UserProfile | null> => {
  try {
    const usersRef = collection(db, 'users')
    const q = query(usersRef, where('username', '==', username.toLowerCase()))
    const snapshot = await getDocs(q)
    
    if (snapshot.empty) return null
    
    const userDoc = snapshot.docs[0]
    const data = userDoc.data()
    
    // Only return if profile is public
    if (!data.isPublic) return null
    
    return {
      ...data,
      createdAt: data.createdAt?.toDate(),
      updatedAt: data.updatedAt?.toDate(),
      lastLoginAt: data.lastLoginAt?.toDate()
    } as UserProfile
  } catch (error) {
    console.error('Error fetching public profile:', error)
    return null
  }
}

// Get public profile by user ID
export const getPublicProfileById = async (userId: string): Promise<UserProfile | null> => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId))
    if (!userDoc.exists()) return null
    
    const data = userDoc.data()
    
    // Only return if profile is public
    if (!data.isPublic) return null
    
    return {
      ...data,
      createdAt: data.createdAt?.toDate(),
      updatedAt: data.updatedAt?.toDate(),
      lastLoginAt: data.lastLoginAt?.toDate()
    } as UserProfile
  } catch (error) {
    console.error('Error fetching public profile:', error)
    return null
  }
}

// Search public profiles
export const searchPublicProfiles = async (
  searchTerm: string,
  limit: number = 20
): Promise<UserProfile[]> => {
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
      
      // Filter by search term (name, username, bio)
      const searchLower = searchTerm.toLowerCase()
      if (
        profile.name.toLowerCase().includes(searchLower) ||
        profile.username.toLowerCase().includes(searchLower) ||
        (profile.bio && profile.bio.toLowerCase().includes(searchLower))
      ) {
        profiles.push(profile)
      }
      
      if (profiles.length >= limit) break
    }
    
    return profiles
  } catch (error) {
    console.error('Error searching public profiles:', error)
    return []
  }
}

// Get featured public profiles
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
  type: 'avatar' | 'banner'
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

// Get profile statistics
export const getProfileStats = async (userId: string): Promise<{
  friendsCount: number
  eventsAttended: number
  postsCount: number
}> => {
  try {
    // Get friends count
    const friendsRef = collection(db, 'friends')
    const friendsQuery = query(friendsRef, where('userId1', '==', userId))
    const friendsSnapshot = await getDocs(friendsQuery)
    const friendsCount = friendsSnapshot.docs.length
    
    // Get events attended count (placeholder)
    const eventsAttended = 0
    
    // Get posts count (placeholder)
    const postsCount = 0
    
    return {
      friendsCount,
      eventsAttended,
      postsCount
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
