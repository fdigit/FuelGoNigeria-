export type UserRole = 'CUSTOMER' | 'DRIVER' | 'VENDOR' | 'ADMIN' | 'SUPER_ADMIN';
export type UserStatus = 'ACTIVE' | 'PENDING' | 'SUSPENDED' | 'REJECTED';

export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
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

export interface UserResponse {
  success: boolean;
  data: User[];
  message?: string;
}

export interface PendingUser extends User {
  status: 'PENDING';
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