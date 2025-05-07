import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useToast } from '../../../contexts/ToastContext';

interface EmergencyRequest {
  id: string;
  status: 'pending' | 'accepted' | 'completed' | 'cancelled';
  fuelType: string;
  quantity: number;
  location: {
    address: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  requestedAt: string;
  estimatedArrival?: string;
}

export default function EmergencyRequest() {
  const [isRequesting, setIsRequesting] = useState(false);
  const [fuelType, setFuelType] = useState('PMS');
  const [quantity, setQuantity] = useState(10);
  const [location, setLocation] = useState({
    address: '',
    coordinates: {
      lat: 6.4281,
      lng: 3.4219
    }
  });
  const { showToast } = useToast();

  const handleRequestEmergency = () => {
    setIsRequesting(true);
    showToast('info', 'Processing emergency request...');
    
    // Simulate API call
    setTimeout(() => {
      showToast('success', 'Emergency request sent successfully!');
      setIsRequesting(false);
    }, 2000);
  };

  const handleLocationSelect = () => {
    // In a real app, you would integrate with Google Maps Places API
    showToast('info', 'Opening location picker...');
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-700 rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Emergency Fuel Request
        </h2>

        <div className="space-y-6">
          {/* Fuel Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Fuel Type
            </label>
            <select
              value={fuelType}
              onChange={(e) => setFuelType(e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-600 dark:border-gray-500 dark:text-white"
            >
              <option value="PMS">Premium (PMS)</option>
              <option value="AGO">Diesel (AGO)</option>
              <option value="DPK">Kerosene (DPK)</option>
            </select>
          </div>

          {/* Quantity Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Quantity (Liters)
            </label>
            <input
              type="number"
              min="1"
              max="100"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-600 dark:border-gray-500 dark:text-white"
            />
          </div>

          {/* Location Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Your Location
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={location.address}
                onChange={(e) => setLocation({ ...location, address: e.target.value })}
                placeholder="Enter your location"
                className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-600 dark:border-gray-500 dark:text-white"
              />
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleLocationSelect}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:bg-gray-600 dark:text-white dark:hover:bg-gray-500"
              >
                Select on Map
              </motion.button>
            </div>
          </div>

          {/* Map Preview */}
          <div className="h-64 bg-gray-200 dark:bg-gray-600 rounded-lg relative">
            {/* In a real app, you would integrate Google Maps here */}
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-gray-500 dark:text-gray-400">
                Map integration coming soon...
              </p>
            </div>
          </div>

          {/* Emergency Request Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleRequestEmergency}
            disabled={isRequesting}
            className="w-full bg-red-600 text-white px-6 py-3 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isRequesting ? 'Processing...' : 'Request Emergency Fuel'}
          </motion.button>
        </div>
      </div>

      {/* Emergency Contact Information */}
      <div className="bg-white dark:bg-gray-700 rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Emergency Contact
        </h3>
        <div className="space-y-2">
          <p className="text-gray-600 dark:text-gray-400">
            For immediate assistance, call our 24/7 emergency line:
          </p>
          <p className="text-lg font-semibold text-primary-600 dark:text-primary-400">
            +234 800 FUELGO
          </p>
        </div>
      </div>
    </div>
  );
} 