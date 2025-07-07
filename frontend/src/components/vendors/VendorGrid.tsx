import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Vendor } from '../../types';
import VendorCard from './VendorCard';
import VendorCardSkeleton from './VendorCardSkeleton';

interface VendorGridProps {
  vendors: Vendor[];
  isLoading: boolean;
  onOrder?: (vendorId: string) => void;
}

export default function VendorGrid({ vendors, isLoading, onOrder }: VendorGridProps) {
  const navigate = useNavigate();

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

  const handleOrder = (vendorId: string) => {
    navigate(`/vendor/${vendorId}`);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      {vendors.map((vendor) => (
        <motion.div
          key={vendor._id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <VendorCard vendor={vendor} onOrder={handleOrder} />
        </motion.div>
      ))}
    </div>
  );
} 