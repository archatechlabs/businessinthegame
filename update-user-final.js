const admin = require('firebase-admin');

// Initialize Firebase Admin with explicit project ID and use default credentials
admin.initializeApp({
  projectId: 'teambig-b6d15'
});

const db = admin.firestore();

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
    
    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();
    
    if (!userDoc.exists) {
      console.error(`User with ID ${userId} not found in Firestore`);
      return;
    }
    
    const currentData = userDoc.data();
    console.log('Current user data:', {
      name: currentData.name,
      email: currentData.email,
      role: currentData.role,
      status: currentData.status
    });
    
    // Update the user to super-admin
    await userRef.update({
      role: 'super-admin',
      permissions: SUPER_ADMIN_PERMISSIONS,
      status: 'active',
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    console.log('✅ Successfully updated user to super-admin!');
    console.log('New permissions:', SUPER_ADMIN_PERMISSIONS);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error updating user:', error);
    process.exit(1);
  }
}

// Get user ID from command line arguments
const userId = process.argv[2];

if (!userId) {
  console.error('Please provide a user ID as an argument');
  console.log('Usage: node update-user-final.js <user-id>');
  process.exit(1);
}

// Run the update
updateUserToSuperAdmin(userId);
