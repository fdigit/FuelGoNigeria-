import express from 'express';
import { auth } from '../middleware/auth';
import { authorize } from '../middleware/authorize.middleware';
import { getUserActivity, getRecentActivity, getActivityByType } from '../controllers/userActivity.controller';

const router = express.Router();

// All routes require authentication
router.use(auth);

// Get user activity (admin only)
router.get('/user/:userId', authorize(['admin']), getUserActivity);

// Get recent activity (admin only)
router.get('/recent', authorize(['admin']), getRecentActivity);

// Get activity by type (admin only)
router.get('/type/:type', authorize(['admin']), getActivityByType);

export default router; 