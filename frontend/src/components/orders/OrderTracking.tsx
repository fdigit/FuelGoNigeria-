import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams } from 'react-router-dom';
import { useToast } from '../../contexts/ToastContext';
import { useAuth } from '../../contexts/AuthContext';
import { orderService } from '../../services/order.service';
import { Order } from '../../types/order';
import webSocketService from '../../services/websocket.service';

interface OrderStatusStep {
  status: Order['status'];
  title: string;
  description: string;
  icon: string;
  completed: boolean;
  current: boolean;
}

export default function OrderTracking() {
  const { orderId } = useParams<{ orderId: string }>();
  const { showToast } = useToast();
  const { user } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [driverLocation, setDriverLocation] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    if (orderId) {
      loadOrder();
    }
  }, [orderId]);

  // Real-time updates
  useEffect(() => {
    if (!orderId) return;

    const handleOrderStatusUpdate = (data: any) => {
      if (data.orderId === orderId) {
        showToast('info', `Order status updated to ${data.status}`);
        loadOrder(); // Refresh order data
      }
    };

    const handleDeliveryUpdate = (data: any) => {
      if (data.orderId === orderId) {
        showToast('info', `Delivery update: ${data.status}`);
        loadOrder();
      }
    };

    const handleDriverLocationUpdate = (data: any) => {
      if (data.orderId === orderId) {
        setDriverLocation(data.location);
      }
    };

    // Setup WebSocket listeners
    webSocketService.on('order_status_updated', handleOrderStatusUpdate);
    webSocketService.on('delivery_updated', handleDeliveryUpdate);
    webSocketService.on('driver_location_updated', handleDriverLocationUpdate);

    // Cleanup listeners
    return () => {
      webSocketService.off('order_status_updated', handleOrderStatusUpdate);
      webSocketService.off('delivery_updated', handleDeliveryUpdate);
      webSocketService.off('driver_location_updated', handleDriverLocationUpdate);
    };
  }, [orderId, showToast]);

  const loadOrder = async () => {
    if (!orderId) return;
    
    setIsLoading(true);
    try {
      const orderData = await orderService.getOrder(orderId);
      setOrder(orderData);
    } catch (error) {
      console.error('Error loading order:', error);
      showToast('error', 'Failed to load order details');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusSteps = (): OrderStatusStep[] => {
    if (!order) return [];

    const steps: OrderStatusStep[] = [
      {
        status: 'pending',
        title: 'Order Placed',
        description: 'Your order has been received',
        icon: '📋',
        completed: ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered'].includes(order.status),
        current: order.status === 'pending'
      },
      {
        status: 'confirmed',
        title: 'Order Confirmed',
        description: 'Vendor has confirmed your order',
        icon: '✅',
        completed: ['confirmed', 'preparing', 'out_for_delivery', 'delivered'].includes(order.status),
        current: order.status === 'confirmed'
      },
      {
        status: 'preparing',
        title: 'Preparing',
        description: 'Your order is being prepared',
        icon: '⚡',
        completed: ['preparing', 'out_for_delivery', 'delivered'].includes(order.status),
        current: order.status === 'preparing'
      },
      {
        status: 'out_for_delivery',
        title: 'Out for Delivery',
        description: 'Driver is on the way',
        icon: '🚚',
        completed: ['out_for_delivery', 'delivered'].includes(order.status),
        current: order.status === 'out_for_delivery'
      },
      {
        status: 'delivered',
        title: 'Delivered',
        description: 'Order has been delivered',
        icon: '🎉',
        completed: order.status === 'delivered',
        current: order.status === 'delivered'
      }
    ];

    if (order.status === 'cancelled') {
      steps.push({
        status: 'cancelled',
        title: 'Cancelled',
        description: 'Order has been cancelled',
        icon: '❌',
        completed: true,
        current: true
      });
    }

    return steps;
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'delivered':
        return 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-200';
      case 'cancelled':
        return 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-200';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-200';
      case 'confirmed':
        return 'text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-200';
      case 'preparing':
        return 'text-purple-600 bg-purple-100 dark:bg-purple-900 dark:text-purple-200';
      case 'out_for_delivery':
        return 'text-indigo-600 bg-indigo-100 dark:bg-indigo-900 dark:text-indigo-200';
      default:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-NG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calculateETA = () => {
    if (!order?.estimatedDelivery) return null;
    
    const estimated = new Date(order.estimatedDelivery);
    const now = new Date();
    const diffMs = estimated.getTime() - now.getTime();
    const diffMins = Math.round(diffMs / 60000);
    
    if (diffMins <= 0) return 'Arriving soon';
    if (diffMins < 60) return `${diffMins} minutes`;
    
    const hours = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    return `${hours}h ${mins}m`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">📦</div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Order Not Found</h2>
          <p className="text-gray-600 dark:text-gray-400">The order you're looking for doesn't exist or you don't have permission to view it.</p>
        </div>
      </div>
    );
  }

  const statusSteps = getStatusSteps();
  const eta = calculateETA();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Order #{order._id.slice(-8).toUpperCase()}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Placed on {formatDate(order.createdAt)}
              </p>
            </div>
            <div className="text-right">
              <div className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(order.status)}`}>
                {order.status.replace('_', ' ').toUpperCase()}
              </div>
              {eta && order.status === 'out_for_delivery' && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  ETA: {eta}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Order Progress */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                Order Progress
              </h2>
              
              <div className="space-y-6">
                {statusSteps.map((step, index) => (
                  <motion.div
                    key={step.status}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-start space-x-4"
                  >
                    <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-lg ${
                      step.completed 
                        ? 'bg-green-500 text-white' 
                        : step.current 
                        ? 'bg-primary-500 text-white' 
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
                    }`}>
                      {step.completed ? '✓' : step.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className={`text-sm font-medium ${
                        step.completed || step.current 
                          ? 'text-gray-900 dark:text-white' 
                          : 'text-gray-500 dark:text-gray-400'
                      }`}>
                        {step.title}
                      </h3>
                      <p className={`text-sm ${
                        step.completed || step.current 
                          ? 'text-gray-600 dark:text-gray-300' 
                          : 'text-gray-400 dark:text-gray-500'
                      }`}>
                        {step.description}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Driver Location (if out for delivery) */}
            {order.status === 'out_for_delivery' && order.driver && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mt-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Driver Location
                </h2>
                <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {order.driver.firstName} {order.driver.lastName}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {driverLocation ? 'Live tracking active' : 'Location updating...'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Order Details */}
          <div className="space-y-6">
            {/* Order Summary */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Order Summary
              </h2>
              
              <div className="space-y-3">
                {order.orderItems.map((item) => (
                  <div key={item._id} className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {item.product?.name || 'Product'}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {item.quantity} {item.product?.unit || 'units'}
                      </p>
                    </div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      ₦{(item.price * item.quantity).toLocaleString()}
                    </p>
                  </div>
                ))}
                
                <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                    <span className="text-gray-900 dark:text-white">
                      ₦{(order.totalAmount - order.deliveryFee).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Delivery Fee</span>
                    <span className="text-gray-900 dark:text-white">
                      ₦{order.deliveryFee.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center font-medium">
                    <span className="text-gray-900 dark:text-white">Total</span>
                    <span className="text-gray-900 dark:text-white">
                      ₦{order.totalAmount.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Delivery Details */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Delivery Details
              </h2>
              
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Delivery Address</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {order.deliveryAddress?.street && `${order.deliveryAddress.street}, `}
                    {order.deliveryAddress?.city}, {order.deliveryAddress?.state}
                  </p>
                </div>
                
                {order.deliveryInstructions && (
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Special Instructions</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {order.deliveryInstructions}
                    </p>
                  </div>
                )}
                
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Payment Method</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                    {order.paymentMethod?.toLowerCase()}
                  </p>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Contact Information
              </h2>
              
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Vendor</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {order.vendor?.businessName}
                  </p>
                </div>
                
                {order.driver && (
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Driver</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {order.driver.firstName} {order.driver.lastName}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {order.driver.phoneNumber}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 