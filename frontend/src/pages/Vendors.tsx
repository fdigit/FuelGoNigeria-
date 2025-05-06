import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { mockVendors } from '../data/mockData';
import VendorGrid from '../components/vendors/VendorGrid';
import FilterBar from '../components/vendors/FilterBar';
import { useToast } from '../contexts/ToastContext';
import type { Vendor } from '../types';
import Footer from '../components/layout/Footer';

export default function Vendors() {
  const [vendors, setVendors] = useState<Vendor[]>(mockVendors);
  const [isLoading, setIsLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const handleFilterChange = (filters: any) => {
    // Implement filter logic here
    console.log('Filters changed:', filters);
  };

  const handleReset = () => {
    setVendors(mockVendors);
    showToast('info', 'Filters have been reset');
  };

  const handleShowNearby = () => {
    showToast('info', 'Showing vendors near your location');
  };

  const handleOrder = (vendorId: string) => {
    showToast('success', 'Order request sent successfully!');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold text-gray-900"
          >
            All Vendors
          </motion.h1>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="lg:w-64">
            <FilterBar
              onFilterChange={handleFilterChange}
              onReset={handleReset}
              onShowNearby={handleShowNearby}
            />
          </div>

          {/* Vendor Grid */}
          <div className="flex-1">
            <VendorGrid 
              vendors={vendors} 
              isLoading={isLoading}
              onOrder={handleOrder}
            />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
} 