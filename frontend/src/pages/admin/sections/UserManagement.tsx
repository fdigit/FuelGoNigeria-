import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiUsers, 
  FiSearch, 
  FiFilter, 
  FiDownload, 
  FiUpload, 
  FiMoreVertical, 
  FiEye, 
  FiEdit, 
  FiTrash2, 
  FiShield, 
  FiClock, 
  FiCheckCircle, 
  FiXCircle, 
  FiAlertTriangle,
  FiUserPlus,
  FiActivity,
  FiBarChart,
  FiSettings,
  FiMail,
  FiPhone,
  FiMapPin,
  FiCalendar,
  FiTrendingUp,
  FiTrendingDown,
  FiUserCheck,
  FiUserX,
  FiRefreshCw,
  FiChevronDown,
  FiChevronUp,
  FiPlus,
  FiMinus,
  FiX
} from 'react-icons/fi';
import type { IconType } from 'react-icons';
import { useAuth } from '../../../contexts/AuthContext';
import { User, UserStatus, UserRole } from '../../../types/user';
import { useToast } from '../../../contexts/ToastContext';
import adminService from '../../../services/admin.service';
import { API_URL } from '../../../config';
import { 
  UserDetailsModal, 
  EditUserModal, 
  DeleteUserModal, 
  BulkActionModal 
} from '../../../components/admin/UserManagementModals';

// Type assertion to ensure icons are treated as React components
const FiUsersIcon = FiUsers as React.ComponentType<React.SVGProps<SVGSVGElement>>;
const FiSearchIcon = FiSearch as React.ComponentType<React.SVGProps<SVGSVGElement>>;
const FiFilterIcon = FiFilter as React.ComponentType<React.SVGProps<SVGSVGElement>>;
const FiDownloadIcon = FiDownload as React.ComponentType<React.SVGProps<SVGSVGElement>>;
const FiUploadIcon = FiUpload as React.ComponentType<React.SVGProps<SVGSVGElement>>;
const FiMoreVerticalIcon = FiMoreVertical as React.ComponentType<React.SVGProps<SVGSVGElement>>;
const FiEyeIcon = FiEye as React.ComponentType<React.SVGProps<SVGSVGElement>>;
const FiEditIcon = FiEdit as React.ComponentType<React.SVGProps<SVGSVGElement>>;
const FiTrash2Icon = FiTrash2 as React.ComponentType<React.SVGProps<SVGSVGElement>>;
const FiShieldIcon = FiShield as React.ComponentType<React.SVGProps<SVGSVGElement>>;
const FiClockIcon = FiClock as React.ComponentType<React.SVGProps<SVGSVGElement>>;
const FiCheckCircleIcon = FiCheckCircle as React.ComponentType<React.SVGProps<SVGSVGElement>>;
const FiXCircleIcon = FiXCircle as React.ComponentType<React.SVGProps<SVGSVGElement>>;
const FiAlertTriangleIcon = FiAlertTriangle as React.ComponentType<React.SVGProps<SVGSVGElement>>;
const FiUserPlusIcon = FiUserPlus as React.ComponentType<React.SVGProps<SVGSVGElement>>;
const FiActivityIcon = FiActivity as React.ComponentType<React.SVGProps<SVGSVGElement>>;
const FiBarChartIcon = FiBarChart as React.ComponentType<React.SVGProps<SVGSVGElement>>;
const FiSettingsIcon = FiSettings as React.ComponentType<React.SVGProps<SVGSVGElement>>;
const FiMailIcon = FiMail as React.ComponentType<React.SVGProps<SVGSVGElement>>;
const FiPhoneIcon = FiPhone as React.ComponentType<React.SVGProps<SVGSVGElement>>;
const FiMapPinIcon = FiMapPin as React.ComponentType<React.SVGProps<SVGSVGElement>>;
const FiCalendarIcon = FiCalendar as React.ComponentType<React.SVGProps<SVGSVGElement>>;
const FiTrendingUpIcon = FiTrendingUp as React.ComponentType<React.SVGProps<SVGSVGElement>>;
const FiTrendingDownIcon = FiTrendingDown as React.ComponentType<React.SVGProps<SVGSVGElement>>;
const FiUserCheckIcon = FiUserCheck as React.ComponentType<React.SVGProps<SVGSVGElement>>;
const FiUserXIcon = FiUserX as React.ComponentType<React.SVGProps<SVGSVGElement>>;
const FiRefreshCwIcon = FiRefreshCw as React.ComponentType<React.SVGProps<SVGSVGElement>>;
const FiChevronDownIcon = FiChevronDown as React.ComponentType<React.SVGProps<SVGSVGElement>>;
const FiChevronUpIcon = FiChevronUp as React.ComponentType<React.SVGProps<SVGSVGElement>>;
const FiPlusIcon = FiPlus as React.ComponentType<React.SVGProps<SVGSVGElement>>;
const FiMinusIcon = FiMinus as React.ComponentType<React.SVGProps<SVGSVGElement>>;
const FiXIcon = FiX as React.ComponentType<React.SVGProps<SVGSVGElement>>;

interface UserStats {
  totalUsers: number;
  pendingUsers: number;
  activeUsers: number;
  suspendedUsers: number;
  rejectedUsers: number;
  usersByRole: Array<{ role: string; count: number }>;
  recentRegistrations: number;
  userGrowthRate?: number;
  newUsersThisWeek?: number;
}

interface UserFilters {
  search: string;
  status: string;
  role: string;
  dateRange: { start: string; end: string };
  verified: string;
  lastActive: string;
}

export default function UserManagement() {
  const { showToast } = useToast();
  const { user: authUser } = useAuth();
  
  // State management
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [showUserActivity, setShowUserActivity] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  
  // Pagination
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  
  // Filters
  const [filters, setFilters] = useState<UserFilters>({
    search: '',
    status: 'all',
    role: 'all',
    dateRange: { start: '', end: '' },
    verified: 'all',
    lastActive: 'all'
  });
  
  // Modal states
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  
  // Form states
  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    role: 'CUSTOMER' as UserRole,
    status: 'ACTIVE' as UserStatus
  });
  
  const [modalReasons, setModalReasons] = useState({
    reject: '',
    suspend: '',
    delete: '',
    bulk: ''
  });
  
  const [bulkAction, setBulkAction] = useState<'approve' | 'reject' | 'suspend' | 'delete' | ''>('');
  
  // Loading states
  const [actionLoading, setActionLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [importLoading, setImportLoading] = useState(false);

  // Fetch data on component mount
  useEffect(() => {
    if (authUser?.token) {
      fetchUsers();
      fetchStats();
    }
  }, [authUser?.token]);

  // Fetch users when filters or pagination changes
  useEffect(() => {
    if (authUser?.token) {
      fetchUsers();
    }
  }, [page, limit, filters]);

  // Debug: Log users when they change
  useEffect(() => {
    console.log('Users updated:', users);
    if (users.length > 0) {
      console.log('First user structure:', users[0]);
      // Test modal with first user
      console.log('Testing modal with user:', {
        _id: users[0]._id,
        firstName: users[0].firstName,
        lastName: users[0].lastName,
        email: users[0].email,
        role: users[0].role,
        status: users[0].status
      });
    }
  }, [users]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      console.log('Fetching users with params:', { page, limit, filters });
      
      const params = {
        page,
        limit,
        ...(filters.search && { search: filters.search }),
        ...(filters.status !== 'all' && { status: filters.status }),
        ...(filters.role !== 'all' && { role: filters.role }),
        ...(filters.dateRange.start && { startDate: filters.dateRange.start }),
        ...(filters.dateRange.end && { endDate: filters.dateRange.end }),
        ...(filters.verified !== 'all' && { verified: filters.verified }),
        ...(filters.lastActive !== 'all' && { lastActive: filters.lastActive })
      };

      console.log('Calling adminService.getAllUsers with params:', params);
      const data = await adminService.getAllUsers(params);
      console.log('Received data from adminService:', data);
      
      setUsers(data.users);
      setTotalPages(data.pagination.pages);
      setTotalUsers(data.pagination.total);
    } catch (error) {
      console.error('Error in fetchUsers:', error);
      showToast('error', error instanceof Error ? error.message : 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const data = await adminService.getUserStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  // User actions
  const handleUserAction = async (action: string, userId: string, reason?: string) => {
    try {
      setActionLoading(true);
      
      let result;
      switch (action) {
        case 'approve':
          result = await adminService.approveUser(userId);
          break;
        case 'reject':
          if (!reason) throw new Error('Rejection reason is required');
          result = await adminService.rejectUser(userId, reason);
          break;
        case 'suspend':
          result = await adminService.updateUserStatus(userId, 'SUSPENDED');
          break;
        case 'activate':
          result = await adminService.updateUserStatus(userId, 'ACTIVE');
          break;
        case 'delete':
          result = await adminService.deleteUser(userId);
          break;
        default:
          throw new Error(`Unknown action: ${action}`);
      }

      showToast('success', `User ${action}ed successfully`);
      fetchUsers();
      fetchStats();
    } catch (error) {
      showToast('error', error instanceof Error ? error.message : `Failed to ${action} user`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleBulkAction = async () => {
    if (!bulkAction || selectedUsers.length === 0) return;
    
    try {
      setActionLoading(true);
      await adminService.bulkAction(bulkAction, selectedUsers, modalReasons.bulk);

      showToast('success', `${selectedUsers.length} users ${bulkAction}ed successfully`);
      setSelectedUsers([]);
      setShowBulkModal(false);
      setBulkAction('');
      setModalReasons({ ...modalReasons, bulk: '' });
      fetchUsers();
      fetchStats();
    } catch (error) {
      showToast('error', error instanceof Error ? error.message : `Failed to ${bulkAction} users`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateUser = async (userData: any) => {
    if (!selectedUser) return;
    
    try {
      setActionLoading(true);
      await adminService.updateUser(selectedUser._id, userData);
      
      // Update the user in the list
      setUsers(users.map(user => 
        user._id === selectedUser._id 
          ? { ...user, ...userData }
          : user
      ));
      
      // Update selected user if it's the same user
      if (selectedUser) {
        setSelectedUser({ ...selectedUser, ...userData });
      }
      
      setShowEditModal(false);
      showToast('success', 'User updated successfully');
    } catch (error) {
      showToast('error', error instanceof Error ? error.message : 'Failed to update user');
    } finally {
      setActionLoading(false);
    }
  };

  const handleExportUsers = async () => {
    try {
      setExportLoading(true);
      const blob = await adminService.exportUsers('csv');
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `users-export-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      showToast('success', 'Users exported successfully');
    } catch (error) {
      showToast('error', error instanceof Error ? error.message : 'Failed to export users');
    } finally {
      setExportLoading(false);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedUsers(filteredUsers.map(user => user._id));
    } else {
      setSelectedUsers([]);
    }
  };

  const handleSelectUser = (userId: string, checked: boolean) => {
    if (checked) {
      setSelectedUsers([...selectedUsers, userId]);
    } else {
      setSelectedUsers(selectedUsers.filter(id => id !== userId));
    }
  };

  // Helper functions for status and role colors
  const getStatusColor = (status: UserStatus) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'SUSPENDED': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'REJECTED': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case 'ADMIN': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'VENDOR': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'DRIVER': return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200';
      case 'CUSTOMER': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  // Filtered users
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
        const email = user.email.toLowerCase();
        const phone = user.phoneNumber?.toLowerCase() || '';
        
        if (!fullName.includes(searchTerm) && !email.includes(searchTerm) && !phone.includes(searchTerm)) {
          return false;
        }
      }
      
      if (filters.status !== 'all' && user.status.toLowerCase() !== filters.status) {
        return false;
      }
      
      if (filters.role !== 'all' && user.role.toLowerCase() !== filters.role) {
        return false;
      }
      
      return true;
    });
  }, [users, filters]);

  // Render functions
  const renderStatsCards = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Users</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {stats?.totalUsers || 0}
            </p>
          </div>
          <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
            <FiUsersIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
        </div>
        <div className="mt-4 flex items-center text-sm">
          <FiTrendingUpIcon className="h-4 w-4 text-green-500 mr-1" />
          <span className="text-green-600 dark:text-green-400">
            +{stats?.userGrowthRate || 0}% this month
          </span>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Users</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {stats?.activeUsers || 0}
            </p>
          </div>
          <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
            <FiUserCheckIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
        </div>
        <div className="mt-4 flex items-center text-sm">
          <FiCheckCircleIcon className="h-4 w-4 text-green-500 mr-1" />
          <span className="text-green-600 dark:text-green-400">
            {((stats?.activeUsers || 0) / (stats?.totalUsers || 1) * 100).toFixed(1)}% active rate
          </span>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending Approval</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {stats?.pendingUsers || 0}
            </p>
          </div>
          <div className="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
            <FiClockIcon className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
          </div>
        </div>
        <div className="mt-4 flex items-center text-sm">
          <FiAlertTriangleIcon className="h-4 w-4 text-yellow-500 mr-1" />
          <span className="text-yellow-600 dark:text-yellow-400">
            Requires attention
          </span>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">New This Week</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {stats?.newUsersThisWeek || 0}
            </p>
          </div>
          <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
            <FiUserPlusIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
          </div>
        </div>
        <div className="mt-4 flex items-center text-sm">
          <FiTrendingUpIcon className="h-4 w-4 text-purple-500 mr-1" />
          <span className="text-purple-600 dark:text-purple-400">
            Growing steadily
          </span>
        </div>
      </motion.div>
    </div>
  );

  const renderFilters = () => (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: showFilters ? 'auto' : 0, opacity: showFilters ? 1 : 0 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6 overflow-hidden"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Search
          </label>
          <div className="relative">
            <FiSearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search users..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Status
          </label>
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="all">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="PENDING">Pending</option>
            <option value="SUSPENDED">Suspended</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Role
          </label>
          <select
            value={filters.role}
            onChange={(e) => setFilters({ ...filters, role: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="all">All Roles</option>
            <option value="CUSTOMER">Customer</option>
            <option value="DRIVER">Driver</option>
            <option value="VENDOR">Vendor</option>
            <option value="ADMIN">Admin</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Last Active
          </label>
          <select
            value={filters.lastActive}
            onChange={(e) => setFilters({ ...filters, lastActive: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
        </div>
      </div>

      <div className="mt-4 flex justify-end space-x-3">
        <button
          onClick={() => setFilters({
            search: '',
            status: 'all',
            role: 'all',
            dateRange: { start: '', end: '' },
            verified: 'all',
            lastActive: 'all'
          })}
          className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
        >
          Clear Filters
        </button>
        <button
          onClick={() => setShowFilters(false)}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Apply Filters
        </button>
      </div>
    </motion.div>
  );

  const renderUserTable = () => (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Users ({totalUsers})
          </h3>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              <FiFilterIcon className="h-4 w-4 mr-2" />
              Filters
            </button>
            <button
              onClick={handleExportUsers}
              disabled={exportLoading}
              className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
            >
              <FiDownloadIcon className="h-4 w-4 mr-2" />
              {exportLoading ? 'Exporting...' : 'Export'}
            </button>
            <button
              onClick={() => setShowCreateUser(true)}
              className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <FiUserPlusIcon className="h-4 w-4 mr-2" />
              Add User
            </button>
          </div>
        </div>
      </div>

      {selectedUsers.length > 0 && (
        <div className="px-6 py-3 bg-blue-50 dark:bg-blue-900/20 border-b border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
              {selectedUsers.length} user{selectedUsers.length !== 1 ? 's' : ''} selected
            </span>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => {
                  setBulkAction('approve');
                  setShowBulkModal(true);
                }}
                className="px-3 py-1.5 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 transition-colors"
              >
                Approve
              </button>
              <button
                onClick={() => {
                  setBulkAction('suspend');
                  setShowBulkModal(true);
                }}
                className="px-3 py-1.5 text-sm font-medium text-white bg-orange-600 rounded-md hover:bg-orange-700 transition-colors"
              >
                Suspend
              </button>
              <button
                onClick={() => {
                  setBulkAction('delete');
                  setShowBulkModal(true);
                }}
                className="px-3 py-1.5 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
              <button
                onClick={() => setSelectedUsers([])}
                className="px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200 transition-colors"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left">
                <input
                  type="checkbox"
                  checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Joined
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Last Active
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {loading ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center">
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-3 text-gray-500 dark:text-gray-400">Loading users...</span>
                  </div>
                </td>
              </tr>
            ) : filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                  No users found
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => (
                <motion.tr
                  key={user._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user._id)}
                      onChange={(e) => handleSelectUser(user._id, e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {user.firstName} {user.lastName}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {user.email}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {user.phoneNumber}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(user.role)}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(user.status)}`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {new Date(user.updatedAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => {
                          console.log('View button clicked for user:', user);
                          setSelectedUser(user);
                          setShowUserDetails(true);
                          console.log('showUserDetails set to true');
                        }}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                        title="View Details"
                      >
                        <FiEyeIcon className="h-4 w-4" />
                      </button>
                      
                      {/* Status Actions */}
                      {user.status === 'PENDING' && (
                        <>
                          <button
                            onClick={() => handleUserAction('approve', user._id)}
                            className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 transition-colors"
                            title="Approve User"
                            disabled={actionLoading}
                          >
                            <FiCheckCircleIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedUser(user);
                              setShowRejectModal(true);
                            }}
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                            title="Reject User"
                            disabled={actionLoading}
                          >
                            <FiXCircleIcon className="h-4 w-4" />
                          </button>
                        </>
                      )}
                      
                      {user.status === 'ACTIVE' && (
                        <button
                          onClick={() => handleUserAction('suspend', user._id)}
                          className="text-orange-600 hover:text-orange-900 dark:text-orange-400 dark:hover:text-orange-300 transition-colors"
                          title="Suspend User"
                          disabled={actionLoading}
                        >
                          <FiAlertTriangleIcon className="h-4 w-4" />
                        </button>
                      )}
                      
                      {user.status === 'SUSPENDED' && (
                        <button
                          onClick={() => handleUserAction('activate', user._id)}
                          className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 transition-colors"
                          title="Activate User"
                          disabled={actionLoading}
                        >
                          <FiCheckCircleIcon className="h-4 w-4" />
                        </button>
                      )}
                      
                      <button
                        onClick={() => {
                          console.log('Edit button clicked for user:', user);
                          setEditForm({
                            firstName: user.firstName,
                            lastName: user.lastName,
                            email: user.email,
                            phoneNumber: user.phoneNumber,
                            role: user.role,
                            status: user.status
                          });
                          setSelectedUser(user);
                          setShowEditModal(true);
                          console.log('showEditModal set to true');
                        }}
                        className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 transition-colors"
                        title="Edit User"
                      >
                        <FiEditIcon className="h-4 w-4" />
                      </button>
                      
                      {user.role !== 'ADMIN' && (
                        <button
                          onClick={() => {
                            console.log('Delete button clicked for user:', user);
                            setSelectedUser(user);
                            setShowDeleteModal(true);
                            console.log('showDeleteModal set to true');
                          }}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                          title="Delete User"
                        >
                          <FiTrash2Icon className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, totalUsers)} of {totalUsers} results
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <select
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
              className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-3 py-1 text-sm font-medium text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="px-3 py-1 text-sm text-gray-700 dark:text-gray-300">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="px-3 py-1 text-sm font-medium text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">User Management</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage users, roles, and permissions across the platform
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowAnalytics(true)}
            className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            <FiBarChartIcon className="h-4 w-4 mr-2" />
            Analytics
          </button>
          <button
            onClick={() => setShowUserActivity(true)}
            className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            <FiActivityIcon className="h-4 w-4 mr-2" />
            Activity
          </button>
          <button
            onClick={fetchUsers}
            disabled={loading}
            className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
          >
            <FiRefreshCwIcon className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      {renderStatsCards()}

      {/* Filters */}
      {renderFilters()}

      {/* User Table */}
      {renderUserTable()}

      {/* Modals */}
      <UserDetailsModal
        isOpen={showUserDetails}
        onClose={() => {
          console.log('Closing UserDetailsModal');
          setShowUserDetails(false);
        }}
        user={selectedUser}
      />

      <EditUserModal
        isOpen={showEditModal}
        onClose={() => {
          console.log('Closing EditUserModal');
          setShowEditModal(false);
        }}
        user={selectedUser}
        onSave={handleUpdateUser}
        loading={actionLoading}
      />

      <DeleteUserModal
        isOpen={showDeleteModal}
        onClose={() => {
          console.log('Closing DeleteUserModal');
          setShowDeleteModal(false);
        }}
        user={selectedUser}
        onConfirm={(reason) => handleUserAction('delete', selectedUser?._id || '', reason)}
        loading={actionLoading}
      />

      {/* Reject User Modal */}
      <div className={`fixed inset-0 z-50 overflow-y-auto ${showRejectModal ? 'block' : 'hidden'}`}
        onClick={() => setShowRejectModal(false)}>
        <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
          <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" />
          <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full"
            onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Reject User</h3>
                <button
                  onClick={() => setShowRejectModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  <FiXIcon className="h-6 w-6" />
                </button>
              </div>
            </div>
            <div className="px-6 py-4">
              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <FiXCircleIcon className="h-6 w-6 text-red-600 dark:text-red-400" />
                  <div>
                    <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                      Are you sure you want to reject this user?
                    </h3>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Reason <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={modalReasons.reject}
                    onChange={(e) => setModalReasons({ ...modalReasons, reject: e.target.value })}
                    placeholder="Please provide a reason for rejecting this user..."
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    rows={3}
                    required
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setShowRejectModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      if (modalReasons.reject.trim()) {
                        handleUserAction('reject', selectedUser?._id || '', modalReasons.reject);
                        setShowRejectModal(false);
                        setModalReasons({ ...modalReasons, reject: '' });
                      }
                    }}
                    disabled={!modalReasons.reject.trim() || actionLoading}
                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {actionLoading ? 'Rejecting...' : 'Reject User'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <BulkActionModal
        isOpen={showBulkModal}
        onClose={() => setShowBulkModal(false)}
        action={bulkAction}
        selectedCount={selectedUsers.length}
        onConfirm={handleBulkAction}
        loading={actionLoading}
      />

    </div>
  );
} 