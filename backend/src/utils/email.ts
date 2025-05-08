import nodemailer from 'nodemailer';

interface EmailOptions {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendEmail = async (options: EmailOptions) => {
  try {
    const mailOptions = {
      from: `"FuelGo Nigeria" <${process.env.SMTP_USER}>`,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html || options.text,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

// Email templates
export const emailTemplates = {
  welcome: (name: string) => ({
    subject: 'Welcome to FuelGo Nigeria',
    text: `Dear ${name},\n\nThank you for registering with FuelGo Nigeria. Your account is pending approval. We will notify you once it's approved.\n\nBest regards,\nFuelGo Nigeria Team`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Welcome to FuelGo Nigeria!</h2>
        <p>Dear ${name},</p>
        <p>Thank you for registering with FuelGo Nigeria. Your account is pending approval. We will notify you once it's approved.</p>
        <p>Best regards,<br>FuelGo Nigeria Team</p>
      </div>
    `,
  }),

  approval: (name: string) => ({
    subject: 'Your FuelGo Nigeria Account Has Been Approved',
    text: `Dear ${name},\n\nYour account has been approved. You can now log in to your account.\n\nBest regards,\nFuelGo Nigeria Team`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Account Approved!</h2>
        <p>Dear ${name},</p>
        <p>Your account has been approved. You can now log in to your account.</p>
        <p>Best regards,<br>FuelGo Nigeria Team</p>
      </div>
    `,
  }),

  rejection: (name: string, reason?: string) => ({
    subject: 'Your FuelGo Nigeria Account Application',
    text: `Dear ${name},\n\nWe regret to inform you that your account application has been rejected.${reason ? `\n\nReason: ${reason}` : ''}\n\nBest regards,\nFuelGo Nigeria Team`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc2626;">Account Application Update</h2>
        <p>Dear ${name},</p>
        <p>We regret to inform you that your account application has been rejected.${reason ? `<br><br><strong>Reason:</strong> ${reason}` : ''}</p>
        <p>Best regards,<br>FuelGo Nigeria Team</p>
      </div>
    `,
  }),

  adminInvitation: (token: string) => ({
    subject: 'Admin Invitation - FuelGo Nigeria',
    text: `You have been invited to join FuelGo Nigeria as an administrator.\n\nClick the link below to complete your registration:\n${process.env.FRONTEND_URL}/admin/register?token=${token}\n\nThis invitation will expire in 24 hours.`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Admin Invitation</h2>
        <p>You have been invited to join FuelGo Nigeria as an administrator.</p>
        <p>Click the link below to complete your registration:</p>
        <a href="${process.env.FRONTEND_URL}/admin/register?token=${token}" style="display: inline-block; padding: 12px 24px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 4px;">
          Complete Registration
        </a>
        <p>This invitation will expire in 24 hours.</p>
      </div>
    `,
  }),
};

// Email templates
const verificationEmailTemplate = (token: string) => ({
  subject: 'Verify your email address',
  html: `
    <h1>Welcome to FuelGo Nigeria!</h1>
    <p>Please click the link below to verify your email address:</p>
    <a href="${process.env.FRONTEND_URL}/verify-email/${token}">Verify Email</a>
    <p>This link will expire in 24 hours.</p>
  `
});

const resetPasswordTemplate = (token: string) => ({
  subject: 'Reset your password',
  html: `
    <h1>Password Reset Request</h1>
    <p>Please click the link below to reset your password:</p>
    <a href="${process.env.FRONTEND_URL}/reset-password/${token}">Reset Password</a>
    <p>This link will expire in 1 hour.</p>
  `
});

// Send verification email
export const sendVerificationEmail = async (email: string, token: string): Promise<void> => {
  try {
    const { subject, html } = verificationEmailTemplate(token);
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject,
      html
    });
  } catch (error) {
    console.error('Error sending verification email:', error);
    throw new Error('Failed to send verification email');
  }
};

// Send password reset email
export const sendPasswordResetEmail = async (email: string, token: string): Promise<void> => {
  try {
    const { subject, html } = resetPasswordTemplate(token);
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject,
      html
    });
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw new Error('Failed to send password reset email');
  }
};

// Send order confirmation email
export const sendOrderConfirmationEmail = async (
  email: string,
  orderId: string,
  totalAmount: number,
  deliveryAddress: string
): Promise<void> => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Order Confirmation - FuelGo Nigeria',
      html: `
        <h1>Order Confirmation</h1>
        <p>Thank you for your order!</p>
        <p>Order ID: ${orderId}</p>
        <p>Total Amount: ₦${totalAmount.toFixed(2)}</p>
        <p>Delivery Address: ${deliveryAddress}</p>
        <p>We will notify you when your order is on its way.</p>
      `
    });
  } catch (error) {
    console.error('Error sending order confirmation email:', error);
    throw new Error('Failed to send order confirmation email');
  }
}; 