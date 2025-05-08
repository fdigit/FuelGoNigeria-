export type UserRole = 'customer' | 'driver' | 'vendor' | 'admin' | 'super_admin';
export type UserStatus = 'pending' | 'active' | 'inactive' | 'suspended' | 'rejected';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  status: UserStatus;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
  additionalInfo?: {
    // Driver specific
    licenseNumber?: string;
    vehicleType?: string;
    vehiclePlate?: string;
    // Vendor specific
    businessName?: string;
    businessAddress?: string;
    businessPhone?: string;
  };
}

export interface PendingUser extends User {
  status: 'pending';
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  role: UserRole;
  // Driver specific
  licenseNumber?: string;
  vehicleType?: string;
  vehiclePlate?: string;
  // Vendor specific
  businessName?: string;
  businessAddress?: string;
  businessPhone?: string;
} 