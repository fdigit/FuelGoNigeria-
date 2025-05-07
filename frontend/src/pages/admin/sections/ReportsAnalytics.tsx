import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useToast } from '../../../contexts/ToastContext';

interface Metric {
  id: string;
  title: string;
  value: number;
  change: number;
  changeType: 'increase' | 'decrease';
  period: 'day' | 'week' | 'month';
}

interface UserAnalytics {
  totalUsers: number;
  activeUsers: number;
  newUsers: number;
  userTypes: {
    customers: number;
    vendors: number;
    drivers: number;
  };
  userGrowth: {
    date: string;
    customers: number;
    vendors: number;
    drivers: number;
  }[];
}

interface OrderAnalytics {
  totalOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  averageOrderValue: number;
  orderTrends: {
    date: string;
    orders: number;
    revenue: number;
  }[];
}

interface RevenueAnalytics {
  totalRevenue: number;
  revenueGrowth: number;
  revenueByType: {
    fuel: number;
    delivery: number;
    commission: number;
  };
  revenueTrends: {
    date: string;
    revenue: number;
    profit: number;
  }[];
}

export default function ReportsAnalytics() {
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'orders' | 'revenue'>('overview');
  const [dateRange, setDateRange] = useState('week');
  const { showToast } = useToast();

  const [metrics, setMetrics] = useState<Metric[]>([
    {
      id: '1',
      title: 'Total Revenue',
      value: 1500000,
      change: 12.5,
      changeType: 'increase',
      period: 'week',
    },
    {
      id: '2',
      title: 'Active Users',
      value: 2500,
      change: 8.3,
      changeType: 'increase',
      period: 'week',
    },
    {
      id: '3',
      title: 'Total Orders',
      value: 1500,
      change: 5.2,
      changeType: 'increase',
      period: 'week',
    },
    {
      id: '4',
      title: 'Average Order Value',
      value: 10000,
      change: 2.1,
      changeType: 'decrease',
      period: 'week',
    },
  ]);

  const [userAnalytics, setUserAnalytics] = useState<UserAnalytics>({
    totalUsers: 5000,
    activeUsers: 2500,
    newUsers: 150,
    userTypes: {
      customers: 3500,
      vendors: 1000,
      drivers: 500,
    },
    userGrowth: [
      {
        date: '2024-02-16',
        customers: 3200,
        vendors: 900,
        drivers: 450,
      },
      {
        date: '2024-02-17',
        customers: 3300,
        vendors: 950,
        drivers: 480,
      },
      {
        date: '2024-02-18',
        customers: 3400,
        vendors: 980,
        drivers: 490,
      },
    ],
  });

  const [orderAnalytics, setOrderAnalytics] = useState<OrderAnalytics>({
    totalOrders: 1500,
    completedOrders: 1200,
    cancelledOrders: 50,
    averageOrderValue: 10000,
    orderTrends: [
      {
        date: '2024-02-16',
        orders: 200,
        revenue: 2000000,
      },
      {
        date: '2024-02-17',
        orders: 250,
        revenue: 2500000,
      },
      {
        date: '2024-02-18',
        orders: 300,
        revenue: 3000000,
      },
    ],
  });

  const [revenueAnalytics, setRevenueAnalytics] = useState<RevenueAnalytics>({
    totalRevenue: 15000000,
    revenueGrowth: 15.5,
    revenueByType: {
      fuel: 12000000,
      delivery: 2000000,
      commission: 1000000,
    },
    revenueTrends: [
      {
        date: '2024-02-16',
        revenue: 2000000,
        profit: 400000,
      },
      {
        date: '2024-02-17',
        revenue: 2500000,
        profit: 500000,
      },
      {
        date: '2024-02-18',
        revenue: 3000000,
        profit: 600000,
      },
    ],
  });

  const handleDateRangeChange = (range: string) => {
    setDateRange(range);
    // In a real application, this would trigger a data refresh
    showToast('success', 'Data updated for selected period');
  };

  const handleExportReport = (type: string) => {
    // In a real application, this would generate and download a report
    showToast('success', `${type} report exported successfully`);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Reports & Analytics
        </h2>
        <div className="flex space-x-4">
          <select
            value={dateRange}
            onChange={(e) => handleDateRangeChange(e.target.value)}
            className="rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="day">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
          </select>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleExportReport('full')}
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          >
            Export Report
          </motion.button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('overview')}
            className={`${
              activeTab === 'overview'
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`${
              activeTab === 'users'
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Users
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`${
              activeTab === 'orders'
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Orders
          </button>
          <button
            onClick={() => setActiveTab('revenue')}
            className={`${
              activeTab === 'revenue'
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Revenue
          </button>
        </nav>
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {metrics.map((metric) => (
              <div
                key={metric.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow p-6"
              >
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  {metric.title}
                </h3>
                <p className="mt-2 text-3xl font-semibold text-gray-900 dark:text-white">
                  ₦{metric.value.toLocaleString()}
                </p>
                <div className="mt-2 flex items-center">
                  <span
                    className={`text-sm font-medium ${
                      metric.changeType === 'increase'
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-red-600 dark:text-red-400'
                    }`}
                  >
                    {metric.changeType === 'increase' ? '↑' : '↓'} {metric.change}%
                  </span>
                  <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                    vs last {metric.period}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Charts Placeholder */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                User Growth
              </h3>
              <div className="h-64 flex items-center justify-center text-gray-500 dark:text-gray-400">
                User Growth Chart
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Revenue Trends
              </h3>
              <div className="h-64 flex items-center justify-center text-gray-500 dark:text-gray-400">
                Revenue Trends Chart
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="space-y-6">
          {/* User Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Total Users
              </h3>
              <p className="mt-2 text-3xl font-semibold text-gray-900 dark:text-white">
                {userAnalytics.totalUsers.toLocaleString()}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Active Users
              </h3>
              <p className="mt-2 text-3xl font-semibold text-gray-900 dark:text-white">
                {userAnalytics.activeUsers.toLocaleString()}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                New Users
              </h3>
              <p className="mt-2 text-3xl font-semibold text-gray-900 dark:text-white">
                {userAnalytics.newUsers.toLocaleString()}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                User Types
              </h3>
              <div className="mt-2 space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Customers
                  </span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {userAnalytics.userTypes.customers.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Vendors
                  </span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {userAnalytics.userTypes.vendors.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Drivers
                  </span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {userAnalytics.userTypes.drivers.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* User Growth Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              User Growth Over Time
            </h3>
            <div className="h-96 flex items-center justify-center text-gray-500 dark:text-gray-400">
              User Growth Chart
            </div>
          </div>
        </div>
      )}

      {activeTab === 'orders' && (
        <div className="space-y-6">
          {/* Order Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Total Orders
              </h3>
              <p className="mt-2 text-3xl font-semibold text-gray-900 dark:text-white">
                {orderAnalytics.totalOrders.toLocaleString()}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Completed Orders
              </h3>
              <p className="mt-2 text-3xl font-semibold text-gray-900 dark:text-white">
                {orderAnalytics.completedOrders.toLocaleString()}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Cancelled Orders
              </h3>
              <p className="mt-2 text-3xl font-semibold text-gray-900 dark:text-white">
                {orderAnalytics.cancelledOrders.toLocaleString()}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Average Order Value
              </h3>
              <p className="mt-2 text-3xl font-semibold text-gray-900 dark:text-white">
                ₦{orderAnalytics.averageOrderValue.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Order Trends Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Order Trends
            </h3>
            <div className="h-96 flex items-center justify-center text-gray-500 dark:text-gray-400">
              Order Trends Chart
            </div>
          </div>
        </div>
      )}

      {activeTab === 'revenue' && (
        <div className="space-y-6">
          {/* Revenue Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Total Revenue
              </h3>
              <p className="mt-2 text-3xl font-semibold text-gray-900 dark:text-white">
                ₦{revenueAnalytics.totalRevenue.toLocaleString()}
              </p>
              <div className="mt-2 flex items-center">
                <span className="text-sm font-medium text-green-600 dark:text-green-400">
                  ↑ {revenueAnalytics.revenueGrowth}%
                </span>
                <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                  vs last period
                </span>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Revenue by Type
              </h3>
              <div className="mt-2 space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Fuel
                  </span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    ₦{revenueAnalytics.revenueByType.fuel.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Delivery
                  </span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    ₦{revenueAnalytics.revenueByType.delivery.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Commission
                  </span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    ₦{revenueAnalytics.revenueByType.commission.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Revenue Trends Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Revenue Trends
            </h3>
            <div className="h-96 flex items-center justify-center text-gray-500 dark:text-gray-400">
              Revenue Trends Chart
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 