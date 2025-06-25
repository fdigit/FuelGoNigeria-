# FuelGo Nigeria - Serverless Setup Guide

This project has been converted to a full serverless architecture that can be deployed on Vercel while maintaining MongoDB as the database.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- MongoDB (local or Atlas)
- Vercel CLI

### Installation

1. **Install all dependencies:**
   ```bash
   npm run install:all
   ```

2. **Set up environment variables:**
   Create a `.env.local` file in the root directory:
   ```env
   # MongoDB Connection
   MONGODB_URI=mongodb://localhost:27017/fuelgo-nigeria
   
   # JWT Secret
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   
   # Frontend API URL (for development)
   REACT_APP_API_URL=http://localhost:3000
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```
   This will start both the frontend (port 3000) and backend (port 3001) concurrently.

## 🏗️ Architecture Changes

### What Changed
- **Express Server → Serverless Functions**: All API routes converted to Vercel serverless functions
- **Database Connection**: Optimized for serverless cold starts with connection pooling
- **File Uploads**: Moved to cloud storage (AWS S3/Cloudinary recommended for production)
- **CORS**: Updated to allow Vercel domains
- **Single Command**: `npm run dev` starts everything

### File Structure
```
├── api/                    # Serverless functions
│   ├── auth/              # Authentication endpoints
│   ├── admin/             # Admin management endpoints
│   ├── db.ts              # Database connection utility
│   └── middleware/        # Serverless middleware
├── frontend/              # React frontend (unchanged)
├── backend/               # Original Express code (for reference)
├── vercel.json           # Vercel configuration
└── package.json          # Root package with dev scripts
```

## 🔧 Development

### Available Scripts
- `npm run dev` - Start both frontend and backend
- `npm run dev:frontend` - Start only frontend
- `npm run dev:backend` - Start only backend (Vercel dev)
- `npm run build` - Build both frontend and backend
- `npm run deploy` - Deploy to Vercel

### API Endpoints
All API endpoints are now serverless functions:

- **Authentication**: `/api/auth/register`, `/api/auth/login`
- **Admin**: `/api/admin/vendors`, `/api/admin/vendors/[id]/verify`
- **Vendors**: `/api/vendor/*`

## 🚀 Deployment

### Vercel Deployment
1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Deploy:**
   ```bash
   npm run deploy
   ```

3. **Set Environment Variables in Vercel:**
   - `MONGODB_URI` - Your MongoDB Atlas connection string
   - `JWT_SECRET` - A secure JWT secret
   - `REACT_APP_API_URL` - Your Vercel deployment URL

### Environment Variables for Production
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/fuelgo-nigeria
JWT_SECRET=your-production-jwt-secret
REACT_APP_API_URL=https://your-app.vercel.app
```

## 📝 Database Setup

### MongoDB Atlas (Recommended for Production)
1. Create a MongoDB Atlas account
2. Create a new cluster
3. Get your connection string
4. Add it to your environment variables

### Local MongoDB
1. Install MongoDB locally
2. Start MongoDB service
3. Use `mongodb://localhost:27017/fuelgo-nigeria` as your URI

## 🔒 Security Considerations

### For Production
- Use MongoDB Atlas with proper authentication
- Set a strong JWT secret
- Configure proper CORS origins
- Use environment variables for all secrets
- Consider rate limiting for API endpoints

### File Uploads
For production, implement cloud storage:
- AWS S3
- Cloudinary
- Firebase Storage

## 🐛 Troubleshooting

### Common Issues
1. **Database Connection**: Ensure MongoDB is running and accessible
2. **CORS Errors**: Check that your frontend URL is in the allowed origins
3. **Environment Variables**: Verify all required variables are set
4. **Port Conflicts**: Ensure ports 3000 and 3001 are available

### Development Tips
- Use `vercel dev` for local serverless function testing
- Check Vercel function logs for debugging
- Use MongoDB Compass for database management

## 📚 Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [MongoDB Atlas](https://www.mongodb.com/atlas)
- [Serverless Functions Best Practices](https://vercel.com/docs/functions) 