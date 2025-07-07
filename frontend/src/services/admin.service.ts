import axios from 'axios';
import { API_URL } from '../config';
import type { AdminInvitation } from './api';
import type { User, UserStatus, UserRole } from '../types/user';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
apiClient.interceptors.request.use(
  (config) => {
    console.log('Request interceptor called for:', config.url);
    
    // Try to get token from user object in localStorage first
    const userStr = localStorage.getItem('user');
    let token = null;
    
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        token = user.token;
        console.log('Found token in user object:', token ? 'Yes' : 'No');
      } catch (e) {
        console.error('Error parsing user from localStorage:', e);
      }
    }
    
    // Fallback to direct token storage
    if (!token) {
      token = localStorage.getItem('token') || sessionStorage.getItem('token');
      console.log('Found token in direct storage:', token ? 'Yes' : 'No');
    }
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('Authorization header set');
    } else {
      console.log('No token found, request will be made without authorization');
    }
    
    console.log('Request config:', {
      url: config.url,
      method: config.method,
      hasAuth: !!config.headers.Authorization
    });
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    console.log('Response received successfully:', {
      status: response.status,
      url: response.config.url,
      data: response.data
    });
    return response;
  },
  (error) => {
    console.error('Response error:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: error.config?.url,
      data: error.response?.data,
      message: error.message
    });
    
    if (error.response?.status === 401) {
      console.log('Unauthorized access detected, redirecting to login');
      // Handle unauthorized access
      localStorage.removeItem('token');
      sessionStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

const adminService = {
  // User Management
  getAllUsers: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    role?: string;
    startDate?: string;
    endDate?: string;
    verified?: string;
    lastActive?: string;
  }) => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    console.log('Making request to:', `/admin/users?${queryParams}`);
    console.log('API_URL:', API_URL);
    console.log('Full URL will be:', `${API_URL}/admin/users?${queryParams}`);
    
    const response = await apiClient.get(`/admin/users?${queryParams}`);
    console.log('Response received:', response);
    return response.data;
  },

  getUserDetails: async (userId: string) => {
    const response = await apiClient.get(`/admin/users/${userId}`);
    return response.data;
  },

  getUserStats: async () => {
    const response = await apiClient.get(`/admin/users/stats`);
    return response.data;
  },

  approveUser: async (userId: string) => {
    const response = await apiClient.post(`/admin/approve-user/${userId}`);
    return response.data;
  },

  rejectUser: async (userId: string, reason: string) => {
    const response = await apiClient.post(`/admin/reject-user/${userId}`, { reason });
    return response.data;
  },

  updateUserStatus: async (userId: string, status: UserStatus) => {
    const response = await apiClient.patch(`/admin/users/${userId}/status`, { status });
    return response.data;
  },

  updateUserRole: async (userId: string, role: UserRole) => {
    const response = await apiClient.patch(`/admin/users/${userId}/role`, { role });
    return response.data;
  },

  updateUser: async (userId: string, userData: Partial<User>) => {
    const response = await apiClient.patch(`/admin/users/${userId}`, userData);
    return response.data;
  },

  deleteUser: async (userId: string) => {
    const response = await apiClient.delete(`/admin/users/${userId}`);
    return response.data;
  },

  bulkAction: async (action: 'approve' | 'reject' | 'suspend' | 'activate' | 'delete', userIds: string[], reason?: string) => {
    const response = await apiClient.post(`/admin/users/bulk-action`, {
      userIds,
      action,
      reason
    });
    return response.data;
  },

  exportUsers: async (format: 'csv' | 'json' = 'csv') => {
    const response = await apiClient.get(`/admin/users/export?format=${format}`, {
      responseType: 'blob'
    });
    return response.data;
  },

  // Admin Management
  createAdminInvitation: async (email: string, role: string = 'admin'): Promise<AdminInvitation> => {
    const response = await apiClient.post<AdminInvitation>(`/admin/invite`, { email, role });
    return response.data;
  },

  listAdminInvitations: async (): Promise<AdminInvitation[]> => {
    const response = await apiClient.get<AdminInvitation[]>(`/admin/invitations`);
    return response.data;
  },

  deleteAdminInvitation: async (id: string): Promise<void> => {
    await apiClient.delete(`/admin/invitations/${id}`);
  }
};

export default adminService; 