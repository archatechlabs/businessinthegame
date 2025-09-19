import { doc, updateDoc, getDoc, collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { UserRole, UserTier } from '@/contexts/AuthContext'

export interface UserManagementData {
  uid: string
  email: string
  name: string
  role: UserRole
  tier: UserTier
  status: 'active' | 'inactive' | 'suspended' | 'pending'
  permissions: string[]
  createdAt: Date
  updatedAt: Date
  lastLoginAt?: Date
}

// Role hierarchy for validation
const ROLE_HIERARCHY: Record<UserRole, number> = {
  'super-admin': 4,
  'admin': 3,
  'moderator': 2,
  'user': 1
}

// Available user tiers
export const AVAILABLE_TIERS: UserTier[] = [
  'non-member',
  'member',
  'premium',
  'vip',
  'founder'
]

// Available roles
export const AVAILABLE_ROLES: UserRole[] = [
  'user',
  'moderator',
  'admin',
  'super-admin'
]

// Get all users (admin only)
export const getAllUsers = async (): Promise<UserManagementData[]> => {
  try {
    const usersRef = collection(db, 'users')
    const snapshot = await getDocs(usersRef)
    
    return snapshot.docs.map(doc => ({
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
      lastLoginAt: doc.data().lastLoginAt?.toDate()
    })) as UserManagementData[]
  } catch (error) {
    console.error('Error fetching users:', error)
    throw error
  }
}

// Get user by ID
export const getUserById = async (uid: string): Promise<UserManagementData | null> => {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid))
    if (userDoc.exists()) {
      const data = userDoc.data()
      return {
        ...data,
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
        lastLoginAt: data.lastLoginAt?.toDate()
      } as UserManagementData
    }
    return null
  } catch (error) {
    console.error('Error fetching user:', error)
    throw error
  }
}

// Update user role
export const updateUserRole = async (
  uid: string, 
  newRole: UserRole, 
  updatedBy: string
): Promise<void> => {
  try {
    const userRef = doc(db, 'users', uid)
    await updateDoc(userRef, {
      role: newRole,
      permissions: getRolePermissions(newRole),
      updatedAt: new Date(),
      updatedBy
    })
  } catch (error) {
    console.error('Error updating user role:', error)
    throw error
  }
}

// Update user tier
export const updateUserTier = async (
  uid: string, 
  newTier: UserTier, 
  updatedBy: string
): Promise<void> => {
  try {
    const userRef = doc(db, 'users', uid)
    await updateDoc(userRef, {
      tier: newTier,
      updatedAt: new Date(),
      updatedBy
    })
  } catch (error) {
    console.error('Error updating user tier:', error)
    throw error
  }
}

// Update user status
export const updateUserStatus = async (
  uid: string, 
  newStatus: 'active' | 'inactive' | 'suspended' | 'pending',
  updatedBy: string
): Promise<void> => {
  try {
    const userRef = doc(db, 'users', uid)
    await updateDoc(userRef, {
      status: newStatus,
      updatedAt: new Date(),
      updatedBy
    })
  } catch (error) {
    console.error('Error updating user status:', error)
    throw error
  }
}

// Check if user can modify another user
export const canModifyUser = (
  currentUserRole: UserRole,
  targetUserRole: UserRole
): boolean => {
  return ROLE_HIERARCHY[currentUserRole] > ROLE_HIERARCHY[targetUserRole]
}

// Get permissions for a role
export const getRolePermissions = (role: UserRole): string[] => {
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
  
  return ROLE_PERMISSIONS[role]
}

// Bulk update users
export const bulkUpdateUsers = async (
  updates: Array<{
    uid: string
    role?: UserRole
    tier?: UserTier
    status?: 'active' | 'inactive' | 'suspended' | 'pending'
  }>,
  updatedBy: string
): Promise<void> => {
  try {
    const updatePromises = updates.map(async (update) => {
      const userRef = doc(db, 'users', update.uid)
      const updateData: Record<string, unknown> = {
        updatedAt: new Date(),
        updatedBy
      }
      
      if (update.role) {
        updateData.role = update.role
        updateData.permissions = getRolePermissions(update.role)
      }
      
      if (update.tier) {
        updateData.tier = update.tier
      }
      
      if (update.status) {
        updateData.status = update.status
      }
      
      return updateDoc(userRef, updateData)
    })
    
    await Promise.all(updatePromises)
  } catch (error) {
    console.error('Error bulk updating users:', error)
    throw error
  }
}

// Get users by role
export const getUsersByRole = async (role: UserRole): Promise<UserManagementData[]> => {
  try {
    const usersRef = collection(db, 'users')
    const q = query(usersRef, where('role', '==', role))
    const snapshot = await getDocs(q)
    
    return snapshot.docs.map(doc => ({
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
      lastLoginAt: doc.data().lastLoginAt?.toDate()
    })) as UserManagementData[]
  } catch (error) {
    console.error('Error fetching users by role:', error)
    throw error
  }
}

// Get users by tier
export const getUsersByTier = async (tier: UserTier): Promise<UserManagementData[]> => {
  try {
    const usersRef = collection(db, 'users')
    const q = query(usersRef, where('tier', '==', tier))
    const snapshot = await getDocs(q)
    
    return snapshot.docs.map(doc => ({
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
      lastLoginAt: doc.data().lastLoginAt?.toDate()
    })) as UserManagementData[]
  } catch (error) {
    console.error('Error fetching users by tier:', error)
    throw error
  }
}
