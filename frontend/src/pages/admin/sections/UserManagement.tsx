import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { useAuth } from '../../../contexts/AuthContext';
import { User, UserStatus, UserRole } from '../../../types/user';
import { useToast } from '../../../contexts/ToastContext';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

export default function UserManagement() {
  const { showToast } = useToast();
  const { user: authUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<UserStatus | 'all'>('all');
  const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: ''
  });
  const [editLoading, setEditLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteReason, setDeleteReason] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showBulkActionsModal, setShowBulkActionsModal] = useState(false);
  const [bulkAction, setBulkAction] = useState<'approve' | 'reject' | 'suspend' | 'delete' | ''>('');
  const [bulkReason, setBulkReason] = useState('');
  const [bulkLoading, setBulkLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);

  useEffect(() => {
    if (authUser?.token) {
      fetchUsers();
      fetchStats();
    }
  }, [authUser?.token]);

  useEffect(() => {
    if (authUser?.token) {
      fetchUsers();
    }
  }, [page, limit, statusFilter, roleFilter, searchTerm]);

  const fetchStats = async () => {
    if (!authUser?.token) return;
    try {
      const response = await fetch(`${API_URL}/api/admin/users/stats`, {
        headers: {
          'Authorization': `Bearer ${authUser.token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) throw new Error('Failed to fetch stats');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      setStats(null);
    }
  };

  const fetchUsers = async () => {
    try {
      if (!authUser?.token) throw new Error('Authentication required');
      setLoading(true);
      let url = `${API_URL}/api/admin/users?page=${page}&limit=${limit}`;
      if (statusFilter !== 'all') url += `&status=${statusFilter}`;
      if (roleFilter !== 'all') url += `&role=${roleFilter}`;
      if (searchTerm) url += `&search=${encodeURIComponent(searchTerm)}`;
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${authUser.token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) throw new Error('Failed to fetch users');
      const data = await response.json();
      setUsers(data.users);
      setTotalPages(data.pagination.pages);
    } catch (error) {
      setUsers([]);
      setTotalPages(1);
      showToast('error', error instanceof Error ? error.message : 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveUser = async (userId: string) => {
    try {
      if (!authUser?.token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`${API_URL}/api/admin/approve-user/${userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authUser.token}`
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error approving user');
      }

      showToast('success', data.message || 'User approved successfully');
      fetchUsers();
    } catch (error) {
      console.error('Error approving user:', error);
      showToast('error', error instanceof Error ? error.message : 'Error approving user');
    }
  };

  const handleRejectUser = async (userId: string) => {
    try {
      if (!authUser?.token) {
        throw new Error('Authentication required');
      }

      if (!rejectionReason.trim()) {
        showToast('error', 'Please provide a reason for rejection');
        return;
      }

      const response = await fetch(`${API_URL}/api/admin/reject-user/${userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authUser.token}`
        },
        body: JSON.stringify({ reason: rejectionReason }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error rejecting user');
      }

      showToast('success', data.message || 'User rejected successfully');
      setShowRejectionModal(false);
      setRejectionReason('');
      fetchUsers();
    } catch (error) {
      console.error('Error rejecting user:', error);
      showToast('error', error instanceof Error ? error.message : 'Error rejecting user');
    }
  };

  const handleStatusChange = async (userId: string, newStatus: UserStatus) => {
    try {
      const response = await fetch(`${API_URL}/api/admin/users/${userId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authUser?.token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update user status');
      }

      setUsers(users.map(user => 
        user._id === userId ? { ...user, status: newStatus } : user
      ));
      toast.success('User status updated successfully');
    } catch (error) {
      console.error('Error updating user status:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update user status');
    }
  };

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    try {
      const response = await fetch(`${API_URL}/api/admin/users/${userId}/role`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authUser?.token}`
        },
        body: JSON.stringify({ role: newRole })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update user role');
      }

      setUsers(users.map(user => 
        user._id === userId ? { ...user, role: newRole } : user
      ));
      toast.success('User role updated successfully');
    } catch (error) {
      console.error('Error updating user role:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update user role');
    }
  };

  const handleEditUser = (user: User) => {
    setEditFormData({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phoneNumber: user.phoneNumber
    });
    setSelectedUser(user);
    setShowEditModal(true);
  };

  const handleUpdateUser = async () => {
    if (!selectedUser) return;
    
    try {
      setEditLoading(true);
      const response = await fetch(`${API_URL}/api/admin/users/${selectedUser._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authUser?.token}`
        },
        body: JSON.stringify(editFormData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update user');
      }

      const updatedUserData = await response.json();
      
      // Update the user in the list
      setUsers(users.map(user => 
        user._id === selectedUser._id 
          ? { ...user, ...editFormData }
          : user
      ));
      
      // Update selected user if it's the same user
      if (selectedUser) {
        setSelectedUser({ ...selectedUser, ...editFormData });
      }
      
      setShowEditModal(false);
      setEditFormData({ firstName: '', lastName: '', email: '', phoneNumber: '' });
      showToast('success', 'User updated successfully');
    } catch (error) {
      console.error('Error updating user:', error);
      showToast('error', error instanceof Error ? error.message : 'Failed to update user');
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!deleteReason.trim()) {
      showToast('error', 'Please provide a reason for deletion');
      return;
    }

    try {
      setDeleteLoading(true);
      const response = await fetch(`${API_URL}/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authUser?.token}`
        },
        body: JSON.stringify({ reason: deleteReason })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete user');
      }

      // Remove user from the list
      setUsers(users.filter(user => user._id !== userId));
      
      // Clear selected user if it was the deleted user
      if (selectedUser && selectedUser._id === userId) {
        setSelectedUser(null);
      }
      
      setShowDeleteModal(false);
      setDeleteReason('');
      showToast('success', 'User deleted successfully');
    } catch (error) {
      console.error('Error deleting user:', error);
      showToast('error', error instanceof Error ? error.message : 'Failed to delete user');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleBulkAction = async () => {
    if (!bulkAction || selectedUserIds.length === 0) {
      showToast('error', 'Please select an action and at least one user');
      return;
    }

    if ((bulkAction === 'reject' || bulkAction === 'delete') && !bulkReason.trim()) {
      showToast('error', 'Please provide a reason for this action');
      return;
    }

    try {
      setBulkLoading(true);
      const response = await fetch(`${API_URL}/api/admin/users/bulk-action`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authUser?.token}`
        },
        body: JSON.stringify({
          userIds: selectedUserIds,
          action: bulkAction,
          reason: bulkReason
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to perform bulk action');
      }

      const result = await response.json();
      
      // Refresh the user list to get updated data
      await fetchUsers();
      
      // Clear selections
      setSelectedUserIds([]);
      setShowBulkActionsModal(false);
      setBulkAction('');
      setBulkReason('');
      
      showToast('success', result.message || 'Bulk action completed successfully');
    } catch (error) {
      console.error('Error performing bulk action:', error);
      showToast('error', error instanceof Error ? error.message : 'Failed to perform bulk action');
    } finally {
      setBulkLoading(false);
    }
  };

  const handleExportUsers = async (format: 'csv' | 'json' = 'csv') => {
    try {
      setExportLoading(true);
      
      // Get all users for export (not paginated)
      const response = await fetch(`${API_URL}/api/admin/users/export?format=${format}`, {
        headers: {
          'Authorization': `Bearer ${authUser?.token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to export users');
      }

      if (format === 'csv') {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `users-export-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        const data = await response.json();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `users-export-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }

      showToast('success', `Users exported successfully as ${format.toUpperCase()}`);
    } catch (error) {
      console.error('Error exporting users:', error);
      showToast('error', error instanceof Error ? error.message : 'Failed to export users');
    } finally {
      setExportLoading(false);
    }
  };

  const handleSelectUser = (userId: string) => {
    setSelectedUserIds(ids => ids.includes(userId) ? ids.filter(id => id !== userId) : [...ids, userId]);
  };

  const handleSelectAll = () => {
    if (selectedUserIds.length === filteredUsers.length) {
      setSelectedUserIds([]);
    } else {
      setSelectedUserIds(filteredUsers.map(u => u._id));
    }
  };

  const handlePrevPage = () => setPage(p => Math.max(1, p - 1));
  const handleNextPage = () => setPage(p => Math.min(totalPages, p + 1));

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesStatus && matchesRole;
  });

  const renderUserDetails = (user: User) => {
    return (
      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">User Details</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Name</p>
              <p className="mt-1 text-sm text-gray-900 dark:text-white">{user.firstName} {user.lastName}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</p>
              <p className="mt-1 text-sm text-gray-900 dark:text-white">{user.email}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Phone</p>
              <p className="mt-1 text-sm text-gray-900 dark:text-white">{user.phoneNumber}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Role</p>
              <select
                value={user.role}
                onChange={(e) => handleRoleChange(user._id, e.target.value as UserRole)}
                className="mt-1 text-sm text-gray-900 dark:text-white capitalize bg-transparent border border-gray-300 dark:border-gray-600 rounded px-2 py-1 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="CUSTOMER">Customer</option>
                <option value="DRIVER">Driver</option>
                <option value="VENDOR">Vendor</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</p>
              <div className="flex items-center space-x-2">
                <select
                  value={user.status}
                  onChange={(e) => handleStatusChange(user._id, e.target.value as UserStatus)}
                  className={`text-xs font-medium px-2 py-1 rounded-full border-0 focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 ${
                    user.status === 'ACTIVE' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                    user.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                    user.status === 'SUSPENDED' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' :
                    'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                  }`}
                >
                  <option value="ACTIVE">Active</option>
                  <option value="PENDING">Pending</option>
                  <option value="SUSPENDED">Suspended</option>
                  <option value="REJECTED">Rejected</option>
                </select>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Registration Date</p>
              <p className="mt-1 text-sm text-gray-900 dark:text-white">
                {new Date(user.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          {user.status === 'PENDING' && (
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setSelectedUser(user);
                  setShowRejectionModal(true);
                }}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600"
              >
                Reject
              </button>
              <button
                onClick={() => handleApproveUser(user._id)}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Approve
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">User Management</h2>
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as UserStatus | 'all')}
            className="px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="all">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
            <option value="SUSPENDED">Suspended</option>
            <option value="PENDING">Pending</option>
            <option value="REJECTED">Rejected</option>
          </select>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as UserRole | 'all')}
            className="px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="all">All Roles</option>
            <option value="CUSTOMER">Customer</option>
            <option value="DRIVER">Driver</option>
            <option value="VENDOR">Vendor</option>
            <option value="ADMIN">Admin</option>
          </select>
          <div className="flex gap-2">
            <button
              onClick={() => handleExportUsers('csv')}
              disabled={exportLoading}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {exportLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              )}
              Export CSV
            </button>
            <button
              onClick={() => handleExportUsers('json')}
              disabled={exportLoading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {exportLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              )}
              Export JSON
            </button>
          </div>
        </div>
      </div>

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow flex flex-col items-center">
            <span className="text-lg font-bold">{stats.totalUsers}</span>
            <span className="text-xs text-gray-500">Total Users</span>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow flex flex-col items-center">
            <span className="text-lg font-bold">{stats.activeUsers}</span>
            <span className="text-xs text-gray-500">Active</span>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow flex flex-col items-center">
            <span className="text-lg font-bold">{stats.pendingUsers}</span>
            <span className="text-xs text-gray-500">Pending</span>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow flex flex-col items-center">
            <span className="text-lg font-bold">{stats.suspendedUsers}</span>
            <span className="text-xs text-gray-500">Suspended</span>
          </div>
        </div>
      )}

      {selectedUserIds.length > 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                {selectedUserIds.length} user{selectedUserIds.length !== 1 ? 's' : ''} selected
              </span>
              <button
                onClick={() => setSelectedUserIds([])}
                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200 text-sm underline"
              >
                Clear selection
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => {
                  setBulkAction('approve');
                  setShowBulkActionsModal(true);
                }}
                className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-sm rounded-md transition-colors"
              >
                Approve Selected
              </button>
              <button
                onClick={() => {
                  setBulkAction('reject');
                  setShowBulkActionsModal(true);
                }}
                className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-sm rounded-md transition-colors"
              >
                Reject Selected
              </button>
              <button
                onClick={() => {
                  setBulkAction('suspend');
                  setShowBulkActionsModal(true);
                }}
                className="px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white text-sm rounded-md transition-colors"
              >
                Suspend Selected
              </button>
              <button
                onClick={() => {
                  setBulkAction('delete');
                  setShowBulkActionsModal(true);
                }}
                className="px-3 py-1.5 bg-red-800 hover:bg-red-900 text-white text-sm rounded-md transition-colors"
              >
                Delete Selected
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg divide-y divide-gray-200 dark:divide-gray-700">
            {filteredUsers.length === 0 ? (
              <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                No users found
              </div>
            ) : (
              <>
                {/* Select All Header */}
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedUserIds.length === filteredUsers.length && filteredUsers.length > 0}
                      onChange={handleSelectAll}
                      className="mr-2"
                    />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Select All ({filteredUsers.length})
                    </span>
                  </div>
                  {selectedUserIds.length > 0 && (
                    <span className="text-xs text-blue-600 dark:text-blue-400">
                      {selectedUserIds.length} selected
                    </span>
                  )}
                </div>
                
                {filteredUsers.map(user => (
                  <motion.div
                    key={user._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer flex items-center"
                    onClick={() => setSelectedUser(user)}
                  >
                    <input
                      type="checkbox"
                      checked={selectedUserIds.includes(user._id)}
                      onChange={e => { e.stopPropagation(); handleSelectUser(user._id); }}
                      className="mr-2"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {user.firstName} {user.lastName}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <select
                            value={user.status}
                            onChange={(e) => handleStatusChange(user._id, e.target.value as UserStatus)}
                            className={`text-xs font-medium px-2 py-1 rounded-full border-0 focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 ${
                              user.status === 'ACTIVE' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                              user.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                              user.status === 'SUSPENDED' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' :
                              'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                            }`}
                          >
                            <option value="ACTIVE">Active</option>
                            <option value="PENDING">Pending</option>
                            <option value="SUSPENDED">Suspended</option>
                            <option value="REJECTED">Rejected</option>
                          </select>
                          <select
                            value={user.role}
                            onChange={(e) => handleRoleChange(user._id, e.target.value as UserRole)}
                            className="text-xs font-medium px-2 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                          >
                            <option value="CUSTOMER">Customer</option>
                            <option value="DRIVER">Driver</option>
                            <option value="VENDOR">Vendor</option>
                            <option value="ADMIN">Admin</option>
                          </select>
                        </div>
                      </div>
                    </div>
                    <button
                      className="ml-2 text-blue-500 hover:underline"
                      onClick={e => { e.stopPropagation(); handleEditUser(user); }}
                    >Edit</button>
                    <button
                      className="ml-2 text-red-500 hover:underline"
                      onClick={e => { 
                        e.stopPropagation(); 
                        setSelectedUser(user);
                        setShowDeleteModal(true);
                      }}
                    >Delete</button>
                  </motion.div>
                ))}
              </>
            )}
          </div>
        </div>

        <div className="lg:col-span-2">
          {selectedUser ? (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              {renderUserDetails(selectedUser)}
            </motion.div>
          ) : (
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 text-center text-gray-500 dark:text-gray-400">
              Select a user to view details
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-between items-center mt-4">
        <button onClick={handlePrevPage} disabled={page === 1} className="px-3 py-1 rounded bg-gray-200">Prev</button>
        <span>Page {page} of {totalPages}</span>
        <button onClick={handleNextPage} disabled={page === totalPages} className="px-3 py-1 rounded bg-gray-200">Next</button>
      </div>

      {/* Edit User Modal */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md"
          >
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Edit User: {selectedUser.firstName} {selectedUser.lastName}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  First Name
                </label>
                <input
                  type="text"
                  value={editFormData.firstName}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, firstName: e.target.value }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Last Name
                </label>
                <input
                  type="text"
                  value={editFormData.lastName}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, lastName: e.target.value }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Email
                </label>
                <input
                  type="email"
                  value={editFormData.email}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={editFormData.phoneNumber}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  required
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditFormData({ firstName: '', lastName: '', email: '', phoneNumber: '' });
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                disabled={editLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateUser}
                disabled={editLoading || !editFormData.firstName || !editFormData.lastName || !editFormData.email || !editFormData.phoneNumber}
                className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {editLoading ? 'Updating...' : 'Update User'}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Delete User Modal */}
      {showDeleteModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md"
          >
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Delete User: {selectedUser.firstName} {selectedUser.lastName}
            </h3>
            <div className="space-y-4">
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                      Warning: This action cannot be undone
                    </h3>
                    <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                      <p>This will permanently delete the user account and all associated data.</p>
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Reason for Deletion
                </label>
                <textarea
                  value={deleteReason}
                  onChange={(e) => setDeleteReason(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  rows={4}
                  placeholder="Enter reason for deletion..."
                  required
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteReason('');
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                disabled={deleteLoading}
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteUser(selectedUser._id)}
                disabled={deleteLoading || !deleteReason.trim()}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deleteLoading ? 'Deleting...' : 'Delete User'}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Rejection Modal */}
      {showRejectionModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md"
          >
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Reject User
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Reason for Rejection
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  rows={4}
                  placeholder="Enter reason for rejection..."
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowRejectionModal(false);
                  setRejectionReason('');
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={() => handleRejectUser(selectedUser._id)}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Reject User
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Bulk Actions Modal */}
      {showBulkActionsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md"
          >
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Bulk {bulkAction.charAt(0).toUpperCase() + bulkAction.slice(1)} Users
            </h3>
            <div className="space-y-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                      Confirm Bulk Action
                    </h3>
                    <div className="mt-2 text-sm text-blue-700 dark:text-blue-300">
                      <p>This action will be applied to {selectedUserIds.length} selected user{selectedUserIds.length !== 1 ? 's' : ''}.</p>
                      {bulkAction === 'delete' && (
                        <p className="mt-1 font-medium">This action cannot be undone!</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              {(bulkAction === 'reject' || bulkAction === 'delete') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Reason for {bulkAction === 'reject' ? 'Rejection' : 'Deletion'}
                  </label>
                  <textarea
                    value={bulkReason}
                    onChange={(e) => setBulkReason(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    rows={4}
                    placeholder={`Enter reason for ${bulkAction}...`}
                    required
                  />
                </div>
              )}
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowBulkActionsModal(false);
                  setBulkAction('');
                  setBulkReason('');
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                disabled={bulkLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleBulkAction}
                disabled={bulkLoading || ((bulkAction === 'reject' || bulkAction === 'delete') && !bulkReason.trim())}
                className={`px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                  bulkAction === 'approve' ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500' :
                  bulkAction === 'reject' ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500' :
                  bulkAction === 'suspend' ? 'bg-orange-600 hover:bg-orange-700 focus:ring-orange-500' :
                  'bg-red-800 hover:bg-red-900 focus:ring-red-500'
                }`}
              >
                {bulkLoading ? 'Processing...' : `${bulkAction.charAt(0).toUpperCase() + bulkAction.slice(1)} Selected`}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
} 