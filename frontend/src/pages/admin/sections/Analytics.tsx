import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface MetricCard {
  title: string;
  value: string | number;
  change: number;
  trend: 'up' | 'down';
}

interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor: string;
    borderColor: string;
  }[];
}

export default function Analytics() {
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month' | 'year'>('week');

  const metrics: MetricCard[] = [
    {
      title: 'Total Orders',
      value: '1,234',
      change: 12.5,
      trend: 'up',
    },
    {
      title: 'Revenue',
      value: '₦4,567,890',
      change: 8.3,
      trend: 'up',
    },
    {
      title: 'Active Users',
      value: '789',
      change: -2.1,
      trend: 'down',
    },
    {
      title: 'Average Order Value',
      value: '₦3,700',
      change: 5.7,
      trend: 'up',
    },
  ];

  const orderData: ChartData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Orders',
        data: [65, 59, 80, 81, 56, 55, 40],
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        borderColor: 'rgb(59, 130, 246)',
      },
    ],
  };

  const revenueData: ChartData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Revenue',
        data: [12000, 19000, 15000, 25000, 22000, 30000, 28000],
        backgroundColor: 'rgba(16, 185, 129, 0.5)',
        borderColor: 'rgb(16, 185, 129)',
      },
    ],
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics</h2>
        <div className="flex space-x-2">
          {(['day', 'week', 'month', 'year'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1 rounded-md text-sm font-medium ${
                timeRange === range
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              {range.charAt(0).toUpperCase() + range.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric) => (
          <motion.div
            key={metric.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow p-6"
          >
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
              {metric.title}
            </h3>
            <div className="mt-2 flex items-baseline">
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {metric.value}
              </p>
              <span
                className={`ml-2 text-sm font-medium ${
                  metric.trend === 'up'
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-red-600 dark:text-red-400'
                }`}
              >
                {metric.trend === 'up' ? '↑' : '↓'} {Math.abs(metric.change)}%
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Orders Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Orders Overview
          </h3>
          <div className="h-64">
            {/* Replace with actual chart component */}
            <div className="w-full h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
              Chart placeholder - Orders over time
            </div>
          </div>
        </div>

        {/* Revenue Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Revenue Overview
          </h3>
          <div className="h-64">
            {/* Replace with actual chart component */}
            <div className="w-full h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
              Chart placeholder - Revenue over time
            </div>
          </div>
        </div>
      </div>

      {/* Additional Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Products */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Top Products
          </h3>
          <div className="space-y-4">
            {[
              { name: 'Premium Petrol', sales: 234, revenue: '₦1,234,000' },
              { name: 'Diesel', sales: 189, revenue: '₦945,000' },
              { name: 'Regular Petrol', sales: 156, revenue: '₦780,000' },
            ].map((product) => (
              <div
                key={product.name}
                className="flex items-center justify-between"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {product.name}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {product.sales} sales
                  </p>
                </div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {product.revenue}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* User Activity */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            User Activity
          </h3>
          <div className="space-y-4">
            {[
              { type: 'New Users', count: 45, change: '+12%' },
              { type: 'Active Users', count: 789, change: '+5%' },
              { type: 'Returning Users', count: 234, change: '+8%' },
            ].map((activity) => (
              <div
                key={activity.type}
                className="flex items-center justify-between"
              >
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {activity.type}
                </p>
                <div className="flex items-center">
                  <p className="text-sm font-medium text-gray-900 dark:text-white mr-2">
                    {activity.count}
                  </p>
                  <span className="text-sm text-green-600 dark:text-green-400">
                    {activity.change}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Recent Orders
          </h3>
          <div className="space-y-4">
            {[
              { id: 'ORD-001', customer: 'John Doe', amount: '₦15,000', status: 'Completed' },
              { id: 'ORD-002', customer: 'Jane Smith', amount: '₦12,500', status: 'Processing' },
              { id: 'ORD-003', customer: 'Mike Johnson', amount: '₦18,000', status: 'Completed' },
            ].map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {order.id}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {order.customer}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {order.amount}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {order.status}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 