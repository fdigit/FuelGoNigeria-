import express from 'express';
import {
  register,
  login,
  getPendingUsers,
  approveUser,
  rejectUser,
  registerAdmin,
  changePassword,
} from '../controllers/auth.controller';
import { auth } from '../middleware/auth.middleware';
import { authorize } from '../middleware/authorize.middleware';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);

// Admin registration (requires secret token)
router.post('/admin/register', registerAdmin);

// Protected routes
router.get('/me', auth, (req, res) => res.json(req.user));
router.get('/pending-users', auth, authorize(['admin']), getPendingUsers);
router.post('/approve-user/:userId', auth, authorize(['admin']), approveUser);
router.post('/reject-user/:userId', auth, authorize(['admin']), rejectUser);
router.post('/change-password', auth, changePassword);

export default router; 