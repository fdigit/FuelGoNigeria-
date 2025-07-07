import api from './api';
import { Order, CreateOrderRequest, OrderSummary, OrderFilters } from '../types/order';

export const orderService = {
  // Create new order
  createOrder: async (orderData: CreateOrderRequest): Promise<Order> => {
    try {
      const response = await api.post<Order>('/api/orders', orderData);
      return response.data;
    } catch (error: any) {
      console.error('Error creating order:', error);
      if (error.response?.data?.errors) {
        const validationErrors = error.response.data.errors;
        const errorMessage = validationErrors.map((err: any) => `${err.field}: ${err.message}`).join(', ');
        throw new Error(errorMessage);
      }
      throw new Error(error.response?.data?.message || 'Failed to create order');
    }
  },

  // Get customer orders
  getCustomerOrders: async (filters?: OrderFilters): Promise<Order[]> => {
    try {
      const params = new URLSearchParams();
      if (filters?.status) params.append('status', filters.status);
      if (filters?.dateRange) params.append('dateRange', filters.dateRange);
      if (filters?.search) params.append('search', filters.search);
      if (filters?.page) params.append('page', filters.page.toString());
      if (filters?.limit) params.append('limit', filters.limit.toString());

      const response = await api.get<Order[]>(`/api/orders/customer?${params.toString()}`);
      return response.data || [];
    } catch (error: any) {
      console.error('Error fetching customer orders:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch orders');
    }
  },

  // Get vendor orders
  getVendorOrders: async (filters?: OrderFilters): Promise<Order[]> => {
    try {
      const params = new URLSearchParams();
      if (filters?.status) params.append('status', filters.status);
      if (filters?.dateRange) params.append('dateRange', filters.dateRange);
      if (filters?.search) params.append('search', filters.search);
      if (filters?.page) params.append('page', filters.page.toString());
      if (filters?.limit) params.append('limit', filters.limit.toString());

      console.log('Making request to vendor orders endpoint with params:', params.toString());
      const response = await api.get<{ orders: Order[]; pagination?: any } | Order[]>(`/api/vendor/orders?${params.toString()}`);
      console.log('Vendor orders response:', response.data);
      
      // Handle both response formats (array or object with orders property)
      if (Array.isArray(response.data)) {
        return response.data;
      } else if (response.data && typeof response.data === 'object' && 'orders' in response.data) {
        return response.data.orders || [];
      }
      return [];
    } catch (error: any) {
      console.error('Error fetching vendor orders:', error);
      console.error('Error details:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      throw new Error(error.response?.data?.message || 'Failed to fetch vendor orders');
    }
  },

  // Get single order by ID
  getOrder: async (orderId: string): Promise<Order> => {
    try {
      const response = await api.get<{ order: Order }>(`/api/orders/${orderId}`);
      return response.data.order;
    } catch (error: any) {
      console.error('Error fetching order:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch order');
    }
  },

  // Update order status (vendor only)
  updateOrderStatus: async (orderId: string, status: Order['status'], notes?: string): Promise<Order> => {
    try {
      const response = await api.patch<{ order: Order }>(`/api/vendor/orders/${orderId}/status`, { 
        status,
        notes 
      });
      return response.data.order;
    } catch (error: any) {
      console.error('Error updating order status:', error);
      throw new Error(error.response?.data?.message || 'Failed to update order status');
    }
  },

  // Assign driver to order (vendor only)
  assignDriver: async (orderId: string, driverId: string): Promise<Order> => {
    try {
      const response = await api.patch<{ order?: Order } & Order>(`/api/vendor/orders/${orderId}/assign-driver`, { driverId });
      // Handle both response formats (direct order or wrapped in order property)
      return (response.data as any).order || response.data;
    } catch (error: any) {
      console.error('Error assigning driver:', error);
      throw new Error(error.response?.data?.message || 'Failed to assign driver');
    }
  },

  // Cancel order (customer only)
  cancelOrder: async (orderId: string, reason?: string): Promise<Order> => {
    try {
      const response = await api.patch<{ order: Order }>(`/api/orders/${orderId}/cancel`, { reason });
      return response.data.order;
    } catch (error: any) {
      console.error('Error cancelling order:', error);
      throw new Error(error.response?.data?.message || 'Failed to cancel order');
    }
  },

  // Get order summary for pricing
  getOrderSummary: async (vendorId: string, orderItems: { productId: string; quantity: number }[]): Promise<OrderSummary> => {
    try {
      const response = await api.post<OrderSummary>('/api/orders/summary', {
        vendorId,
        orderItems
      });
      return response.data;
    } catch (error: any) {
      console.error('Error getting order summary:', error);
      throw new Error(error.response?.data?.message || 'Failed to get order summary');
    }
  },

  // Get vendor products for ordering
  getVendorProducts: async (vendorId: string): Promise<any[]> => {
    try {
      const response = await api.get(`/api/vendors/${vendorId}/products`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching vendor products:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch vendor products');
    }
  },

  // Driver methods
  getDriverOrders: async (filters?: OrderFilters): Promise<Order[]> => {
    try {
      const params = new URLSearchParams();
      if (filters?.status) params.append('status', filters.status);
      if (filters?.page) params.append('page', filters.page.toString());
      if (filters?.limit) params.append('limit', filters.limit.toString());

      const response = await api.get<{ orders: Order[]; pagination: any }>(`/api/driver/deliveries?${params.toString()}`);
      return response.data.orders || response.data || [];
    } catch (error: any) {
      console.error('Error fetching driver orders:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch driver orders');
    }
  },

  updateDriverLocation: async (orderId: string, location: { lat: number; lng: number }): Promise<void> => {
    try {
      await api.patch(`/api/driver/deliveries/${orderId}/update-location`, { location });
    } catch (error: any) {
      console.error('Error updating driver location:', error);
      throw new Error(error.response?.data?.message || 'Failed to update location');
    }
  },

  completeDelivery: async (orderId: string): Promise<Order> => {
    try {
      const response = await api.patch<{ order: Order }>(`/api/driver/deliveries/${orderId}/complete-delivery`);
      return response.data.order;
    } catch (error: any) {
      console.error('Error completing delivery:', error);
      throw new Error(error.response?.data?.message || 'Failed to complete delivery');
    }
  },

  // Admin methods
  getAllOrders: async (filters?: OrderFilters): Promise<{ orders: Order[]; pagination: any }> => {
    try {
      const params = new URLSearchParams();
      if (filters?.status) params.append('status', filters.status);
      if (filters?.dateRange) params.append('dateRange', filters.dateRange);
      if (filters?.search) params.append('search', filters.search);
      if (filters?.page) params.append('page', filters.page.toString());
      if (filters?.limit) params.append('limit', filters.limit.toString());

      const response = await api.get<{ orders: Order[]; pagination: any }>(`/api/admin/orders?${params.toString()}`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching all orders:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch all orders');
    }
  },

  adminIntervention: async (orderId: string, action: string, reason: string, data?: any): Promise<Order> => {
    try {
      const response = await api.patch<{ order: Order }>(`/api/admin/orders/${orderId}/intervene`, {
        action,
        reason,
        ...data
      });
      return response.data.order;
    } catch (error: any) {
      console.error('Error performing admin intervention:', error);
      throw new Error(error.response?.data?.message || 'Failed to perform admin intervention');
    }
  },

  getOrderAnalytics: async (): Promise<any> => {
    try {
      const response = await api.get('/api/orders/admin/analytics');
      return response.data;
    } catch (error: any) {
      console.error('Error fetching order analytics:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch analytics');
    }
  }
}; 