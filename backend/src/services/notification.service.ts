import { PrismaClient } from '@prisma/client';
import { sendEmail } from '../utils/email';
import { sendSMS } from '../utils/sms';

const prisma = new PrismaClient();

// Import enums from the generated Prisma client
const { NotificationType, NotificationPriority, NotificationChannel, UserRole } = require('@prisma/client');

// Create type aliases for better TypeScript support
type NotificationTypeEnum = typeof NotificationType[keyof typeof NotificationType];
type NotificationPriorityEnum = typeof NotificationPriority[keyof typeof NotificationPriority];
type NotificationChannelEnum = typeof NotificationChannel[keyof typeof NotificationChannel];
type UserRoleEnum = typeof UserRole[keyof typeof UserRole];

export interface CreateNotificationData {
  userId: string;
  type: NotificationTypeEnum;
  title: string;
  message: string;
  data?: any;
  priority?: NotificationPriorityEnum;
  channels?: NotificationChannelEnum[];
}

export interface NotificationTemplateData {
  name: string;
  title: string;
  message: string;
  type: NotificationTypeEnum;
  priority?: NotificationPriorityEnum;
  targetRoles: UserRoleEnum[];
}

export class NotificationService {
  // Create and send a notification
  static async createNotification(data: CreateNotificationData) {
    try {
      // Get user notification preferences
      const userPrefs = await prisma.userNotificationPreference.findUnique({
        where: { userId: data.userId }
      });

      // Determine which channels to use
      const channels = data.channels || this.getDefaultChannels(data.type, userPrefs);

      // Create notification record
      const notification = await prisma.notification.create({
        data: {
          userId: data.userId,
          type: data.type,
          title: data.title,
          message: data.message,
          data: data.data,
          priority: data.priority || NotificationPriority.MEDIUM,
          channel: channels,
          sentAt: new Date()
        }
      });

      // Send notifications through different channels
      await this.sendNotificationThroughChannels(notification, channels, userPrefs);

      return notification;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  // Send notification to multiple users
  static async sendBulkNotification(userIds: string[], data: Omit<CreateNotificationData, 'userId'>) {
    const notifications = [];
    
    for (const userId of userIds) {
      try {
        const notification = await this.createNotification({
          ...data,
          userId
        });
        notifications.push(notification);
      } catch (error) {
        console.error(`Error sending notification to user ${userId}:`, error);
      }
    }

    return notifications;
  }

  // Send notification to users by role
  static async sendNotificationByRole(roles: string[] | UserRoleEnum[], data: Omit<CreateNotificationData, 'userId'>) {
    // Convert string roles to UserRole enum values if needed
    const validRoles = roles.map(role => {
      if (typeof role === 'string') {
        // Validate that the string role is a valid UserRole enum value
        if (Object.values(UserRole).includes(role as any)) {
          return role as UserRoleEnum;
        } else {
          throw new Error(`Invalid role: ${role}`);
        }
      }
      return role as UserRoleEnum;
    });

    const users = await prisma.user.findMany({
      where: {
        role: { in: validRoles },
        status: 'ACTIVE'
      },
      select: { id: true }
    });

    const userIds = users.map((user: any) => user.id);
    return this.sendBulkNotification(userIds, data);
  }

  // Get user notifications
  static async getUserNotifications(userId: string, options: {
    limit?: number;
    offset?: number;
    unreadOnly?: boolean;
    type?: NotificationTypeEnum;
  } = {}) {
    const { limit = 20, offset = 0, unreadOnly = false, type } = options;

    const where: any = { userId };
    
    if (unreadOnly) {
      where.isRead = false;
    }
    
    if (type) {
      where.type = type;
    }

    const notifications = await prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset
    });

    const total = await prisma.notification.count({ where });
    const unreadCount = await prisma.notification.count({
      where: { userId, isRead: false }
    });

    return {
      notifications,
      total,
      unreadCount,
      hasMore: total > offset + limit
    };
  }

  // Mark notification as read
  static async markAsRead(notificationId: string, userId: string) {
    return prisma.notification.updateMany({
      where: {
        id: notificationId,
        userId
      },
      data: {
        isRead: true,
        readAt: new Date()
      }
    });
  }

  // Mark all notifications as read for a user
  static async markAllAsRead(userId: string) {
    return prisma.notification.updateMany({
      where: {
        userId,
        isRead: false
      },
      data: {
        isRead: true,
        readAt: new Date()
      }
    });
  }

  // Delete notification
  static async deleteNotification(notificationId: string, userId: string) {
    return prisma.notification.deleteMany({
      where: {
        id: notificationId,
        userId
      }
    });
  }

  // Create notification template
  static async createTemplate(data: NotificationTemplateData) {
    return prisma.notificationTemplate.create({
      data: {
        name: data.name,
        title: data.title,
        message: data.message,
        type: data.type,
        priority: data.priority || NotificationPriority.MEDIUM,
        targetRoles: data.targetRoles
      }
    });
  }

  // Get notification templates
  static async getTemplates() {
    return prisma.notificationTemplate.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' }
    });
  }

  // Send notification using template
  static async sendTemplateNotification(templateId: string, userIds: string[], variables: Record<string, any> = {}) {
    const template = await prisma.notificationTemplate.findUnique({
      where: { id: templateId }
    });

    if (!template) {
      throw new Error('Template not found');
    }

    const title = this.replaceVariables(template.title, variables);
    const message = this.replaceVariables(template.message, variables);

    return this.sendBulkNotification(userIds, {
      type: template.type,
      title,
      message,
      priority: template.priority,
      data: variables
    });
  }

  // Update user notification preferences
  static async updateUserPreferences(userId: string, preferences: {
    emailNotifications?: boolean;
    smsNotifications?: boolean;
    pushNotifications?: boolean;
    inAppNotifications?: boolean;
    orderNotifications?: boolean;
    paymentNotifications?: boolean;
    systemNotifications?: boolean;
    marketingNotifications?: boolean;
  }) {
    return prisma.userNotificationPreference.upsert({
      where: { userId },
      update: preferences,
      create: {
        userId,
        ...preferences
      }
    });
  }

  // Get user notification preferences
  static async getUserPreferences(userId: string) {
    return prisma.userNotificationPreference.findUnique({
      where: { userId }
    });
  }

  // Private helper methods
  private static getDefaultChannels(_type: NotificationTypeEnum, userPrefs: any): NotificationChannelEnum[] {
    const channels: NotificationChannelEnum[] = [NotificationChannel.IN_APP];

    if (!userPrefs) {
      return channels;
    }

    if (userPrefs.emailNotifications) {
      channels.push(NotificationChannel.EMAIL);
    }

    if (userPrefs.smsNotifications) {
      channels.push(NotificationChannel.SMS);
    }

    if (userPrefs.pushNotifications) {
      channels.push(NotificationChannel.PUSH);
    }

    return channels;
  }

  private static async sendNotificationThroughChannels(notification: any, channels: NotificationChannelEnum[], userPrefs: any) {
    const user = await prisma.user.findUnique({
      where: { id: notification.userId }
    });

    if (!user) return;

    for (const channel of channels) {
      try {
        switch (channel) {
          case NotificationChannel.EMAIL:
            if (userPrefs?.emailNotifications !== false) {
              await this.sendEmailNotification(user.email, notification);
            }
            break;

          case NotificationChannel.SMS:
            if (userPrefs?.smsNotifications !== false) {
              await this.sendSMSNotification(user.phoneNumber, notification);
            }
            break;

          case NotificationChannel.PUSH:
            if (userPrefs?.pushNotifications !== false) {
              await this.sendPushNotification(notification);
            }
            break;

          case NotificationChannel.IN_APP:
            // In-app notifications are handled by WebSocket
            // This will be implemented in the WebSocket service
            break;
        }
      } catch (error) {
        console.error(`Error sending ${channel} notification:`, error);
      }
    }
  }

  private static async sendEmailNotification(email: string, notification: any) {
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">${notification.title}</h2>
        <p style="color: #666; line-height: 1.6;">${notification.message}</p>
        <div style="margin-top: 20px; padding: 15px; background-color: #f8f9fa; border-radius: 5px;">
          <small style="color: #999;">
            Sent at: ${new Date(notification.sentAt).toLocaleString()}
          </small>
        </div>
      </div>
    `;

    const textContent = `${notification.title}\n\n${notification.message}\n\nSent at: ${new Date(notification.sentAt).toLocaleString()}`;

    await sendEmail({
      to: email,
      subject: notification.title,
      text: textContent,
      html: htmlContent
    });
  }

  private static async sendSMSNotification(phoneNumber: string, notification: any) {
    const message = `${notification.title}: ${notification.message}`;
    await sendSMS(phoneNumber, message);
  }

  private static async sendPushNotification(notification: any) {
    // This would integrate with a push notification service like OneSignal
    // For now, we'll log it
    console.log('Push notification would be sent:', notification);
  }

  private static replaceVariables(text: string, variables: Record<string, any>): string {
    return text.replace(/\{(\w+)\}/g, (match, key) => {
      return variables[key] || match;
    });
  }

  // Predefined notification methods for common scenarios
  static async sendOrderStatusNotification(userId: string, orderId: string, status: string) {
    return this.createNotification({
      userId,
      type: NotificationType.ORDER_STATUS,
      title: 'Order Status Update',
      message: `Your order #${orderId} has been ${status}`,
      data: { orderId, status },
      priority: NotificationPriority.HIGH
    });
  }

  static async sendPaymentNotification(userId: string, orderId: string, amount: number) {
    return this.createNotification({
      userId,
      type: NotificationType.PAYMENT,
      title: 'Payment Confirmation',
      message: `Payment of ₦${amount.toLocaleString()} for order #${orderId} has been confirmed`,
      data: { orderId, amount },
      priority: NotificationPriority.HIGH
    });
  }

  static async sendDeliveryNotification(userId: string, orderId: string, driverName: string) {
    return this.createNotification({
      userId,
      type: NotificationType.DELIVERY,
      title: 'Driver Assigned',
      message: `${driverName} has been assigned to deliver your order #${orderId}`,
      data: { orderId, driverName },
      priority: NotificationPriority.HIGH
    });
  }

  static async sendLowStockAlert(vendorId: string, productName: string, currentStock: number) {
    const vendor = await prisma.vendor.findUnique({
      where: { id: vendorId },
      include: { user: true }
    });

    if (!vendor) return;

    return this.createNotification({
      userId: vendor.userId,
      type: NotificationType.ALERT,
      title: 'Low Stock Alert',
      message: `${productName} stock is running low. Current level: ${currentStock} liters`,
      data: { productName, currentStock },
      priority: NotificationPriority.URGENT
    });
  }
} 