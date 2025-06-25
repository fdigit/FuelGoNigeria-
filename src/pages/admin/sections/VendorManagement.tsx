import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { useAuth } from '../../../../frontend/src/contexts/AuthContext';

interface Vendor {
  _id: string;
  business_name: string;
  address: {
    street: string;
    city: string;
    state: string;
    coordinates: [number, number];
  };
  fuel_types: string[];
  documents: {
    business_registration: string;
    tax_id: string;
    fuel_license: string;
  };
  operating_hours: {
    open: string;
    close: string;
    days: string[];
  };
  average_rating: number;
  total_ratings: number;
  verification_status: 'pending' | 'verified' | 'rejected';
  bank_info: {
    bank_name: string;
    account_number: string;
    account_name: string;
  };
  createdAt: string;
  updatedAt: string;
}

export default function VendorManagement() {
  const { user } = useAuth();
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
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/admin/vendors`, {
        headers: {
          'Authorization': `Bearer ${user?.token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch vendors');
      }

      const data = await response.json();
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
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/admin/vendors/${vendorId}/verify`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update vendor status');
      }

      setVendors(vendors.map(vendor => 
        vendor._id === vendorId ? { ...vendor, verification_status: newStatus } : vendor
      ));
      toast.success(`Vendor ${newStatus} successfully`);
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
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Vendor Management</h2>
        <div className="flex space-x-4">
          <input
            type="text"
            placeholder="Search vendors..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="verified">Verified</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
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
                    Joined {new Date(vendor.createdAt).toLocaleDateString()}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 dark:text-white">
                    {vendor.address.street}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
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

      {/* Vendor Details Modal */}
      {isViewingDetails && selectedVendor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
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
                    {selectedVendor.address.street}
                    <br />
                    {selectedVendor.address.state}, {selectedVendor.address.city}
                  </p>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Operating Hours</h4>
                  <p className="mt-1 text-sm text-gray-900 dark:text-white">
                    {selectedVendor.operating_hours.open} - {selectedVendor.operating_hours.close}
                    <br />
                    {selectedVendor.operating_hours.days.join(', ')}
                  </p>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Documents</h4>
                  <div className="mt-1 space-y-2">
                    <p className="text-sm text-gray-900 dark:text-white">
                      Business Registration: {selectedVendor.documents.business_registration}
                    </p>
                    <p className="text-sm text-gray-900 dark:text-white">
                      Tax ID: {selectedVendor.documents.tax_id}
                    </p>
                    <p className="text-sm text-gray-900 dark:text-white">
                      Fuel License: {selectedVendor.documents.fuel_license}
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Bank Information</h4>
                  <p className="mt-1 text-sm text-gray-900 dark:text-white">
                    {selectedVendor.bank_info.bank_name}
                    <br />
                    Account: {selectedVendor.bank_info.account_number}
                    <br />
                    Name: {selectedVendor.bank_info.account_name}
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