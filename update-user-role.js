const { initializeApp } = require('firebase/app');
const { getFirestore, doc, updateDoc, getDoc } = require('firebase/firestore');

// Firebase configuration - you'll need to replace these with your actual config
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Super admin permissions
const SUPER_ADMIN_PERMISSIONS = [
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
];

async function updateUserToSuperAdmin(userId) {
  try {
    console.log(`Updating user ${userId} to super-admin...`);
    
    // First, check if the user exists
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) {
      console.error(`User with ID ${userId} not found in Firestore`);
      return;
    }
    
    const currentData = userSnap.data();
    console.log('Current user data:', {
      name: currentData.name,
      email: currentData.email,
      role: currentData.role,
      status: currentData.status
    });
    
    // Update the user to super-admin
    await updateDoc(userRef, {
      role: 'super-admin',
      permissions: SUPER_ADMIN_PERMISSIONS,
      status: 'active',
      updatedAt: new Date()
    });
    
    console.log('✅ Successfully updated user to super-admin!');
    console.log('New permissions:', SUPER_ADMIN_PERMISSIONS);
    
  } catch (error) {
    console.error('❌ Error updating user:', error);
    process.exit(1);
  }
}

// Get user ID from command line arguments
const userId = process.argv[2];

if (!userId) {
  console.error('Please provide a user ID as an argument');
  console.log('Usage: node update-user-role.js <user-id>');
  process.exit(1);
}

// Run the update
updateUserToSuperAdmin(userId);
