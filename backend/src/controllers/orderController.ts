import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { WebSocketService } from '../services/websocket.service';
import { NotificationService } from '../services/notification.service';

const prisma = new PrismaClient();

// Order status state machine
const ORDER_STATUS_FLOW = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['preparing', 'cancelled'],
  preparing: ['out_for_delivery', 'cancelled'],
  out_for_delivery: ['delivered', 'cancelled'],
  delivered: [],
  cancelled: []
};

export const orderController = {
  // Create new order
  async createOrder(req: Request, res: Response) {
    try {
      if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
      const userId = req.user.userId;
      const { vendorId, orderItems, deliveryAddress, phoneNumber, paymentMethod, specialInstructions } = req.body;

      // Validate vendor exists and is active
      const vendor = await prisma.vendor.findFirst({
        where: { 
          id: vendorId,
          isActive: true,
          verificationStatus: 'VERIFIED'
        }
      });

      if (!vendor) {
        return res.status(404).json({ message: 'Vendor not found or not available' });
      }

      // Validate and calculate order
      let subtotal = 0;
      const validatedItems: any[] = [];

      for (const item of orderItems) {
        const product = await prisma.product.findFirst({
          where: { 
            id: item.productId,
            vendorId: vendorId,
            status: 'AVAILABLE'
          }
        });

        if (!product) {
          return res.status(404).json({ message: `Product ${item.productId} not found or unavailable` });
        }

        if (product.availableQty < item.quantity) {
          return res.status(400).json({ 
            message: `Insufficient stock for ${product.name}. Available: ${product.availableQty} ${product.unit}` 
          });
        }

        if (item.quantity < product.minOrderQty) {
          return res.status(400).json({ 
            message: `Minimum order quantity for ${product.name} is ${product.minOrderQty} ${product.unit}` 
          });
        }

        if (item.quantity > product.maxOrderQty) {
          return res.status(400).json({ 
            message: `Maximum order quantity for ${product.name} is ${product.maxOrderQty} ${product.unit}` 
          });
        }

        subtotal += product.pricePerUnit * item.quantity;
        validatedItems.push({ ...item, price: product.pricePerUnit });
      }

      const totalAmount = subtotal + vendor.deliveryFee;

      // Check minimum order amount
      if (subtotal < vendor.minimumOrder) {
        return res.status(400).json({ 
          message: `Minimum order amount is ₦${vendor.minimumOrder}` 
        });
      }

      // Create order with transaction
      const order = await prisma.$transaction(async (tx) => {
        // Create order
        const newOrder = await tx.order.create({
          data: {
            userId,
            vendorId,
            status: 'PENDING',
            totalAmount,
            deliveryFee: vendor.deliveryFee,
            address: deliveryAddress,
            deliveryAddress,
            deliveryInstructions: specialInstructions,
            paymentStatus: 'PENDING',
            paymentMethod: paymentMethod.toUpperCase(),
            orderItems: {
              create: validatedItems.map(item => ({
                productId: item.productId,
                quantity: item.quantity,
                price: item.price
              }))
            }
          },
          include: {
            orderItems: {
              include: {
                product: true
              }
            },
            user: {
              select: {
                firstName: true,
                lastName: true,
                phoneNumber: true,
                email: true
              }
            },
            vendor: {
              select: {
                businessName: true,
                address: true
              }
            }
          }
        });

        // Update product stock
        for (const item of validatedItems) {
          await tx.product.update({
            where: { id: item.productId },
            data: { 
              availableQty: {
                decrement: item.quantity
              }
            }
          });
        }

        // Update user phone number if provided
        if (phoneNumber) {
          await tx.user.update({
            where: { id: userId },
            data: { phoneNumber }
          });
        }

        return newOrder;
      });

      // Send notifications
      await NotificationService.sendOrderStatusNotification(order.userId, order.id, 'pending');
      // Fetch vendor's userId for notification
      const vendorUser = await prisma.vendor.findUnique({ where: { id: order.vendorId }, select: { userId: true } });
      if (vendorUser) {
        await NotificationService.sendOrderStatusNotification(vendorUser.userId, order.id, 'pending');
      }

      // Send real-time update
      const webSocketService = (global as any).webSocketService as WebSocketService;
      if (webSocketService) {
        webSocketService.sendOrderStatusUpdate(order.id, 'pending', order.userId);
        webSocketService.sendOrderStatusUpdate(order.id, 'pending', vendor.userId);
      }

      res.status(201).json({
        message: 'Order created successfully',
        order: {
          id: order.id,
          status: order.status,
          totalAmount: order.totalAmount,
          estimatedDelivery: order.estimatedDelivery,
          orderNumber: order.id.slice(-8).toUpperCase()
        }
      });

    } catch (error) {
      console.error('Error creating order:', error);
      res.status(500).json({ message: 'Failed to create order' });
    }
    return;
  },

  // Get customer orders
  async getCustomerOrders(req: Request, res: Response) {
    try {
      if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
      const userId = req.user.userId;
      const { status, dateRange, search, page = 1, limit = 10 } = req.query;

      const where: any = { userId };

      if (status && status !== 'all') {
        where.status = status.toString().toUpperCase();
      }

      if (dateRange) {
        const now = new Date();
        let startDate = new Date();
        
        switch (dateRange) {
          case 'today':
            startDate.setHours(0, 0, 0, 0);
            break;
          case 'week':
            startDate.setDate(now.getDate() - 7);
            break;
          case 'month':
            startDate.setMonth(now.getMonth() - 1);
            break;
          case 'year':
            startDate.setFullYear(now.getFullYear() - 1);
            break;
        }
        
        where.createdAt = { gte: startDate };
      }

      if (search) {
        where.OR = [
          { id: { contains: search.toString(), mode: 'insensitive' } },
          { vendor: { businessName: { contains: search.toString(), mode: 'insensitive' } } }
        ];
      }

      const skip = (Number(page) - 1) * Number(limit);

      const [orders, total] = await Promise.all([
        prisma.order.findMany({
          where,
          include: {
            orderItems: {
              include: {
                product: true
              }
            },
            vendor: {
              select: {
                businessName: true,
                address: true
              }
            },
            driver: {
              select: {
                firstName: true,
                lastName: true,
                phoneNumber: true
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take: Number(limit)
        }),
        prisma.order.count({ where })
      ]);

      res.json({
        orders,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      });

    } catch (error) {
      console.error('Error fetching customer orders:', error);
      res.status(500).json({ message: 'Failed to fetch orders' });
    }
    return;
  },

  // Get vendor orders
  async getVendorOrders(req: Request, res: Response) {
    try {
      if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
      const userId = req.user.userId;
      const { status, dateRange, search, page = 1, limit = 10 } = req.query;

      // Get vendor
      const vendor = await prisma.vendor.findUnique({
        where: { userId }
      });

      if (!vendor) {
        return res.status(404).json({ message: 'Vendor not found' });
      }

      const where: any = { vendorId: vendor.id };

      if (status && status !== 'all') {
        where.status = status.toString().toUpperCase();
      }

      if (dateRange) {
        const now = new Date();
        let startDate = new Date();
        
        switch (dateRange) {
          case 'today':
            startDate.setHours(0, 0, 0, 0);
            break;
          case 'week':
            startDate.setDate(now.getDate() - 7);
            break;
          case 'month':
            startDate.setMonth(now.getMonth() - 1);
            break;
          case 'year':
            startDate.setFullYear(now.getFullYear() - 1);
            break;
        }
        
        where.createdAt = { gte: startDate };
      }

      if (search) {
        where.OR = [
          { id: { contains: search.toString(), mode: 'insensitive' } },
          { user: { 
            OR: [
              { firstName: { contains: search.toString(), mode: 'insensitive' } },
              { lastName: { contains: search.toString(), mode: 'insensitive' } }
            ]
          } }
        ];
      }

      const skip = (Number(page) - 1) * Number(limit);

      const [orders, total] = await Promise.all([
        prisma.order.findMany({
          where,
          include: {
            orderItems: {
              include: {
                product: true
              }
            },
            user: {
              select: {
                firstName: true,
                lastName: true,
                phoneNumber: true,
                email: true
              }
            },
            driver: {
              select: {
                firstName: true,
                lastName: true,
                phoneNumber: true
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take: Number(limit)
        }),
        prisma.order.count({ where })
      ]);

      res.json({
        orders,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      });

    } catch (error) {
      console.error('Error fetching vendor orders:', error);
      res.status(500).json({ message: 'Failed to fetch orders' });
    }
    return;
  },

  // Get single order
  async getOrderById(req: Request, res: Response) {
    try {
      if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
      const { orderId } = req.params;
      const userId = req.user.userId;
      const userRole = req.user.role;

      const where: any = { id: orderId };

      // Role-based access control
      if (userRole === 'CUSTOMER') {
        where.userId = userId;
      } else if (userRole === 'VENDOR') {
        const vendor = await prisma.vendor.findUnique({ where: { userId } });
        if (!vendor) {
          return res.status(404).json({ message: 'Vendor not found' });
        }
        where.vendorId = vendor.id;
      } else if (userRole === 'DRIVER') {
        const driver = await prisma.driver.findUnique({ where: { userId } });
        if (!driver) {
          return res.status(404).json({ message: 'Driver not found' });
        }
        where.driverId = driver.id;
      }
      // Admin can access all orders

      const order = await prisma.order.findFirst({
        where,
        include: {
          orderItems: {
            include: {
              product: true
            }
          },
          user: {
            select: {
              firstName: true,
              lastName: true,
              phoneNumber: true,
              email: true
            }
          },
          vendor: {
            select: {
              businessName: true,
              address: true
            }
          },
          driver: {
            select: {
              firstName: true,
              lastName: true,
              phoneNumber: true
            }
          }
        }
      });

      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }

      res.json({ order });

    } catch (error) {
      console.error('Error fetching order:', error);
      res.status(500).json({ message: 'Failed to fetch order' });
    }
    return;
  },

  // Update order status
  async updateOrderStatus(req: Request, res: Response) {
    try {
      if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
      const { orderId } = req.params;
      const { status } = req.body;
      const userId = req.user.userId;

      // Verify vendor owns this order
      const vendor = await prisma.vendor.findUnique({
        where: { userId }
      });

      if (!vendor) {
        return res.status(404).json({ message: 'Vendor not found' });
      }

      const order = await prisma.order.findFirst({
        where: {
          id: orderId,
          vendorId: vendor.id
        }
      });

      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }

      // Validate status transition
      const allowedTransitions: string[] = ORDER_STATUS_FLOW[order.status.toLowerCase() as keyof typeof ORDER_STATUS_FLOW];
      if (!allowedTransitions.includes(status)) {
        return res.status(400).json({ 
          message: `Invalid status transition from ${order.status} to ${status}` 
        });
      }

      const updatedOrder = await prisma.order.update({
        where: { id: orderId },
        data: { 
          status: status.toUpperCase(),
          updatedAt: new Date()
        },
        include: {
          orderItems: {
            include: {
              product: true
            }
          },
          user: {
            select: {
              firstName: true,
              lastName: true,
              phoneNumber: true,
              email: true
            }
          },
          driver: {
            select: {
              firstName: true,
              lastName: true,
              phoneNumber: true
            }
          }
        }
      });

      // Send notifications
      await NotificationService.sendOrderStatusNotification(updatedOrder.userId, updatedOrder.id, updatedOrder.status);

      // Send real-time update
      const webSocketService = (global as any).webSocketService as WebSocketService;
      if (webSocketService) {
        webSocketService.sendOrderStatusUpdate(orderId, status, order.userId);
      }

      res.json({
        message: 'Order status updated successfully',
        order: updatedOrder
      });

    } catch (error) {
      console.error('Error updating order status:', error);
      res.status(500).json({ message: 'Failed to update order status' });
    }
    return;
  },

  // Assign driver to order
  async assignDriver(req: Request, res: Response) {
    try {
      if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
      const { orderId } = req.params;
      const { driverId } = req.body;
      const userId = req.user.userId;

      // Verify vendor owns this order
      const vendor = await prisma.vendor.findUnique({
        where: { userId }
      });

      if (!vendor) {
        return res.status(404).json({ message: 'Vendor not found' });
      }

      const order = await prisma.order.findFirst({
        where: {
          id: orderId,
          vendorId: vendor.id
        }
      });

      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }

      // Verify driver exists and belongs to vendor
      const driver = await prisma.driver.findFirst({
        where: {
          id: driverId,
          vendorId: vendor.id,
          status: 'AVAILABLE'
        }
      });

      if (!driver) {
        return res.status(404).json({ message: 'Driver not found or not available' });
      }

      const updatedOrder = await prisma.order.update({
        where: { id: orderId },
        data: { 
          driverId,
          updatedAt: new Date()
        },
        include: {
          orderItems: {
            include: {
              product: true
            }
          },
          user: {
            select: {
              firstName: true,
              lastName: true,
              phoneNumber: true,
              email: true
            }
          },
          driver: {
            select: {
              firstName: true,
              lastName: true,
              phoneNumber: true
            }
          }
        }
      });

      // Update driver status
      await prisma.driver.update({
        where: { id: driverId },
        data: { status: 'BUSY' }
      });

      // Send notifications
      if (updatedOrder.driverId) {
        const driver = await prisma.driver.findUnique({ where: { id: updatedOrder.driverId }, include: { user: true } });
        if (driver && driver.user) {
          await NotificationService.sendDeliveryNotification(updatedOrder.userId, updatedOrder.id, `${driver.user.firstName} ${driver.user.lastName}`);
        }
      }

      res.json({
        message: 'Driver assigned successfully',
        order: updatedOrder
      });

    } catch (error) {
      console.error('Error assigning driver:', error);
      res.status(500).json({ message: 'Failed to assign driver' });
    }
    return;
  },

  // Cancel order
  async cancelOrder(req: Request, res: Response) {
    try {
      if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
      const { orderId } = req.params;
      const userId = req.user.userId;

      const order = await prisma.order.findFirst({
        where: {
          id: orderId,
          userId
        },
        include: {
          orderItems: true
        }
      });

      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }

      // Check if order can be cancelled
      if (!['PENDING', 'CONFIRMED'].includes(order.status)) {
        return res.status(400).json({ 
          message: 'Order cannot be cancelled at this stage' 
        });
      }

      const updatedOrder = await prisma.$transaction(async (tx) => {
        // Update order status
        const cancelledOrder = await tx.order.update({
          where: { id: orderId },
          data: { 
            status: 'CANCELLED',
            updatedAt: new Date()
          },
          include: {
            orderItems: {
              include: {
                product: true
              }
            },
            user: {
              select: {
                firstName: true,
                lastName: true,
                phoneNumber: true,
                email: true
              }
            },
            vendor: {
              select: {
                businessName: true,
                address: true
              }
            }
          }
        });

        // Restore product stock
        for (const item of order.orderItems) {
          await tx.product.update({
            where: { id: item.productId },
            data: { 
              availableQty: {
                increment: item.quantity
              }
            }
          });
        }

        return cancelledOrder;
      });

      // Send notifications
      await NotificationService.sendOrderStatusNotification(updatedOrder.userId, updatedOrder.id, 'cancelled');

      res.json({
        message: 'Order cancelled successfully',
        order: updatedOrder
      });

    } catch (error) {
      console.error('Error cancelling order:', error);
      res.status(500).json({ message: 'Failed to cancel order' });
    }
    return;
  },

  // Get order summary for pricing
  async getOrderSummary(req: Request, res: Response) {
    try {
      if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
      const { vendorId, orderItems } = req.body;

      let subtotal = 0;
      const items = [];

      for (const item of orderItems) {
        const product = await prisma.product.findFirst({
          where: { 
            id: item.productId,
            vendorId,
            status: 'AVAILABLE'
          }
        });

        if (!product) {
          return res.status(404).json({ message: `Product ${item.productId} not found` });
        }

        const itemTotal = product.pricePerUnit * item.quantity;
        subtotal += itemTotal;

        items.push({
          product,
          quantity: item.quantity,
          price: product.pricePerUnit,
          total: itemTotal
        });
      }

      const vendor = await prisma.vendor.findUnique({
        where: { id: vendorId },
        select: { deliveryFee: true, minimumOrder: true }
      });

      if (!vendor) {
        return res.status(404).json({ message: 'Vendor not found' });
      }

      const deliveryFee = vendor.deliveryFee;
      const total = subtotal + deliveryFee;

      res.json({
        items,
        subtotal,
        deliveryFee,
        total,
        minimumOrder: vendor.minimumOrder,
        meetsMinimum: subtotal >= vendor.minimumOrder
      });

    } catch (error) {
      console.error('Error calculating order summary:', error);
      res.status(500).json({ message: 'Failed to calculate order summary' });
    }
    return;
  },

  // Admin intervention
  async adminIntervention(req: Request, res: Response) {
    try {
      if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
      const { orderId } = req.params;
      const { action, reason, newStatus, driverId } = req.body;
      const userId = req.user.userId;

      // Verify admin role
      const user = await prisma.user.findUnique({
        where: { id: userId }
      });

      if (user?.role !== 'ADMIN') {
        return res.status(403).json({ message: 'Admin access required' });
      }

      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
          orderItems: {
            include: {
              product: true
            }
          },
          user: {
            select: {
              firstName: true,
              lastName: true,
              phoneNumber: true,
              email: true
            }
          },
          vendor: {
            select: {
              businessName: true,
              address: true
            }
          }
        }
      });

      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }

      let updatedOrder = order;

      switch (action) {
        case 'force_cancel':
          updatedOrder = await prisma.order.update({
            where: { id: orderId },
            data: { 
              status: 'CANCELLED',
              updatedAt: new Date()
            },
            include: {
              orderItems: {
                include: {
                  product: true
                }
              },
              user: {
                select: {
                  firstName: true,
                  lastName: true,
                  phoneNumber: true,
                  email: true
                }
              },
              vendor: {
                select: {
                  businessName: true,
                  address: true
                }
              }
            }
          });
          break;

        case 'force_confirm':
          updatedOrder = await prisma.order.update({
            where: { id: orderId },
            data: { 
              status: 'CONFIRMED',
              updatedAt: new Date()
            },
            include: {
              orderItems: {
                include: {
                  product: true
                }
              },
              user: {
                select: {
                  firstName: true,
                  lastName: true,
                  phoneNumber: true,
                  email: true
                }
              },
              vendor: {
                select: {
                  businessName: true,
                  address: true
                }
              }
            }
          });
          break;

        case 'assign_driver':
          if (!driverId) {
            return res.status(400).json({ message: 'Driver ID required' });
          }
          updatedOrder = await prisma.order.update({
            where: { id: orderId },
            data: { 
              driverId,
              updatedAt: new Date()
            },
            include: {
              orderItems: {
                include: {
                  product: true
                }
              },
              user: {
                select: {
                  firstName: true,
                  lastName: true,
                  phoneNumber: true,
                  email: true
                }
              },
              vendor: {
                select: {
                  businessName: true,
                  address: true
                }
              }
            }
          });
          break;

        case 'update_status':
          if (!newStatus) {
            return res.status(400).json({ message: 'New status required' });
          }
          updatedOrder = await prisma.order.update({
            where: { id: orderId },
            data: { 
              status: newStatus.toUpperCase(),
              updatedAt: new Date()
            },
            include: {
              orderItems: {
                include: {
                  product: true
                }
              },
              user: {
                select: {
                  firstName: true,
                  lastName: true,
                  phoneNumber: true,
                  email: true
                }
              },
              vendor: {
                select: {
                  businessName: true,
                  address: true
                }
              }
            }
          });
          break;

        case 'refund':
          // Implement refund logic here
          break;
      }

      // Log admin intervention
      await prisma.notification.create({
        data: {
          userId: order.userId,
          type: 'SYSTEM',
          title: 'Admin Intervention',
          message: `Admin ${user.firstName} ${user.lastName} performed action: ${action}. Reason: ${reason}`,
          priority: 'HIGH',
          channel: ['IN_APP', 'EMAIL']
        }
      });

      res.json({
        message: 'Admin intervention completed successfully',
        order: updatedOrder
      });

    } catch (error) {
      console.error('Error performing admin intervention:', error);
      res.status(500).json({ message: 'Failed to perform admin intervention' });
    }
    return;
  },

  // Get order analytics (admin only)
  async getOrderAnalytics(req: Request, res: Response) {
    try {
      if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
      const userId = req.user.userId;

      // Verify admin role
      const user = await prisma.user.findUnique({
        where: { id: userId }
      });

      if (user?.role !== 'ADMIN') {
        return res.status(403).json({ message: 'Admin access required' });
      }

      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));

      const [
        totalOrders,
        pendingOrders,
        completedOrders,
        cancelledOrders,
        monthlyOrders,
        weeklyOrders,
        totalRevenue,
        monthlyRevenue,
        weeklyRevenue
      ] = await Promise.all([
        prisma.order.count(),
        prisma.order.count({ where: { status: 'PENDING' } }),
        prisma.order.count({ where: { status: 'DELIVERED' } }),
        prisma.order.count({ where: { status: 'CANCELLED' } }),
        prisma.order.count({ where: { createdAt: { gte: startOfMonth } } }),
        prisma.order.count({ where: { createdAt: { gte: startOfWeek } } }),
        prisma.order.aggregate({
          where: { status: 'DELIVERED' },
          _sum: { totalAmount: true }
        }),
        prisma.order.aggregate({
          where: { 
            status: 'DELIVERED',
            createdAt: { gte: startOfMonth }
          },
          _sum: { totalAmount: true }
        }),
        prisma.order.aggregate({
          where: { 
            status: 'DELIVERED',
            createdAt: { gte: startOfWeek }
          },
          _sum: { totalAmount: true }
        })
      ]);

      res.json({
        analytics: {
          totalOrders,
          pendingOrders,
          completedOrders,
          cancelledOrders,
          monthlyOrders,
          weeklyOrders,
          totalRevenue: totalRevenue._sum.totalAmount || 0,
          monthlyRevenue: monthlyRevenue._sum.totalAmount || 0,
          weeklyRevenue: weeklyRevenue._sum.totalAmount || 0
        }
      });

    } catch (error) {
      console.error('Error fetching order analytics:', error);
      res.status(500).json({ message: 'Failed to fetch analytics' });
    }
    return;
  },

  // Driver-specific methods
  async getDriverOrders(req: Request, res: Response) {
    try {
      if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
      const userId = req.user.userId;
      const { status, page = 1, limit = 10 } = req.query;

      const driver = await prisma.driver.findUnique({
        where: { userId }
      });

      if (!driver) {
        return res.status(404).json({ message: 'Driver not found' });
      }

      const where: any = { driverId: driver.id };

      if (status && status !== 'all') {
        where.status = status.toString().toUpperCase();
      }

      const skip = (Number(page) - 1) * Number(limit);

      const [orders, total] = await Promise.all([
        prisma.order.findMany({
          where,
          include: {
            orderItems: {
              include: {
                product: true
              }
            },
            user: {
              select: {
                firstName: true,
                lastName: true,
                phoneNumber: true,
                email: true
              }
            },
            vendor: {
              select: {
                businessName: true,
                address: true
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take: Number(limit)
        }),
        prisma.order.count({ where })
      ]);

      res.json({
        orders,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      });

    } catch (error) {
      console.error('Error fetching driver orders:', error);
      res.status(500).json({ message: 'Failed to fetch orders' });
    }
    return;
  },

  async updateDriverLocation(req: Request, res: Response) {
    try {
      if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
      const { orderId } = req.params;
      const { location } = req.body;
      const userId = req.user.userId;

      const driver = await prisma.driver.findUnique({
        where: { userId }
      });

      if (!driver) {
        return res.status(404).json({ message: 'Driver not found' });
      }

      const order = await prisma.order.findFirst({
        where: {
          id: orderId,
          driverId: driver.id
        }
      });

      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }

      // Send real-time location update
      const webSocketService = (global as any).webSocketService as WebSocketService;
      if (webSocketService) {
        webSocketService.sendDriverLocationUpdate(driver.id, orderId, location);
      }

      res.json({
        message: 'Location updated successfully'
      });

    } catch (error) {
      console.error('Error updating driver location:', error);
      res.status(500).json({ message: 'Failed to update location' });
    }
    return;
  },

  async completeDelivery(req: Request, res: Response) {
    try {
      if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
      const { orderId } = req.params;
      const userId = req.user.userId;

      const driver = await prisma.driver.findUnique({
        where: { userId }
      });

      if (!driver) {
        return res.status(404).json({ message: 'Driver not found' });
      }

      const order = await prisma.order.findFirst({
        where: {
          id: orderId,
          driverId: driver.id
        }
      });

      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }

      const updatedOrder = await prisma.$transaction(async (tx) => {
        // Update order status
        const deliveredOrder = await tx.order.update({
          where: { id: orderId },
          data: { 
            status: 'DELIVERED',
            updatedAt: new Date()
          },
          include: {
            orderItems: {
              include: {
                product: true
              }
            },
            user: {
              select: {
                firstName: true,
                lastName: true,
                phoneNumber: true,
                email: true
              }
            },
            vendor: {
              select: {
                businessName: true,
                address: true
              }
            }
          }
        });

        // Update driver status back to available
        await tx.driver.update({
          where: { id: driver.id },
          data: { status: 'AVAILABLE' }
        });

        return deliveredOrder;
      });

      // Send notifications
      await NotificationService.sendOrderStatusNotification(updatedOrder.userId, updatedOrder.id, 'delivered');

      res.json({
        message: 'Delivery completed successfully',
        order: updatedOrder
      });

    } catch (error) {
      console.error('Error completing delivery:', error);
      res.status(500).json({ message: 'Failed to complete delivery' });
    }
    return;
  },

  // Get all orders (admin only)
  async getAllOrders(req: Request, res: Response) {
    try {
      if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
      const userId = req.user.userId;
      const { status, dateRange, search, page = 1, limit = 10 } = req.query;

      // Verify admin role
      const user = await prisma.user.findUnique({
        where: { id: userId }
      });

      if (user?.role !== 'ADMIN') {
        return res.status(403).json({ message: 'Admin access required' });
      }

      const where: any = {};

      if (status && status !== 'all') {
        where.status = status.toString().toUpperCase();
      }

      if (dateRange) {
        const now = new Date();
        let startDate = new Date();
        
        switch (dateRange) {
          case 'today':
            startDate.setHours(0, 0, 0, 0);
            break;
          case 'week':
            startDate.setDate(now.getDate() - 7);
            break;
          case 'month':
            startDate.setMonth(now.getMonth() - 1);
            break;
          case 'year':
            startDate.setFullYear(now.getFullYear() - 1);
            break;
        }
        
        where.createdAt = { gte: startDate };
      }

      if (search) {
        where.OR = [
          { id: { contains: search.toString(), mode: 'insensitive' } },
          { user: { 
            OR: [
              { firstName: { contains: search.toString(), mode: 'insensitive' } },
              { lastName: { contains: search.toString(), mode: 'insensitive' } }
            ]
          } },
          { vendor: { businessName: { contains: search.toString(), mode: 'insensitive' } } }
        ];
      }

      const skip = (Number(page) - 1) * Number(limit);

      const [orders, total] = await Promise.all([
        prisma.order.findMany({
          where,
          include: {
            orderItems: {
              include: {
                product: true
              }
            },
            user: {
              select: {
                firstName: true,
                lastName: true,
                phoneNumber: true,
                email: true
              }
            },
            vendor: {
              select: {
                businessName: true,
                address: true
              }
            },
            driver: {
              select: {
                firstName: true,
                lastName: true,
                phoneNumber: true
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take: Number(limit)
        }),
        prisma.order.count({ where })
      ]);

      res.json({
        orders,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      });

    } catch (error) {
      console.error('Error fetching all orders:', error);
      res.status(500).json({ message: 'Failed to fetch orders' });
    }
    return;
  }
}; 