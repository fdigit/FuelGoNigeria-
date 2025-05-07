import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Overview from './sections/Overview';
import ProductManagement from './sections/ProductManagement';
import OrderManagement from './sections/OrderManagement';
import Earnings from './sections/Earnings';
import DriverManagement from './sections/DriverManagement';
import CustomerFeedback from './sections/CustomerFeedback';
import VendorProfile from './sections/VendorProfile';
import Notifications from './sections/Notifications';

type Section = 'overview' | 'products' | 'orders' | 'earnings' | 'drivers' | 'feedback' | 'profile' | 'notifications';

export default function VendorDashboard() {
  const [activeSection, setActiveSection] = useState<Section>('overview');

  const sections = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'products', label: 'Products', icon: '⛽' },
    { id: 'orders', label: 'Orders', icon: '📦' },
    { id: 'earnings', label: 'Earnings', icon: '💰' },
    { id: 'drivers', label: 'Drivers', icon: '🚚' },
    { id: 'feedback', label: 'Feedback', icon: '⭐' },
    { id: 'profile', label: 'Profile', icon: '👤' },
    { id: 'notifications', label: 'Notifications', icon: '🔔' },
  ];

  const renderSection = () => {
    switch (activeSection) {
      case 'overview':
        return <Overview />;
      case 'products':
        return <ProductManagement />;
      case 'orders':
        return <OrderManagement />;
      case 'earnings':
        return <Earnings />;
      case 'drivers':
        return <DriverManagement />;
      case 'feedback':
        return <CustomerFeedback />;
      case 'profile':
        return <VendorProfile />;
      case 'notifications':
        return <Notifications />;
      default:
        return <Overview />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 min-h-screen bg-white dark:bg-gray-800 shadow-lg">
          <div className="p-4">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">
              Vendor Dashboard
            </h1>
            <nav className="space-y-2">
              {sections.map((section) => (
                <motion.button
                  key={section.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveSection(section.id as Section)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    activeSection === section.id
                      ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-100'
                      : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                  }`}
                >
                  <span className="text-xl">{section.icon}</span>
                  <span>{section.label}</span>
                </motion.button>
              ))}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          {renderSection()}
        </div>
      </div>
    </div>
  );
} 