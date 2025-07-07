import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import VendorGrid from '../components/vendors/VendorGrid';
import FilterBar from '../components/vendors/FilterBar';
import { useToast } from '../contexts/ToastContext';
import { vendorService } from '../services/api';
import type { Vendor } from '../types';
import Footer from '../components/layout/Footer';

export default function Vendors() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    loadVendors();
  }, []);

  const loadVendors = async () => {
    try {
      setIsLoading(true);
      console.log('Loading vendors...');
      const vendorsData = await vendorService.getVendors();
      console.log('Vendors loaded:', vendorsData);
      setVendors(vendorsData);
    } catch (error) {
      console.error('Error loading vendors:', error);
      showToast('error', 'Failed to load vendors');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (filters: any) => {
    // Implement filter logic here
    console.log('Filters changed:', filters);
  };

  const handleReset = () => {
    loadVendors();
    showToast('info', 'Filters have been reset');
  };

  const handleShowNearby = () => {
    showToast('info', 'Showing vendors near your location');
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
            />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
} 