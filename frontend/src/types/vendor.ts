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
  id: string;
  name: string;
  location: string;
  rating: number;
  totalRatings: number;
  isTopVendor: boolean;
  hasFastDelivery: boolean;
  hasHotPrice: boolean;
  priceRange: {
    min: number;
    max: number;
  };
  deliveryTime: string;
  fuelTypes: string[];
  contact: {
    name: string;
    email: string;
    phone: string;
  };
  products: Product[];
}

export interface VendorDisplay extends Vendor {
  // Additional display-specific properties can be added here
} 