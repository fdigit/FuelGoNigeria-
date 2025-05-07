import { Request, Response } from 'express';
import crypto from 'crypto';
import User from '../models/User';
import AdminInvitation from '../models/AdminInvitation';
import { sendEmail } from '../utils/email';

// Create an admin invitation
export const createAdminInvitation = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    const adminId = req.user?.id;

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
      token,
      email,
      createdBy: adminId,
      expiresAt
    });

    // Send invitation email
    try {
      await sendEmail({
        to: email,
        subject: 'Admin Invitation - FuelGo Nigeria',
        html: `
          <h1>Admin Invitation</h1>
          <p>You have been invited to join FuelGo Nigeria as an administrator.</p>
          <p>Click the link below to complete your registration:</p>
          <a href="${process.env.FRONTEND_URL}/admin/register?token=${token}">
            Complete Registration
          </a>
          <p>This invitation will expire in 24 hours.</p>
        `
      });
    } catch (error) {
      console.error('Failed to send invitation email:', error);
      // Don't fail the request if email sending fails
    }

    res.status(201).json({
      message: 'Admin invitation sent successfully',
      invitation: {
        email: invitation.email,
        expiresAt: invitation.expiresAt
      }
    });
  } catch (error) {
    console.error('Error creating admin invitation:', error);
    res.status(500).json({ message: 'Error creating admin invitation' });
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
        id: admin._id,
        firstName: admin.firstName,
        lastName: admin.lastName,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (error) {
    console.error('Error registering admin:', error);
    res.status(500).json({ message: 'Error registering admin' });
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