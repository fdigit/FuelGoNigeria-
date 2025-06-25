import React from 'react';

export default function VendorCardSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
      {/* Image Skeleton */}
      <div className="h-48 bg-gray-200 dark:bg-gray-700 animate-pulse" />

      {/* Content Skeleton */}
      <div className="p-4 sm:p-6">
        {/* Title and Rating */}
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <div className="h-6 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          </div>
          <div className="h-5 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        </div>

        {/* Operating Hours */}
        <div className="mt-4">
          <div className="h-4 w-40 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        </div>

        {/* Fuel Types */}
        <div className="mt-4 flex gap-2">
          <div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
          <div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
          <div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
        </div>

        {/* Button */}
        <div className="mt-6">
          <div className="h-10 w-full bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
        </div>
      </div>
    </div>
  );
} 