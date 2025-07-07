#!/bin/bash

# FuelGo Nigeria Vercel Deployment Script

echo "🚀 Starting FuelGo Nigeria deployment..."

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm run install:all

# Generate Prisma client
echo "🗄️ Generating Prisma client..."
npx prisma generate

# Build frontend
echo "🏗️ Building frontend..."
cd frontend
npm run build
cd ..

# Check if build was successful
if [ ! -d "frontend/build" ]; then
    echo "❌ Frontend build failed!"
    exit 1
fi

echo "✅ Build completed successfully!"

# Deploy to Vercel
echo "🚀 Deploying to Vercel..."
vercel --prod

echo "✅ Deployment completed!"
echo "🌐 Your app should be live at: https://your-app-name.vercel.app"
echo ""
echo "📝 Don't forget to:"
echo "   1. Set environment variables in Vercel dashboard"
echo "   2. Configure your domain (if needed)"
echo "   3. Test all API endpoints" 