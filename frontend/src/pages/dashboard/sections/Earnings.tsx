import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useToast } from '../../../contexts/ToastContext';
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
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface Delivery {
  id: string;
  date: string;
  customerName: string;
  amount: number;
  status: 'completed' | 'pending';
}

export default function Earnings() {
  const [timeRange, setTimeRange] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const { showToast } = useToast();

  const earningsData = {
    daily: {
      total: 25000,
      deliveries: 8,
      chartData: {
        labels: ['6AM', '9AM', '12PM', '3PM', '6PM', '9PM'],
        datasets: [
          {
            label: 'Earnings (₦)',
            data: [5000, 8000, 12000, 15000, 20000, 25000],
            borderColor: 'rgb(59, 130, 246)',
            backgroundColor: 'rgba(59, 130, 246, 0.5)',
            tension: 0.4,
          },
        ],
      },
    },
    weekly: {
      total: 175000,
      deliveries: 45,
      chartData: {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [
          {
            label: 'Earnings (₦)',
            data: [25000, 30000, 28000, 32000, 35000, 40000, 45000],
            borderColor: 'rgb(59, 130, 246)',
            backgroundColor: 'rgba(59, 130, 246, 0.5)',
            tension: 0.4,
          },
        ],
      },
    },
    monthly: {
      total: 750000,
      deliveries: 180,
      chartData: {
        labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
        datasets: [
          {
            label: 'Earnings (₦)',
            data: [175000, 185000, 195000, 195000],
            borderColor: 'rgb(59, 130, 246)',
            backgroundColor: 'rgba(59, 130, 246, 0.5)',
            tension: 0.4,
          },
        ],
      },
    },
  };

  const recentDeliveries: Delivery[] = [
    {
      id: 'DEL001',
      date: '2024-02-20 14:30',
      customerName: 'John Doe',
      amount: 5000,
      status: 'completed',
    },
    {
      id: 'DEL002',
      date: '2024-02-20 15:45',
      customerName: 'Jane Smith',
      amount: 7500,
      status: 'completed',
    },
    {
      id: 'DEL003',
      date: '2024-02-20 16:20',
      customerName: 'Mike Johnson',
      amount: 6000,
      status: 'pending',
    },
  ];

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: false,
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

  const handleExportReport = () => {
    // In a real app, this would generate and download a report
    showToast('success', 'Report exported successfully');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Earnings
        </h2>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleExportReport}
          className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
        >
          Export Report
        </motion.button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Total Earnings
          </h3>
          <p className="mt-2 text-3xl font-bold text-primary-600">
            ₦{earningsData[timeRange].total.toLocaleString()}
          </p>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {timeRange.charAt(0).toUpperCase() + timeRange.slice(1)} earnings
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Total Deliveries
          </h3>
          <p className="mt-2 text-3xl font-bold text-primary-600">
            {earningsData[timeRange].deliveries}
          </p>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {timeRange.charAt(0).toUpperCase() + timeRange.slice(1)} deliveries
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Average per Delivery
          </h3>
          <p className="mt-2 text-3xl font-bold text-primary-600">
            ₦
            {Math.round(
              earningsData[timeRange].total / earningsData[timeRange].deliveries
            ).toLocaleString()}
          </p>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {timeRange.charAt(0).toUpperCase() + timeRange.slice(1)} average
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Earnings Trend
          </h3>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as typeof timeRange)}
            className="rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>
        <div className="h-80">
          <Line options={chartOptions} data={earningsData[timeRange].chartData} />
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Recent Deliveries
          </h3>
        </div>
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {recentDeliveries.map((delivery) => (
            <div key={delivery.id} className="px-6 py-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {delivery.customerName}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date(delivery.date).toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    ₦{delivery.amount.toLocaleString()}
                  </p>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      delivery.status === 'completed'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                    }`}
                  >
                    {delivery.status.charAt(0).toUpperCase() +
                      delivery.status.slice(1)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 