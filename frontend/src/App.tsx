import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ChakraProvider } from '@chakra-ui/react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import DashboardRouter from './components/dashboard/DashboardRouter';
import Profile from './pages/dashboard/Profile';
import { ToastProvider } from './contexts/ToastContext';
import Navbar from './components/layout/Navbar';
import Hero from './components/home/Hero';
import FilterBar from './components/vendors/FilterBar';
import VendorCard from './components/vendors/VendorCard';
import VendorCardSkeleton from './components/vendors/VendorCardSkeleton';
import { useToast } from './contexts/ToastContext';
import type { Vendor } from './types';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import theme from './theme';
import { vendorService } from './services/api';

function HomePage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLocation, setSelectedLocation] = useState('');
  const { showToast } = useToast();

  useEffect(() => {
    const fetchVendors = async () => {
      try {
        const data = await vendorService.getVendors();
        setVendors(data);
      } catch (error) {
        console.error('Error fetching vendors:', error);
        showToast('error', 'Failed to load vendors. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchVendors();
  }, []);

  const handleLocationSelect = (location: string) => {
    // Only update if the location has changed
    if (location !== selectedLocation) {
      setSelectedLocation(location);
      showToast('info', `Showing vendors in ${location}`);
    }
  };

  const handleFilterChange = (filters: any) => {
    // Implement filter logic here
    console.log('Filters changed:', filters);
  };

  const handleReset = async () => {
    setIsLoading(true);
    try {
      const data = await vendorService.getVendors();
      setVendors(data);
      showToast('info', 'Filters have been reset');
    } catch (error) {
      console.error('Error resetting vendors:', error);
      showToast('error', 'Failed to reset vendors. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleShowNearby = () => {
    showToast('info', 'Showing vendors near your location');
  };

  const handleOrder = (vendorId: string) => {
    showToast('success', 'Order request sent successfully!');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar onSearch={() => {}} onLocationSelect={handleLocationSelect} />
      <Hero onLocationSelect={handleLocationSelect} />
      
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {isLoading ? (
                // Show skeleton loaders while loading
                Array.from({ length: 6 }).map((_, index) => (
                  <VendorCardSkeleton key={index} />
                ))
              ) : vendors.length === 0 ? (
                // Show message when no vendors are found
                <div className="col-span-full text-center py-12">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    No vendors found
                  </h3>
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    Try adjusting your filters or search criteria
                  </p>
                </div>
              ) : (
                // Show actual vendor cards
                vendors.map((vendor) => (
                  <VendorCard
                    key={vendor._id}
                    vendor={vendor}
                    onOrder={handleOrder}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Layout><HomePage /></Layout>} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected routes */}
      <Route 
        path="/dashboard/*" 
        element={
          <ProtectedRoute roles={['CUSTOMER', 'ADMIN', 'DRIVER', 'VENDOR']}>
            <Layout>
              <Routes>
                <Route index element={<DashboardRouter />} />
                <Route path="profile" element={<Profile />} />
              </Routes>
            </Layout>
          </ProtectedRoute>
        } 
      />

      {/* Catch all route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <ChakraProvider theme={theme}>
      <AuthProvider>
        <ToastProvider>
          <Router>
            <ToastContainer
              position="top-right"
              autoClose={5000}
              hideProgressBar={false}
              newestOnTop
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme="light"
            />
            <AppRoutes />
          </Router>
        </ToastProvider>
      </AuthProvider>
    </ChakraProvider>
  );
}

export default App;
