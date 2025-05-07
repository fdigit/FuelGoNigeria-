export type UserRole = 'customer' | 'driver' | 'vendor' | 'admin';
export type UserStatus = 'pending' | 'active' | 'rejected' | 'suspended';

export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: UserRole;
  status: UserStatus;
  registrationDate: Date;
  lastLogin?: string;
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

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  role: 'customer' | 'driver' | 'vendor' | 'admin';
  // Driver specific
  licenseNumber?: string;
  vehicleType?: string;
  vehiclePlate?: string;
  // Vendor specific
  businessName?: string;
  businessAddress?: string;
  businessPhone?: string;
} 