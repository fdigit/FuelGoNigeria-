import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Overview from './sections/Overview';
import OrderFuel from './sections/OrderFuel';
import LiveTracking from './sections/LiveTracking';
import OrderHistory from './sections/OrderHistory';
import EmergencyRequest from './sections/EmergencyRequest';
import RateReview from './sections/RateReview';
import ProfileManagement from './sections/ProfileManagement';
import NotificationsCenter from './sections/NotificationsCenter';
import Wallet from './sections/Wallet';
import { useAuth } from '../../contexts/AuthContext';

export default function CustomerDashboard() {
  const { logout } = useAuth();
  const [activeSection, setActiveSection] = useState('overview');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const sections = {
    overview: <Overview />,
    order: <OrderFuel />,
    tracking: <LiveTracking />,
    history: <OrderHistory />,
    emergency: <EmergencyRequest />,
    rate: <RateReview />,
    profile: <ProfileManagement />,
    notifications: <NotificationsCenter />,
    wallet: <Wallet />
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
          {/* Sidebar Navigation */}
          <div className={`lg:w-64 ${isMobileMenuOpen ? 'block' : 'hidden'} lg:block`}>
            <nav className="space-y-1 bg-white dark:bg-gray-800 rounded-lg shadow p-4">
              {[
                { id: 'overview', label: 'Overview', icon: '📊' },
                { id: 'order', label: 'Order Fuel', icon: '⛽' },
                { id: 'tracking', label: 'Live Tracking', icon: '📍' },
                { id: 'history', label: 'Order History', icon: '📋' },
                { id: 'emergency', label: 'Emergency', icon: '🚨' },
                { id: 'rate', label: 'Rate & Review', icon: '⭐' },
                { id: 'profile', label: 'Profile', icon: '👤' },
                { id: 'notifications', label: 'Notifications', icon: '🔔' },
                { id: 'wallet', label: 'Wallet', icon: '💰' }
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveSection(item.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                    activeSection === item.id
                      ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-100'
                      : 'text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700'
                  }`}
                >
                  <span className="mr-3">{item.icon}</span>
                  {item.label}
                </button>
              ))}
            </nav>
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
              {sections[activeSection as keyof typeof sections]}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
} 