#!/bin/bash

echo "🚀 Setting up Vercel Environment Variables for Live Streaming"
echo "=============================================================="
echo ""

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

echo "📋 Environment variables to add to Vercel:"
echo ""
echo "NEXT_PUBLIC_AGORA_APP_ID=7ea6ebc7055441d59fcb828e039cc304"
echo "NEXT_PUBLIC_AGORA_APP_CERTIFICATE=4afaa715732f401ca726b5faed18d286"
echo ""

echo "🔧 To add these variables:"
echo "1. Run: vercel env add NEXT_PUBLIC_AGORA_APP_ID"
echo "2. Enter: 7ea6ebc7055441d59fcb828e039cc304"
echo "3. Select: Production"
echo ""
echo "4. Run: vercel env add NEXT_PUBLIC_AGORA_APP_CERTIFICATE"
echo "5. Enter: 4afaa715732f401ca726b5faed18d286"
echo "6. Select: Production"
echo ""
echo "7. Run: vercel --prod to redeploy"
echo ""

read -p "Do you want to add these variables now? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Adding NEXT_PUBLIC_AGORA_APP_ID..."
    vercel env add NEXT_PUBLIC_AGORA_APP_ID
    echo "Adding NEXT_PUBLIC_AGORA_APP_CERTIFICATE..."
    vercel env add NEXT_PUBLIC_AGORA_APP_CERTIFICATE
    echo "✅ Environment variables added!"
    echo "🚀 Redeploying to production..."
    vercel --prod
else
    echo "📝 Please add the environment variables manually in Vercel dashboard"
fi
