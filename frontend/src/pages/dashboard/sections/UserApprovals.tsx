import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useToast } from '../../../contexts/ToastContext';
import { User } from '../../../types/user';

interface PendingUser extends Omit<User, '_id'> {
  _id: string;
  registrationDate: Date;
  additionalInfo?: {
    licenseNumber?: string;
    vehicleType?: string;
    vehiclePlate?: string;
    businessName?: string;
    businessAddress?: string;
    businessPhone?: string;
  };
}

export default function UserApprovals() {
  const { showToast } = useToast();
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<PendingUser | null>(null);

  useEffect(() => {
    fetchPendingUsers();
  }, []);

  const fetchPendingUsers = async () => {
    try {
      const response = await fetch('/api/admin/pending-users');
      const data = await response.json();
      setPendingUsers(data);
    } catch (error) {
      showToast('error', 'Failed to fetch pending users');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (userId: string) => {
    try {
      const response = await fetch(`/api/admin/approve-user/${userId}`, {
        method: 'POST',
      });

      if (response.ok) {
        showToast('success', 'User approved successfully');
        setPendingUsers(prev => prev.filter(user => user._id !== userId));
        setSelectedUser(null);
      } else {
        throw new Error('Failed to approve user');
      }
    } catch (error) {
      showToast('error', 'Failed to approve user');
    }
  };

  const handleReject = async (userId: string) => {
    try {
      const response = await fetch(`/api/admin/reject-user/${userId}`, {
        method: 'POST',
      });

      if (response.ok) {
        showToast('success', 'User rejected successfully');
        setPendingUsers(prev => prev.filter(user => user._id !== userId));
        setSelectedUser(null);
      } else {
        throw new Error('Failed to reject user');
      }
    } catch (error) {
      showToast('error', 'Failed to reject user');
    }
  };

  const renderUserDetails = (user: PendingUser) => {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Name</h3>
            <p className="mt-1 text-sm text-gray-900 dark:text-white">{user.firstName} {user.lastName}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</h3>
            <p className="mt-1 text-sm text-gray-900 dark:text-white">{user.email}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Phone</h3>
            <p className="mt-1 text-sm text-gray-900 dark:text-white">{user.phone}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Role</h3>
            <p className="mt-1 text-sm text-gray-900 dark:text-white capitalize">{user.role}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Registration Date</h3>
            <p className="mt-1 text-sm text-gray-900 dark:text-white">
              {new Date(user.registrationDate).toLocaleDateString()}
            </p>
          </div>
        </div>

        {user.role === 'driver' && user.additionalInfo && (
          <div className="mt-4">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Driver Information</h3>
            <div className="mt-2 grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">License Number</p>
                <p className="mt-1 text-sm text-gray-900 dark:text-white">{user.additionalInfo.licenseNumber}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Vehicle Type</p>
                <p className="mt-1 text-sm text-gray-900 dark:text-white">{user.additionalInfo.vehicleType}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Vehicle Plate</p>
                <p className="mt-1 text-sm text-gray-900 dark:text-white">{user.additionalInfo.vehiclePlate}</p>
              </div>
            </div>
          </div>
        )}

        {user.role === 'vendor' && user.additionalInfo && (
          <div className="mt-4">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Business Information</h3>
            <div className="mt-2 grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Business Name</p>
                <p className="mt-1 text-sm text-gray-900 dark:text-white">{user.additionalInfo.businessName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Business Address</p>
                <p className="mt-1 text-sm text-gray-900 dark:text-white">{user.additionalInfo.businessAddress}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Business Phone</p>
                <p className="mt-1 text-sm text-gray-900 dark:text-white">{user.additionalInfo.businessPhone}</p>
              </div>
            </div>
          </div>
        )}

        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={() => handleReject(user._id)}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600"
          >
            Reject
          </button>
          <button
            onClick={() => handleApprove(user._id)}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Approve
          </button>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Pending Approvals</h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Review and approve new user registrations
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg divide-y divide-gray-200 dark:divide-gray-700">
            {pendingUsers.length === 0 ? (
              <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                No pending approvals
              </div>
            ) : (
              pendingUsers.map(user => (
                <motion.div
                  key={user._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                  onClick={() => setSelectedUser(user)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                    </div>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100">
                      {user.role}
                    </span>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>

        <div className="lg:col-span-2">
          {selectedUser ? (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white dark:bg-gray-800 shadow rounded-lg p-6"
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
    </div>
  );
} 