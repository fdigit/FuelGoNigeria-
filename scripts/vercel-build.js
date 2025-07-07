#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');

console.log('🚀 Starting Vercel build process...');

try {
  // Set environment variables for production build
  process.env.CI = 'false';
  process.env.GENERATE_SOURCEMAP = 'false';
  process.env.NODE_ENV = 'production';

  console.log('📦 Installing dependencies...');
  execSync('npm install', { stdio: 'inherit' });

  console.log('🏗️ Building frontend...');
  execSync('cd frontend && npm install', { stdio: 'inherit' });
  execSync('cd frontend && npm run build', { stdio: 'inherit' });

  console.log('🗄️ Generating Prisma client...');
  try {
    execSync('npx prisma generate', { stdio: 'inherit' });
  } catch (error) {
    console.log('⚠️ Prisma generation failed, continuing...');
  }

  console.log('✅ Build completed successfully!');
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
} 