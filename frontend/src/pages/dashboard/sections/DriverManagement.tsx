import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useToast } from '../../../contexts/ToastContext';

interface Driver {
  id: string;
  name: string;
  phone: string;
  email: string;
  status: 'available' | 'busy' | 'offline';
  currentLocation?: string;
  rating: number;
  totalDeliveries: number;
  activeOrders: number;
  vehicleDetails: {
    type: string;
    plateNumber: string;
    capacity: number;
  };
}

interface Order {
  id: string;
  customerName: string;
  location: string;
  status: 'in_progress' | 'completed';
  assignedTo: string;
}

export default function DriverManagement() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [activeOrders] = useState<Order[]>([]);

  const { showToast } = useToast();

  const handleStatusChange = (driverId: string, newStatus: Driver['status']) => {
    setDrivers(prev =>
      prev.map(driver =>
        driver.id === driverId ? { ...driver, status: newStatus } : driver
      )
    );
    showToast('success', `Driver status updated to ${newStatus}`);
  };

  const handleAddDriver = () => {
    // In a real app, you would open a modal or navigate to a form
    showToast('info', 'Add driver functionality coming soon!');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Driver Management
        </h2>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleAddDriver}
          className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
        >
          Add New Driver
        </motion.button>
      </div>

      {/* Drivers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {drivers.map((driver) => (
          <div
            key={driver.id}
            className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden"
          >
            <div className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    {driver.name}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {driver.phone}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {driver.email}
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

              <div className="mt-4 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Rating</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {driver.rating} ⭐
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Total Deliveries
                  </p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {driver.totalDeliveries}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Active Orders
                  </p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {driver.activeOrders}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Vehicle Type
                  </p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {driver.vehicleDetails.type}
                  </p>
                </div>
              </div>

              <div className="mt-4">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Current Location
                </p>
                <p className="text-sm text-gray-900 dark:text-white">
                  {driver.currentLocation}
                </p>
              </div>

              <div className="mt-4">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Vehicle Details
                </p>
                <p className="text-sm text-gray-900 dark:text-white">
                  {driver.vehicleDetails.plateNumber} - {driver.vehicleDetails.capacity}L
                </p>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Update Status
                </label>
                <select
                  value={driver.status}
                  onChange={(e) =>
                    handleStatusChange(driver.id, e.target.value as Driver['status'])
                  }
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="available">Available</option>
                  <option value="busy">Busy</option>
                  <option value="offline">Offline</option>
                </select>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Active Orders */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Active Orders
          </h3>
        </div>
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
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Driver
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {activeOrders.map((order) => (
                <tr key={order.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {order.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {order.customerName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {order.location}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {drivers.find((d) => d.id === order.assignedTo)?.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        order.status === 'in_progress'
                          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                          : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      }`}
                    >
                      {order.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 