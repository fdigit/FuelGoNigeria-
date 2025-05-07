import React from 'react';
import { motion } from 'framer-motion';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { useToast } from '../../../contexts/ToastContext';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface SalesData {
  total: number;
  today: number;
  thisWeek: number;
  thisMonth: number;
}

interface StockData {
  product: string;
  available: number;
  total: number;
}

interface Delivery {
  id: string;
  customerName: string;
  address: string;
  fuelType: string;
  quantity: number;
  status: 'pending' | 'in_progress' | 'completed';
  estimatedTime: string;
}

export default function Overview() {
  const { showToast } = useToast();

  // Mock data - In a real app, this would come from an API
  const salesData: SalesData = {
    total: 2500000,
    today: 150000,
    thisWeek: 850000,
    thisMonth: 2500000,
  };

  const stockData: StockData[] = [
    { product: 'Petrol (PMS)', available: 5000, total: 10000 },
    { product: 'Diesel (AGO)', available: 3000, total: 8000 },
    { product: 'Kerosene (DPK)', available: 2000, total: 5000 },
  ];

  const activeOrders = 12;
  const pendingDeliveries = 5;

  const currentTask: Delivery = {
    id: 'DEL001',
    customerName: 'John Doe',
    address: '123 Main Street, Lagos',
    fuelType: 'Premium (PMS)',
    quantity: 50,
    status: 'in_progress',
    estimatedTime: '15 minutes',
  };

  const todaySummary = {
    totalDeliveries: 8,
    completedDeliveries: 5,
    totalEarnings: 25000,
    averageRating: 4.8,
  };

  // Sales chart data
  const chartData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Sales (₦)',
        data: [120000, 150000, 180000, 140000, 160000, 200000, 150000],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Sales Overview',
      },
    },
    scales: {
      y: {
        type: 'linear' as const,
        beginAtZero: true,
        ticks: {
          callback: function(this: any, value: any) {
            return `₦${value.toLocaleString()}`;
          }
        },
      },
    },
  };

  const handleStartNavigation = () => {
    // In a real app, this would open Google Maps with the destination
    showToast('info', 'Opening Google Maps...');
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Overview</h2>

      {/* Current Task */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Current Task
        </h3>
        {currentTask ? (
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Delivery ID</p>
                <p className="text-lg font-medium text-gray-900 dark:text-white">
                  {currentTask.id}
                </p>
              </div>
              <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                IN PROGRESS
              </span>
            </div>

            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Customer</p>
              <p className="text-lg font-medium text-gray-900 dark:text-white">
                {currentTask.customerName}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Delivery Address</p>
              <p className="text-lg font-medium text-gray-900 dark:text-white">
                {currentTask.address}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Fuel Type</p>
                <p className="text-lg font-medium text-gray-900 dark:text-white">
                  {currentTask.fuelType}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Quantity</p>
                <p className="text-lg font-medium text-gray-900 dark:text-white">
                  {currentTask.quantity}L
                </p>
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Estimated Time</p>
              <p className="text-lg font-medium text-gray-900 dark:text-white">
                {currentTask.estimatedTime}
              </p>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleStartNavigation}
              className="w-full px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            >
              Start Navigation
            </motion.button>
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400">No current task assigned</p>
        )}
      </div>

      {/* Today's Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Total Deliveries
          </h4>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
            {todaySummary.totalDeliveries}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Completed Deliveries
          </h4>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
            {todaySummary.completedDeliveries}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Today's Earnings
          </h4>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
            ₦{todaySummary.totalEarnings.toLocaleString()}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Average Rating
          </h4>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
            {todaySummary.averageRating} ⭐
          </p>
        </div>
      </div>

      {/* Sales Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow p-6"
        >
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Sales</h3>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
            ₦{salesData.total.toLocaleString()}
          </p>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow p-6"
        >
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Today's Sales</h3>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
            ₦{salesData.today.toLocaleString()}
          </p>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow p-6"
        >
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Active Orders</h3>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
            {activeOrders}
          </p>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow p-6"
        >
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Pending Deliveries</h3>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
            {pendingDeliveries}
          </p>
        </motion.div>
      </div>

      {/* Sales Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <Line data={chartData} options={chartOptions} />
      </div>

      {/* Stock Overview */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Stock Overview</h2>
        <div className="space-y-4">
          {stockData.map((item) => (
            <div key={item.product} className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-700 dark:text-gray-300">{item.product}</span>
                <span className="text-gray-500 dark:text-gray-400">
                  {item.available} / {item.total} liters
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-primary-600 h-2 rounded-full"
                  style={{ width: `${(item.available / item.total) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 