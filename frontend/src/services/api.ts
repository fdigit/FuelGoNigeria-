import axios from 'axios';
import { User, UserStatus, UserRole } from '../types/user';

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
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
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
    if (error.response?.status === 401) {
      // Only redirect to login if we're not already on the login page
      if (!window.location.pathname.includes('/login')) {
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
  }
};

export default api; 