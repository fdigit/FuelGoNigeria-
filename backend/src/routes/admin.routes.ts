import express from 'express';
import { auth } from '../middleware/auth.middleware';
import { authorize } from '../middleware/authorize.middleware';
import { ipWhitelist } from '../middleware/security.middleware';
import {
  createAdminInvitation,
  registerAdmin,
  listAdminInvitations
} from '../controllers/admin.controller';

const router = express.Router();

// Protected routes - only accessible by existing admins
router.use(auth);
router.use(authorize(['admin']));
router.use(ipWhitelist);

// Create admin invitation
router.post('/invite', createAdminInvitation);

// List all admin invitations
router.get('/invitations', listAdminInvitations);

// Public route - register admin using invitation
router.post('/register', registerAdmin);

export default router; 