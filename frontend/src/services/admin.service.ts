import axios from 'axios';
import { API_URL } from '../config';

const adminService = {
  // User Management
  getAllUsers: async () => {
    const response = await axios.get(`${API_URL}/admin/users`);
    return response.data;
  },

  getUserDetails: async (userId: string) => {
    const response = await axios.get(`${API_URL}/admin/users/${userId}`);
    return response.data;
  },

  getPendingUsers: async () => {
    const response = await axios.get(`${API_URL}/admin/users/pending`);
    return response.data;
  },

  approveUser: async (userId: string) => {
    const response = await axios.post(`${API_URL}/admin/users/${userId}/approve`);
    return response.data;
  },

  rejectUser: async (userId: string, reason: string) => {
    const response = await axios.post(`${API_URL}/admin/users/${userId}/reject`, { reason });
    return response.data;
  },

  updateUserStatus: async (userId: string, status: 'active' | 'suspended' | 'rejected') => {
    const response = await axios.patch(`${API_URL}/admin/users/${userId}/status`, { status });
    return response.data;
  },

  // Admin Management
  createAdminInvitation: async (email: string) => {
    const response = await axios.post(`${API_URL}/admin/invite`, { email });
    return response.data;
  },

  listAdminInvitations: async () => {
    const response = await axios.get(`${API_URL}/admin/invitations`);
    return response.data;
  },
};

export default adminService; 