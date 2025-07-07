import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useToast } from '../../../contexts/ToastContext';

import { orderService } from '../../../services/order.service';
import { driverService } from '../../../services/api';
import { Order, OrderFilters } from '../../../types/order';
import webSocketService from '../../../services/websocket.service';

interface Driver {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: 'available' | 'busy' | 'offline';
  currentLocation?: string;
  rating?: number;
  totalDeliveries?: number;
  activeOrders?: number;
  vehicleDetails?: {
    type: string;
    plateNumber: string;
    capacity: number;
  };
  licenseNumber?: string;
  licenseExpiry?: string;
  isActive?: boolean;
  createdAt?: string;
}

export default function OrderManagement() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [filters, setFilters] = useState<OrderFilters>({});
  const [isLoading, setIsLoading] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>('');

  const { showToast } = useToast();

  const loadOrders = useCallback(async () => {
    setIsLoading(true);
    try {
      console.log('Loading vendor orders with filters:', filters);
      const ordersData = await orderService.getVendorOrders(filters);
      console.log('Vendor orders loaded:', ordersData);
      
      // Filter out any null or undefined orders
      const validOrders = ordersData.filter(order => order != null);
      console.log('Valid orders after filtering:', validOrders);
      
      setOrders(validOrders);
    } catch (error) {
      console.error('Error loading vendor orders:', error);
      showToast('error', 'Failed to load orders');
    } finally {
      setIsLoading(false);
    }
  }, [filters, showToast]);

  const loadDrivers = useCallback(async () => {
    try {
      const driversData = await driverService.getDrivers();
      setDrivers(driversData);
    } catch (error) {
      console.error('Error loading drivers:', error);
      // Set empty array if no drivers found
      setDrivers([]);
      // Don't show error toast for this as it's not critical
    }
  }, []);

  useEffect(() => {
    loadOrders();
    loadDrivers();
  }, [loadOrders, loadDrivers]);

  // Listen for real-time notifications and order updates
  useEffect(() => {
    // Listen for new order notifications
    const handleNewOrder = (data: any) => {
      if (data.notification?.type === 'ORDER_STATUS' && data.notification?.title === 'New Order Received') {
        showToast('info', 'New order received! Refreshing orders...');
        
        // Play notification sound
        try {
          const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT');
          audio.volume = 0.3;
          audio.play().catch(() => {
            // Ignore audio play errors
          });
        } catch (error) {
          // Ignore audio errors
        }
        
        loadOrders(); // Refresh orders list
      }
    };

    // Listen for order status updates
    const handleOrderStatusUpdate = (data: any) => {
      showToast('info', `Order #${data.orderId} status updated to ${data.status}`);
      loadOrders(); // Refresh orders list
    };

    // Setup WebSocket listeners
    webSocketService.on('notification_received', handleNewOrder);
    webSocketService.on('order_status_updated', handleOrderStatusUpdate);

    // Cleanup listeners
    return () => {
      webSocketService.off('notification_received', handleNewOrder);
      webSocketService.off('order_status_updated', handleOrderStatusUpdate);
    };
  }, [showToast, loadOrders]);

  const handleOrderStatusChange = async (orderId: string, newStatus: Order['status']) => {
    try {
      const updatedOrder = await orderService.updateOrderStatus(orderId, newStatus);
      setOrders(prev =>
        prev.map(order =>
          order && order._id === orderId ? updatedOrder : order
        )
      );
      showToast('success', `Order status updated to ${newStatus}`);
    } catch (error) {
      showToast('error', 'Failed to update order status');
    }
  };

  const handleAssignDriver = async (orderId: string, driverId: string) => {
    if (!driverId) {
      showToast('error', 'Please select a driver');
      return;
    }
    
    try {
      const updatedOrder = await orderService.assignDriver(orderId, driverId);
      setOrders(prev =>
        prev.map(order =>
          order && order._id === orderId ? updatedOrder : order
        )
      );
      showToast('success', 'Driver assigned successfully');
    } catch (error) {
      showToast('error', 'Failed to assign driver');
    }
  };

  const handleFilterChange = (key: keyof OrderFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'preparing':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'out_for_delivery':
        return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200';
      case 'delivered':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getStatusActions = (order: Order) => {
    if (!order || !order._id) return null;
    
    switch (order.status) {
      case 'pending':
        return (
          <div className="flex space-x-2">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleOrderStatusChange(order._id, 'confirmed')}
              className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
            >
              Accept
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleOrderStatusChange(order._id, 'cancelled')}
              className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
            >
              Decline
            </motion.button>
          </div>
        );
      case 'confirmed':
        return (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleOrderStatusChange(order._id, 'preparing')}
            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
          >
            Start Preparing
          </motion.button>
        );
      case 'preparing':
        return (
          <div className="space-y-2">
            <select
              value={order.driverId || ''}
              onChange={(e) => handleAssignDriver(order._id, e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="">Assign Driver</option>
              {drivers.length > 0 ? (
                drivers
                  .filter((driver) => driver.status === 'available')
                  .map((driver) => (
                    <option key={driver.id} value={driver.id}>
                      {driver.name}
                    </option>
                  ))
              ) : (
                <option value="" disabled>No drivers available</option>
              )}
            </select>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleOrderStatusChange(order._id, 'out_for_delivery')}
              className="w-full text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
            >
              Out for Delivery
            </motion.button>
          </div>
        );
      case 'out_for_delivery':
        return (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleOrderStatusChange(order._id, 'delivered')}
            className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
          >
            Mark as Delivered
          </motion.button>
        );
      default:
        return null;
    }
  };

  const filteredOrders = (orders || []).filter(order => {
    if (!order || !order._id) return false;
    if (selectedStatus && order.status !== selectedStatus) return false;
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      return (
        order._id.toLowerCase().includes(searchTerm) ||
        order.customer?.firstName?.toLowerCase().includes(searchTerm) ||
        order.customer?.lastName?.toLowerCase().includes(searchTerm) ||
        order.customer?.phoneNumber?.includes(searchTerm)
      );
    }
    return true;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-NG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getOrderSummary = () => {
    const ordersList = orders || [];
    const total = ordersList.length;
    const pending = ordersList.filter(o => o && o._id && o.status === 'pending').length;
    const confirmed = ordersList.filter(o => o && o._id && o.status === 'confirmed').length;
    const preparing = ordersList.filter(o => o && o._id && o.status === 'preparing').length;
    const outForDelivery = ordersList.filter(o => o && o._id && o.status === 'out_for_delivery').length;
    const delivered = ordersList.filter(o => o && o._id && o.status === 'delivered').length;

    return { total, pending, confirmed, preparing, outForDelivery, delivered };
  };

  const summary = getOrderSummary();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Order Management
          </h2>
          {summary.pending > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="bg-red-500 text-white text-sm font-medium px-3 py-1 rounded-full"
            >
              {summary.pending} New
            </motion.div>
          )}
        </div>
        <div className="flex space-x-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={loadOrders}
            disabled={isLoading}
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {isLoading ? 'Loading...' : 'Refresh'}
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          >
            Export Orders
          </motion.button>
        </div>
      </div>

      {/* Order Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{summary.total}</div>
          <div className="text-sm text-gray-500 dark:text-gray-400">Total Orders</div>
        </div>
        <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg shadow p-4">
          <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{summary.pending}</div>
          <div className="text-sm text-yellow-600 dark:text-yellow-400">Pending</div>
        </div>
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg shadow p-4">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{summary.confirmed}</div>
          <div className="text-sm text-blue-600 dark:text-blue-400">Confirmed</div>
        </div>
        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg shadow p-4">
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{summary.preparing}</div>
          <div className="text-sm text-purple-600 dark:text-purple-400">Preparing</div>
        </div>
        <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg shadow p-4">
          <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{summary.outForDelivery}</div>
          <div className="text-sm text-indigo-600 dark:text-indigo-400">Out for Delivery</div>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg shadow p-4">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">{summary.delivered}</div>
          <div className="text-sm text-green-600 dark:text-green-400">Delivered</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Status Filter
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="preparing">Preparing</option>
              <option value="out_for_delivery">Out for Delivery</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Search
            </label>
            <input
              type="text"
              placeholder="Search by order ID, customer name, or phone"
              value={filters.search || ''}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Date Range
            </label>
            <select
              value={filters.dateRange || ''}
              onChange={(e) => handleFilterChange('dateRange', e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Order ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredOrders.map((order) => {
                if (!order || !order._id) return null;
                return (
                <tr key={order._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      #{order._id.slice(-8)}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(order.createdAt)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {order.customer?.firstName} {order.customer?.lastName}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {order.customer?.phoneNumber}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {order.deliveryAddress?.street}, {order.deliveryAddress?.city}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {order.orderItems.length} items
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      ₦{order.totalAmount.toLocaleString()}
                    </div>
                    {order.driver && (
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        Driver: {order.driver.firstName} {order.driver.lastName}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                        order.status
                      )}`}
                    >
                      {order.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {getStatusActions(order)}
                  </td>
                </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {filteredOrders.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <div className="text-gray-500 dark:text-gray-400 text-lg">No orders found</div>
          <div className="text-gray-400 dark:text-gray-500 text-sm">Try adjusting your filters</div>
        </div>
      )}

      {/* Active Drivers */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Active Drivers
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {drivers.map((driver) => (
            <div
              key={driver.id}
              className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                    {driver.name}
                  </h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {driver.phone}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {driver.currentLocation}
                  </p>
                </div>
                <span
                  className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    driver.status === 'available'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : driver.status === 'busy'
                      ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                  }`}
                >
                  {driver.status.toUpperCase()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 