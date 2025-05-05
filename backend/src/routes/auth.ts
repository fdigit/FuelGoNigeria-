import express from 'express';
import { body } from 'express-validator';
import {
  register,
  login,
  verifyEmail,
  verifyPhone,
  forgotPassword,
  resetPassword,
} from '../controllers/auth';
import { auth } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = express.Router();

// Public routes
router.post(
  '/register',
  [
    body('firstName').trim().isLength({ min: 2 }).withMessage('First name must be at least 2 characters long'),
    body('lastName').trim().isLength({ min: 2 }).withMessage('Last name must be at least 2 characters long'),
    body('email').trim().isEmail().withMessage('Please provide a valid email address'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    body('phoneNumber').matches(/^[0-9]{11}$/).withMessage('Please provide a valid 11-digit phone number'),
  ],
  validate,
  register
);

router.post(
  '/login',
  [
    body('email').trim().isEmail().withMessage('Please provide a valid email address'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  validate,
  login
);

router.post(
  '/verify-email',
  [
    body('email').trim().isEmail().withMessage('Please provide a valid email address'),
    body('token').notEmpty().withMessage('Verification token is required'),
  ],
  validate,
  verifyEmail
);

router.post(
  '/verify-phone',
  [
    body('phoneNumber').matches(/^[0-9]{11}$/).withMessage('Please provide a valid 11-digit phone number'),
    body('token').notEmpty().withMessage('Verification token is required'),
  ],
  validate,
  verifyPhone
);

router.post(
  '/forgot-password',
  [
    body('email').trim().isEmail().withMessage('Please provide a valid email address'),
  ],
  validate,
  forgotPassword
);

router.post(
  '/reset-password',
  [
    body('email').trim().isEmail().withMessage('Please provide a valid email address'),
    body('token').notEmpty().withMessage('Reset token is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  ],
  validate,
  resetPassword
);

// Protected routes
router.get('/me', auth, (req, res) => {
  res.json({ user: req.user });
});

export default router; 