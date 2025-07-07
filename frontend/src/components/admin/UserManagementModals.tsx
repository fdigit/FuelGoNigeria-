import React, { useState } from 'react';
import { 
  FiX, 
  FiUser, 
  FiMail, 
  FiPhone, 
  FiShield, 
  FiCalendar, 
  FiMapPin,
  FiAlertTriangle,
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiEdit,
  FiTrash2,
  FiDownload,
  FiUpload
} from 'react-icons/fi';
import type { IconType } from 'react-icons';
import { User, UserStatus, UserRole } from '../../types/user';

// Type assertion to ensure icons are treated as React components
const FiXIcon = FiX as React.ComponentType<React.SVGProps<SVGSVGElement>>;
const FiUserIcon = FiUser as React.ComponentType<React.SVGProps<SVGSVGElement>>;
const FiMailIcon = FiMail as React.ComponentType<React.SVGProps<SVGSVGElement>>;
const FiPhoneIcon = FiPhone as React.ComponentType<React.SVGProps<SVGSVGElement>>;
const FiShieldIcon = FiShield as React.ComponentType<React.SVGProps<SVGSVGElement>>;
const FiCalendarIcon = FiCalendar as React.ComponentType<React.SVGProps<SVGSVGElement>>;
const FiMapPinIcon = FiMapPin as React.ComponentType<React.SVGProps<SVGSVGElement>>;
const FiAlertTriangleIcon = FiAlertTriangle as React.ComponentType<React.SVGProps<SVGSVGElement>>;
const FiCheckCircleIcon = FiCheckCircle as React.ComponentType<React.SVGProps<SVGSVGElement>>;
const FiXCircleIcon = FiXCircle as React.ComponentType<React.SVGProps<SVGSVGElement>>;
const FiClockIcon = FiClock as React.ComponentType<React.SVGProps<SVGSVGElement>>;
const FiEditIcon = FiEdit as React.ComponentType<React.SVGProps<SVGSVGElement>>;
const FiTrash2Icon = FiTrash2 as React.ComponentType<React.SVGProps<SVGSVGElement>>;
const FiDownloadIcon = FiDownload as React.ComponentType<React.SVGProps<SVGSVGElement>>;
const FiUploadIcon = FiUpload as React.ComponentType<React.SVGProps<SVGSVGElement>>;

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children, title, size = 'md' }) => {
  console.log('Modal render:', { isOpen, title, size });
  
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl'
  };

  if (!isOpen) {
    console.log('Modal not open, returning null');
    return null;
  }

  console.log('Modal is open, rendering...');

  return (
    <div className="fixed inset-0 z-[9999] overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        />
        
        {/* Modal Content */}
        <div 
          className={`inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle ${sizeClasses[size]} w-full`}
          onClick={e => {
            console.log('Modal content clicked, stopping propagation');
            e.stopPropagation();
          }}
        >
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                {title}
              </h3>
              <button
                onClick={() => {
                  console.log('Close button clicked');
                  onClose();
                }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <FiXIcon className="h-6 w-6" />
              </button>
            </div>
          </div>
          <div className="px-6 py-4">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

interface UserDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
}

export const UserDetailsModal: React.FC<UserDetailsModalProps> = ({ isOpen, onClose, user }) => {
  console.log('UserDetailsModal render:', { isOpen, user });
  if (!user) return null;

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

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="User Details" size="lg">
      <div className="space-y-6">
        {/* User Avatar and Basic Info */}
        <div className="flex items-center space-x-4">
          <div className="h-16 w-16 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
            <span className="text-xl font-bold text-gray-700 dark:text-gray-300">
              {user.firstName.charAt(0)}{user.lastName.charAt(0)}
            </span>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {user.firstName} {user.lastName}
            </h2>
            <p className="text-gray-600 dark:text-gray-400">{user.email}</p>
            <div className="flex items-center space-x-2 mt-2">
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(user.status)}`}>
                {user.status}
              </span>
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(user.role)}`}>
                {user.role}
              </span>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Contact Information</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <FiMailIcon className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</p>
                  <p className="text-sm text-gray-900 dark:text-white">{user.email}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <FiPhoneIcon className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Phone</p>
                  <p className="text-sm text-gray-900 dark:text-white">{user.phoneNumber}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Account Information</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <FiCalendarIcon className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Joined</p>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <FiClockIcon className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Last Updated</p>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {new Date(user.updatedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Information */}
        {user.additionalInfo && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Additional Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {user.additionalInfo.businessName && (
                <div className="flex items-center space-x-3">
                  <FiUserIcon className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Business Name</p>
                    <p className="text-sm text-gray-900 dark:text-white">{user.additionalInfo.businessName}</p>
                  </div>
                </div>
              )}
              {user.additionalInfo.businessAddress && (
                <div className="flex items-center space-x-3">
                  <FiMapPinIcon className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Business Address</p>
                    <p className="text-sm text-gray-900 dark:text-white">{user.additionalInfo.businessAddress}</p>
                  </div>
                </div>
              )}
              {user.additionalInfo.licenseNumber && (
                <div className="flex items-center space-x-3">
                  <FiShieldIcon className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">License Number</p>
                    <p className="text-sm text-gray-900 dark:text-white">{user.additionalInfo.licenseNumber}</p>
                  </div>
                </div>
              )}
              {user.additionalInfo.vehicleType && (
                <div className="flex items-center space-x-3">
                  <FiUserIcon className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Vehicle Type</p>
                    <p className="text-sm text-gray-900 dark:text-white">{user.additionalInfo.vehicleType}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
};

interface EditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onSave: (userData: any) => void;
  loading?: boolean;
}

export const EditUserModal: React.FC<EditUserModalProps> = ({ 
  isOpen, 
  onClose, 
  user, 
  onSave, 
  loading = false 
}) => {
  console.log('EditUserModal render:', { isOpen, user, loading });
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    role: 'CUSTOMER' as UserRole,
    status: 'ACTIVE' as UserStatus
  });

  React.useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role,
        status: user.status
      });
    }
  }, [user]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit User" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              First Name
            </label>
            <input
              type="text"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Last Name
            </label>
            <input
              type="text"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Email
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Phone Number
          </label>
          <input
            type="tel"
            value={formData.phoneNumber}
            onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Role
            </label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="CUSTOMER">Customer</option>
              <option value="DRIVER">Driver</option>
              <option value="VENDOR">Vendor</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as UserStatus })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="ACTIVE">Active</option>
              <option value="PENDING">Pending</option>
              <option value="SUSPENDED">Suspended</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

interface DeleteUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onConfirm: (reason: string) => void;
  loading?: boolean;
}

export const DeleteUserModal: React.FC<DeleteUserModalProps> = ({ 
  isOpen, 
  onClose, 
  user, 
  onConfirm, 
  loading = false 
}) => {
  console.log('DeleteUserModal render:', { isOpen, user, loading });
  const [reason, setReason] = useState('');

  const handleConfirm = () => {
    if (reason.trim()) {
      onConfirm(reason);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Delete User" size="md">
      <div className="space-y-4">
        <div className="flex items-center space-x-3 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
          <FiAlertTriangleIcon className="h-6 w-6 text-red-600 dark:text-red-400" />
          <div>
            <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
              Are you sure you want to delete this user?
            </h3>
            <p className="text-sm text-red-700 dark:text-red-300 mt-1">
              This action cannot be undone. The user will be permanently removed from the system.
            </p>
          </div>
        </div>

        {user && (
          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">User Details</h4>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              <p><strong>Name:</strong> {user.firstName} {user.lastName}</p>
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Role:</strong> {user.role}</p>
              <p><strong>Status:</strong> {user.status}</p>
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Reason for Deletion <span className="text-red-500">*</span>
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Please provide a reason for deleting this user..."
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:text-white"
            rows={3}
            required
          />
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!reason.trim() || loading}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Deleting...' : 'Delete User'}
          </button>
        </div>
      </div>
    </Modal>
  );
};

interface BulkActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  action: 'approve' | 'reject' | 'suspend' | 'delete' | '';
  selectedCount: number;
  onConfirm: (reason: string) => void;
  loading?: boolean;
}

export const BulkActionModal: React.FC<BulkActionModalProps> = ({ 
  isOpen, 
  onClose, 
  action, 
  selectedCount, 
  onConfirm, 
  loading = false 
}) => {
  const [reason, setReason] = useState('');

  const getActionConfig = () => {
    switch (action) {
      case 'approve':
        return {
          title: 'Approve Users',
          message: `Are you sure you want to approve ${selectedCount} user${selectedCount !== 1 ? 's' : ''}?`,
          icon: FiCheckCircleIcon,
          color: 'green',
          buttonText: 'Approve Users'
        };
      case 'reject':
        return {
          title: 'Reject Users',
          message: `Are you sure you want to reject ${selectedCount} user${selectedCount !== 1 ? 's' : ''}?`,
          icon: FiXCircleIcon,
          color: 'red',
          buttonText: 'Reject Users'
        };
      case 'suspend':
        return {
          title: 'Suspend Users',
          message: `Are you sure you want to suspend ${selectedCount} user${selectedCount !== 1 ? 's' : ''}?`,
          icon: FiAlertTriangleIcon,
          color: 'orange',
          buttonText: 'Suspend Users'
        };
      case 'delete':
        return {
          title: 'Delete Users',
          message: `Are you sure you want to delete ${selectedCount} user${selectedCount !== 1 ? 's' : ''}? This action cannot be undone.`,
          icon: FiTrash2Icon,
          color: 'red',
          buttonText: 'Delete Users'
        };
      default:
        return {
          title: 'Bulk Action',
          message: '',
          icon: FiAlertTriangleIcon,
          color: 'gray',
          buttonText: 'Confirm'
        };
    }
  };

  const config = getActionConfig();
  const IconComponent = config.icon as React.ComponentType<React.SVGProps<SVGSVGElement>>;

  const handleConfirm = () => {
    if (action === 'delete' && !reason.trim()) {
      return; // Require reason for deletion
    }
    onConfirm(reason);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={config.title} size="md">
      <div className="space-y-4">
        <div className={`flex items-center space-x-3 p-4 bg-${config.color}-50 dark:bg-${config.color}-900/20 rounded-lg`}>
          <IconComponent className={`h-6 w-6 text-${config.color}-600 dark:text-${config.color}-400`} />
          <div>
            <h3 className={`text-sm font-medium text-${config.color}-800 dark:text-${config.color}-200`}>
              {config.message}
            </h3>
          </div>
        </div>

        {(action === 'reject' || action === 'suspend' || action === 'delete') && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Reason {action === 'delete' && <span className="text-red-500">*</span>}
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={`Please provide a reason for ${action}ing these users...`}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              rows={3}
              required={action === 'delete'}
            />
          </div>
        )}

        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={(action === 'delete' && !reason.trim()) || loading}
            className={`px-4 py-2 text-sm font-medium text-white bg-${config.color}-600 rounded-lg hover:bg-${config.color}-700 transition-colors disabled:opacity-50`}
          >
            {loading ? 'Processing...' : config.buttonText}
          </button>
        </div>
      </div>
    </Modal>
  );
}; 