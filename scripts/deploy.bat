@echo off
REM FuelGo Nigeria Vercel Deployment Script for Windows

echo 🚀 Starting FuelGo Nigeria deployment...

REM Check if Vercel CLI is installed
vercel --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Vercel CLI not found. Installing...
    npm install -g vercel
)

REM Install dependencies
echo 📦 Installing dependencies...
call npm run install:all

REM Generate Prisma client
echo 🗄️ Generating Prisma client...
call npx prisma generate

REM Build frontend
echo 🏗️ Building frontend...
cd frontend
call npm run build
cd ..

REM Check if build was successful
if not exist "frontend\build" (
    echo ❌ Frontend build failed!
    exit /b 1
)

echo ✅ Build completed successfully!

REM Deploy to Vercel
echo 🚀 Deploying to Vercel...
call vercel --prod

echo ✅ Deployment completed!
echo 🌐 Your app should be live at: https://your-app-name.vercel.app
echo.
echo 📝 Don't forget to:
echo    1. Set environment variables in Vercel dashboard
echo    2. Configure your domain (if needed)
echo    3. Test all API endpoints

pause 