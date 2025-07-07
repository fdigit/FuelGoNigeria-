# Deployment Fix Guide

## Issues Identified

The main issues causing the deployment problems are:

1. **Missing Serverless Functions**: The `api` directory was mostly empty, causing 404 errors for all API endpoints
2. **TypeScript Configuration**: Missing proper types for serverless functions
3. **Environment Variables**: Missing environment variables in Vercel deployment

## What Was Fixed

### 1. Created Missing Serverless Functions

- `api/vendor/index.ts` - Vendor listing endpoint
- `api/vendor/[vendorId]/index.ts` - Vendor detail endpoint  
- `api/auth/login.ts` - Authentication login
- `api/auth/register.ts` - User registration
- `api/auth/validate-token.ts` - Token validation
- `api/admin/vendors/index.ts` - Admin vendor management
- `api/health.ts` - Health check endpoint

### 2. Fixed TypeScript Configuration

- Created `api/types/api.ts` with proper types
- Created `api/db.ts` for database connection
- Updated all imports to use proper types

### 3. Environment Variables Required

You need to set these environment variables in your Vercel deployment:

```env
# Database
MONGODB_URI=your_mongodb_connection_string

# JWT Secret
JWT_SECRET=your_secure_jwt_secret

# Frontend API URL (should be your Vercel deployment URL)
REACT_APP_API_URL=https://your-app.vercel.app
```

## Deployment Steps

1. **Set Environment Variables in Vercel:**
   - Go to your Vercel dashboard
   - Select your project
   - Go to Settings > Environment Variables
   - Add the three variables above

2. **Deploy the Updated Code:**
   ```bash
   npm run deploy
   ```

3. **Test the API:**
   - Visit `https://your-app.vercel.app/api/health` to test if the API is working
   - Try loading vendors at `https://your-app.vercel.app/api/vendor`
   - Test authentication at `https://your-app.vercel.app/api/auth/login`

## Common Issues and Solutions

### 1. "Failed to load vendors" Error
- **Cause**: Missing serverless functions or database connection
- **Solution**: Ensure all API files are deployed and environment variables are set

### 2. "Cannot sign in" Error  
- **Cause**: Missing authentication endpoints or JWT secret
- **Solution**: Verify `/api/auth/login` endpoint exists and JWT_SECRET is set

### 3. CORS Errors
- **Cause**: Frontend trying to access API from different domain
- **Solution**: Update CORS origins in `api/middleware/cors.ts` to include your Vercel domain

### 4. Database Connection Errors
- **Cause**: Invalid MongoDB URI or network issues
- **Solution**: Verify MONGODB_URI is correct and accessible from Vercel

## Testing Locally

To test the serverless functions locally:

```bash
# Install Vercel CLI
npm i -g vercel

# Run locally
vercel dev
```

This will start the serverless functions locally for testing.

## Next Steps

After deploying:

1. Test all endpoints work correctly
2. Verify vendor loading works
3. Test user authentication
4. Check admin functionality
5. Monitor Vercel function logs for any errors

## Support

If you continue to have issues:

1. Check Vercel function logs in the dashboard
2. Verify all environment variables are set correctly
3. Test API endpoints individually using tools like Postman
4. Ensure your MongoDB database is accessible from Vercel's servers 