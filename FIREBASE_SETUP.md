# Firebase Setup Guide

## 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project"
3. Enter project name: `business-in-the-game` (or your preferred name)
4. Enable Google Analytics (optional)
5. Click "Create project"

## 2. Enable Authentication

1. In your Firebase project, go to "Authentication" in the left sidebar
2. Click "Get started"
3. Go to "Sign-in method" tab
4. Enable "Email/Password" provider
5. Click "Save"

## 3. Create Firestore Database

1. Go to "Firestore Database" in the left sidebar
2. Click "Create database"
3. Choose "Start in test mode" (we'll add security rules later)
4. Select a location (choose closest to your users)
5. Click "Done"

## 4. Get Configuration

1. Go to Project Settings (gear icon)
2. Scroll down to "Your apps" section
3. Click "Web" icon (`</>`)
4. Register app with name: `BIG Web App`
5. Copy the config object

## 5. Set Environment Variables

Create a `.env.local` file in your project root:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

## 6. Deploy to Vercel

1. Add environment variables in Vercel dashboard
2. Go to your project settings
3. Add each environment variable from step 5
4. Redeploy your project

## 7. Create First Admin User

After deployment, you'll need to manually create an admin user:

1. Go to Firestore Database
2. Create a new document in "users" collection
3. Use the UID from Authentication users
4. Set the document with:
   - `role: "admin"`
   - `status: "active"`
   - `name: "Admin User"`
   - `email: "admin@example.com"`
   - `createdAt: [current timestamp]`
   - `updatedAt: [current timestamp]`

## 8. Security Rules (Optional)

Add these Firestore security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      allow read: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```

## Testing

1. Visit your deployed site
2. Click "Membership" button
3. Create a test account
4. Check Firestore for the new user document
5. Approve the user from admin dashboard
6. User should be redirected to dashboard

## Troubleshooting

- Make sure all environment variables are set correctly
- Check Firebase console for any errors
- Verify Firestore rules allow read/write access
- Check browser console for authentication errors
