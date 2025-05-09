import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useToast } from '../../../contexts/ToastContext';

interface VendorProfileData {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  licenseNumber: string;
  businessType: string;
  operatingHours: {
    [key: string]: {
      open: string;
      close: string;
      isOpen: boolean;
    };
  };
  paymentMethods: string[];
  notificationPreferences: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
}

export default function VendorProfile() {
  const [profile, setProfile] = useState<VendorProfileData>({
    id: 'VEN001',
    name: 'FuelGo Station',
    email: 'contact@fuelgostation.com',
    phone: '+234 800 123 4567',
    address: '123 Main Street',
    city: 'Lagos',
    state: 'Lagos State',
    licenseNumber: 'FGN-2024-001',
    businessType: 'Filling Station',
    operatingHours: {
      monday: { open: '06:00', close: '22:00', isOpen: true },
      tuesday: { open: '06:00', close: '22:00', isOpen: true },
      wednesday: { open: '06:00', close: '22:00', isOpen: true },
      thursday: { open: '06:00', close: '22:00', isOpen: true },
      friday: { open: '06:00', close: '22:00', isOpen: true },
      saturday: { open: '07:00', close: '20:00', isOpen: true },
      sunday: { open: '08:00', close: '18:00', isOpen: true },
    },
    paymentMethods: ['Cash', 'Card', 'Bank Transfer'],
    notificationPreferences: {
      email: true,
      sms: true,
      push: true,
    },
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState<VendorProfileData>(profile);
  const { showToast } = useToast();

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setEditedProfile(prev => ({
        ...prev,
        [name]: checked,
      }));
    } else {
      setEditedProfile(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleOperatingHoursChange = (
    day: string,
    field: 'open' | 'close' | 'isOpen',
    value: string | boolean
  ) => {
    setEditedProfile(prev => ({
      ...prev,
      operatingHours: {
        ...prev.operatingHours,
        [day]: {
          ...prev.operatingHours[day],
          [field]: value,
        },
      },
    }));
  };

  const handlePaymentMethodToggle = (method: string) => {
    setEditedProfile(prev => ({
      ...prev,
      paymentMethods: prev.paymentMethods.includes(method)
        ? prev.paymentMethods.filter(m => m !== method)
        : [...prev.paymentMethods, method],
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Vendor Profile
        </h2>
        {!isEditing ? (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          >
            Edit Profile
          </motion.button>
        ) : (
          <div className="flex space-x-2">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleCancel}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
            >
              Cancel
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSave}
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            >
              Save Changes
            </motion.button>
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="p-6 space-y-6">
          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Basic Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Station Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={isEditing ? editedProfile.name : profile.name}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={isEditing ? editedProfile.email : profile.email}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Phone
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={isEditing ? editedProfile.phone : profile.phone}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  License Number
                </label>
                <input
                  type="text"
                  name="licenseNumber"
                  value={isEditing ? editedProfile.licenseNumber : profile.licenseNumber}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800"
                />
              </div>
            </div>
          </div>

          {/* Address Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Address Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Address
                </label>
                <input
                  type="text"
                  name="address"
                  value={isEditing ? editedProfile.address : profile.address}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  City
                </label>
                <input
                  type="text"
                  name="city"
                  value={isEditing ? editedProfile.city : profile.city}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  State
                </label>
                <input
                  type="text"
                  name="state"
                  value={isEditing ? editedProfile.state : profile.state}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800"
                />
              </div>
            </div>
          </div>

          {/* Operating Hours */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Operating Hours
            </h3>
            <div className="space-y-4">
              {Object.entries(
                isEditing ? editedProfile.operatingHours : profile.operatingHours
              ).map(([day, hours]) => (
                <div key={day} className="flex items-center space-x-4">
                  <div className="w-32">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                      {day}
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="time"
                      value={hours.open}
                      onChange={(e) =>
                        handleOperatingHoursChange(day, 'open', e.target.value)
                      }
                      disabled={!isEditing || !hours.isOpen}
                      className="rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800"
                    />
                    <span className="text-gray-500 dark:text-gray-400">to</span>
                    <input
                      type="time"
                      value={hours.close}
                      onChange={(e) =>
                        handleOperatingHoursChange(day, 'close', e.target.value)
                      }
                      disabled={!isEditing || !hours.isOpen}
                      className="rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800"
                    />
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={hours.isOpen}
                        onChange={(e) =>
                          handleOperatingHoursChange(day, 'isOpen', e.target.checked)
                        }
                        disabled={!isEditing}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        Open
                      </span>
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Methods */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Payment Methods
            </h3>
            <div className="flex flex-wrap gap-4">
              {['Cash', 'Card', 'Bank Transfer', 'Mobile Money'].map((method) => (
                <label
                  key={method}
                  className="flex items-center space-x-2 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={
                      isEditing
                        ? editedProfile.paymentMethods.includes(method)
                        : profile.paymentMethods.includes(method)
                    }
                    onChange={() => handlePaymentMethodToggle(method)}
                    disabled={!isEditing}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {method}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Notification Preferences */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Notification Preferences
            </h3>
            <div className="flex flex-wrap gap-4">
              {Object.entries(
                isEditing
                  ? editedProfile.notificationPreferences
                  : profile.notificationPreferences
              ).map(([type, enabled]) => (
                <label
                  key={type}
                  className="flex items-center space-x-2 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={enabled}
                    onChange={(e) =>
                      setEditedProfile(prev => ({
                        ...prev,
                        notificationPreferences: {
                          ...prev.notificationPreferences,
                          [type]: e.target.checked,
                        },
                      }))
                    }
                    disabled={!isEditing}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">
                    {type}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 