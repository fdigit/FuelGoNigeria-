import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Overview from './sections/Overview';
import AssignedDeliveries from './sections/AssignedDeliveries';
import DeliveryStatus from './sections/DeliveryStatus';
import Earnings from './sections/Earnings';
import Availability from './sections/Availability';
import DriverProfile from './sections/DriverProfile';
import LiveLocation from './sections/LiveLocation';

export default function DriverDashboard() {
  const [activeSection, setActiveSection] = useState('overview');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const sections = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'deliveries', label: 'Assigned Deliveries', icon: '📦' },
    { id: 'status', label: 'Delivery Status', icon: '🚚' },
    { id: 'earnings', label: 'Earnings', icon: '💰' },
    { id: 'availability', label: 'Availability', icon: '🟢' },
    { id: 'profile', label: 'Profile', icon: '👤' },
    { id: 'location', label: 'Live Location', icon: '📍' },
  ];

  const renderSection = () => {
    switch (activeSection) {
      case 'overview':
        return <Overview />;
      case 'deliveries':
        return <AssignedDeliveries />;
      case 'status':
        return <DeliveryStatus />;
      case 'earnings':
        return <Earnings />;
      case 'availability':
        return <Availability />;
      case 'profile':
        return <DriverProfile />;
      case 'location':
        return <LiveLocation />;
      default:
        return <Overview />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-16">
        {/* Mobile menu button */}
        <div className="lg:hidden mb-4">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
          >
            {isMobileMenuOpen ? 'Close Menu' : 'Open Menu'}
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className={`lg:w-64 ${isMobileMenuOpen ? 'block' : 'hidden'} lg:block`}>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Driver Dashboard</h1>
              <nav className="space-y-1">
                {sections.map((section) => (
                  <motion.button
                    key={section.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setActiveSection(section.id);
                      setIsMobileMenuOpen(false);
                    }}
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
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6"
            >
              {renderSection()}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
} 