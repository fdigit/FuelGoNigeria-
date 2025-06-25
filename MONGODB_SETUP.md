# 🗄️ MongoDB Atlas Setup Guide

This guide will help you set up MongoDB Atlas and connect it to your FuelGo Nigeria app.

## 📋 Prerequisites

- A MongoDB Atlas account (free tier available)
- Node.js and npm installed
- Your FuelGo Nigeria project set up

## 🚀 Step 1: Create MongoDB Atlas Account

1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Click "Try Free" or "Sign Up"
3. Create your account or sign in

## 🏗️ Step 2: Create a Cluster

1. **Choose a Plan:**
   - Select "FREE" tier (M0 Sandbox)
   - Click "Create"

2. **Choose a Provider & Region:**
   - Select your preferred cloud provider (AWS, Google Cloud, or Azure)
   - Choose a region close to your users (e.g., US East for global access)
   - Click "Next"

3. **Cluster Name:**
   - Name your cluster (e.g., "fuelgo-cluster")
   - Click "Create Cluster"

## 🔐 Step 3: Set Up Database Access

1. In the left sidebar, click "Database Access"
2. Click "Add New Database User"
3. **Authentication Method:** Password
4. **Username:** Create a username (e.g., "fuelgo-user")
5. **Password:** Create a strong password (save this!)
6. **Database User Privileges:** "Read and write to any database"
7. Click "Add User"

## 🌐 Step 4: Set Up Network Access

1. In the left sidebar, click "Network Access"
2. Click "Add IP Address"
3. **Access List Entry:**
   - For development: Click "Allow Access from Anywhere" (0.0.0.0/0)
   - For production: Add specific IP addresses
4. Click "Confirm"

## 🔗 Step 5: Get Connection String

1. Go back to "Database" in the sidebar
2. Click "Connect" on your cluster
3. **Choose a connection method:** "Connect your application"
4. **Driver:** Node.js
5. **Version:** Latest
6. Copy the connection string

## ⚙️ Step 6: Configure Environment Variables

1. Open your `.env.local` file
2. Replace the placeholder DATABASE_URL with your actual connection string:

```env
DATABASE_URL="mongodb+srv://fuelgo-user:your-password@fuelgo-cluster.xxxxx.mongodb.net/fuelgo-nigeria?retryWrites=true&w=majority"
JWT_SECRET="your-super-secret-jwt-key-here"
```

**Important:** Replace:
- `fuelgo-user` with your actual username
- `your-password` with your actual password
- `fuelgo-cluster.xxxxx.mongodb.net` with your actual cluster URL
- `fuelgo-nigeria` with your desired database name

## 🗃️ Step 7: Set Up Database Schema

1. Generate Prisma client:
```bash
npm run db:generate
```

2. Push schema to database:
```bash
npm run db:push
```

## 🌱 Step 8: Seed the Database

Run the seeding script to populate your database with test data:

```bash
npm run seed
```

This will create:
- Admin user: `admin@fuelgo.com` / `admin123`
- Test customer: `john@example.com` / `customer123`
- Test vendor: `mike@quickfuel.com` / `vendor123`

## 🧪 Step 9: Test the Connection

1. Start your development server:
```bash
npm run dev
```

2. Check the console for:
```
🗄️  Connected to MongoDB via Prisma
```

3. Test the API endpoints:
   - `GET http://localhost:3001/api/health`
   - `GET http://localhost:3001/api/vendor`

## 🛠️ Useful Commands

```bash
# Generate Prisma client
npm run db:generate

# Push schema changes to database
npm run db:push

# Open Prisma Studio (database GUI)
npm run db:studio

# Seed database with test data
npm run seed

# Start development servers
npm run dev
```

## 🔍 Troubleshooting

### Connection Issues
- Verify your connection string is correct
- Check that your IP address is whitelisted
- Ensure your database user has the correct permissions

### Schema Issues
- Run `npm run db:generate` after schema changes
- Use `npm run db:push` to sync schema changes
- Check Prisma Studio for database state

### Authentication Issues
- Verify JWT_SECRET is set in your environment
- Check that user credentials are correct
- Ensure user status is 'ACTIVE'

## 📊 Database Structure

Your database will contain these collections:
- `users` - User accounts and authentication
- `vendors` - Vendor profiles and business info
- `products` - Fuel products and pricing
- `orders` - Customer orders
- `order_items` - Individual items in orders
- `payments` - Payment transactions
- `reviews` - Customer reviews and ratings

## 🔒 Security Best Practices

1. **Environment Variables:** Never commit `.env.local` to version control
2. **Strong Passwords:** Use complex passwords for database users
3. **IP Whitelisting:** Restrict network access in production
4. **Regular Backups:** Set up automated backups in MongoDB Atlas
5. **Monitoring:** Enable MongoDB Atlas monitoring and alerts

## 🚀 Production Deployment

When deploying to Vercel:

1. Add your MongoDB connection string to Vercel environment variables
2. Ensure your Vercel deployment IP is whitelisted in MongoDB Atlas
3. Use a production-grade MongoDB cluster (M10 or higher)
4. Set up proper monitoring and alerting

## 📞 Support

If you encounter issues:
1. Check MongoDB Atlas documentation
2. Review Prisma documentation
3. Check the console for error messages
4. Verify all environment variables are set correctly

---

**🎉 Congratulations!** Your FuelGo Nigeria app is now connected to MongoDB Atlas with Prisma ORM! 