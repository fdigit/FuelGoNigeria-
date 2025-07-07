import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HTTPServer } from 'http';
import * as jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface AuthenticatedSocket {
  userId: string;
  userRole: string;
  socketId: string;
}

interface SocketData {
  user: {
    id: string;
    role: string;
  };
}

interface OrderStatusUpdateData {
  orderId: string;
  status: string;
  userId: string;
}

interface DeliveryUpdateData {
  orderId: string;
  driverId: string;
  status: string;
  location: any;
}

interface PaymentUpdateData {
  orderId: string;
  status: string;
  userId: string;
}

interface NotificationData {
  userId: string;
  notification: any;
}

interface DriverLocationUpdateData {
  driverId: string;
  orderId: string;
  location: any;
}

interface StockAlertData {
  vendorId: string;
  productName: string;
  currentStock: number;
}

interface AdminBroadcastData {
  message: string;
  targetRoles?: string[];
}

export class WebSocketService {
  private io: SocketIOServer;
  private connectedUsers: Map<string, AuthenticatedSocket> = new Map();

  constructor(server: HTTPServer) {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:3000",
        methods: ["GET", "POST"]
      }
    });

    this.setupMiddleware();
    this.setupEventHandlers();
  }

  private setupMiddleware() {
    // Authentication middleware
    this.io.use(async (socket: Socket<SocketData>, next: (err?: Error) => void) => {
      try {
        const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];
        
        if (!token) {
          return next(new Error('Authentication error: No token provided'));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;
        
        // Verify user exists and is active
        const user = await prisma.user.findUnique({
          where: { id: decoded.userId },
          select: { id: true, role: true, status: true }
        });

        if (!user || user.status !== 'ACTIVE') {
          return next(new Error('Authentication error: Invalid or inactive user'));
        }

        socket.data.user = {
          id: user.id,
          role: user.role
        };

        next();
      } catch (error) {
        next(new Error('Authentication error: Invalid token'));
      }
    });
  }

  private setupEventHandlers() {
    this.io.on('connection', (socket: Socket<SocketData>) => {
      const user = socket.data.user;
      
      // Store connected user
      this.connectedUsers.set(user.id, {
        userId: user.id,
        userRole: user.role,
        socketId: socket.id
      });

      console.log(`User ${user.id} connected with role ${user.role}`);

      // Join user to their personal room
      socket.join(`user:${user.id}`);

      // Join user to role-based rooms
      socket.join(`role:${user.role}`);
      socket.join('all');

      // Handle disconnection
      socket.on('disconnect', () => {
        this.connectedUsers.delete(user.id);
        console.log(`User ${user.id} disconnected`);
      });

      // Handle order status updates
      socket.on('order_status_update' as any, async (data: OrderStatusUpdateData) => {
        try {
          const { orderId, status, userId } = data;
          
          // Emit to specific user
          this.io.to(`user:${userId}`).emit('order_status_updated', {
            orderId,
            status,
            timestamp: new Date().toISOString()
          });
        } catch (error) {
          console.error('Error handling order status update:', error);
        }
      });

      // Handle delivery updates
      socket.on('delivery_update' as any, async (data: DeliveryUpdateData) => {
        try {
          const { orderId, driverId, status, location } = data;
          
          // Get order details to find customer
          const order = await prisma.order.findUnique({
            where: { id: orderId },
            select: { userId: true }
          });

          if (order) {
            // Emit to customer
            this.io.to(`user:${order.userId}`).emit('delivery_updated', {
              orderId,
              driverId,
              status,
              location,
              timestamp: new Date().toISOString()
            });
          }
        } catch (error) {
          console.error('Error handling delivery update:', error);
        }
      });

      // Handle payment updates
      socket.on('payment_update' as any, async (data: PaymentUpdateData) => {
        try {
          const { orderId, status, userId } = data;
          
          // Emit to customer
          this.io.to(`user:${userId}`).emit('payment_updated', {
            orderId,
            status,
            timestamp: new Date().toISOString()
          });
        } catch (error) {
          console.error('Error handling payment update:', error);
        }
      });

      // Handle new notifications
      socket.on('new_notification' as any, async (data: NotificationData) => {
        try {
          const { userId, notification } = data;
          
          // Emit to specific user
          this.io.to(`user:${userId}`).emit('notification_received', {
            notification,
            timestamp: new Date().toISOString()
          });
        } catch (error) {
          console.error('Error handling new notification:', error);
        }
      });

      // Handle driver location updates
      socket.on('driver_location_update' as any, async (data: DriverLocationUpdateData) => {
        try {
          const { driverId, orderId, location } = data;
          
          // Get order details to find customer
          const order = await prisma.order.findUnique({
            where: { id: orderId },
            select: { userId: true }
          });

          if (order) {
            // Emit to customer
            this.io.to(`user:${order.userId}`).emit('driver_location_updated', {
              driverId,
              orderId,
              location,
              timestamp: new Date().toISOString()
            });
          }
        } catch (error) {
          console.error('Error handling driver location update:', error);
        }
      });

      // Handle vendor stock alerts
      socket.on('stock_alert' as any, async (data: StockAlertData) => {
        try {
          const { vendorId, productName, currentStock } = data;
          
          // Get vendor details
          const vendor = await prisma.vendor.findUnique({
            where: { id: vendorId },
            select: { userId: true }
          });

          if (vendor) {
            // Emit to vendor
            this.io.to(`user:${vendor.userId}`).emit('stock_alert_received', {
              productName,
              currentStock,
              timestamp: new Date().toISOString()
            });
          }
        } catch (error) {
          console.error('Error handling stock alert:', error);
        }
      });

      // Handle admin broadcasts
      socket.on('admin_broadcast' as any, async (data: AdminBroadcastData) => {
        try {
          const { message, targetRoles } = data;
          
          if (targetRoles && targetRoles.length > 0) {
            // Emit to specific roles
            targetRoles.forEach((role: string) => {
              this.io.to(`role:${role}`).emit('admin_broadcast_received', {
                message,
                timestamp: new Date().toISOString()
              });
            });
          } else {
            // Emit to all users
            this.io.to('all').emit('admin_broadcast_received', {
              message,
              timestamp: new Date().toISOString()
            });
          }
        } catch (error) {
          console.error('Error handling admin broadcast:', error);
        }
      });
    });
  }

  // Public methods for sending notifications
  public sendNotificationToUser(userId: string, notification: any) {
    this.io.to(`user:${userId}`).emit('notification_received', {
      notification,
      timestamp: new Date().toISOString()
    });
  }

  public sendNotificationToRole(role: string, notification: any) {
    this.io.to(`role:${role}`).emit('notification_received', {
      notification,
      timestamp: new Date().toISOString()
    });
  }

  public sendNotificationToAll(notification: any) {
    this.io.to('all').emit('notification_received', {
      notification,
      timestamp: new Date().toISOString()
    });
  }

  public sendOrderStatusUpdate(orderId: string, status: string, userId: string) {
    this.io.to(`user:${userId}`).emit('order_status_updated', {
      orderId,
      status,
      timestamp: new Date().toISOString()
    });
  }

  public sendDeliveryUpdate(orderId: string, driverId: string, status: string, location: any) {
    // This will be handled by the order service
    this.io.emit('delivery_update', {
      orderId,
      driverId,
      status,
      location,
      timestamp: new Date().toISOString()
    });
  }

  public sendPaymentUpdate(orderId: string, status: string, userId: string) {
    this.io.to(`user:${userId}`).emit('payment_updated', {
      orderId,
      status,
      timestamp: new Date().toISOString()
    });
  }

  public sendDriverLocationUpdate(driverId: string, orderId: string, location: any) {
    this.io.emit('driver_location_update', {
      driverId,
      orderId,
      location,
      timestamp: new Date().toISOString()
    });
  }

  public sendStockAlert(vendorId: string, productName: string, currentStock: number) {
    this.io.emit('stock_alert', {
      vendorId,
      productName,
      currentStock,
      timestamp: new Date().toISOString()
    });
  }

  public sendAdminBroadcast(message: string, targetRoles?: string[]) {
    this.io.emit('admin_broadcast', {
      message,
      targetRoles,
      timestamp: new Date().toISOString()
    });
  }

  // Get connected users info
  public getConnectedUsers() {
    return Array.from(this.connectedUsers.values());
  }

  public getConnectedUsersCount() {
    return this.connectedUsers.size;
  }

  public isUserConnected(userId: string) {
    return this.connectedUsers.has(userId);
  }
} 