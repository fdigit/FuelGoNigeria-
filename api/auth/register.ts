import { ApiRequest, ApiResponse } from '../types/api';
import { prisma } from '../db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { cors } from '../middleware/cors';

export default async function handler(req: ApiRequest, res: ApiResponse) {
  // Handle CORS
  if (cors(req, res)) return;

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { firstName, lastName, email, password, phone, role } = req.body;
    
    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { phoneNumber: phone }
        ]
      }
    });

    if (existingUser) {
      return res.status(400).json({ 
        message: existingUser.email === email ? 'Email already exists' : 'Phone number already exists' 
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Convert role to uppercase to match Prisma enum
    const normalizedRole = role ? role.toUpperCase() : 'CUSTOMER';

    // Create user
    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        password: hashedPassword,
        phoneNumber: phone,
        role: normalizedRole,
        status: 'PENDING'
      }
    });

    // If user is a vendor, create vendor record
    if (normalizedRole === 'VENDOR') {
      await prisma.vendor.create({
        data: {
          userId: user.id,
          businessName: req.body.businessName || 'TBD',
          address: {
            city: 'Lagos',
            state: 'Lagos',
            country: 'Nigeria'
          },
          operatingHours: {
            open: '06:00',
            close: '22:00',
            days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
          },
          fuelTypes: ['PMS', 'Diesel'],
          services: ['Fuel Delivery'],
          paymentMethods: ['Cash', 'Card'],
          minimumOrder: 0,
          deliveryFee: 0,
          rating: 0,
          totalReviews: 0,
          isVerified: false,
          isActive: true
        }
      });
    }

    // Generate token
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        _id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        status: user.status,
        phoneNumber: user.phoneNumber
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Error during registration' });
  }
} 