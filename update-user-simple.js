// Simple script to update user role using Firebase CLI
const { execSync } = require('child_process');
const fs = require('fs');

const userId = process.argv[2];

if (!userId) {
  console.error('Please provide a user ID as an argument');
  console.log('Usage: node update-user-simple.js <user-id>');
  process.exit(1);
}

// Create a temporary JSON file with the update data
const updateData = {
  role: 'super-admin',
  permissions: [
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
  status: 'active',
  updatedAt: new Date().toISOString()
};

// Write the update data to a temporary file
const tempFile = `temp-update-${userId}.json`;
fs.writeFileSync(tempFile, JSON.stringify(updateData, null, 2));

console.log(`Updating user ${userId} to super-admin...`);
console.log('Update data:', updateData);

try {
  // Use Firebase CLI to update the document
  const command = `firebase firestore:set /users/${userId} ${tempFile}`;
  console.log('Running command:', command);
  
  execSync(command, { stdio: 'inherit' });
  
  console.log('✅ Successfully updated user to super-admin!');
  
  // Clean up temporary file
  fs.unlinkSync(tempFile);
  
} catch (error) {
  console.error('❌ Error updating user:', error.message);
  
  // Clean up temporary file
  if (fs.existsSync(tempFile)) {
    fs.unlinkSync(tempFile);
  }
  
  process.exit(1);
}
