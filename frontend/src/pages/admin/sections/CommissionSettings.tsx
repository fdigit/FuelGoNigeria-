import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useToast } from '../../../contexts/ToastContext';

interface CommissionRate {
  id: string;
  type: 'VENDOR' | 'DRIVER';
  tier: 'standard' | 'premium' | 'enterprise';
  rate: number;
  minAmount: number;
  maxAmount: number;
  conditions: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface SpecialRate {
  id: string;
  type: 'VENDOR' | 'DRIVER';
  userId: string;
  userName: string;
  rate: number;
  reason: string;
  startDate: string;
  endDate?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function CommissionSettings() {
  const [commissionRates, setCommissionRates] = useState<CommissionRate[]>([
    {
      id: 'CR001',
      type: 'VENDOR',
      tier: 'standard',
      rate: 5,
      minAmount: 0,
      maxAmount: 100000,
      conditions: ['Standard service level', 'Regular support'],
      isActive: true,
      createdAt: '2024-02-22T10:00:00Z',
      updatedAt: '2024-02-22T10:00:00Z',
    },
    {
      id: 'CR002',
      type: 'VENDOR',
      tier: 'premium',
      rate: 4,
      minAmount: 100001,
      maxAmount: 500000,
      conditions: ['Priority support', 'Advanced analytics'],
      isActive: true,
      createdAt: '2024-02-22T10:00:00Z',
      updatedAt: '2024-02-22T10:00:00Z',
    },
    {
      id: 'CR003',
      type: 'DRIVER',
      tier: 'standard',
      rate: 8,
      minAmount: 0,
      maxAmount: 50000,
      conditions: ['Standard delivery service'],
      isActive: true,
      createdAt: '2024-02-22T10:00:00Z',
      updatedAt: '2024-02-22T10:00:00Z',
    },
  ]);

  const [specialRates, setSpecialRates] = useState<SpecialRate[]>([
    {
      id: 'SR001',
      type: 'VENDOR',
      userId: 'V001',
      userName: 'Fuel Station A',
      rate: 3.5,
      reason: 'High volume partner',
      startDate: '2024-02-01T00:00:00Z',
      isActive: true,
      createdAt: '2024-02-22T10:00:00Z',
      updatedAt: '2024-02-22T10:00:00Z',
    },
  ]);

  const [activeTab, setActiveTab] = useState<'standard' | 'special'>('standard');
  const [selectedRate, setSelectedRate] = useState<CommissionRate | null>(null);
  const [selectedSpecialRate, setSelectedSpecialRate] = useState<SpecialRate | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    rate: '',
    minAmount: '',
    maxAmount: '',
    conditions: '',
  });

  const { showToast } = useToast();

  const handleEditRate = (rate: CommissionRate) => {
    setSelectedRate(rate);
    setEditForm({
      rate: rate.rate.toString(),
      minAmount: rate.minAmount.toString(),
      maxAmount: rate.maxAmount.toString(),
      conditions: rate.conditions.join('\n'),
    });
    setIsEditing(true);
  };

  const handleSaveRate = () => {
    if (!selectedRate) return;

    const updatedRate = {
      ...selectedRate,
      rate: parseFloat(editForm.rate),
      minAmount: parseFloat(editForm.minAmount),
      maxAmount: parseFloat(editForm.maxAmount),
      conditions: editForm.conditions.split('\n').filter(Boolean),
      updatedAt: new Date().toISOString(),
    };

    setCommissionRates(
      commissionRates.map((rate) =>
        rate.id === selectedRate.id ? updatedRate : rate
      )
    );
    setIsEditing(false);
    setSelectedRate(null);
    showToast('success', 'Commission rate updated successfully');
  };

  const handleToggleRate = (rateId: string) => {
    setCommissionRates(
      commissionRates.map((rate) =>
        rate.id === rateId
          ? { ...rate, isActive: !rate.isActive, updatedAt: new Date().toISOString() }
          : rate
      )
    );
    showToast('success', 'Commission rate status updated');
  };

  const handleToggleSpecialRate = (rateId: string) => {
    setSpecialRates(
      specialRates.map((rate) =>
        rate.id === rateId
          ? { ...rate, isActive: !rate.isActive, updatedAt: new Date().toISOString() }
          : rate
      )
    );
    showToast('success', 'Special rate status updated');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Commission Settings
        </h2>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('standard')}
            className={`${
              activeTab === 'standard'
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Standard Rates
          </button>
          <button
            onClick={() => setActiveTab('special')}
            className={`${
              activeTab === 'special'
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Special Rates
          </button>
        </nav>
      </div>

      {activeTab === 'standard' ? (
        <div className="space-y-6">
          {/* Standard Commission Rates */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Tier
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Rate
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Amount Range
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
                  {commissionRates.map((rate) => (
                    <tr key={rate.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                          {rate.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {rate.tier}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {rate.rate}%
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        ₦{rate.minAmount.toLocaleString()} - ₦{rate.maxAmount.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            rate.isActive
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          }`}
                        >
                          {rate.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleEditRate(rate)}
                            className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300"
                          >
                            Edit
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleToggleRate(rate.id)}
                            className={`${
                              rate.isActive
                                ? 'text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300'
                                : 'text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300'
                            }`}
                          >
                            {rate.isActive ? 'Deactivate' : 'Activate'}
                          </motion.button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Special Commission Rates */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Rate
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Reason
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Period
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
                  {specialRates.map((rate) => (
                    <tr key={rate.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                          {rate.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {rate.userName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {rate.rate}%
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {rate.reason}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {new Date(rate.startDate).toLocaleDateString()}
                        {rate.endDate && ` - ${new Date(rate.endDate).toLocaleDateString()}`}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            rate.isActive
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          }`}
                        >
                          {rate.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setSelectedSpecialRate(rate)}
                            className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300"
                          >
                            View
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleToggleSpecialRate(rate.id)}
                            className={`${
                              rate.isActive
                                ? 'text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300'
                                : 'text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300'
                            }`}
                          >
                            {rate.isActive ? 'Deactivate' : 'Activate'}
                          </motion.button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Edit Rate Modal */}
      {isEditing && selectedRate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Edit Commission Rate
              </h3>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setIsEditing(false)}
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
              >
                ✕
              </motion.button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Rate (%)
                </label>
                <input
                  type="number"
                  value={editForm.rate}
                  onChange={(e) => setEditForm({ ...editForm, rate: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  step="0.1"
                  min="0"
                  max="100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Minimum Amount
                </label>
                <input
                  type="number"
                  value={editForm.minAmount}
                  onChange={(e) => setEditForm({ ...editForm, minAmount: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Maximum Amount
                </label>
                <input
                  type="number"
                  value={editForm.maxAmount}
                  onChange={(e) => setEditForm({ ...editForm, maxAmount: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Conditions (one per line)
                </label>
                <textarea
                  value={editForm.conditions}
                  onChange={(e) => setEditForm({ ...editForm, conditions: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  rows={4}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSaveRate}
                  className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                >
                  Save Changes
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Special Rate Modal */}
      {selectedSpecialRate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Special Rate Details
              </h3>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedSpecialRate(null)}
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
              >
                ✕
              </motion.button>
            </div>
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  User Details
                </h4>
                <p className="mt-1 text-sm text-gray-900 dark:text-white">
                  {selectedSpecialRate.userName}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Type: {selectedSpecialRate.type}
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Rate Details
                </h4>
                <p className="mt-1 text-sm text-gray-900 dark:text-white">
                  Rate: {selectedSpecialRate.rate}%
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Reason: {selectedSpecialRate.reason}
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Period
                </h4>
                <p className="mt-1 text-sm text-gray-900 dark:text-white">
                  Start: {new Date(selectedSpecialRate.startDate).toLocaleDateString()}
                </p>
                {selectedSpecialRate.endDate && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    End: {new Date(selectedSpecialRate.endDate).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 