import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User';

// Load environment variables
dotenv.config();

const createFirstAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI as string);
    console.log('Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@fuelgo.com' });
    if (existingAdmin) {
      console.log('Removing existing admin user...');
      await User.deleteOne({ email: 'admin@fuelgo.com' });
    }

    // Create admin user
    const password = 'Admin@123';
    const adminData = {
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@fuelgo.com',
      password: password, // Plain password - will be hashed by pre-save middleware
      role: 'admin',
      status: 'active',
      phoneNumber: '+2348000000000',
      isEmailVerified: true,
      isPhoneVerified: true
    };

    const admin = new User(adminData);
    await admin.save();

    console.log('Admin user created successfully');
    console.log('Email:', adminData.email);
    console.log('Password:', password);
    console.log('Please change this password after first login');

    process.exit(0);
  } catch (error) {
    console.error('Error creating admin user:', error);
    process.exit(1);
  }
};

createFirstAdmin(); 