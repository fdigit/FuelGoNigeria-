export interface Product {
  _id: string;
  type: 'PMS' | 'Diesel' | 'Kerosene' | 'Gas';
  name: string;
  description: string;
  price_per_unit: number;
  unit: 'litre' | 'kg';
  available_qty: number;
  min_order_qty: number;
  max_order_qty: number;
  status: 'available' | 'out_of_stock' | 'discontinued';
  image_url?: string;
  specifications?: {
    octane_rating?: number;
    cetane_number?: number;
    flash_point?: number;
    pressure?: number;
  };
}

export interface Vendor {
  _id: string;
  business_name: string;
  image?: string;
  logo?: string;
  verification_status: 'verified' | 'pending' | 'rejected';
  address: {
    city: string;
    state: string;
    country: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  average_rating: number;
  total_ratings: number;
  operating_hours: {
    open: string;
    close: string;
  };
  fuel_types: string[];
  contact: {
    phone: string;
    email: string;
  };
  services: string[];
  payment_methods: string[];
  minimum_order: number;
  delivery_fee: number;
  rating: number;
  reviews: number;
  is_verified: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface VendorDisplay extends Vendor {
  // Additional display-specific properties can be added here
}

export interface Filters {
  state: string;
  fuelType: string;
  priceMin: number;
  priceMax: number;
  deliveryTime: string;
  minRating: string;
} 