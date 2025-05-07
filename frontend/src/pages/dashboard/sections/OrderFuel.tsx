import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { mockVendors } from '../../../data/mockData';
import { useToast } from '../../../contexts/ToastContext';

interface OrderFormData {
  vendorId: string;
  fuelType: string;
  quantity: number;
  deliveryAddress: string;
  useCurrentLocation: boolean;
}

export default function OrderFuel() {
  const { register, handleSubmit, watch, setValue } = useForm<OrderFormData>();
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const useCurrentLocation = watch('useCurrentLocation');

  const onSubmit = async (data: OrderFormData) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      showToast('success', 'Order placed successfully!');
      // Reset form
      setValue('vendorId', '');
      setValue('fuelType', '');
      setValue('quantity', 0);
      setValue('deliveryAddress', '');
      setValue('useCurrentLocation', false);
    } catch (error) {
      showToast('error', 'Failed to place order. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // In a real app, you would use a geocoding service to get the address
          setValue('deliveryAddress', 'Current Location');
          setValue('useCurrentLocation', true);
        },
        (error) => {
          showToast('error', 'Failed to get your location. Please enter address manually.');
        }
      );
    } else {
      showToast('error', 'Geolocation is not supported by your browser.');
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Order Fuel</h2>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Vendor Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Select Vendor
          </label>
          <select
            {...register('vendorId', { required: true })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="">Select a vendor</option>
            {mockVendors.map((vendor) => (
              <option key={vendor.id} value={vendor.id}>
                {vendor.name} - {vendor.location.city}
              </option>
            ))}
          </select>
        </div>

        {/* Fuel Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Fuel Type
          </label>
          <select
            {...register('fuelType', { required: true })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="">Select fuel type</option>
            <option value="premium">Premium (PMS)</option>
            <option value="regular">Regular (PMS)</option>
            <option value="diesel">Diesel (AGO)</option>
          </select>
        </div>

        {/* Quantity */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Quantity (Liters)
          </label>
          <input
            type="number"
            min="1"
            step="1"
            {...register('quantity', { required: true, min: 1 })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>

        {/* Delivery Address */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Delivery Address
          </label>
          <div className="mt-1 flex rounded-md shadow-sm">
            <input
              type="text"
              {...register('deliveryAddress', { required: !useCurrentLocation })}
              disabled={useCurrentLocation}
              className="block w-full rounded-l-md border-gray-300 focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800"
              placeholder="Enter delivery address"
            />
            <button
              type="button"
              onClick={handleUseCurrentLocation}
              className="inline-flex items-center px-4 py-2 border border-l-0 border-gray-300 rounded-r-md bg-gray-50 text-sm font-medium text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600"
            >
              Use Current Location
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Placing Order...' : 'Place Order'}
          </motion.button>
        </div>
      </form>
    </div>
  );
} 