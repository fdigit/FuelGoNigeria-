import React from 'react';
import { Vendor, Product } from '../types';
import { StarIcon, ClockIcon, TruckIcon, FireIcon } from '@heroicons/react/24/solid';
import { StarIcon as StarOutlineIcon } from '@heroicons/react/24/outline';

interface VendorCardProps {
  vendor: Vendor;
}

const VendorCard: React.FC<VendorCardProps> = ({ vendor }) => {
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
      {/* Header */}
      <div className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">{vendor.name}</h3>
            <p className="text-gray-600 mt-1">{vendor.location}</p>
          </div>
          <div className="flex items-center">
            <StarIcon className="h-5 w-5 text-yellow-400" />
            <span className="ml-1 text-gray-700">{vendor.rating.toFixed(1)}</span>
            <span className="ml-1 text-gray-500">({vendor.totalRatings})</span>
          </div>
        </div>

        {/* Features */}
        <div className="mt-4 flex flex-wrap gap-2">
          {vendor.isTopVendor && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
              <StarIcon className="h-3 w-3 mr-1" />
              Top Rated
            </span>
          )}
          {vendor.hasFastDelivery && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              <TruckIcon className="h-3 w-3 mr-1" />
              Fast Delivery
            </span>
          )}
          {vendor.hasHotPrice && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
              <FireIcon className="h-3 w-3 mr-1" />
              Best Price
            </span>
          )}
        </div>

        {/* Products */}
        <div className="mt-6">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Available Products</h4>
          <div className="space-y-3">
            {vendor.products.map((product: Product) => (
              <div key={product._id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-900">{product.name}</p>
                  <p className="text-xs text-gray-500">{product.type}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">₦{product.price_per_unit.toLocaleString()}</p>
                  <p className="text-xs text-gray-500">per {product.unit}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 flex justify-between items-center text-sm text-gray-500">
          <div className="flex items-center">
            <ClockIcon className="h-4 w-4 mr-1" />
            <span>{vendor.deliveryTime}</span>
          </div>
          <div>
            <span className="text-gray-900 font-medium">₦{vendor.priceRange.min.toLocaleString()}</span>
            <span className="mx-1">-</span>
            <span className="text-gray-900 font-medium">₦{vendor.priceRange.max.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorCard; 