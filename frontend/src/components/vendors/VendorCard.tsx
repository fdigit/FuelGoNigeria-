import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { StarIcon, TruckIcon, FireIcon, ShieldCheckIcon } from '@heroicons/react/24/solid';
import { StarIcon as StarOutlineIcon } from '@heroicons/react/24/outline';
import { Vendor } from '../../types';

interface VendorCardProps {
  vendor: Vendor;
  onOrder: (vendorId: string) => void;
}

export default function VendorCard({ vendor, onOrder }: VendorCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, index) => (
      <span key={index}>
        {index < rating ? (
          <StarIcon className="h-5 w-5 text-yellow-400" />
        ) : (
          <StarOutlineIcon className="h-5 w-5 text-gray-300" />
        )}
      </span>
    ));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden transition-all duration-300"
    >
      <div className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              {vendor.name}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              {vendor.location}
            </p>
          </div>
          <div className="flex items-center">
            {renderStars(vendor.rating)}
            <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
              ({vendor.totalRatings} reviews)
            </span>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {vendor.isTopVendor && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
              🥇 Top Vendor
            </span>
          )}
          {vendor.hasFastDelivery && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              🛵 Fast Delivery
            </span>
          )}
          {vendor.hasHotPrice && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
              🔥 Hot Price
            </span>
          )}
        </div>

        <div className="mt-4">
          <div className="flex justify-between items-center">
            <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">
              ₦{vendor.priceRange.min.toLocaleString()}
              {vendor.priceRange.min !== vendor.priceRange.max && ` - ₦${vendor.priceRange.max.toLocaleString()}`}
              <span className="text-sm font-normal text-gray-500">/L</span>
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Delivery: {vendor.deliveryTime}
            </span>
          </div>
        </div>

        <div className="mt-4">
          <div className="flex flex-wrap gap-2">
            {vendor.fuelTypes.map((type: string) => (
              <span
                key={type}
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
              >
                {type}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-6">
          <button
            onClick={() => onOrder(vendor.id)}
            className="w-full btn-primary"
          >
            Order Now
          </button>
        </div>
      </div>
    </motion.div>
  );
} 