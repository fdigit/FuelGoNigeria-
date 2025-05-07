import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useToast } from '../../../contexts/ToastContext';

interface Dispute {
  id: string;
  orderId: string;
  customer: {
    name: string;
    phone: string;
    email: string;
  };
  vendor: {
    name: string;
    phone: string;
  };
  driver?: {
    name: string;
    phone: string;
  };
  type: 'delivery' | 'quality' | 'payment' | 'other';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'high' | 'medium' | 'low';
  description: string;
  createdAt: string;
  updatedAt: string;
  resolution?: {
    action: string;
    notes: string;
    resolvedBy: string;
    resolvedAt: string;
  };
}

export default function DisputeResolution() {
  const [disputes, setDisputes] = useState<Dispute[]>([
    {
      id: 'DSP001',
      orderId: 'ORD001',
      customer: {
        name: 'John Doe',
        phone: '+234 123 456 7890',
        email: 'john@example.com',
      },
      vendor: {
        name: 'Fuel Station A',
        phone: '+234 123 456 7891',
      },
      driver: {
        name: 'Mike Johnson',
        phone: '+234 123 456 7892',
      },
      type: 'delivery',
      status: 'open',
      priority: 'high',
      description: 'Delivery was delayed by 2 hours',
      createdAt: '2024-02-22T10:00:00Z',
      updatedAt: '2024-02-22T10:00:00Z',
    },
    {
      id: 'DSP002',
      orderId: 'ORD002',
      customer: {
        name: 'Jane Smith',
        phone: '+234 123 456 7893',
        email: 'jane@example.com',
      },
      vendor: {
        name: 'Fuel Station B',
        phone: '+234 123 456 7894',
      },
      type: 'quality',
      status: 'in_progress',
      priority: 'medium',
      description: 'Fuel quality issue reported',
      createdAt: '2024-02-22T09:00:00Z',
      updatedAt: '2024-02-22T09:30:00Z',
    },
  ]);

  const [filters, setFilters] = useState({
    status: '',
    type: '',
    priority: '',
    search: '',
  });

  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState('');

  const { showToast } = useToast();

  const handleStatusChange = (disputeId: string, newStatus: Dispute['status']) => {
    setDisputes(
      disputes.map((dispute) =>
        dispute.id === disputeId
          ? { ...dispute, status: newStatus, updatedAt: new Date().toISOString() }
          : dispute
      )
    );
    showToast('success', 'Dispute status updated successfully');
  };

  const handleResolveDispute = (disputeId: string) => {
    if (!resolutionNotes.trim()) {
      showToast('error', 'Please provide resolution notes');
      return;
    }

    setDisputes(
      disputes.map((dispute) =>
        dispute.id === disputeId
          ? {
              ...dispute,
              status: 'resolved',
              updatedAt: new Date().toISOString(),
              resolution: {
                action: 'Resolved by admin',
                notes: resolutionNotes,
                resolvedBy: 'Admin User',
                resolvedAt: new Date().toISOString(),
              },
            }
          : dispute
      )
    );
    setResolutionNotes('');
    setSelectedDispute(null);
    showToast('success', 'Dispute resolved successfully');
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const filteredDisputes = disputes.filter((dispute) => {
    return (
      (!filters.status || dispute.status === filters.status) &&
      (!filters.type || dispute.type === filters.type) &&
      (!filters.priority || dispute.priority === filters.priority) &&
      (!filters.search ||
        dispute.id.toLowerCase().includes(filters.search.toLowerCase()) ||
        dispute.customer.name.toLowerCase().includes(filters.search.toLowerCase()))
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Dispute Resolution
        </h2>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
        >
          Export Disputes
        </motion.button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="">All Status</option>
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Type
            </label>
            <select
              value={filters.type}
              onChange={(e) => handleFilterChange('type', e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="">All Types</option>
              <option value="delivery">Delivery</option>
              <option value="quality">Quality</option>
              <option value="payment">Payment</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Priority
            </label>
            <select
              value={filters.priority}
              onChange={(e) => handleFilterChange('priority', e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="">All Priorities</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Search
            </label>
            <input
              type="text"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              placeholder="Search disputes..."
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
        </div>
      </div>

      {/* Disputes List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Dispute ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Priority
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredDisputes.map((dispute) => (
                <tr key={dispute.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {dispute.id}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Order: {dispute.orderId}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {dispute.customer.name}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {dispute.customer.phone}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                      {dispute.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        dispute.priority === 'high'
                          ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          : dispute.priority === 'medium'
                          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                          : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      }`}
                    >
                      {dispute.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        dispute.status === 'resolved'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : dispute.status === 'closed'
                          ? 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                          : dispute.status === 'in_progress'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                      }`}
                    >
                      {dispute.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setSelectedDispute(dispute)}
                        className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300"
                      >
                        View Details
                      </motion.button>
                      {dispute.status === 'open' && (
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleStatusChange(dispute.id, 'in_progress')}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          Start Resolution
                        </motion.button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dispute Details Modal */}
      {selectedDispute && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Dispute Details - {selectedDispute.id}
              </h3>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedDispute(null)}
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
              >
                ✕
              </motion.button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Customer Details
                  </h4>
                  <p className="mt-1 text-sm text-gray-900 dark:text-white">
                    {selectedDispute.customer.name}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {selectedDispute.customer.phone}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {selectedDispute.customer.email}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Vendor Details
                  </h4>
                  <p className="mt-1 text-sm text-gray-900 dark:text-white">
                    {selectedDispute.vendor.name}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {selectedDispute.vendor.phone}
                  </p>
                </div>
                {selectedDispute.driver && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Driver Details
                    </h4>
                    <p className="mt-1 text-sm text-gray-900 dark:text-white">
                      {selectedDispute.driver.name}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {selectedDispute.driver.phone}
                    </p>
                  </div>
                )}
                <div>
                  <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Dispute Details
                  </h4>
                  <p className="mt-1 text-sm text-gray-900 dark:text-white">
                    Type: {selectedDispute.type}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Priority: {selectedDispute.priority}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Status: {selectedDispute.status}
                  </p>
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Description
                </h4>
                <p className="mt-1 text-sm text-gray-900 dark:text-white">
                  {selectedDispute.description}
                </p>
              </div>
              {selectedDispute.resolution && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Resolution
                  </h4>
                  <p className="mt-1 text-sm text-gray-900 dark:text-white">
                    {selectedDispute.resolution.notes}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Resolved by {selectedDispute.resolution.resolvedBy} on{' '}
                    {new Date(selectedDispute.resolution.resolvedAt).toLocaleString()}
                  </p>
                </div>
              )}
              {selectedDispute.status === 'in_progress' && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Resolution Notes
                  </h4>
                  <textarea
                    value={resolutionNotes}
                    onChange={(e) => setResolutionNotes(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    rows={4}
                    placeholder="Enter resolution notes..."
                  />
                  <div className="mt-4 flex justify-end space-x-2">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleStatusChange(selectedDispute.id, 'closed')}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                    >
                      Close Dispute
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleResolveDispute(selectedDispute.id)}
                      className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                    >
                      Resolve Dispute
                    </motion.button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 