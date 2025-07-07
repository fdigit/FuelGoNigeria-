# Vercel Deployment Guide for FuelGo Nigeria

## Prerequisites
- Vercel account
- MongoDB Atlas database
- Environment variables configured

## Environment Variables Setup

Configure these environment variables in your Vercel project settings:

### Required Variables
```
DATABASE_URL=mongodb+srv://fmfonn:VStbtHxS8TT1Bex5@cluster0.ssoqdin.mongodb.net/fuelgo-nigeria?retryWrites=true&w=majority
JWT_SECRET=fuelgo-nigeria-jwt-secret-2024-super-secure-key-change-in-production
NODE_ENV=production
REACT_APP_API_URL=https://your-app-name.vercel.app/api
```

### Optional Variables
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
PAYSTACK_SECRET_KEY=your-paystack-secret-key
PAYSTACK_PUBLIC_KEY=your-paystack-public-key
```

## Deployment Steps

1. **Connect to Vercel**
   ```bash
   npm install -g vercel
   vercel login
   ```

2. **Deploy to Vercel**
   ```bash
   vercel --prod
   ```

3. **Configure Environment Variables**
   - Go to your Vercel dashboard
   - Select your project
   - Go to Settings > Environment Variables
   - Add all the required environment variables listed above

4. **Database Setup**
   - Ensure your MongoDB Atlas cluster is accessible from Vercel
   - Run database migrations if needed:
   ```bash
   npx prisma db push
   ```

## Project Structure

```
├── api/                    # Serverless API functions
│   ├── auth/              # Authentication endpoints
│   ├── vendor/            # Vendor management endpoints
│   ├── middleware/        # CORS and other middleware
│   └── types/             # TypeScript type definitions
├── frontend/              # React frontend application
│   ├── src/               # React source code
│   ├── public/            # Static assets
│   └── build/             # Production build output
├── vercel.json            # Vercel configuration
└── package.json           # Root package.json with build scripts
```

## Build Process

The deployment uses the following build process:

1. **Frontend Build**: React app is built using `npm run build` in the frontend directory
2. **API Build**: Prisma client is generated for database access
3. **Static Files**: Frontend build files are served as static assets
4. **API Routes**: Serverless functions handle API requests

## API Endpoints

- `GET /api/health` - Health check
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/validate-token` - Token validation
- `GET /api/vendor` - Vendor listing
- `POST /api/vendor` - Create vendor

## Troubleshooting

### Common Issues

1. **Database Connection Errors**
   - Ensure DATABASE_URL is correctly set
   - Check MongoDB Atlas network access settings
   - Verify database user permissions

2. **Build Failures**
   - Check that all dependencies are installed
   - Ensure TypeScript compilation passes
   - Verify Prisma schema is valid

3. **CORS Errors**
   - Verify CORS configuration in api/middleware/cors.ts
   - Check that your domain is in the allowed origins list

4. **Environment Variables**
   - Ensure all required variables are set in Vercel
   - Check variable names match exactly (case-sensitive)
   - Restart deployment after adding new variables

### Debug Commands

```bash
# Check build locally
npm run build

# Test API locally
vercel dev

# Check Prisma connection
npx prisma db push

# Generate Prisma client
npx prisma generate
```

## Security Notes

1. **JWT Secret**: Use a strong, unique JWT secret in production
2. **Database URL**: Ensure database credentials are secure
3. **CORS**: Only allow necessary origins
4. **Environment Variables**: Never commit sensitive data to version control

## Performance Optimization

1. **Database Indexing**: Ensure proper indexes on frequently queried fields
2. **Image Optimization**: Use Vercel's image optimization for product images
3. **Caching**: Implement appropriate caching strategies
4. **Bundle Size**: Monitor and optimize frontend bundle size 