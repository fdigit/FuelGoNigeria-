import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useToast } from '../../../contexts/ToastContext';
import Modal from '../../../components/common/Modal';
import { API_URL } from '../../../config';

interface Driver {
  id: string;
  name: string;
  phone: string;
  email: string;
  status: 'available' | 'busy' | 'offline';
  currentLocation?: string;
  rating: number;
  totalDeliveries: number;
  activeOrders: number;
  vehicleDetails: {
    type: string;
    plateNumber: string;
    capacity: number;
  };
  licenseNumber?: string;
  licenseExpiry?: string;
  isActive?: boolean;
  createdAt?: string;
}

interface Order {
  id: string;
  customerName: string;
  location: string;
  status: 'in_progress' | 'completed';
  assignedTo: string;
}

export default function DriverManagement() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [filteredDrivers, setFilteredDrivers] = useState<Driver[]>([]);
  const [activeOrders] = useState<Order[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    licenseNumber: '',
    licenseExpiry: '',
    licenseType: '',
    vehicleType: '',
    vehiclePlate: '',
    vehicleModel: '',
    vehicleColor: '',
    vehicleCapacity: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactRelationship: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { showToast } = useToast();

  const fetchDrivers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const storedUser = localStorage.getItem('user');
      if (!storedUser) {
        throw new Error('No authentication token found. Please log in again.');
      }
      
      const userData = JSON.parse(storedUser);
      const token = userData.token;
      
      if (!token) {
        throw new Error('No authentication token found. Please log in again.');
      }
      
      const res = await fetch(`${API_URL}/vendor/drivers`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (res.status === 401) {
        throw new Error('Authentication failed. Please log in again.');
      }
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: 'Failed to fetch drivers' }));
        throw new Error(errorData.message || 'Failed to fetch drivers');
      }
      
      const data = await res.json();
      setDrivers(data);
      setFilteredDrivers(data);
    } catch (err: any) {
      setError(err.message || 'Error fetching drivers');
      showToast('error', err.message || 'Failed to fetch drivers');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchDrivers();
  }, [fetchDrivers]);

  // Filter drivers based on search and status
  useEffect(() => {
    let filtered = drivers;
    
    if (searchTerm) {
      filtered = filtered.filter(driver => 
        driver.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        driver.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        driver.phone.includes(searchTerm) ||
        driver.vehicleDetails.plateNumber.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(driver => driver.status === statusFilter);
    }
    
    setFilteredDrivers(filtered);
  }, [drivers, searchTerm, statusFilter]);

  const handleStatusChange = async (driverId: string, newStatus: Driver['status']) => {
    try {
      setLoading(true);
      setError(null);
      
      const storedUser = localStorage.getItem('user');
      if (!storedUser) {
        throw new Error('No authentication token found. Please log in again.');
      }
      
      const userData = JSON.parse(storedUser);
      const token = userData.token;
      
      if (!token) {
        throw new Error('No authentication token found. Please log in again.');
      }
      
      const res = await fetch(`${API_URL}/vendor/drivers/${driverId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (res.status === 401) {
        throw new Error('Authentication failed. Please log in again.');
      }
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: 'Failed to update status' }));
        throw new Error(errorData.message || 'Failed to update status');
      }
      
      await fetchDrivers();
      showToast('success', `Driver status updated to ${newStatus}`);
    } catch (err: any) {
      setError(err.message || 'Error updating status');
      showToast('error', err.message || 'Failed to update driver status');
    } finally {
      setLoading(false);
    }
  };

  const handleAddDriver = () => {
    setShowAddModal(true);
    setForm({
      firstName: '', lastName: '', email: '', phone: '', password: '', licenseNumber: '', licenseExpiry: '', licenseType: '', vehicleType: '', vehiclePlate: '', vehicleModel: '', vehicleColor: '', vehicleCapacity: '', emergencyContactName: '', emergencyContactPhone: '', emergencyContactRelationship: ''
    });
  };

  const handleEditDriver = (driver: Driver) => {
    setSelectedDriver(driver);
    // Parse driver name to get first and last name
    const nameParts = driver.name.split(' ');
    setForm({
      firstName: nameParts[0] || '',
      lastName: nameParts.slice(1).join(' ') || '',
      email: driver.email,
      phone: driver.phone,
      password: '', // Don't populate password for edit
      licenseNumber: driver.licenseNumber || '',
      licenseExpiry: driver.licenseExpiry ? new Date(driver.licenseExpiry).toISOString().split('T')[0] : '',
      licenseType: '',
      vehicleType: driver.vehicleDetails.type,
      vehiclePlate: driver.vehicleDetails.plateNumber,
      vehicleModel: '',
      vehicleColor: '',
      vehicleCapacity: driver.vehicleDetails.capacity?.toString() || '',
      emergencyContactName: '',
      emergencyContactPhone: '',
      emergencyContactRelationship: '',
    });
    setShowEditModal(true);
  };

  const handleViewDetails = (driver: Driver) => {
    setSelectedDriver(driver);
    setShowDetailsModal(true);
  };

  const handleDeleteDriver = async (driverId: string) => {
    if (!window.confirm('Are you sure you want to deactivate this driver?')) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const storedUser = localStorage.getItem('user');
      if (!storedUser) {
        throw new Error('No authentication token found. Please log in again.');
      }
      
      const userData = JSON.parse(storedUser);
      const token = userData.token;
      
      if (!token) {
        throw new Error('No authentication token found. Please log in again.');
      }
      
      const res = await fetch(`${API_URL}/vendor/drivers/${driverId}/deactivate`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (res.status === 401) {
        throw new Error('Authentication failed. Please log in again.');
      }
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: 'Failed to deactivate driver' }));
        throw new Error(errorData.message || 'Failed to deactivate driver');
      }
      
      await fetchDrivers();
      showToast('success', 'Driver deactivated successfully');
    } catch (err: any) {
      setError(err.message || 'Error deactivating driver');
      showToast('error', err.message || 'Failed to deactivate driver');
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAddDriverSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      // Basic validation
      if (!form.firstName || !form.lastName || !form.email || !form.phone || !form.password || !form.licenseNumber || !form.licenseExpiry || !form.licenseType || !form.vehicleType || !form.vehiclePlate) {
        setError('Please fill all required fields');
        setLoading(false);
        return;
      }
      
      const storedUser = localStorage.getItem('user');
      if (!storedUser) {
        throw new Error('No authentication token found. Please log in again.');
      }
      
      const userData = JSON.parse(storedUser);
      const token = userData.token;
      
      if (!token) {
        throw new Error('No authentication token found. Please log in again.');
      }
      
      const requestBody = {
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        phoneNumber: form.phone,
        password: form.password,
        licenseNumber: form.licenseNumber,
        licenseExpiry: form.licenseExpiry,
        licenseType: form.licenseType,
        vehicleType: form.vehicleType,
        vehiclePlate: form.vehiclePlate,
        vehicleModel: form.vehicleModel,
        vehicleColor: form.vehicleColor,
        vehicleCapacity: form.vehicleCapacity,
        emergencyContact: form.emergencyContactName ? {
          name: form.emergencyContactName,
          phone: form.emergencyContactPhone,
          relationship: form.emergencyContactRelationship
        } : undefined
      };
      
      console.log('Adding driver with data:', requestBody);
      
      const res = await fetch(`${API_URL}/vendor/drivers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestBody)
      });
      
      console.log('Response status:', res.status);
      console.log('Response headers:', res.headers);
      
      if (res.status === 401) {
        throw new Error('Authentication failed. Please log in again.');
      }
      
      if (!res.ok) {
        const errData = await res.json().catch(() => ({ message: 'Failed to add driver' }));
        console.error('Error response:', errData);
        throw new Error(errData.message || 'Failed to add driver');
      }
      
      const successData = await res.json();
      console.log('Success response:', successData);
      
      setShowAddModal(false);
      setForm({
        firstName: '', lastName: '', email: '', phone: '', password: '', licenseNumber: '', licenseExpiry: '', licenseType: '', vehicleType: '', vehiclePlate: '', vehicleModel: '', vehicleColor: '', vehicleCapacity: '', emergencyContactName: '', emergencyContactPhone: '', emergencyContactRelationship: ''
      });
      showToast('success', 'Driver added successfully');
      fetchDrivers();
    } catch (err: any) {
      console.error('Add driver error:', err);
      setError(err.message || 'Error adding driver');
      showToast('error', err.message || 'Failed to add driver');
    } finally {
      setLoading(false);
    }
  };

  const handleEditDriverSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDriver) return;
    
    setLoading(true);
    setError(null);
    try {
      // Basic validation
      if (!form.firstName || !form.lastName || !form.email || !form.phone || !form.licenseNumber || !form.licenseExpiry || !form.licenseType || !form.vehicleType || !form.vehiclePlate) {
        setError('Please fill all required fields');
        setLoading(false);
        return;
      }
      const storedUser = localStorage.getItem('user');
      if (!storedUser) {
        throw new Error('No authentication token found. Please log in again.');
      }
      
      const userData = JSON.parse(storedUser);
      const token = userData.token;
      
      if (!token) {
        throw new Error('No authentication token found. Please log in again.');
      }
      
      const res = await fetch(`${API_URL}/vendor/drivers/${selectedDriver.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          phoneNumber: form.phone,
          licenseNumber: form.licenseNumber,
          licenseExpiry: form.licenseExpiry,
          licenseType: form.licenseType,
          vehicleType: form.vehicleType,
          vehiclePlate: form.vehiclePlate,
          vehicleModel: form.vehicleModel,
          vehicleColor: form.vehicleColor,
          vehicleCapacity: form.vehicleCapacity,
          emergencyContact: form.emergencyContactName ? {
            name: form.emergencyContactName,
            phone: form.emergencyContactPhone,
            relationship: form.emergencyContactRelationship
          } : undefined
        })
      });
      
      if (res.status === 401) {
        throw new Error('Authentication failed. Please log in again.');
      }
      
      if (!res.ok) {
        const errData = await res.json().catch(() => ({ message: 'Failed to update driver' }));
        throw new Error(errData.message || 'Failed to update driver');
      }
      setShowEditModal(false);
      setSelectedDriver(null);
      showToast('success', 'Driver updated successfully');
      fetchDrivers();
    } catch (err: any) {
      setError(err.message || 'Error updating driver');
      showToast('error', 'Failed to update driver');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'busy':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'offline':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  if (loading && drivers.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Driver Management
        </h2>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleAddDriver}
          className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
        >
          Add New Driver
        </motion.button>
      </div>

      {/* Search and Filter */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Search Drivers
            </label>
            <input
              type="text"
              placeholder="Search by name, email, phone, or plate number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Status Filter
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="all">All Status</option>
              <option value="available">Available</option>
              <option value="busy">Busy</option>
              <option value="offline">Offline</option>
            </select>
          </div>
          <div className="flex items-end">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {filteredDrivers.length} of {drivers.length} drivers
            </div>
          </div>
        </div>
      </div>

      {/* Add Driver Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add New Driver" size="lg">
        <div className="max-h-[70vh] overflow-y-auto">
          <form onSubmit={handleAddDriverSubmit} className="space-y-6">
            {/* Personal Information Section */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">
                Personal Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">First Name *</label>
                  <input type="text" name="firstName" value={form.firstName} onChange={handleFormChange} className="w-full rounded-md border-gray-300 dark:bg-gray-700 dark:text-white focus:ring-primary-500 focus:border-primary-500" required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Last Name *</label>
                  <input type="text" name="lastName" value={form.lastName} onChange={handleFormChange} className="w-full rounded-md border-gray-300 dark:bg-gray-700 dark:text-white focus:ring-primary-500 focus:border-primary-500" required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Email *</label>
                  <input type="email" name="email" value={form.email} onChange={handleFormChange} className="w-full rounded-md border-gray-300 dark:bg-gray-700 dark:text-white focus:ring-primary-500 focus:border-primary-500" required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Phone *</label>
                  <input type="tel" name="phone" value={form.phone} onChange={handleFormChange} className="w-full rounded-md border-gray-300 dark:bg-gray-700 dark:text-white focus:ring-primary-500 focus:border-primary-500" required />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Password *</label>
                  <input type="password" name="password" value={form.password} onChange={handleFormChange} className="w-full rounded-md border-gray-300 dark:bg-gray-700 dark:text-white focus:ring-primary-500 focus:border-primary-500" required />
                </div>
              </div>
            </div>

            {/* License Information Section */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">
                License Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">License Number *</label>
                  <input type="text" name="licenseNumber" value={form.licenseNumber} onChange={handleFormChange} className="w-full rounded-md border-gray-300 dark:bg-gray-700 dark:text-white focus:ring-primary-500 focus:border-primary-500" required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">License Expiry *</label>
                  <input type="date" name="licenseExpiry" value={form.licenseExpiry} onChange={handleFormChange} className="w-full rounded-md border-gray-300 dark:bg-gray-700 dark:text-white focus:ring-primary-500 focus:border-primary-500" required />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">License Type *</label>
                  <input type="text" name="licenseType" value={form.licenseType} onChange={handleFormChange} className="w-full rounded-md border-gray-300 dark:bg-gray-700 dark:text-white focus:ring-primary-500 focus:border-primary-500" required />
                </div>
              </div>
            </div>

            {/* Vehicle Information Section */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">
                Vehicle Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Vehicle Type *</label>
                  <input type="text" name="vehicleType" value={form.vehicleType} onChange={handleFormChange} className="w-full rounded-md border-gray-300 dark:bg-gray-700 dark:text-white focus:ring-primary-500 focus:border-primary-500" required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Vehicle Plate *</label>
                  <input type="text" name="vehiclePlate" value={form.vehiclePlate} onChange={handleFormChange} className="w-full rounded-md border-gray-300 dark:bg-gray-700 dark:text-white focus:ring-primary-500 focus:border-primary-500" required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Vehicle Model</label>
                  <input type="text" name="vehicleModel" value={form.vehicleModel} onChange={handleFormChange} className="w-full rounded-md border-gray-300 dark:bg-gray-700 dark:text-white focus:ring-primary-500 focus:border-primary-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Vehicle Color</label>
                  <input type="text" name="vehicleColor" value={form.vehicleColor} onChange={handleFormChange} className="w-full rounded-md border-gray-300 dark:bg-gray-700 dark:text-white focus:ring-primary-500 focus:border-primary-500" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Vehicle Capacity (L)</label>
                  <input type="number" name="vehicleCapacity" value={form.vehicleCapacity} onChange={handleFormChange} className="w-full rounded-md border-gray-300 dark:bg-gray-700 dark:text-white focus:ring-primary-500 focus:border-primary-500" />
                </div>
              </div>
            </div>

            {/* Emergency Contact Section */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">
                Emergency Contact (Optional)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Contact Name</label>
                  <input type="text" name="emergencyContactName" value={form.emergencyContactName} onChange={handleFormChange} className="w-full rounded-md border-gray-300 dark:bg-gray-700 dark:text-white focus:ring-primary-500 focus:border-primary-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Contact Phone</label>
                  <input type="text" name="emergencyContactPhone" value={form.emergencyContactPhone} onChange={handleFormChange} className="w-full rounded-md border-gray-300 dark:bg-gray-700 dark:text-white focus:ring-primary-500 focus:border-primary-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Relationship</label>
                  <input type="text" name="emergencyContactRelationship" value={form.emergencyContactRelationship} onChange={handleFormChange} className="w-full rounded-md border-gray-300 dark:bg-gray-700 dark:text-white focus:ring-primary-500 focus:border-primary-500" />
                </div>
              </div>
            </div>

            {error && <div className="text-red-600 text-sm mt-2 bg-red-50 dark:bg-red-900/20 p-3 rounded-md">{error}</div>}
            
            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button 
                type="button" 
                onClick={() => setShowAddModal(false)} 
                className="w-full sm:w-auto px-4 py-2 rounded-md bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="w-full sm:w-auto px-4 py-2 rounded-md bg-primary-600 text-white hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" 
                disabled={loading}
              >
                {loading ? 'Adding...' : 'Add Driver'}
              </button>
            </div>
          </form>
        </div>
      </Modal>

      {/* Edit Driver Modal */}
      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Edit Driver" size="lg">
        <div className="max-h-[70vh] overflow-y-auto">
          <form onSubmit={handleEditDriverSubmit} className="space-y-6">
            {/* Personal Information Section */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">
                Personal Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">First Name *</label>
                  <input type="text" name="firstName" value={form.firstName} onChange={handleFormChange} className="w-full rounded-md border-gray-300 dark:bg-gray-700 dark:text-white focus:ring-primary-500 focus:border-primary-500" required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Last Name *</label>
                  <input type="text" name="lastName" value={form.lastName} onChange={handleFormChange} className="w-full rounded-md border-gray-300 dark:bg-gray-700 dark:text-white focus:ring-primary-500 focus:border-primary-500" required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Email *</label>
                  <input type="email" name="email" value={form.email} onChange={handleFormChange} className="w-full rounded-md border-gray-300 dark:bg-gray-700 dark:text-white focus:ring-primary-500 focus:border-primary-500" required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Phone *</label>
                  <input type="tel" name="phone" value={form.phone} onChange={handleFormChange} className="w-full rounded-md border-gray-300 dark:bg-gray-700 dark:text-white focus:ring-primary-500 focus:border-primary-500" required />
                </div>
              </div>
            </div>

            {/* License Information Section */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">
                License Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">License Number *</label>
                  <input type="text" name="licenseNumber" value={form.licenseNumber} onChange={handleFormChange} className="w-full rounded-md border-gray-300 dark:bg-gray-700 dark:text-white focus:ring-primary-500 focus:border-primary-500" required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">License Expiry *</label>
                  <input type="date" name="licenseExpiry" value={form.licenseExpiry} onChange={handleFormChange} className="w-full rounded-md border-gray-300 dark:bg-gray-700 dark:text-white focus:ring-primary-500 focus:border-primary-500" required />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">License Type *</label>
                  <input type="text" name="licenseType" value={form.licenseType} onChange={handleFormChange} className="w-full rounded-md border-gray-300 dark:bg-gray-700 dark:text-white focus:ring-primary-500 focus:border-primary-500" required />
                </div>
              </div>
            </div>

            {/* Vehicle Information Section */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">
                Vehicle Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Vehicle Type *</label>
                  <input type="text" name="vehicleType" value={form.vehicleType} onChange={handleFormChange} className="w-full rounded-md border-gray-300 dark:bg-gray-700 dark:text-white focus:ring-primary-500 focus:border-primary-500" required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Vehicle Plate *</label>
                  <input type="text" name="vehiclePlate" value={form.vehiclePlate} onChange={handleFormChange} className="w-full rounded-md border-gray-300 dark:bg-gray-700 dark:text-white focus:ring-primary-500 focus:border-primary-500" required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Vehicle Model</label>
                  <input type="text" name="vehicleModel" value={form.vehicleModel} onChange={handleFormChange} className="w-full rounded-md border-gray-300 dark:bg-gray-700 dark:text-white focus:ring-primary-500 focus:border-primary-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Vehicle Color</label>
                  <input type="text" name="vehicleColor" value={form.vehicleColor} onChange={handleFormChange} className="w-full rounded-md border-gray-300 dark:bg-gray-700 dark:text-white focus:ring-primary-500 focus:border-primary-500" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Vehicle Capacity (L)</label>
                  <input type="number" name="vehicleCapacity" value={form.vehicleCapacity} onChange={handleFormChange} className="w-full rounded-md border-gray-300 dark:bg-gray-700 dark:text-white focus:ring-primary-500 focus:border-primary-500" />
                </div>
              </div>
            </div>

            {/* Emergency Contact Section */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">
                Emergency Contact (Optional)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Contact Name</label>
                  <input type="text" name="emergencyContactName" value={form.emergencyContactName} onChange={handleFormChange} className="w-full rounded-md border-gray-300 dark:bg-gray-700 dark:text-white focus:ring-primary-500 focus:border-primary-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Contact Phone</label>
                  <input type="text" name="emergencyContactPhone" value={form.emergencyContactPhone} onChange={handleFormChange} className="w-full rounded-md border-gray-300 dark:bg-gray-700 dark:text-white focus:ring-primary-500 focus:border-primary-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Relationship</label>
                  <input type="text" name="emergencyContactRelationship" value={form.emergencyContactRelationship} onChange={handleFormChange} className="w-full rounded-md border-gray-300 dark:bg-gray-700 dark:text-white focus:ring-primary-500 focus:border-primary-500" />
                </div>
              </div>
            </div>

            {error && <div className="text-red-600 text-sm mt-2 bg-red-50 dark:bg-red-900/20 p-3 rounded-md">{error}</div>}
            
            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button 
                type="button" 
                onClick={() => setShowEditModal(false)} 
                className="w-full sm:w-auto px-4 py-2 rounded-md bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="w-full sm:w-auto px-4 py-2 rounded-md bg-primary-600 text-white hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" 
                disabled={loading}
              >
                {loading ? 'Updating...' : 'Update Driver'}
              </button>
            </div>
          </form>
        </div>
      </Modal>

      {/* Driver Details Modal */}
      <Modal isOpen={showDetailsModal} onClose={() => setShowDetailsModal(false)} title="Driver Details" size="lg">
        {selectedDriver && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">Personal Information</h4>
                <p><span className="text-gray-600 dark:text-gray-400">Name:</span> {selectedDriver.name}</p>
                <p><span className="text-gray-600 dark:text-gray-400">Email:</span> {selectedDriver.email}</p>
                <p><span className="text-gray-600 dark:text-gray-400">Phone:</span> {selectedDriver.phone}</p>
                <p><span className="text-gray-600 dark:text-gray-400">Status:</span> 
                  <span className={`ml-2 px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedDriver.status)}`}>
                    {selectedDriver.status.toUpperCase()}
                  </span>
                </p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">Vehicle Information</h4>
                <p><span className="text-gray-600 dark:text-gray-400">Type:</span> {selectedDriver.vehicleDetails.type}</p>
                <p><span className="text-gray-600 dark:text-gray-400">Plate:</span> {selectedDriver.vehicleDetails.plateNumber}</p>
                <p><span className="text-gray-600 dark:text-gray-400">Capacity:</span> {selectedDriver.vehicleDetails.capacity}L</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">Performance</h4>
                <p><span className="text-gray-600 dark:text-gray-400">Rating:</span> {selectedDriver.rating} ⭐</p>
                <p><span className="text-gray-600 dark:text-gray-400">Total Deliveries:</span> {selectedDriver.totalDeliveries}</p>
                <p><span className="text-gray-600 dark:text-gray-400">Active Orders:</span> {selectedDriver.activeOrders}</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">License Information</h4>
                <p><span className="text-gray-600 dark:text-gray-400">Number:</span> {selectedDriver.licenseNumber || 'N/A'}</p>
                <p><span className="text-gray-600 dark:text-gray-400">Expiry:</span> {selectedDriver.licenseExpiry ? new Date(selectedDriver.licenseExpiry).toLocaleDateString() : 'N/A'}</p>
              </div>
            </div>
            <div className="flex justify-end">
              <button onClick={() => setShowDetailsModal(false)} className="px-4 py-2 rounded-md bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200">Close</button>
            </div>
          </div>
        )}
      </Modal>

      {/* Drivers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDrivers.map((driver) => (
          <motion.div
            key={driver.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden"
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    {driver.name}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {driver.phone}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {driver.email}
                  </p>
                </div>
                <span
                  className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(driver.status)}`}
                >
                  {driver.status.toUpperCase()}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Rating</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {driver.rating} ⭐
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Total Deliveries
                  </p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {driver.totalDeliveries}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Active Orders
                  </p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {driver.activeOrders}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Vehicle Type
                  </p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {driver.vehicleDetails.type}
                  </p>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Current Location
                </p>
                <p className="text-sm text-gray-900 dark:text-white">
                  {driver.currentLocation || 'Not available'}
                </p>
              </div>

              <div className="mb-4">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Vehicle Details
                </p>
                <p className="text-sm text-gray-900 dark:text-white">
                  {driver.vehicleDetails.plateNumber} - {driver.vehicleDetails.capacity}L
                </p>
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Update Status
                </label>
                <select
                  value={driver.status}
                  onChange={(e) =>
                    handleStatusChange(driver.id, e.target.value as Driver['status'])
                  }
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="available">Available</option>
                  <option value="busy">Busy</option>
                  <option value="offline">Offline</option>
                </select>
              </div>

              <div className="flex space-x-2 mt-4">
                <button
                  onClick={() => handleViewDetails(driver)}
                  className="flex-1 px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-200 dark:hover:bg-blue-800"
                >
                  View Details
                </button>
                <button
                  onClick={() => handleEditDriver(driver)}
                  className="flex-1 px-3 py-2 text-sm bg-yellow-100 text-yellow-700 rounded-md hover:bg-yellow-200 dark:bg-yellow-900 dark:text-yellow-200 dark:hover:bg-yellow-800"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteDriver(driver.id)}
                  className="flex-1 px-3 py-2 text-sm bg-red-100 text-red-700 rounded-md hover:bg-red-200 dark:bg-red-900 dark:text-red-200 dark:hover:bg-red-800"
                >
                  Deactivate
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredDrivers.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="text-gray-500 dark:text-gray-400">
            {drivers.length === 0 ? 'No drivers found. Add your first driver to get started.' : 'No drivers match your search criteria.'}
          </div>
        </div>
      )}

      {/* Active Orders */}
      {activeOrders.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Active Orders
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Driver
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {activeOrders.map((order) => (
                  <tr key={order.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {order.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {order.customerName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {order.location}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {drivers.find((d) => d.id === order.assignedTo)?.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          order.status === 'in_progress'
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                            : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        }`}
                      >
                        {order.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
} 