import { Driver } from '../types/driver';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

class DriverService {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('token');
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
}

export default new DriverService(); 