import { Request, Response } from 'express';
import jwt, { SignOptions } from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User, { IUser } from '../models/User';
import { sendVerificationEmail } from '../utils/email';
import { sendVerificationSMS } from '../utils/sms';

// Utility: Generate JWT token
const generateToken = (userId: string): string => {
  const payload = { userId };
  const options: SignOptions = { expiresIn: '7d' };
  const secret = process.env.JWT_SECRET || 'defaultSecret';

  return jwt.sign(payload, secret, options);
};

// REGISTER USER
export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, phoneNumber, firstName, lastName } = req.body;

    const existingUser = await User.findOne({ email }).exec();
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const user = new User({
      email,
      password,
      phoneNumber,
      firstName,
      lastName,
    });

    const emailToken = Math.floor(100000 + Math.random() * 900000).toString();
    const phoneToken = Math.floor(100000 + Math.random() * 900000).toString();

    user.emailVerificationToken = emailToken;
    user.phoneVerificationToken = phoneToken;

    await user.save();

    await sendVerificationEmail(user.email, emailToken);
    await sendVerificationSMS(user.phoneNumber, phoneToken);

    const token = generateToken(user._id.toString());

    return res.status(201).json({
      token,
      user: {
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        isEmailVerified: user.isEmailVerified,
        isPhoneVerified: user.isPhoneVerified,
      },
    });
  } catch (err: any) {
    console.error('Registration error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

// LOGIN USER
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).exec() as IUser | null;
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user._id.toString());

    return res.status(200).json({
      token,
      user: {
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        isEmailVerified: user.isEmailVerified,
        isPhoneVerified: user.isPhoneVerified,
      },
    });
  } catch (err: any) {
    console.error('Login error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

// VERIFY EMAIL
export const verifyEmail = async (req: Request, res: Response) => {
  try {
    const { email, token } = req.body;

    const user = await User.findOne({ email }).exec() as IUser | null;
    if (!user || user.emailVerificationToken !== token) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    await user.save();

    return res.status(200).json({ message: 'Email verified successfully' });
  } catch (err: any) {
    console.error('Email verification error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

// VERIFY PHONE
export const verifyPhone = async (req: Request, res: Response) => {
  try {
    const { phoneNumber, token } = req.body;

    const user = await User.findOne({ phoneNumber }).exec() as IUser | null;
    if (!user || user.phoneVerificationToken !== token) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    user.isPhoneVerified = true;
    user.phoneVerificationToken = undefined;
    await user.save();

    return res.status(200).json({ message: 'Phone number verified successfully' });
  } catch (err: any) {
    console.error('Phone verification error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

// FORGOT PASSWORD
export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email }).exec() as IUser | null;
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const resetToken = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour

    await user.save();

    await sendVerificationEmail(email, resetToken);

    return res.status(200).json({ message: 'Reset token sent to email' });
  } catch (err: any) {
    console.error('Forgot password error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

// RESET PASSWORD
export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { email, token, password } = req.body;

    const user = await User.findOne({
      email,
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() },
    }).exec() as IUser | null;

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    return res.status(200).json({ message: 'Password reset successful' });
  } catch (err: any) {
    console.error('Reset password error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
}; 