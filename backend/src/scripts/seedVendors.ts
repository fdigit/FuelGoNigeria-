import dotenv from 'dotenv';
import User from '../models/User';
import Vendor from '../models/Vendor';
import connectDB from '../config/database';

dotenv.config();

const seedVendors = async () => {
  try {
    // Connect to database
    await connectDB();
    console.log('Connected to database');

    // Create test users first
    const users = await User.create([
      {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@quickfuel.com',
        password: 'password123',
        phoneNumber: '+2341234567890',
        role: 'vendor',
        status: 'active'
      },
      {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane@citygas.com',
        password: 'password123',
        phoneNumber: '+2349876543210',
        role: 'vendor',
        status: 'active'
      }
    ]);

    console.log('Created test users');

    // Create test vendors
    const vendors = await Vendor.create([
      {
        user_id: users[0]._id,
        business_name: 'Quick Fuel Station',
        address: {
          street: '123 Victoria Island Road',
          city: 'Lagos',
          state: 'Lagos',
          coordinates: [3.4219, 6.4281]
        },
        fuel_types: ['PMS', 'Diesel'],
        documents: {
          business_registration: 'reg123',
          tax_id: 'tax123',
          fuel_license: 'license123'
        },
        operating_hours: {
          open: '06:00',
          close: '22:00',
          days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
        },
        average_rating: 4.5,
        total_ratings: 128,
        verification_status: 'verified',
        bank_info: {
          bank_name: 'First Bank',
          account_number: '1234567890',
          account_name: 'Quick Fuel Station'
        }
      },
      {
        user_id: users[1]._id,
        business_name: 'City Gas Station',
        address: {
          street: '45 Ikeja Road',
          city: 'Lagos',
          state: 'Lagos',
          coordinates: [3.3494, 6.6018]
        },
        fuel_types: ['PMS', 'Diesel'],
        documents: {
          business_registration: 'reg456',
          tax_id: 'tax456',
          fuel_license: 'license456'
        },
        operating_hours: {
          open: '07:00',
          close: '21:00',
          days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
        },
        average_rating: 4.2,
        total_ratings: 95,
        verification_status: 'verified',
        bank_info: {
          bank_name: 'UBA',
          account_number: '0987654321',
          account_name: 'City Gas Station'
        }
      }
    ]);

    console.log('Created test vendors:', vendors);
    console.log('Seeding completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding vendors:', error);
    process.exit(1);
  }
};

seedVendors(); 