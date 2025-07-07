import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import webSocketService from '../services/websocket.service';
import { NotificationService, Notification } from '../services/notification.service';
import { useToast } from './ToastContext';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  refreshNotifications: () => Promise<void>;
  addNotification: (notification: Notification) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { showToast } = useToast();

  // Load initial notifications
  useEffect(() => {
    if (user) {
      loadNotifications();
    }
  }, [user]);

  // Setup WebSocket listeners
  useEffect(() => {
    if (!user) return;

    // Listen for new notifications
    webSocketService.on('notification_received', (data) => {
      const newNotification = data.notification;
      addNotification(newNotification);
      
      // Show toast for high priority notifications
      if (newNotification.priority === 'HIGH' || newNotification.priority === 'URGENT') {
        showToast('info', newNotification.title);
      }
    });

    // Listen for order status updates
    webSocketService.on('order_status_updated', (data) => {
      showToast('info', `Order #${data.orderId} status: ${data.status}`);
    });

    // Listen for delivery updates
    webSocketService.on('delivery_updated', (data) => {
      showToast('info', `Delivery update: ${data.status}`);
    });

    // Listen for payment updates
    webSocketService.on('payment_updated', (data) => {
      showToast('success', `Payment ${data.status} for order #${data.orderId}`);
    });

    // Listen for stock alerts (for vendors)
    webSocketService.on('stock_alert_received', (data) => {
      showToast('warning', `Low stock alert: ${data.productName} (${data.currentStock} remaining)`);
    });

    // Listen for admin broadcasts
    webSocketService.on('admin_broadcast_received', (data) => {
      showToast('info', data.message);
    });

    return () => {
      // Cleanup listeners
      webSocketService.off('notification_received');
      webSocketService.off('order_status_updated');
      webSocketService.off('delivery_updated');
      webSocketService.off('payment_updated');
      webSocketService.off('stock_alert_received');
      webSocketService.off('admin_broadcast_received');
    };
  }, [user, showToast]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const response = await NotificationService.getNotifications({
        limit: 50,
        unreadOnly: false
      });
      
      setNotifications(response.notifications);
      setUnreadCount(response.unreadCount);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const addNotification = (notification: Notification) => {
    setNotifications(prev => [notification, ...prev]);
    if (!notification.isRead) {
      setUnreadCount(prev => prev + 1);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await NotificationService.markAsRead(id);
      setNotifications(prev =>
        prev.map(notification =>
          notification.id === id ? { ...notification, isRead: true } : notification
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
      showToast('error', 'Failed to mark notification as read');
    }
  };

  const markAllAsRead = async () => {
    try {
      await NotificationService.markAllAsRead();
      setNotifications(prev =>
        prev.map(notification => ({ ...notification, isRead: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      showToast('error', 'Failed to mark notifications as read');
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      await NotificationService.deleteNotification(id);
      setNotifications(prev => prev.filter(notification => notification.id !== id));
      
      // Update unread count if the deleted notification was unread
      const deletedNotification = notifications.find(n => n.id === id);
      if (deletedNotification && !deletedNotification.isRead) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
      showToast('error', 'Failed to delete notification');
    }
  };

  const refreshNotifications = async () => {
    await loadNotifications();
  };

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refreshNotifications,
    addNotification
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}; 