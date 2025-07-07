import { Product } from './vendor';

export interface Order {
  _id: string;
  userId: string;
  vendorId: string;
  driverId?: string;
  status: 'pending' | 'confirmed' | 'preparing' | 'out_for_delivery' | 'delivered' | 'cancelled';
  totalAmount: number;
  deliveryFee: number;
  address: Address;
  deliveryAddress?: Address;
  deliveryTime?: string;
  estimatedDelivery?: string;
  deliveryInstructions?: string;
  paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentMethod?: string;
  createdAt: string;
  updatedAt: string;
  orderItems: OrderItem[];
  customer?: {
    firstName: string;
    lastName: string;
    phoneNumber: string;
    email: string;
  };
  vendor?: {
    businessName: string;
    address: Address;
  };
  driver?: {
    firstName: string;
    lastName: string;
    phoneNumber: string;
  };
}

export interface OrderItem {
  _id: string;
  orderId: string;
  productId: string;
  quantity: number;
  price: number;
  product?: Product;
}

export interface CreateOrderRequest {
  vendorId: string;
  orderItems: {
    productId: string;
    quantity: number;
  }[];
  deliveryAddress: Address;
  phoneNumber: string;
  paymentMethod: string;
  specialInstructions?: string;
}

export interface Address {
  street?: string;
  city: string;
  state: string;
  country: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface OrderFilters {
  status?: string;
  dateRange?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface OrderSummary {
  subtotal: number;
  deliveryFee: number;
  total: number;
  estimatedDelivery: string;
} 