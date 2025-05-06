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

export interface Vendor {
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