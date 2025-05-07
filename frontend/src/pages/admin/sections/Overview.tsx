import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useToast } from '../../../contexts/ToastContext';

interface KPI {
  id: string;
  title: string;
  value: number;
  change: number;
  icon: string;
}

interface Alert {
  id: string;
  type: 'dispute' | 'payment' | 'system';
  message: string;
  timestamp: string;
  priority: 'high' | 'medium' | 'low';
}

export default function Overview() {
  const [kpis, setKpis] = useState<KPI[]>([
    {
      id: 'users',
      title: 'Total Users',
      value: 1250,
      change: 12.5,
      icon: '👥',
    },
    {
      id: 'vendors',
      title: 'Active Vendors',
      value: 45,
      change: 5.2,
      icon: '🏪',
    },
    {
      id: 'drivers',
      title: 'Active Drivers',
      value: 120,
      change: 8.3,
      icon: '🚗',
    },
    {
      id: 'revenue',
      title: 'Total Revenue',
      value: 2500000,
      change: 15.7,
      icon: '💰',
    },
  ]);

  const [alerts, setAlerts] = useState<Alert[]>([
    {
      id: '1',
      type: 'dispute',
      message: 'New dispute filed for Order #1234',
      timestamp: '2024-02-22T10:30:00Z',
      priority: 'high',
    },
    {
      id: '2',
      type: 'payment',
      message: 'Failed payment for Order #1235',
      timestamp: '2024-02-22T09:15:00Z',
      priority: 'medium',
    },
    {
      id: '3',
      type: 'system',
      message: 'System maintenance scheduled for tonight',
      timestamp: '2024-02-22T08:00:00Z',
      priority: 'low',
    },
  ]);

  const { showToast } = useToast();

  const handleAlertAction = (alertId: string) => {
    showToast('info', 'Processing alert...');
    // In a real app, this would handle the alert action
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Dashboard Overview
        </h2>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
        >
          Refresh Data
        </motion.button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi) => (
          <motion.div
            key={kpi.id}
            whileHover={{ scale: 1.02 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {kpi.title}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {kpi.id === 'revenue'
                    ? `₦${kpi.value.toLocaleString()}`
                    : kpi.value.toLocaleString()}
                </p>
              </div>
              <span className="text-3xl">{kpi.icon}</span>
            </div>
            <div className="mt-4">
              <span
                className={`text-sm font-medium ${
                  kpi.change >= 0
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-red-600 dark:text-red-400'
                }`}
              >
                {kpi.change >= 0 ? '+' : ''}
                {kpi.change}%
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
                vs last month
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Order Activity Heatmap */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Order Activity Heatmap
        </h3>
        <div className="aspect-w-16 aspect-h-9 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
          {/* In a real app, this would be a heatmap component */}
          <div className="w-full h-full flex items-center justify-center">
            <p className="text-gray-500 dark:text-gray-400">
              Heatmap View (Coming Soon)
            </p>
          </div>
        </div>
      </div>

      {/* Alerts & Notifications */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Alerts & Notifications
          </h3>
        </div>
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className="px-6 py-4 flex items-center justify-between"
            >
              <div className="flex items-center space-x-4">
                <span
                  className={`w-2 h-2 rounded-full ${
                    alert.priority === 'high'
                      ? 'bg-red-500'
                      : alert.priority === 'medium'
                      ? 'bg-yellow-500'
                      : 'bg-green-500'
                  }`}
                />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {alert.message}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date(alert.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleAlertAction(alert.id)}
                className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              >
                View Details
              </motion.button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 