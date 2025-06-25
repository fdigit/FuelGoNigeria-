# AUTH FIXES

- **Problem**: Conflicting authentication systems using both Prisma (dev-server.js) and Mongoose (backend/src)
- **Fix**: Standardized on **Prisma-based authentication** in `dev-server.js`. All Mongoose-based authentication, models, and routes have been removed. The only supported authentication and user management system is now Prisma-based and handled in `dev-server.js`.

## Current Auth System
- **Backend**: Prisma + Express (see `dev-server.js`)
- **Frontend**: Uses `/api/auth/login` and `/api/auth/register` endpoints on the backend (port 3001)
- **Database**: MongoDB Atlas via Prisma

## Removed/Deprecated
- All Mongoose models, controllers, and routes
- All Next.js API routes for authentication
- All scripts and configs referencing Mongoose or old models

## Migration Notes
- If you need to migrate any custom business logic from the old system, copy it into the Prisma-based logic in `dev-server.js`.
- All user, vendor, and admin management should now be done via Prisma and the new API endpoints.

## Testing
- Use the seeded test accounts for login:
  - Admin: `admin@fuelgo.com` / `admin123`
  - Customer: `john@example.com` / `customer123`
  - Vendor: `mike@quickfuel.com` / `vendor123`

## Troubleshooting
- If you see any errors about missing models or controllers, make sure you are not referencing any old Mongoose code.
- The only supported backend is the one running on port 3001 with Prisma.

## Issues Identified and Fixed

### 1. **Multiple Authentication Systems**
- **Problem**: Conflicting authentication systems using both Prisma (dev-server.js) and Mongoose (backend/src)
- **Fix**: Standardized on **Prisma-based authentication** in `dev-server.js`. All Mongoose-based authentication, models, and routes have been removed. The only supported authentication and user management system is now Prisma-based and handled in `dev-server.js`.

### 2. **Inconsistent API Endpoints**
- **Problem**: Frontend calling `/api/auth/login` but backend expecting `/auth/login`
- **Fix**: Updated frontend to use correct endpoints: `/auth/login` and `/auth/register`

### 3. **Password Hashing Inconsistency**
- **Problem**: Different password hashing approaches in different files
- **Fix**: Standardized password hashing using bcrypt with salt rounds of 10

### 4. **Field Mapping Issues**
- **Problem**: Inconsistent field names between frontend and backend (phone vs phoneNumber)
- **Fix**: Updated backend to properly map `phone` field from frontend to `phoneNumber` in database

### 5. **Missing Environment Variables**
- **Problem**: JWT_SECRET not properly configured
- **Fix**: Added fallback JWT_SECRET and validation in database configuration

### 6. **CORS Configuration**
- **Problem**: Potential CORS issues between frontend and backend
- **Fix**: Updated CORS configuration to include all necessary origins and headers

## Setup Instructions

### 1. Environment Configuration

Create a `.env` file in the `backend` directory:

```env
# Database Configuration
DATABASE_URL="mongodb://localhost:27017/fuelgo_nigeria"

# JWT Configuration
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRES_IN="7d"

# Server Configuration
PORT=5000
NODE_ENV=development
```

### 2. Database Setup

Ensure MongoDB is running locally or update the DATABASE_URL to point to your MongoDB instance.

### 3. Install Dependencies

```bash
# Backend dependencies
cd backend
npm install

# Frontend dependencies
cd ../frontend
npm install
```

### 4. Test Authentication System

```bash
# Test the authentication system
cd backend
npm run test-auth
```

### 5. Start Development Servers

```bash
# Start both frontend and backend
npm run dev
```

## API Endpoints

### Authentication Endpoints

- **POST** `/api/auth/register` - User registration
- **POST** `/api/auth/login` - User login
- **GET** `/api/auth/validate` - Validate JWT token
- **POST** `/api/auth/change-password` - Change password (authenticated)

### Request/Response Examples

#### Registration
```json
POST /api/auth/register
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "12345678901",
  "role": "customer"
}
```

#### Login
```json
POST /api/auth/login
{
  "email": "john@example.com",
  "password": "password123"
}
```

## User Roles and Status

### Roles
- `customer` - Regular customers
- `driver` - Delivery drivers
- `vendor` - Fuel vendors
- `admin` - Platform administrators
- `super_admin` - Super administrators

### Status
- `pending` - Awaiting admin approval
- `active` - Approved and active
- `rejected` - Rejected by admin
- `suspended` - Temporarily suspended

## Security Features

1. **Password Hashing**: All passwords are hashed using bcrypt with salt rounds of 10
2. **JWT Tokens**: Secure JWT tokens for authentication
3. **Rate Limiting**: API rate limiting to prevent abuse
4. **CORS Protection**: Proper CORS configuration
5. **Input Validation**: Comprehensive input validation
6. **Error Handling**: Secure error handling without exposing sensitive information

## Testing

Run the authentication test to verify everything is working:

```bash
cd backend
npm run test-auth
```

This will:
- Connect to the database
- Create a test user
- Test password verification
- Test JWT token generation
- Verify user status and role

## Troubleshooting

### Common Issues

1. **"JWT_SECRET is not defined"**
   - Ensure JWT_SECRET is set in your .env file
   - The system will use a fallback secret for development

2. **"Invalid credentials"**
   - Check if the user exists in the database
   - Verify the password is correct
   - Check if the account status is 'active'

3. **"Account pending approval"**
   - New accounts require admin approval
   - Use admin panel to approve users

4. **CORS errors**
   - Ensure the frontend URL is included in CORS origins
   - Check that the API URL is correctly configured

### Debug Mode

Enable debug logging by setting `NODE_ENV=development` in your .env file.

## Production Considerations

1. **Change JWT_SECRET**: Use a strong, unique JWT secret in production
2. **Database Security**: Use MongoDB Atlas or secure MongoDB instance
3. **HTTPS**: Ensure all communications use HTTPS
4. **Environment Variables**: Never commit .env files to version control
5. **Rate Limiting**: Adjust rate limiting based on your needs
6. **Logging**: Implement proper logging for production monitoring 