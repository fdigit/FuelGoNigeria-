import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { useAuth } from '../../../contexts/AuthContext';
import { adminService } from '../../../services/api';
import { Vendor } from '../../../types/vendor';

export default function VendorManagement() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'verified' | 'rejected'>('all');
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [isViewingDetails, setIsViewingDetails] = useState(false);

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    try {
      const data = await adminService.getVendors();
      setVendors(data);
    } catch (error) {
      console.error('Error fetching vendors:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to load vendors');
    } finally {
      setLoading(false);
    }
  };

  const handleVerificationStatusChange = async (vendorId: string, newStatus: 'verified' | 'rejected') => {
    try {
      const result = await adminService.updateVendorStatus(vendorId, newStatus);
      
      setVendors(vendors.map(vendor => 
        vendor._id === vendorId ? { ...vendor, verification_status: newStatus } : vendor
      ));
      toast.success(result.message);
    } catch (error) {
      console.error('Error updating vendor status:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update vendor status');
    }
  };

  const handleViewDetails = (vendor: Vendor) => {
    setSelectedVendor(vendor);
    setIsViewingDetails(true);
  };

  const filteredVendors = vendors.filter(vendor => {
    const matchesSearch = vendor.business_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         `${vendor.address.state}, ${vendor.address.city}`.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || vendor.verification_status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Vendor Management</h2>
        <div className="flex flex-col sm:flex-row w-full sm:w-auto gap-4">
          <input
            type="text"
            placeholder="Search vendors..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-64 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
            className="w-full sm:w-auto px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="verified">Verified</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Vendors List - Mobile Card View */}
      <div className="block sm:hidden space-y-4">
        {filteredVendors.map((vendor) => (
          <div key={vendor._id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {vendor.business_name}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {vendor.address.state}, {vendor.address.city}
                </p>
              </div>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  vendor.verification_status === 'verified'
                    ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
                    : vendor.verification_status === 'rejected'
                    ? 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
                    : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100'
                }`}
              >
                {vendor.verification_status.charAt(0).toUpperCase() + vendor.verification_status.slice(1)}
              </span>
            </div>
            
            <div className="flex flex-wrap gap-2 mb-3">
              {vendor.fuel_types.map((type) => (
                <span
                  key={type}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800 dark:bg-primary-800 dark:text-primary-100"
                >
                  {type}
                </span>
              ))}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <span className="text-sm text-gray-900 dark:text-white">
                  {vendor.average_rating.toFixed(1)}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">
                  ({vendor.total_ratings})
                </span>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleViewDetails(vendor)}
                  className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300 text-sm"
                >
                  View Details
                </button>
                {vendor.verification_status === 'pending' && (
                  <>
                    <button
                      onClick={() => handleVerificationStatusChange(vendor._id, 'verified')}
                      className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 text-sm"
                    >
                      Verify
                    </button>
                    <button
                      onClick={() => handleVerificationStatusChange(vendor._id, 'rejected')}
                      className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 text-sm"
                    >
                      Reject
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Vendors List - Desktop Table View */}
      <div className="hidden sm:block bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Business Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Fuel Types
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Rating
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredVendors.map((vendor) => (
                <tr key={vendor._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {vendor.business_name}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Joined {new Date(vendor.created_at).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {vendor.address.state}, {vendor.address.city}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-wrap gap-1">
                      {vendor.fuel_types.map((type) => (
                        <span
                          key={type}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800 dark:bg-primary-800 dark:text-primary-100"
                        >
                          {type}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        vendor.verification_status === 'verified'
                          ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
                          : vendor.verification_status === 'rejected'
                          ? 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100'
                      }`}
                    >
                      {vendor.verification_status.charAt(0).toUpperCase() + vendor.verification_status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="text-sm text-gray-900 dark:text-white">
                        {vendor.average_rating.toFixed(1)}
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">
                        ({vendor.total_ratings})
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleViewDetails(vendor)}
                        className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300"
                      >
                        View Details
                      </button>
                      {vendor.verification_status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleVerificationStatusChange(vendor._id, 'verified')}
                            className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                          >
                            Verify
                          </button>
                          <button
                            onClick={() => handleVerificationStatusChange(vendor._id, 'rejected')}
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                          >
                            Reject
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Vendor Details Modal - Mobile Optimized */}
      {isViewingDetails && selectedVendor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-4 sm:p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  {selectedVendor.business_name}
                </h3>
                <button
                  onClick={() => setIsViewingDetails(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Address</h4>
                  <p className="mt-1 text-sm text-gray-900 dark:text-white">
                    {selectedVendor.address.state}, {selectedVendor.address.city}
                  </p>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Operating Hours</h4>
                  <p className="mt-1 text-sm text-gray-900 dark:text-white">
                    {selectedVendor.operating_hours.open} - {selectedVendor.operating_hours.close}
                  </p>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Contact</h4>
                  <p className="mt-1 text-sm text-gray-900 dark:text-white">
                    Phone: {selectedVendor.contact.phone}
                    <br />
                    Email: {selectedVendor.contact.email}
                  </p>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Services</h4>
                  <p className="mt-1 text-sm text-gray-900 dark:text-white">
                    {selectedVendor.services.join(', ')}
                  </p>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Payment Methods</h4>
                  <p className="mt-1 text-sm text-gray-900 dark:text-white">
                    {selectedVendor.payment_methods.join(', ')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 