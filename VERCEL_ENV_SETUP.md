# Vercel Environment Variables Setup

## Required Environment Variables for Production

Add these environment variables in your Vercel dashboard:

### Firebase Configuration
```
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id
```

### Agora Live Streaming Configuration
```
NEXT_PUBLIC_AGORA_APP_ID=7ea6ebc7055441d59fcb828e039cc304
NEXT_PUBLIC_AGORA_APP_CERTIFICATE=4afaa715732f401ca726b5faed18d286
```

### Production Settings
```
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://businessinthegame.vercel.app
```

### Optional (if using)
```
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
DATABASE_URL=your_database_url
JWT_SECRET=your_jwt_secret_key
ENCRYPTION_KEY=your_encryption_key
```

## How to Add Environment Variables in Vercel

1. Go to your Vercel dashboard
2. Select your project: `businessinthegame`
3. Go to Settings → Environment Variables
4. Add each variable above
5. Make sure to set them for Production environment
6. Redeploy your project

## Critical Variables for Live Streaming

The most important variables for live streaming to work are:
- `NEXT_PUBLIC_AGORA_APP_ID=7ea6ebc7055441d59fcb828e039cc304`
- `NEXT_PUBLIC_AGORA_APP_CERTIFICATE=4afaa715732f401ca726b5faed18d286`

Without these, you'll get the "Agora App ID not configured" error.
