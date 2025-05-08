import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { sendEmail } from '../utils/email';
import { generateToken } from '../utils/token';

export const register = async (req: Request, res: Response) => {
  try {
    const { 
      firstName, 
      lastName, 
      email, 
      password, 
      phone,
      role,
      licenseNumber,
      vehicleType,
      vehiclePlate,
      businessName,
      businessAddress,
      businessPhone
    } = req.body;

    console.log('Received registration request:', req.body);

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Create user with proper field mapping
    const userData = {
      firstName,
      lastName,
      email,
      password,
      phoneNumber: phone, // Map phone to phoneNumber
      role: role || 'customer',
      status: 'pending',
      ...(role === 'driver' && {
        licenseNumber,
        vehicleType,
        vehiclePlate
      }),
      ...(role === 'vendor' && {
        businessName,
        businessAddress,
        businessPhone
      })
    };

    console.log('Saving new user:', { email: userData.email, role: userData.role, status: userData.status });

    const user = await User.create(userData);

    // Generate token
    const token = generateToken(user);

    res.status(201).json({
      message: 'Registration successful',
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        status: user.status
      },
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      message: 'Error during registration',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check if account is pending
    if (user.status === 'pending') {
      return res.status(403).json({
        message: 'Account pending approval',
        status: 'pending',
      });
    }

    // Check if account is rejected
    if (user.status === 'rejected') {
      return res.status(403).json({
        message: 'Account has been rejected',
        status: 'rejected',
      });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = generateToken(user);

    res.json({
      token,
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        status: user.status
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getPendingUsers = async (req: Request, res: Response) => {
  try {
    const pendingUsers = await User.find({ status: 'pending' })
      .select('-password')
      .sort({ registrationDate: -1 });

    res.json(pendingUsers);
  } catch (error) {
    console.error('Get pending users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const approveUser = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.status = 'active';
    await user.save();

    // Send approval email
    await sendEmail({
      to: user.email,
      subject: 'Your FuelGo Nigeria Account Has Been Approved',
      text: `Dear ${user.firstName},\n\nYour account has been approved. You can now log in to your account.\n\nBest regards,\nFuelGo Nigeria Team`,
    });

    res.json({ message: 'User approved successfully' });
  } catch (error) {
    console.error('Approve user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const rejectUser = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { reason } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.status = 'rejected';
    await user.save();

    // Send rejection email
    await sendEmail({
      to: user.email,
      subject: 'Your FuelGo Nigeria Account Application',
      text: `Dear ${user.firstName},\n\nWe regret to inform you that your account application has been rejected.${reason ? `\n\nReason: ${reason}` : ''}\n\nBest regards,\nFuelGo Nigeria Team`,
    });

    res.json({ message: 'User rejected successfully' });
  } catch (error) {
    console.error('Reject user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const registerAdmin = async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, email, password, phone, secretToken } = req.body;

    // Verify secret token
    if (secretToken !== process.env.ADMIN_REGISTRATION_TOKEN) {
      return res.status(403).json({ message: 'Invalid admin registration token' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create admin user
    const user = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      phone,
      role: 'admin',
      status: 'active', // Admin accounts are automatically active
      isEmailVerified: true, // Admin accounts are automatically verified
      isPhoneVerified: true,
    });

    await user.save();

    // Try to send welcome email
    try {
      await sendEmail({
        to: email,
        subject: 'Welcome to FuelGo Nigeria Admin Portal',
        text: `Dear ${firstName},\n\nWelcome to the FuelGo Nigeria Admin Portal. Your account has been created and is ready to use.\n\nBest regards,\nFuelGo Nigeria Team`,
      });
    } catch (emailError) {
      console.log('Email sending failed, but admin registration was successful:', emailError);
    }

    res.status(201).json({
      message: 'Admin account created successfully',
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        status: user.status
      }
    });
  } catch (error) {
    console.error('Admin registration error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Change password
export const changePassword = async (req: Request, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    user.password = hashedPassword;
    await user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ message: 'Error changing password' });
  }
};

// Validate token
export const validateToken = async (req: Request, res: Response) => {
  try {
    // The auth middleware has already verified the token and attached the user
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    // Return the user data without sensitive information
    res.json({
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        status: user.status
      }
    });
  } catch (error) {
    console.error('Token validation error:', error);
    res.status(500).json({ 
      message: 'Error validating token',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}; 