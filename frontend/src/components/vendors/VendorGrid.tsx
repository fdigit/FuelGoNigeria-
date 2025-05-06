import React from 'react';
import VendorCard from './VendorCard';
import VendorCardSkeleton from './VendorCardSkeleton';

interface FuelType {
  type: string;
  price: number;
}

interface Location {
  city: string;
  address: string;
}

interface Review {
  id: string;
  rating: number;
  comment: string;
  userName: string;
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

interface VendorGridProps {
  vendors: Vendor[];
  isLoading: boolean;
  onOrder: (vendorId: string) => void;
}

export default function VendorGrid({ vendors, isLoading, onOrder }: VendorGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <VendorCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {vendors.map((vendor) => (
        <VendorCard
          key={vendor.id}
          vendor={vendor}
          onOrder={onOrder}
        />
      ))}
    </div>
  );
} 