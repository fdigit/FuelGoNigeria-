import nodemailer from 'nodemailer';

// Create reusable transporter
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

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