import React from 'react';
import { motion } from 'framer-motion';
import { StarIcon, MapPinIcon, ClockIcon } from '@heroicons/react/24/solid';
import { Vendor } from '../../types';
import VendorCardSkeleton from './VendorCardSkeleton';

interface VendorGridProps {
  vendors: Vendor[];
  isLoading: boolean;
  onOrder: (vendorId: string) => void;
}

export default function VendorGrid({ vendors, isLoading, onOrder }: VendorGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <VendorCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (vendors.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          No vendors found
        </h3>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Try adjusting your filters or search criteria
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      {vendors.map((vendor) => (
        <motion.div
          key={vendor._id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden"
        >
          {/* Vendor Image */}
          <div className="relative h-48 bg-gray-200 dark:bg-gray-700">
            <img
              src={vendor.image || '/images/station-placeholder.jpg'}
              alt={vendor.business_name}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-4 right-4">
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  vendor.verification_status === 'verified'
                    ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
                    : vendor.verification_status === 'rejected'
                    ? 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
                    : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100'
                }`}
              >
                {vendor.verification_status.charAt(0).toUpperCase() + vendor.verification_status.slice(1)}
              </span>
            </div>
          </div>

          {/* Vendor Info */}
          <div className="p-4 sm:p-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {vendor.business_name}
                </h3>
                <div className="mt-1 flex items-center text-sm text-gray-500 dark:text-gray-400">
                  <MapPinIcon className="h-4 w-4 mr-1" />
                  <span>{vendor.address.city}, {vendor.address.state}</span>
                </div>
              </div>
              <div className="flex items-center">
                <StarIcon className="h-5 w-5 text-yellow-400" />
                <span className="ml-1 text-sm font-medium text-gray-900 dark:text-white">
                  {vendor.average_rating.toFixed(1)}
                </span>
                <span className="ml-1 text-sm text-gray-500 dark:text-gray-400">
                  ({vendor.total_ratings})
                </span>
              </div>
            </div>

            {/* Operating Hours */}
            <div className="mt-4 flex items-center text-sm text-gray-500 dark:text-gray-400">
              <ClockIcon className="h-4 w-4 mr-1" />
              <span>{vendor.operating_hours.open} - {vendor.operating_hours.close}</span>
            </div>

            {/* Fuel Types */}
            <div className="mt-4 flex flex-wrap gap-2">
              {vendor.fuel_types.map((type) => (
                <span
                  key={type}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800 dark:bg-primary-800 dark:text-primary-100"
                >
                  {type}
                </span>
              ))}
            </div>

            {/* Action Button */}
            <div className="mt-6">
              <button
                onClick={() => onOrder(vendor._id)}
                className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200"
              >
                Order Fuel
              </button>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
} 