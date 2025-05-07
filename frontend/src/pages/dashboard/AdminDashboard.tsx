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

type Section = 
  | 'overview'
  | 'users'
  | 'orders'
  | 'disputes'
  | 'commission'
  | 'payouts'
  | 'notifications'
  | 'reports'
  | 'settings'
  | 'audit'
  | 'roles';

export default function AdminDashboard() {
  const [activeSection, setActiveSection] = useState<Section>('overview');

  const sections = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'users', label: 'User Management', icon: '👥' },
    { id: 'orders', label: 'Order Oversight', icon: '📦' },
    { id: 'disputes', label: 'Dispute Resolution', icon: '⚖️' },
    { id: 'commission', label: 'Commission Settings', icon: '💰' },
    { id: 'payouts', label: 'Payouts & Transactions', icon: '💳' },
    { id: 'notifications', label: 'Push Notifications', icon: '🔔' },
    { id: 'reports', label: 'Reports & Analytics', icon: '📈' },
    { id: 'settings', label: 'Platform Settings', icon: '⚙️' },
    { id: 'audit', label: 'Audit Logs', icon: '📝' },
    { id: 'roles', label: 'Admin Roles', icon: '👤' },
  ];

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
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      {/* Sidebar */}
      <div className="w-64 bg-white dark:bg-gray-800 shadow-lg overflow-y-auto">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
        </div>
        <nav className="mt-4">
          {sections.map((section) => (
            <motion.button
              key={section.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveSection(section.id as Section)}
              className={`w-full px-4 py-3 text-left flex items-center space-x-3 ${
                activeSection === section.id
                  ? 'bg-primary-50 text-primary-600 dark:bg-primary-900 dark:text-primary-200'
                  : 'text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700'
              }`}
            >
              <span className="text-xl">{section.icon}</span>
              <span>{section.label}</span>
            </motion.button>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          {renderSection()}
        </div>
      </div>
    </div>
  );
} 