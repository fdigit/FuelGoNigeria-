export interface Driver {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  status: 'available' | 'busy' | 'offline';
  currentLocation?: {
    lat: number;
    lng: number;
  };
  rating: number;
  totalDeliveries: number;
  activeOrders: number;
  vehicleDetails: {
    type: string;
    plateNumber: string;
    capacity: number;
  };
  licenseNumber?: string;
  licenseExpiry?: string;
  licenseType?: string;
  vehicleType?: string;
  vehiclePlate?: string;
  vehicleModel?: string;
  vehicleColor?: string;
  vehicleCapacity?: number;
  isActive?: boolean;
  createdAt?: string;
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  totalEarnings?: number;
}

export interface DriverFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  licenseNumber: string;
  licenseExpiry: string;
  licenseType: string;
  vehicleType: string;
  vehiclePlate: string;
  vehicleModel: string;
  vehicleColor: string;
  vehicleCapacity: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactRelationship: string;
}

export interface DriverFilters {
  searchTerm: string;
  statusFilter: string;
} 