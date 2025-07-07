import { Router, Request, Response } from 'express';
import { NotificationService } from '../services/notification.service';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Get user notifications
router.get('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { limit, offset, unreadOnly, type } = req.query;

    const result = await NotificationService.getUserNotifications(userId!, {
      limit: limit ? parseInt(limit as string) : undefined,
      offset: offset ? parseInt(offset as string) : undefined,
      unreadOnly: unreadOnly === 'true',
      type: type as any
    });

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notifications'
    });
  }
});

// Mark notification as read
router.patch('/:id/read', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const notificationId = req.params.id;

    await NotificationService.markAsRead(notificationId, userId!);

    res.json({
      success: true,
      message: 'Notification marked as read'
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark notification as read'
    });
  }
});

// Mark all notifications as read
router.patch('/read-all', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;

    await NotificationService.markAllAsRead(userId!);

    res.json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark notifications as read'
    });
  }
});

// Delete notification
router.delete('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const notificationId = req.params.id;

    await NotificationService.deleteNotification(notificationId, userId!);

    res.json({
      success: true,
      message: 'Notification deleted'
    });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete notification'
    });
  }
});

// Get notification preferences
router.get('/preferences', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;

    const preferences = await NotificationService.getUserPreferences(userId!);

    res.json({
      success: true,
      data: preferences
    });
  } catch (error) {
    console.error('Error fetching notification preferences:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notification preferences'
    });
  }
});

// Update notification preferences
router.put('/preferences', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const preferences = req.body;

    const updatedPreferences = await NotificationService.updateUserPreferences(userId!, preferences);

    res.json({
      success: true,
      data: updatedPreferences,
      message: 'Notification preferences updated'
    });
  } catch (error) {
    console.error('Error updating notification preferences:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update notification preferences'
    });
  }
});

// Admin routes for managing notifications
router.get('/templates', authenticateToken, async (req: Request, res: Response) => {
  try {
    // Check if user is admin
    if (req.user?.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const templates = await NotificationService.getTemplates();

    res.json({
      success: true,
      data: templates
    });
  } catch (error) {
    console.error('Error fetching notification templates:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notification templates'
    });
  }
  return;
});

// Create notification template (admin only)
router.post('/templates', authenticateToken, async (req: Request, res: Response) => {
  try {
    // Check if user is admin
    if (req.user?.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const templateData = req.body;
    const template = await NotificationService.createTemplate(templateData);

    res.json({
      success: true,
      data: template,
      message: 'Notification template created'
    });
  } catch (error) {
    console.error('Error creating notification template:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create notification template'
    });
  }
  return;
});

// Send bulk notification (admin only)
router.post('/send-bulk', authenticateToken, async (req: Request, res: Response) => {
  try {
    // Check if user is admin
    if (req.user?.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const { userIds, notificationData } = req.body;

    const notifications = await NotificationService.sendBulkNotification(userIds, notificationData);

    res.json({
      success: true,
      data: notifications,
      message: `Notifications sent to ${notifications.length} users`
    });
  } catch (error) {
    console.error('Error sending bulk notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send bulk notifications'
    });
  }
  return;
});

// Send notification by role (admin only)
router.post('/send-by-role', authenticateToken, async (req: Request, res: Response) => {
  try {
    // Check if user is admin
    if (req.user?.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const { roles, notificationData } = req.body;

    const notifications = await NotificationService.sendNotificationByRole(roles, notificationData);

    res.json({
      success: true,
      data: notifications,
      message: `Notifications sent to users with roles: ${roles.join(', ')}`
    });
  } catch (error) {
    console.error('Error sending notifications by role:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send notifications by role'
    });
  }
  return;
});

export default router; 