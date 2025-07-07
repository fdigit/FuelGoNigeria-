import { Driver } from '../types/driver';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

interface AssignedDelivery {
  _id: string;
  orderId: string;
  customerName: string;
  customerPhone: string;
  address: string;
  deliveryAddress: string;
  fuelType: string;
  quantity: number;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  estimatedTime: string;
  specialInstructions?: string;
  orderItems: Array<{
    _id: string;
    productId: string;
    quantity: number;
    price: number;
    product: {
      _id: string;
      name: string;
      type: string;
      unit: string;
    };
  }>;
  totalAmount: number;
  deliveryFee: number;
  createdAt: string;
  updatedAt: string;
}

class DriverService {
  private getAuthHeaders(): HeadersInit {
    const storedUser = localStorage.getItem('user');
    let token = null;
    
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        token = userData.token;
      } catch (error) {
        console.error('Error parsing user data from localStorage:', error);
      }
    }
    
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  }

  async getDrivers(): Promise<Driver[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/vendor/drivers`, {
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error('Failed to fetch drivers');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching drivers:', error);
      throw error;
    }
  }

  async addDriver(driverData: {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    password: string;
    licenseNumber: string;
    licenseExpiry: string;
    licenseType: string;
    vehicleType: string;
    vehiclePlate: string;
    vehicleModel?: string;
    vehicleColor?: string;
    vehicleCapacity?: number;
    emergencyContact?: {
      name: string;
      phone: string;
      relationship: string;
    };
  }): Promise<{ message: string; driver: Driver }> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/vendor/drivers`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(driverData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add driver');
      }

      return await response.json();
    } catch (error) {
      console.error('Error adding driver:', error);
      throw error;
    }
  }

  async updateDriverStatus(driverId: string, status: string): Promise<{ message: string; driver: Driver }> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/vendor/drivers/${driverId}/status`, {
        method: 'PATCH',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ status })
      });

      if (!response.ok) {
        throw new Error('Failed to update driver status');
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating driver status:', error);
      throw error;
    }
  }

  async updateDriver(driverId: string, driverData: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phoneNumber?: string;
    licenseNumber?: string;
    licenseExpiry?: string;
    licenseType?: string;
    vehicleType?: string;
    vehiclePlate?: string;
    vehicleModel?: string;
    vehicleColor?: string;
    vehicleCapacity?: number;
    emergencyContact?: {
      name: string;
      phone: string;
      relationship: string;
    };
  }): Promise<{ message: string; driver: Driver }> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/vendor/drivers/${driverId}`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(driverData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update driver');
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating driver:', error);
      throw error;
    }
  }

  async deactivateDriver(driverId: string): Promise<{ message: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/vendor/drivers/${driverId}/deactivate`, {
        method: 'PATCH',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error('Failed to deactivate driver');
      }

      return await response.json();
    } catch (error) {
      console.error('Error deactivating driver:', error);
      throw error;
    }
  }

  async getDriverDetails(driverId: string): Promise<Driver> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/vendor/drivers/${driverId}`, {
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error('Failed to fetch driver details');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching driver details:', error);
      throw error;
    }
  }

  // Get driver's assigned deliveries
  async getAssignedDeliveries(): Promise<AssignedDelivery[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/driver/deliveries`, {
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error('Failed to fetch assigned deliveries');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching assigned deliveries:', error);
      throw error;
    }
  }

  // Update delivery status
  async updateDeliveryStatus(deliveryId: string, status: 'in_progress' | 'completed' | 'cancelled'): Promise<{ message: string; delivery: AssignedDelivery }> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/driver/deliveries/${deliveryId}/status`, {
        method: 'PATCH',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ status })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update delivery status');
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating delivery status:', error);
      throw error;
    }
  }

  // Confirm payment for COD orders
  async confirmPayment(orderId: string, paymentAmount: number, paymentMethod: string = 'CASH'): Promise<{ message: string; order: any }> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/orders/${orderId}/confirm-payment`, {
        method: 'PATCH',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ paymentAmount, paymentMethod })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to confirm payment');
      }

      return await response.json();
    } catch (error) {
      console.error('Error confirming payment:', error);
      throw error;
    }
  }

  // Get driver profile
  async getDriverProfile(): Promise<Driver> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/driver/profile`, {
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error('Failed to fetch driver profile');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching driver profile:', error);
      throw error;
    }
  }

  // Update driver availability
  async updateAvailability(isAvailable: boolean): Promise<{ message: string; driver: Driver }> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/driver/availability`, {
        method: 'PATCH',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ isAvailable })
      });

      if (!response.ok) {
        throw new Error('Failed to update availability');
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating availability:', error);
      throw error;
    }
  }
}

export default new DriverService(); 