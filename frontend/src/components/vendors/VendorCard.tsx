import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Vendor } from '../../types/vendor';

interface VendorCardProps {
  vendor: Vendor;
  onOrder: (vendorId: string) => void;
}

export default function VendorCard({ vendor, onOrder }: VendorCardProps) {
  const navigate = useNavigate();
  console.log('VendorCard received vendor:', vendor);
  console.log('Vendor logo URL:', vendor.logo);
  
  // Generate a gradient based on vendor name for consistent colors
  const getGradientColors = (businessName: string) => {
    if (!businessName) return 'from-gray-500 to-gray-600';
    
    const colors = [
      'from-blue-500 to-purple-600',
      'from-green-500 to-teal-600',
      'from-orange-500 to-red-600',
      'from-indigo-500 to-blue-600',
      'from-pink-500 to-rose-600',
      'from-yellow-500 to-orange-600',
      'from-emerald-500 to-green-600',
      'from-violet-500 to-purple-600'
    ];
    const index = businessName.length % colors.length;
    return colors[index];
  };

  const gradientClass = getGradientColors(vendor.business_name || '');
  
  // Safe access to nested properties
  const businessName = vendor.business_name || 'Unknown Business';
  const state = vendor.address?.state || 'Unknown State';
  const city = vendor.address?.city || 'Unknown City';
  const fuelTypes = vendor.fuel_types || [];
  const operatingHours = vendor.operating_hours || { open: 'N/A', close: 'N/A' };
  const averageRating = vendor.average_rating || 0;
  const totalRatings = vendor.total_ratings || 0;

  return (
    <div 
      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden flex flex-col hover:shadow-xl transition-shadow duration-300 cursor-pointer"
      onClick={() => navigate(`/vendor/${vendor._id}`)}
    >
      {/* Banner Header */}
      <div className={`relative h-32 bg-gradient-to-r ${gradientClass} flex items-center justify-center`}>
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full bg-white opacity-20 rounded-full transform -translate-y-1/2 -translate-x-1/2 scale-150"></div>
          <div className="absolute bottom-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full transform translate-y-1/2 translate-x-1/2"></div>
        </div>
        
        {/* Vendor Logo */}
        <div className="relative z-10">
          {vendor.logo ? (
            <div className="w-16 h-16 rounded-full bg-white p-1 shadow-lg">
              <img
                src={vendor.logo}
                alt={`${vendor.business_name} logo`}
                className="w-full h-full rounded-full object-cover"
                onError={(e) => {
                  console.error('Error loading vendor logo:', vendor.logo);
                  e.currentTarget.style.display = 'none';
                }}
                onLoad={() => {
                  console.log('Successfully loaded vendor logo:', vendor.logo);
                }}
              />
            </div>
          ) : (
            <div className="w-16 h-16 rounded-full bg-white p-3 shadow-lg flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
          )}
        </div>

        {/* Verification Badge */}
        <div className="absolute top-3 right-3">
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium shadow-sm ${
              vendor.verification_status === 'verified'
                ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
                : vendor.verification_status === 'rejected'
                ? 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
                : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100'
            }`}
          >
            {vendor.verification_status ? 
              vendor.verification_status.charAt(0).toUpperCase() + vendor.verification_status.slice(1) 
              : 'Pending'
            }
          </span>
        </div>

        {/* Business Name on Banner */}
        <div className="absolute bottom-3 left-3 right-3">
          <h3 className="text-lg font-bold text-white drop-shadow-lg truncate">
            {businessName}
          </h3>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Location */}
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-3">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>{state}, {city}</span>
          </div>

          {/* Rating */}
          <div className="flex items-center mb-3">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  className={`w-4 h-4 ${
                    i < Math.floor(averageRating)
                      ? 'text-yellow-400'
                      : 'text-gray-300 dark:text-gray-600'
                  }`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <span className="ml-2 text-sm font-medium text-gray-900 dark:text-white">
              {averageRating.toFixed(1)}
            </span>
            <span className="ml-1 text-sm text-gray-500 dark:text-gray-400">
              ({totalRatings})
            </span>
          </div>

          {/* Operating Hours */}
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-3">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{operatingHours.open} - {operatingHours.close}</span>
          </div>

          {/* Fuel Types */}
          <div className="flex flex-wrap gap-2 mb-4">
            {fuelTypes.map((type) => (
              <span
                key={type}
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100"
              >
                {type}
              </span>
            ))}
          </div>
        </div>

        {/* Order Button */}
        <div className="mt-auto">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOrder(vendor._id);
            }}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Order Now
          </button>
        </div>
      </div>
    </div>
  );
} 