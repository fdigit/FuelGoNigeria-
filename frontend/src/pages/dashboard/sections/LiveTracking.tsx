import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useToast } from '../../../contexts/ToastContext';

interface OrderStatus {
  id: string;
  status: 'confirmed' | 'on_the_way' | 'delivered';
  driverName: string;
  driverPhone: string;
  estimatedArrival: string;
  currentLocation: {
    lat: number;
    lng: number;
  };
}

// Mock active order
const mockOrder: OrderStatus = {
  id: '1234',
  status: 'on_the_way',
  driverName: 'John Doe',
  driverPhone: '+234 801 234 5678',
  estimatedArrival: '15 mins',
  currentLocation: {
    lat: 6.4281,
    lng: 3.4219
  }
};

export default function LiveTracking() {
  const [order, setOrder] = useState<OrderStatus | null>(mockOrder);
  const { showToast } = useToast();

  useEffect(() => {
    // In a real app, you would set up WebSocket connection here
    // to receive real-time updates of the driver's location
    const interval = setInterval(() => {
      // Simulate location updates
      if (order) {
        setOrder({
          ...order,
          currentLocation: {
            lat: order.currentLocation.lat + (Math.random() - 0.5) * 0.001,
            lng: order.currentLocation.lng + (Math.random() - 0.5) * 0.001
          }
        });
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [order]);

  const handleCallDriver = () => {
    showToast('info', 'Calling driver...');
    // In a real app, you would initiate a call here
  };

  const handleMessageDriver = () => {
    showToast('info', 'Opening chat...');
    // In a real app, you would open a chat interface here
  };

  if (!order) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          No active orders to track
        </h3>
        <p className="mt-2 text-gray-500 dark:text-gray-400">
          Place an order to start tracking your delivery
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Order Status */}
      <div className="bg-white dark:bg-gray-700 rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Order #{order.id}
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Status: {order.status.replace('_', ' ').toUpperCase()}
            </p>
          </div>
          <span className="px-3 py-1 text-sm font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
            {order.estimatedArrival} until arrival
          </span>
        </div>
      </div>

      {/* Map */}
      <div className="bg-white dark:bg-gray-700 rounded-lg shadow overflow-hidden">
        <div className="h-96 bg-gray-200 dark:bg-gray-600 relative">
          {/* In a real app, you would integrate Google Maps here */}
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-gray-500 dark:text-gray-400">
              Map integration coming soon...
            </p>
          </div>
        </div>
      </div>

      {/* Driver Info */}
      <div className="bg-white dark:bg-gray-700 rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Driver Information
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-500 dark:text-gray-400">Driver Name</span>
            <span className="font-medium text-gray-900 dark:text-white">
              {order.driverName}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-500 dark:text-gray-400">Phone Number</span>
            <span className="font-medium text-gray-900 dark:text-white">
              {order.driverPhone}
            </span>
          </div>
        </div>

        <div className="mt-6 flex space-x-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleCallDriver}
            className="flex-1 bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          >
            Call Driver
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleMessageDriver}
            className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:bg-gray-600 dark:text-white dark:hover:bg-gray-500"
          >
            Message
          </motion.button>
        </div>
      </div>
    </div>
  );
} 