import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Overview from './sections/Overview';
import AssignedDeliveries from './sections/AssignedDeliveries';
import DeliveryStatus from './sections/DeliveryStatus';
import Earnings from './sections/Earnings';
import Availability from './sections/Availability';
import DriverProfile from './sections/DriverProfile';
import LiveLocation from './sections/LiveLocation';

type Section = 'overview' | 'deliveries' | 'status' | 'earnings' | 'availability' | 'profile' | 'location';

export default function DriverDashboard() {
  const [activeSection, setActiveSection] = useState<Section>('overview');

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
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      {/* Sidebar */}
      <div className="w-64 bg-white dark:bg-gray-800 shadow-lg">
        <div className="p-4">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Driver Dashboard</h1>
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