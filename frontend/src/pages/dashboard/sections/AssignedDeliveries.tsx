import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useToast } from '../../../contexts/ToastContext';

interface Delivery {
  id: string;
  customerName: string;
  address: string;
  fuelType: string;
  quantity: number;
  status: 'pending' | 'in_progress' | 'completed';
  estimatedTime: string;
  customerPhone: string;
  specialInstructions?: string;
}

export default function AssignedDeliveries() {
  const [deliveries, setDeliveries] = useState<Delivery[]>([
    {
      id: 'DEL001',
      customerName: 'John Doe',
      address: '123 Main Street, Lagos',
      fuelType: 'Premium (PMS)',
      quantity: 50,
      status: 'pending',
      estimatedTime: '15 minutes',
      customerPhone: '+234 800 123 4567',
      specialInstructions: 'Please call when arriving',
    },
    {
      id: 'DEL002',
      customerName: 'Jane Smith',
      address: '456 Park Avenue, Lagos',
      fuelType: 'Diesel (AGO)',
      quantity: 75,
      status: 'pending',
      estimatedTime: '25 minutes',
      customerPhone: '+234 800 765 4321',
    },
  ]);

  const { showToast } = useToast();

  const handleStartNavigation = (delivery: Delivery) => {
    // In a real app, this would open Google Maps with the destination
    showToast('info', `Opening Google Maps for ${delivery.address}`);
  };

  const handleStartDelivery = (deliveryId: string) => {
    setDeliveries(prev =>
      prev.map(delivery =>
        delivery.id === deliveryId
          ? { ...delivery, status: 'in_progress' }
          : delivery
      )
    );
    showToast('success', 'Delivery started successfully');
  };

  const handleCallCustomer = (phone: string) => {
    // In a real app, this would initiate a phone call
    showToast('info', `Calling ${phone}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Assigned Deliveries
        </h2>
        <div className="flex space-x-4">
          <select
            className="rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            onChange={(e) => {
              // In a real app, implement filtering logic
              showToast('info', 'Filtering functionality coming soon!');
            }}
          >
            <option value="all">All Deliveries</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {deliveries.map((delivery) => (
          <div
            key={delivery.id}
            className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden"
          >
            <div className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    {delivery.customerName}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {delivery.address}
                  </p>
                </div>
                <span
                  className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    delivery.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                      : delivery.status === 'in_progress'
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                      : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  }`}
                >
                  {delivery.status.toUpperCase()}
                </span>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Fuel Type</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {delivery.fuelType}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Quantity</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {delivery.quantity}L
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Estimated Time
                  </p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {delivery.estimatedTime}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Customer Phone
                  </p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {delivery.customerPhone}
                  </p>
                </div>
              </div>

              {delivery.specialInstructions && (
                <div className="mt-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Special Instructions
                  </p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {delivery.specialInstructions}
                  </p>
                </div>
              )}

              <div className="mt-6 flex space-x-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleStartNavigation(delivery)}
                  className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                >
                  Start Navigation
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleCallCustomer(delivery.customerPhone)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                >
                  Call Customer
                </motion.button>
                {delivery.status === 'pending' && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleStartDelivery(delivery.id)}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                  >
                    Start Delivery
                  </motion.button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 