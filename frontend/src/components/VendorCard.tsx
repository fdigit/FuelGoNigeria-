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
            <h3 className="text-xl font-semibold text-gray-900">{vendor.business_name}</h3>
            <p className="text-gray-600 mt-1">{vendor.address.state}, {vendor.address.city}</p>
          </div>
          <div className="flex items-center">
            <StarIcon className="h-5 w-5 text-yellow-400" />
            <span className="ml-1 text-gray-700">{vendor.average_rating.toFixed(1)}</span>
            <span className="ml-1 text-gray-500">({vendor.total_ratings})</span>
          </div>
        </div>

        {/* Features */}
        <div className="mt-4 flex flex-wrap gap-2">
          {vendor.verification_status === 'verified' && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              <StarIcon className="h-3 w-3 mr-1" />
              Verified
            </span>
          )}
          {vendor.is_active && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              <TruckIcon className="h-3 w-3 mr-1" />
              Active
            </span>
          )}
          {vendor.fuel_types.includes('PMS') && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
              <FireIcon className="h-3 w-3 mr-1" />
              PMS Available
            </span>
          )}
        </div>

        {/* Fuel Types */}
        <div className="mt-6">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Available Fuel Types</h4>
          <div className="flex flex-wrap gap-2">
            {vendor.fuel_types.map((fuelType) => (
              <span
                key={fuelType}
                className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
              >
                {fuelType}
              </span>
            ))}
          </div>
        </div>

        {/* Services */}
        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Services</h4>
          <div className="flex flex-wrap gap-1">
            {vendor.services.slice(0, 3).map((service) => (
              <span
                key={service}
                className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-50 text-blue-700"
              >
                {service}
              </span>
            ))}
            {vendor.services.length > 3 && (
              <span className="text-xs text-gray-500">+{vendor.services.length - 3} more</span>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 flex justify-between items-center text-sm text-gray-500">
          <div className="flex items-center">
            <ClockIcon className="h-4 w-4 mr-1" />
            <span>{vendor.operating_hours.open} - {vendor.operating_hours.close}</span>
          </div>
          <div>
            <span className="text-gray-900 font-medium">Min: ₦{vendor.minimum_order.toLocaleString()}</span>
            <span className="mx-1">|</span>
            <span className="text-gray-900 font-medium">Delivery: ₦{vendor.delivery_fee.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorCard; 