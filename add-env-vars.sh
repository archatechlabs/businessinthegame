#!/bin/bash

echo "Adding Firebase environment variables to Vercel..."

# Add each environment variable
echo "teambig-b6d15.firebaseapp.com" | npx vercel env add NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN --stdin
echo "teambig-b6d15" | npx vercel env add NEXT_PUBLIC_FIREBASE_PROJECT_ID --stdin
echo "teambig-b6d15.firebasestorage.app" | npx vercel env add NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET --stdin
echo "690178064505" | npx vercel env add NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID --stdin
echo "1:690178064505:web:3bbc82827d20c04586d4a8" | npx vercel env add NEXT_PUBLIC_FIREBASE_APP_ID --stdin

echo "All environment variables added!"
