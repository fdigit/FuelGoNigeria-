import api from './api';

export interface Notification {
  id: string;
  userId: string;
  type: 'ORDER_STATUS' | 'PAYMENT' | 'DELIVERY' | 'SYSTEM' | 'MARKETING' | 'ALERT' | 'REVIEW' | 'DISPUTE';
  title: string;
  message: string;
  data?: any;
  isRead: boolean;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  channel: ('EMAIL' | 'SMS' | 'PUSH' | 'IN_APP')[];
  sentAt?: string;
  readAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationPreferences {
  id: string;
  userId: string;
  emailNotifications: boolean;
  smsNotifications: boolean;
  pushNotifications: boolean;
  inAppNotifications: boolean;
  orderNotifications: boolean;
  paymentNotifications: boolean;
  systemNotifications: boolean;
  marketingNotifications: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationTemplate {
  id: string;
  name: string;
  title: string;
  message: string;
  type: string;
  priority: string;
  targetRoles: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationResponse {
  notifications: Notification[];
  total: number;
  unreadCount: number;
  hasMore: boolean;
}

export class NotificationService {
  // Get user notifications
  static async getNotifications(options: {
    limit?: number;
    offset?: number;
    unreadOnly?: boolean;
    type?: string;
  } = {}): Promise<NotificationResponse> {
    const params = new URLSearchParams();
    
    if (options.limit) params.append('limit', options.limit.toString());
    if (options.offset) params.append('offset', options.offset.toString());
    if (options.unreadOnly) params.append('unreadOnly', 'true');
    if (options.type) params.append('type', options.type);

    const response = await api.get(`/notifications?${params.toString()}`);
    return response.data.data;
  }

  // Mark notification as read
  static async markAsRead(notificationId: string): Promise<void> {
    await api.patch(`/notifications/${notificationId}/read`);
  }

  // Mark all notifications as read
  static async markAllAsRead(): Promise<void> {
    await api.patch('/notifications/read-all');
  }

  // Delete notification
  static async deleteNotification(notificationId: string): Promise<void> {
    await api.delete(`/notifications/${notificationId}`);
  }

  // Get notification preferences
  static async getPreferences(): Promise<NotificationPreferences | null> {
    try {
      const response = await api.get('/notifications/preferences');
      return response.data.data;
    } catch (error) {
      // If no preferences exist, return null
      return null;
    }
  }

  // Update notification preferences
  static async updatePreferences(preferences: Partial<NotificationPreferences>): Promise<NotificationPreferences> {
    const response = await api.put('/notifications/preferences', preferences);
    return response.data.data;
  }

  // Admin: Get notification templates
  static async getTemplates(): Promise<NotificationTemplate[]> {
    const response = await api.get('/notifications/templates');
    return response.data.data;
  }

  // Admin: Create notification template
  static async createTemplate(template: {
    name: string;
    title: string;
    message: string;
    type: string;
    priority?: string;
    targetRoles: string[];
  }): Promise<NotificationTemplate> {
    const response = await api.post('/notifications/templates', template);
    return response.data.data;
  }

  // Admin: Send bulk notification
  static async sendBulkNotification(userIds: string[], notificationData: {
    type: string;
    title: string;
    message: string;
    priority?: string;
    channels?: string[];
  }): Promise<Notification[]> {
    const response = await api.post('/notifications/send-bulk', {
      userIds,
      notificationData
    });
    return response.data.data;
  }

  // Admin: Send notification by role
  static async sendNotificationByRole(roles: string[], notificationData: {
    type: string;
    title: string;
    message: string;
    priority?: string;
    channels?: string[];
  }): Promise<Notification[]> {
    const response = await api.post('/notifications/send-by-role', {
      roles,
      notificationData
    });
    return response.data.data;
  }

  // Helper method to format notification priority for display
  static getPriorityColor(priority: string): string {
    switch (priority) {
      case 'URGENT':
        return 'text-red-600 bg-red-100';
      case 'HIGH':
        return 'text-orange-600 bg-orange-100';
      case 'MEDIUM':
        return 'text-blue-600 bg-blue-100';
      case 'LOW':
        return 'text-gray-600 bg-gray-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  }

  // Helper method to format notification type for display
  static getTypeIcon(type: string): string {
    switch (type) {
      case 'ORDER_STATUS':
        return '📦';
      case 'PAYMENT':
        return '💳';
      case 'DELIVERY':
        return '🚚';
      case 'SYSTEM':
        return '⚙️';
      case 'MARKETING':
        return '📢';
      case 'ALERT':
        return '⚠️';
      case 'REVIEW':
        return '⭐';
      case 'DISPUTE':
        return '⚠️';
      default:
        return '📢';
    }
  }

  // Helper method to format notification time
  static formatTime(timestamp: string): string {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) {
      return 'Just now';
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return `${hours}h ago`;
    } else {
      const days = Math.floor(diffInMinutes / 1440);
      return `${days}d ago`;
    }
  }
} 