import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User';
import bcrypt from 'bcryptjs';

dotenv.config();

const verifyAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI as string);
    console.log('Connected to MongoDB');

    // Find admin user
    const admin = await User.findOne({ email: 'admin@fuelgo.com' });
    
    if (!admin) {
      console.log('Admin user not found!');
      process.exit(1);
    }

    console.log('Admin user found:', {
      id: admin._id,
      email: admin.email,
      role: admin.role,
      status: admin.status
    });

    // Test password
    const testPassword = 'Admin@123';
    const isMatch = await bcrypt.compare(testPassword, admin.password);
    console.log('Password match:', isMatch);

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

verifyAdmin(); 