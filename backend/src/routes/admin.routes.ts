import express from 'express';
import { auth } from '../middleware/auth.middleware';
import { authorize } from '../middleware/authorize.middleware';
import {
  createAdminInvitation,
  registerAdmin,
  listAdminInvitations,
  getPendingUsers,
  approveUser,
  rejectUser,
  getAllUsers,
  getUserDetails,
  updateUserStatus
} from '../controllers/admin.controller';

const router = express.Router();

// Protected routes - only accessible by existing admins
router.use(auth);
router.use(authorize(['admin']));

// User Management Routes
router.get('/users', getAllUsers);
router.get('/users/:userId', getUserDetails);
router.get('/users/pending', getPendingUsers);
router.post('/users/:userId/approve', approveUser);
router.post('/users/:userId/reject', rejectUser);
router.patch('/users/:userId/status', updateUserStatus);

// Admin Management Routes
router.post('/invite', createAdminInvitation);
router.get('/invitations', listAdminInvitations);
router.post('/register', registerAdmin);

export default router; 