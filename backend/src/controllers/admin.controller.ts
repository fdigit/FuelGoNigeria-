import { Request, Response } from 'express';
import crypto from 'crypto';
import User from '../models/User';
import AdminInvitation from '../models/AdminInvitation';
import { sendEmail, emailTemplates } from '../utils/email';
import { Types } from 'mongoose';
import { IUser } from '../models/User';

// Create an admin invitation
export const createAdminInvitation = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    const admin = req.user as IUser;

    if (!admin._id) {
      return res.status(400).json({ message: 'Invalid admin ID' });
    }

    const adminId = admin._id as unknown as string;
    if (!Types.ObjectId.isValid(adminId)) {
      return res.status(400).json({ message: 'Invalid admin ID format' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Check if invitation already exists and is not expired
    const existingInvitation = await AdminInvitation.findOne({
      email,
      used: false,
      expiresAt: { $gt: new Date() }
    });

    if (existingInvitation) {
      return res.status(400).json({ message: 'An active invitation already exists for this email' });
    }

    // Generate invitation token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Create invitation
    const invitation = await AdminInvitation.create({
      email,
      createdBy: new Types.ObjectId(adminId),
      token,
      expiresAt
    });

    // Send invitation email
    const { subject, text, html } = emailTemplates.adminInvitation(invitation.token);
    await sendEmail({
      to: email,
      subject,
      text,
      html
    });

    res.status(201).json({
      message: 'Admin invitation sent successfully',
      invitation: {
        _id: invitation._id,
        email: invitation.email,
        createdAt: invitation.createdAt
      }
    });
  } catch (error) {
    console.error('Create admin invitation error:', error);
    res.status(500).json({ 
      message: 'Error creating admin invitation',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Register admin using invitation
export const registerAdmin = async (req: Request, res: Response) => {
  try {
    const { token, firstName, lastName, email, password } = req.body;

    // Validate invitation
    const invitation = await AdminInvitation.findOne({
      token,
      used: false,
      expiresAt: { $gt: new Date() }
    });

    if (!invitation) {
      return res.status(400).json({ message: 'Invalid or expired invitation token' });
    }

    if (invitation.email !== email) {
      return res.status(400).json({ message: 'Email does not match invitation' });
    }

    // Create admin user
    const admin = await User.create({
      firstName,
      lastName,
      email,
      password,
      role: 'admin',
      status: 'active'
    });

    // Mark invitation as used
    invitation.used = true;
    invitation.usedAt = new Date();
    invitation.usedBy = admin._id;
    await invitation.save();

    res.status(201).json({
      message: 'Admin account created successfully',
      user: {
        _id: admin._id,
        firstName: admin.firstName,
        lastName: admin.lastName,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (error) {
    console.error('Error registering admin:', error);
    res.status(500).json({ 
      message: 'Error registering admin',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// List all admin invitations
export const listAdminInvitations = async (req: Request, res: Response) => {
  try {
    const invitations = await AdminInvitation.find()
      .populate('createdBy', 'firstName lastName email')
      .populate('usedBy', 'firstName lastName email')
      .sort({ createdAt: -1 });

    res.json(invitations);
  } catch (error) {
    console.error('Error listing admin invitations:', error);
    res.status(500).json({ message: 'Error listing admin invitations' });
  }
};

// Get all users
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ 
      message: 'Error fetching users',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Get user details
export const getUserDetails = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    if (!Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid user ID format' });
    }

    const user = await User.findById(userId)
      .select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Get user details error:', error);
    res.status(500).json({ 
      message: 'Error fetching user details',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Get pending users
export const getPendingUsers = async (req: Request, res: Response) => {
  try {
    const pendingUsers = await User.find({ status: 'pending' })
      .select('-password')
      .sort({ createdAt: -1 });
    res.json(pendingUsers);
  } catch (error) {
    console.error('Get pending users error:', error);
    res.status(500).json({ 
      message: 'Error fetching pending users',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Approve user
export const approveUser = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    if (!Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid user ID format' });
    }

    // First check if user exists and is not already active
    const existingUser = await User.findById(userId);
    if (!existingUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (existingUser.status === 'active') {
      return res.status(400).json({ message: 'User is already active' });
    }

    // Then update the status
    const updatedUser = await User.findOneAndUpdate(
      { _id: userId },
      { $set: { status: 'active' } },
      { new: true, runValidators: false }
    );

    if (!updatedUser) {
      return res.status(500).json({ message: 'Failed to update user status' });
    }

    // Send approval email
    try {
      const { subject, text, html } = emailTemplates.approval(updatedUser.firstName);
      await sendEmail({
        to: updatedUser.email,
        subject,
        text,
        html
      });
    } catch (emailError) {
      console.error('Error sending approval email:', emailError);
      // Don't fail the request if email fails
    }

    res.json({ 
      message: 'User approved successfully',
      user: {
        _id: updatedUser._id,
        email: updatedUser.email,
        status: updatedUser.status
      }
    });
  } catch (error) {
    console.error('Approve user error:', error);
    res.status(500).json({ 
      message: 'Error approving user',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Reject user
export const rejectUser = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { reason } = req.body;

    if (!Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid user ID format' });
    }

    if (!reason || typeof reason !== 'string' || reason.trim().length === 0) {
      return res.status(400).json({ message: 'Rejection reason is required' });
    }

    const user = await User.findOneAndUpdate(
      { _id: userId },
      { 
        $set: { 
          status: 'rejected',
          rejectionReason: reason 
        } 
      },
      { new: true, runValidators: false }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.status === 'rejected') {
      return res.status(400).json({ message: 'User is already rejected' });
    }

    // Send rejection email
    try {
      const { subject, text, html } = emailTemplates.rejection(user.firstName, reason);
      await sendEmail({
        to: user.email,
        subject,
        text,
        html
      });
    } catch (emailError) {
      console.error('Error sending rejection email:', emailError);
      // Don't fail the request if email fails
    }

    res.json({ 
      message: 'User rejected successfully',
      user: {
        _id: user._id,
        email: user.email,
        status: user.status
      }
    });
  } catch (error) {
    console.error('Reject user error:', error);
    res.status(500).json({ 
      message: 'Error rejecting user',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Update user status
export const updateUserStatus = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { status } = req.body;

    if (!Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid user ID format' });
    }

    if (!['active', 'suspended', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.status = status;
    await user.save();

    res.json({ 
      message: 'User status updated successfully',
      user: {
        _id: user._id,
        email: user.email,
        status: user.status
      }
    });
  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({ 
      message: 'Error updating user status',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}; 