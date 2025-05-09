import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useToast } from '../../../contexts/ToastContext';

interface DriverProfileData {
  id: string;
  name: string;
  email: string;
  phone: string;
  licenseNumber: string;
  licenseExpiry: string;
  vehicleType: string;
  vehicleNumber: string;
  vehicleModel: string;
  vehicleColor: string;
  address: string;
  city: string;
  state: string;
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  };
}

export default function DriverProfile() {
  const [profile, setProfile] = useState<DriverProfileData>({
    id: 'DRV001',
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+234 123 456 7890',
    licenseNumber: 'DL123456789',
    licenseExpiry: '2025-12-31',
    vehicleType: 'Truck',
    vehicleNumber: 'ABC123XYZ',
    vehicleModel: 'Toyota Hilux',
    vehicleColor: 'White',
    address: '123 Main Street',
    city: 'Lagos',
    state: 'Lagos',
    emergencyContact: {
      name: 'Jane Doe',
      phone: '+234 987 654 3210',
      relationship: 'Spouse',
    },
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState<DriverProfileData>(profile);
  const { showToast } = useToast();

  const handleInputChange = (
    field: keyof DriverProfileData,
    value: string | { name: string; phone: string; relationship: string }
  ) => {
    setEditedProfile((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleEmergencyContactChange = (
    field: keyof DriverProfileData['emergencyContact'],
    value: string
  ) => {
    setEditedProfile((prev) => ({
      ...prev,
      emergencyContact: {
        ...prev.emergencyContact,
        [field]: value,
      },
    }));
  };

  const handleSave = () => {
    setProfile(editedProfile);
    setIsEditing(false);
    showToast('success', 'Profile updated successfully');
  };

  const handleCancel = () => {
    setEditedProfile(profile);
    setIsEditing(false);
  };

  const handleChangePassword = () => {
    // In a real app, this would open a password change modal
    showToast('info', 'Password change functionality coming soon');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Driver Profile
        </h2>
        <div className="flex space-x-4">
          {!isEditing ? (
            <>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              >
                Edit Profile
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleChangePassword}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              >
                Change Password
              </motion.button>
            </>
          ) : (
            <>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSave}
                className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              >
                Save Changes
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleCancel}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              >
                Cancel
              </motion.button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Personal Information */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Personal Information
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Full Name
              </label>
              <input
                type="text"
                value={isEditing ? editedProfile.name : profile.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                disabled={!isEditing}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:opacity-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Email
              </label>
              <input
                type="email"
                value={isEditing ? editedProfile.email : profile.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                disabled={!isEditing}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:opacity-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Phone
              </label>
              <input
                type="tel"
                value={isEditing ? editedProfile.phone : profile.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                disabled={!isEditing}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:opacity-50"
              />
            </div>
          </div>
        </div>

        {/* License Information */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            License Information
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                License Number
              </label>
              <input
                type="text"
                value={isEditing ? editedProfile.licenseNumber : profile.licenseNumber}
                onChange={(e) => handleInputChange('licenseNumber', e.target.value)}
                disabled={!isEditing}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:opacity-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                License Expiry
              </label>
              <input
                type="date"
                value={isEditing ? editedProfile.licenseExpiry : profile.licenseExpiry}
                onChange={(e) => handleInputChange('licenseExpiry', e.target.value)}
                disabled={!isEditing}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:opacity-50"
              />
            </div>
          </div>
        </div>

        {/* Vehicle Information */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Vehicle Information
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Vehicle Type
              </label>
              <input
                type="text"
                value={isEditing ? editedProfile.vehicleType : profile.vehicleType}
                onChange={(e) => handleInputChange('vehicleType', e.target.value)}
                disabled={!isEditing}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:opacity-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Vehicle Number
              </label>
              <input
                type="text"
                value={isEditing ? editedProfile.vehicleNumber : profile.vehicleNumber}
                onChange={(e) => handleInputChange('vehicleNumber', e.target.value)}
                disabled={!isEditing}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:opacity-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Vehicle Model
              </label>
              <input
                type="text"
                value={isEditing ? editedProfile.vehicleModel : profile.vehicleModel}
                onChange={(e) => handleInputChange('vehicleModel', e.target.value)}
                disabled={!isEditing}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:opacity-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Vehicle Color
              </label>
              <input
                type="text"
                value={isEditing ? editedProfile.vehicleColor : profile.vehicleColor}
                onChange={(e) => handleInputChange('vehicleColor', e.target.value)}
                disabled={!isEditing}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:opacity-50"
              />
            </div>
          </div>
        </div>

        {/* Emergency Contact */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Emergency Contact
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Contact Name
              </label>
              <input
                type="text"
                value={
                  isEditing
                    ? editedProfile.emergencyContact.name
                    : profile.emergencyContact.name
                }
                onChange={(e) =>
                  handleEmergencyContactChange('name', e.target.value)
                }
                disabled={!isEditing}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:opacity-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Contact Phone
              </label>
              <input
                type="tel"
                value={
                  isEditing
                    ? editedProfile.emergencyContact.phone
                    : profile.emergencyContact.phone
                }
                onChange={(e) =>
                  handleEmergencyContactChange('phone', e.target.value)
                }
                disabled={!isEditing}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:opacity-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Relationship
              </label>
              <input
                type="text"
                value={
                  isEditing
                    ? editedProfile.emergencyContact.relationship
                    : profile.emergencyContact.relationship
                }
                onChange={(e) =>
                  handleEmergencyContactChange('relationship', e.target.value)
                }
                disabled={!isEditing}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:opacity-50"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 