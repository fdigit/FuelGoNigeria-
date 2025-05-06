import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { StarIcon, TruckIcon, FireIcon, ShieldCheckIcon } from '@heroicons/react/24/solid';
import { StarIcon as StarOutlineIcon } from '@heroicons/react/24/outline';

interface Review {
  id: string;
  rating: number;
  comment: string;
  userName: string;
}

interface FuelType {
  type: string;
  price: number;
}

interface Location {
  city: string;
  address: string;
}

interface Vendor {
  id: string;
  name: string;
  location: Location;
  rating: number;
  fuelTypes: FuelType[];
  deliveryTime: string;
  isTopVendor: boolean;
  isFastDelivery: boolean;
  hasHotPrice: boolean;
  reviews: Review[];
}

interface VendorCardProps {
  vendor: Vendor;
  onOrder: (vendorId: string) => void;
}

export default function VendorCard({ vendor, onOrder }: VendorCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [showReviews, setShowReviews] = useState(false);

  const lowestPrice = Math.min(...vendor.fuelTypes.map(ft => ft.price));
  const highestPrice = Math.max(...vendor.fuelTypes.map(ft => ft.price));

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
              {vendor.location.city}, {vendor.location.address}
            </p>
          </div>
          <div className="flex items-center">
            {renderStars(vendor.rating)}
            <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
              ({vendor.reviews.length} reviews)
            </span>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {vendor.isTopVendor && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
              🥇 Top Vendor
            </span>
          )}
          {vendor.isFastDelivery && (
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
              ₦{lowestPrice.toLocaleString()}
              {lowestPrice !== highestPrice && ` - ₦${highestPrice.toLocaleString()}`}
              <span className="text-sm font-normal text-gray-500">/L</span>
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Delivery: {vendor.deliveryTime}
            </span>
          </div>
        </div>

        <div className="mt-4">
          <div className="flex flex-wrap gap-2">
            {vendor.fuelTypes.map((type) => (
              <span
                key={type.type}
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
              >
                {type.type}
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

        {isHovered && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700"
          >
            <button
              onClick={() => setShowReviews(!showReviews)}
              className="text-sm text-primary-600 dark:text-primary-400 hover:underline"
            >
              {showReviews ? 'Hide Reviews' : 'Show Reviews'}
            </button>

            {showReviews && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-2 space-y-2"
              >
                {vendor.reviews.slice(0, 2).map((review) => (
                  <div
                    key={review.id}
                    className="text-sm text-gray-600 dark:text-gray-300"
                  >
                    <div className="flex items-center">
                      {renderStars(review.rating)}
                      <span className="ml-2 font-medium">{review.userName}</span>
                    </div>
                    <p className="mt-1">{review.comment}</p>
                  </div>
                ))}
              </motion.div>
            )}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
} 