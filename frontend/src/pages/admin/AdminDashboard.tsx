import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Overview from './sections/Overview';
import UserManagement from './sections/UserManagement';
import OrderOversight from './sections/OrderOversight';
import DisputeResolution from './sections/DisputeResolution';
import CommissionSettings from './sections/CommissionSettings';
import PayoutsTransactions from './sections/PayoutsTransactions';
import PushNotifications from './sections/PushNotifications';
import ReportsAnalytics from './sections/ReportsAnalytics';
import PlatformSettings from './sections/PlatformSettings';
import AuditLogs from './sections/AuditLogs';
import AdminRoles from './sections/AdminRoles';

type Section = {
  id: string;
  name: string;
  icon: string;
};

const sections: Section[] = [
  { id: 'overview', name: 'Overview', icon: '📊' },
  { id: 'users', name: 'User Management', icon: '👥' },
  { id: 'orders', name: 'Order Oversight', icon: '📦' },
  { id: 'disputes', name: 'Dispute Resolution', icon: '⚖️' },
  { id: 'commission', name: 'Commission Settings', icon: '💰' },
  { id: 'payouts', name: 'Payouts & Transactions', icon: '💳' },
  { id: 'notifications', name: 'Push Notifications', icon: '🔔' },
  { id: 'reports', name: 'Reports & Analytics', icon: '📈' },
  { id: 'settings', name: 'Platform Settings', icon: '⚙️' },
  { id: 'audit', name: 'Audit Logs', icon: '📝' },
  { id: 'roles', name: 'Admin Roles', icon: '👤' },
];

export default function AdminDashboard() {
  const [activeSection, setActiveSection] = useState('overview');

  const renderSection = () => {
    switch (activeSection) {
      case 'overview':
        return <Overview />;
      case 'users':
        return <UserManagement />;
      case 'orders':
        return <OrderOversight />;
      case 'disputes':
        return <DisputeResolution />;
      case 'commission':
        return <CommissionSettings />;
      case 'payouts':
        return <PayoutsTransactions />;
      case 'notifications':
        return <PushNotifications />;
      case 'reports':
        return <ReportsAnalytics />;
      case 'settings':
        return <PlatformSettings />;
      case 'audit':
        return <AuditLogs />;
      case 'roles':
        return <AdminRoles />;
      default:
        return <Overview />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 min-h-screen bg-white dark:bg-gray-800 shadow-lg">
          <div className="p-4">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Admin Dashboard
            </h1>
          </div>
          <nav className="mt-4">
            {sections.map((section) => (
              <motion.button
                key={section.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveSection(section.id)}
                className={`w-full px-4 py-3 text-left flex items-center space-x-3 ${
                  activeSection === section.id
                    ? 'bg-primary-50 text-primary-600 dark:bg-primary-900 dark:text-primary-200'
                    : 'text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700'
                }`}
              >
                <span className="text-xl">{section.icon}</span>
                <span className="font-medium">{section.name}</span>
              </motion.button>
            ))}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">{renderSection()}</div>
        </div>
      </div>
    </div>
  );
} 