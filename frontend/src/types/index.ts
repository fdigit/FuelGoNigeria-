// Export all types from vendor.ts
export type { Product, Vendor, VendorDisplay } from './vendor';

// Export all types from user.ts
export * from './user';

// Export all types from order.ts
export * from './order';

// Common interfaces
export interface FuelType {
  type: string;
  price: number;
}

export interface Location {
  city: string;
  address: string;
}

export interface Review {
  id: string;
  rating: number;
  comment: string;
  userName: string;
}

export interface Contact {
  name: string;
  email: string;
  phone: string;
}

export interface PriceRange {
  min: number;
  max: number;
} 