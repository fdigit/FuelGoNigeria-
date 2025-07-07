# FuelGo Nigeria - Fuel Delivery Platform

A full-stack fuel delivery platform built with React, Node.js, and MongoDB.

## 🚀 Quick Deploy to Vercel

### Prerequisites
- Vercel account
- MongoDB Atlas database
- Node.js 18+ installed

### Environment Variables

Set these in your Vercel project settings:

```env
DATABASE_URL=mongodb+srv://fmfonn:VStbtHxS8TT1Bex5@cluster0.ssoqdin.mongodb.net/fuelgo-nigeria?retryWrites=true&w=majority
JWT_SECRET=fuelgo-nigeria-jwt-secret-2024-super-secure-key-change-in-production
NODE_ENV=production
REACT_APP_API_URL=https://your-app-name.vercel.app/api
```

### Deployment Steps

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   # For Unix/Linux/Mac
   npm run deploy:setup
   
   # For Windows
   npm run deploy:windows
   
   # Or simple deploy
   npm run deploy
   ```

## 🏗️ Local Development

### Installation

```bash
# Install all dependencies
npm run install:all

# Generate Prisma client
npm run db:generate

# Start development server
npm run dev
```

### Available Scripts

- `npm run dev` - Start development servers
- `npm run build` - Build for production
- `npm run deploy` - Deploy to Vercel
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema to database
- `npm run db:studio` - Open Prisma Studio

## 📁 Project Structure

```
├── api/                    # Serverless API functions
│   ├── auth/              # Authentication endpoints
│   ├── vendor/            # Vendor management
│   ├── middleware/        # CORS and middleware
│   └── types/             # TypeScript types
├── frontend/              # React application
│   ├── src/               # React source code
│   ├── public/            # Static assets
│   └── build/             # Production build
├── backend/               # Express.js backend (development)
├── prisma/                # Database schema
├── scripts/               # Deployment scripts
└── vercel.json            # Vercel configuration
```

## 🔧 Configuration

### Frontend Configuration
The frontend automatically detects the environment and uses the appropriate API URL:
- Development: `http://localhost:5000/api`
- Production: `https://your-app-name.vercel.app/api`

### Database
- Uses MongoDB Atlas with Prisma ORM
- Schema defined in `prisma/schema.prisma`
- Automatic migrations with `npm run db:push`

## 🌐 API Endpoints

- `GET /api/health` - Health check
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/validate-token` - Token validation
- `GET /api/vendor` - Vendor listing

## 🔒 Security

- JWT-based authentication
- Password hashing with bcrypt
- CORS protection
- Environment variable protection

## 📊 Features

- User authentication and authorization
- Vendor management
- Product catalog
- Order management
- Payment processing
- Real-time notifications
- Driver assignment
- Review system

## 🛠️ Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express, TypeScript
- **Database**: MongoDB with Prisma ORM
- **Deployment**: Vercel
- **Authentication**: JWT
- **Payments**: Paystack integration

## 📝 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📞 Support

For support, email support@fuelgo-nigeria.com or create an issue in this repository. 