import axios from 'axios';
import { User, UserStatus, UserRole } from '../types/user';
import { Vendor, VendorDisplay, Product } from '../types';

export interface Activity {
  _id: string;
  type: string;
  ipAddress: string;
  deviceInfo: {
    browser: string;
    os: string;
    device: string;
  };
  status: 'success' | 'failed';
  details?: string;
  timestamp: string;
}

export interface AdminInvitation {
  _id: string;
  email: string;
  role: UserRole;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
  expiresAt: string;
}

// Use environment variable for API URL, fallback to localhost for development
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    // Get token from user object in localStorage
    const storedUser = localStorage.getItem('user');
    let token = null;
    
    console.log('Request interceptor - URL:', config.url);
    console.log('Request interceptor - storedUser:', storedUser);
    
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        token = userData.token;
        console.log('Request interceptor - token from user data:', token ? 'Present' : 'Missing');
        console.log('Request interceptor - user role:', userData.role);
      } catch (error) {
        console.log('Error parsing user data from localStorage:', error);
      }
    }
    
    // Also try to get token directly
    const directToken = localStorage.getItem('token');
    console.log('Request interceptor - direct token:', directToken ? 'Present' : 'Missing');
    
    // Use direct token if available, otherwise use token from user data
    const finalToken = directToken || token;
    
    if (finalToken && config.headers) {
      config.headers.Authorization = `Bearer ${finalToken}`;
      console.log('Request interceptor - Authorization header set');
    } else {
      console.log('Request interceptor - No token available');
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.log('API Error:', {
      url: error.config?.url,
      status: error.response?.status,
      message: error.response?.data?.message || error.message
    });
    
    if (error.response?.status === 401) {
      // Don't auto-logout for vendor profile endpoints - let the component handle it
      if (error.config?.url?.includes('/api/vendor/profile')) {
        console.log('Vendor profile 401 error - not auto-logging out');
        return Promise.reject(error);
      }
      
      // Only redirect to login if we're not already on the login page
      if (!window.location.pathname.includes('/login')) {
        console.log('Auto-logging out due to 401 error');
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const userService = {
  getAllUsers: async (): Promise<User[]> => {
    try {
      const response = await api.get<User[]>('/api/admin/users');
      return response.data;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  },

  approveUser: async (userId: string): Promise<{ message: string }> => {
    try {
      const response = await api.post<{ message: string }>(`/api/admin/approve-user/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error approving user:', error);
      throw error;
    }
  },

  rejectUser: async (userId: string, reason: string): Promise<{ message: string }> => {
    try {
      const response = await api.post<{ message: string }>(`/api/admin/reject-user/${userId}`, { reason });
      return response.data;
    } catch (error) {
      console.error('Error rejecting user:', error);
      throw error;
    }
  },

  updateUserStatus: async (userId: string, status: UserStatus): Promise<User> => {
    try {
      const response = await api.patch<User>(`/api/admin/users/${userId}/status`, { status });
      return response.data;
    } catch (error) {
      console.error('Error updating user status:', error);
      throw error;
    }
  },

  updateUserRole: async (userId: string, role: UserRole): Promise<User> => {
    try {
      const response = await api.patch<User>(`/api/admin/users/${userId}/role`, { role });
      return response.data;
    } catch (error) {
      console.error('Error updating user role:', error);
      throw error;
    }
  },

  updateUser: async (userId: string, userData: Partial<User>): Promise<User> => {
    try {
      const response = await api.patch<User>(`/api/users/${userId}`, userData);
      return response.data;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }
};

export const activityService = {
  getUserActivity: async (userId: string): Promise<Activity[]> => {
    try {
      const response = await api.get<Activity[]>(`/api/activity/user/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user activity:', error);
      throw error;
    }
  },

  getRecentActivity: async (): Promise<Activity[]> => {
    try {
      const response = await api.get<Activity[]>('/api/activity/recent');
      return response.data;
    } catch (error) {
      console.error('Error fetching recent activity:', error);
      throw error;
    }
  }
};

export const adminService = {
  listAdminInvitations: async (): Promise<AdminInvitation[]> => {
    try {
      const response = await api.get<AdminInvitation[]>('/admin/invitations');
      return response.data;
    } catch (error) {
      console.error('Error listing admin invitations:', error);
      throw error;
    }
  },

  // New admin vendor management functions
  getVendors: async (): Promise<Vendor[]> => {
    try {
      const response = await api.get<Vendor[]>('/api/admin/vendors');
      return response.data;
    } catch (error) {
      console.error('Error fetching vendors:', error);
      throw error;
    }
  },

  updateVendorStatus: async (vendorId: string, status: 'verified' | 'rejected'): Promise<{ message: string; vendor: Vendor }> => {
    try {
      const response = await api.patch<{ message: string; vendor: Vendor }>(`/api/admin/vendors/${vendorId}/verify`, { status });
      return response.data;
    } catch (error) {
      console.error('Error updating vendor status:', error);
      throw error;
    }
  }
};

export const vendorService = {
  getVendors: async (): Promise<VendorDisplay[]> => {
    try {
      console.log('Fetching vendors from:', `${API_URL}/api/vendor`);
      const response = await api.get('/api/vendor');
      console.log('Vendor response status:', response.status);
      console.log('Vendor response data length:', response.data?.length);
      
      if (!response.data || !Array.isArray(response.data)) {
        console.error('Invalid vendor data received:', response.data);
        return [];
      }

      const vendors = response.data.map((vendor: any): VendorDisplay => {
        // Calculate price range from products (if available)
        const prices = vendor.products?.map((p: Product) => p.price_per_unit) || [];
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const minPrice = prices.length > 0 ? Math.min(...prices) : 650; // Default to 650 if no products
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const maxPrice = prices.length > 0 ? Math.max(...prices) : 680; // Default to 680 if no products

        // Construct full logo URL if it's a relative path
        let fullLogoUrl = vendor.logo;
        if (vendor.logo && vendor.logo.startsWith('/uploads/')) {
          // Remove '/api' from the API_URL since we're accessing static files
          const baseUrl = API_URL.replace('/api', '');
          fullLogoUrl = `${baseUrl}${vendor.logo}`;
        }

        const transformedVendor = {
          _id: vendor._id,
          business_name: vendor.business_name,
          image: vendor.image,
          logo: fullLogoUrl,
          verification_status: vendor.verification_status,
          address: vendor.address,
          average_rating: vendor.average_rating,
          total_ratings: vendor.total_ratings,
          operating_hours: vendor.operating_hours,
          fuel_types: vendor.fuel_types,
          contact: vendor.contact,
          services: vendor.services,
          payment_methods: vendor.payment_methods,
          minimum_order: vendor.minimum_order,
          delivery_fee: vendor.delivery_fee,
          rating: vendor.rating,
          reviews: vendor.reviews,
          is_verified: vendor.is_verified,
          is_active: vendor.is_active,
          created_at: vendor.created_at,
          updated_at: vendor.updated_at,
        };
        return transformedVendor;
      });
      return vendors;
    } catch (error) {
      console.error('Error fetching vendors:', error);
      throw error;
    }
  },

  // Get single vendor details with products
  getVendorById: async (vendorId: string): Promise<any> => {
    try {
      console.log('Fetching vendor details for ID:', vendorId);
      const response = await api.get(`/api/vendor/${vendorId}`);
      console.log('Vendor detail response:', response.data);
      
      const vendorData = response.data;
      
      // Construct full logo URL if it's a relative path
      if (vendorData.logo && vendorData.logo.startsWith('/uploads/')) {
        const baseUrl = API_URL.replace('/api', '');
        vendorData.logo = `${baseUrl}${vendorData.logo}`;
        console.log('Vendor detail logo URL constructed:', vendorData.logo);
      }
      
      return vendorData;
    } catch (error: any) {
      console.error('Error fetching vendor details:', error);
      if (error.response?.status === 404) {
        throw new Error('Vendor not found');
      }
      throw error;
    }
  },

  // Vendor Profile Service
  getProfile: async (): Promise<any> => {
    try {
      const response = await api.get('/api/vendor/profile');
      const profileData = response.data;
      
      // Construct full logo URL if it's a relative path
      if (profileData.logo && profileData.logo.startsWith('/uploads/')) {
        const baseUrl = API_URL.replace('/api', '');
        profileData.logo = `${baseUrl}${profileData.logo}`;
        console.log('Profile logo URL constructed:', profileData.logo);
      }
      
      return profileData;
    } catch (error: any) {
      console.error('Error fetching vendor profile:', error);
      // Re-throw the error but with more context
      if (error.response?.status === 404) {
        throw new Error('Vendor profile not found');
      }
      throw error;
    }
  },

  updateProfile: async (profileData: any): Promise<{ message: string; profile: any }> => {
    try {
      const response = await api.put('/api/vendor/profile', profileData);
      return response.data;
    } catch (error: any) {
      console.error('Error updating vendor profile:', error);
      throw error;
    }
  },

  uploadLogo: async (file: File): Promise<{ message: string; logoUrl: string }> => {
    try {
      const formData = new FormData();
      formData.append('logo', file);

      const response = await api.post('/api/vendor/logo', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error: any) {
      console.error('Error uploading logo:', error);
      throw error;
    }
  }
};

export const driverService = {
  getDrivers: async (): Promise<any[]> => {
    try {
      const response = await api.get('/api/vendor/drivers');
      return response.data;
    } catch (error) {
      console.error('Error fetching drivers:', error);
      throw error;
    }
  }
};

export default api; 