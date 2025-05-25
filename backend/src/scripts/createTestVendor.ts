import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User';
import Vendor from '../models/Vendor';

dotenv.config();

async function createTestVendor() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/fuelgo');
    console.log('Connected to MongoDB');

    // Create test user
    const user = await User.create({
      firstName: 'Test',
      lastName: 'Vendor',
      email: 'test.vendor@example.com',
      password: 'password123',
      phoneNumber: '+2341234567890',
      role: 'vendor',
      status: 'active'
    });

    // Create test vendor
    const vendor = await Vendor.create({
      user_id: user._id,
      business_name: 'Test Fuel Station',
      address: {
        street: '123 Test Street',
        city: 'Lagos',
        state: 'Victoria Island',
        coordinates: [3.3792, 6.5244] // Lagos coordinates
      },
      fuel_types: ['PMS', 'Diesel'],
      operating_hours: {
        open: '08:00',
        close: '20:00',
        days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
      },
      average_rating: 4.8,
      total_ratings: 25,
      verification_status: 'verified',
      bank_info: {
        bank_name: 'Test Bank',
        account_number: '1234567890',
        account_name: 'Test Vendor Account'
      }
    });

    console.log('Test vendor created:', vendor);
    process.exit(0);
  } catch (error) {
    console.error('Error creating test vendor:', error);
    process.exit(1);
  }
}

createTestVendor(); 