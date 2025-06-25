import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useToast } from '../../../contexts/ToastContext';
import { vendorService } from '../../../services/api';

interface VendorProfileData {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  licenseNumber: string;
  logo?: string | null;
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
    id: '',
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    licenseNumber: '',
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
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const { showToast } = useToast();

  // Fetch profile data on component mount
  useEffect(() => {
    fetchProfile();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const profileData = await vendorService.getProfile();
      console.log('Profile data received:', profileData);
      console.log('Profile logo:', profileData.logo);
      setProfile(profileData);
      setEditedProfile(profileData);
    } catch (error: any) {
      console.error('Error fetching profile:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Unknown error';
      setError(`Failed to load profile: ${errorMessage}`);
      
      // Don't show error toast for 404, just show empty profile
      if (error.response?.status === 404) {
        showToast('info', 'No profile data found. You can create your profile now.');
      } else {
        showToast('error', `Failed to load profile data: ${errorMessage}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

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

  const handleSave = async () => {
    try {
      setIsSaving(true);
      console.log('=== FRONTEND: Sending profile update ===');
      console.log('Edited profile data:', editedProfile);
      
      const response = await vendorService.updateProfile(editedProfile);
      console.log('=== FRONTEND: Received response ===');
      console.log('Response:', response);
      console.log('Updated profile data:', response.profile);
      
      setProfile(response.profile);
      setEditedProfile(response.profile);
      setIsEditing(false);
      showToast('success', response.message || 'Profile updated successfully');
    } catch (error) {
      console.error('Error saving profile:', error);
      showToast('error', 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditedProfile(profile);
    setIsEditing(false);
  };

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    console.log('File selected:', file);

    // Validate file type
    if (!file.type.startsWith('image/')) {
      showToast('error', 'Please select an image file');
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      showToast('error', 'File size must be less than 5MB');
      return;
    }

    try {
      setIsUploadingLogo(true);
      
      console.log('Uploading logo using vendor service');
      const data = await vendorService.uploadLogo(file);
      console.log('Upload success data:', data);
      
      // Update the profile with the new logo URL
      setProfile(prev => ({ ...prev, logo: data.logoUrl }));
      setEditedProfile(prev => ({ ...prev, logo: data.logoUrl }));
      
      showToast('success', 'Logo uploaded successfully');
    } catch (error: any) {
      console.error('Error uploading logo:', error);
      showToast('error', `Failed to upload logo: ${error.message}`);
    } finally {
      setIsUploadingLogo(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error Loading Profile</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
              <div className="mt-4">
                <button
                  onClick={fetchProfile}
                  className="bg-red-100 text-red-800 px-3 py-2 rounded-md text-sm font-medium hover:bg-red-200"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
              disabled={isSaving}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 disabled:opacity-50"
            >
              Cancel
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSave}
              disabled={isSaving}
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </motion.button>
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
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

          {/* Logo Upload */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Business Logo
            </h3>
            <div className="flex flex-col lg:flex-row items-start space-y-4 lg:space-y-0 lg:space-x-8">
              <div className="flex-shrink-0">
                <div className="w-32 h-32 rounded-xl border-2 border-gray-300 dark:border-gray-600 overflow-hidden bg-gray-100 dark:bg-gray-700 shadow-lg">
                  {profile.logo ? (
                    <img
                      src={profile.logo}
                      alt="Business Logo"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        console.error('Error loading logo in profile:', profile.logo);
                        console.error('Error details:', e);
                        e.currentTarget.style.display = 'none';
                      }}
                      onLoad={() => {
                        console.log('Successfully loaded logo in profile:', profile.logo);
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                </div>
                {profile.logo && (
                  <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 text-center">
                    Current Logo: {profile.logo}
                  </p>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Upload Logo
                </label>
                <div className="flex items-center space-x-4">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    disabled={isUploadingLogo}
                    className="block w-full text-sm text-gray-500 dark:text-gray-400
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-md file:border-0
                      file:text-sm file:font-medium
                      file:bg-primary-50 file:text-primary-700
                      hover:file:bg-primary-100
                      dark:file:bg-primary-900 dark:file:text-primary-200
                      disabled:opacity-50"
                  />
                  {isUploadingLogo && (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">Uploading...</span>
                    </div>
                  )}
                </div>
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  Recommended: Square image, max 5MB. Supported formats: JPG, PNG, GIF
                </p>
                {profile.logo && (
                  <div className="mt-3">
                    <button
                      onClick={() => {
                        setProfile(prev => ({ ...prev, logo: null }));
                        setEditedProfile(prev => ({ ...prev, logo: null }));
                      }}
                      className="text-xs text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                    >
                      Remove Logo
                    </button>
                  </div>
                )}
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
            <div className="space-y-3">
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