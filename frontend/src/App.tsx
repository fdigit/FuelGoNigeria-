import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ChakraProvider } from '@chakra-ui/react';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import CustomerDashboard from './pages/dashboard/CustomerDashboard';
import AdminDashboard from './components/admin/AdminDashboard';
import DriverDashboard from './pages/dashboard/DriverDashboard';
import VendorDashboard from './pages/dashboard/VendorDashboard';
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

// Mock data for vendors
const mockVendors: Vendor[] = [
  {
    id: '1',
    name: 'Quick Fuel Station',
    location: {
      city: 'Lagos',
      address: 'Victoria Island'
    },
    rating: 4.5,
    fuelTypes: [
      { type: 'Petrol (PMS)', price: 650 },
      { type: 'Diesel (AGO)', price: 680 }
    ],
    deliveryTime: 'Within 30 mins',
    isTopVendor: true,
    isFastDelivery: true,
    hasHotPrice: true,
    reviews: [
      {
        id: '1',
        rating: 5,
        comment: 'Fast delivery and great service!',
        userName: 'John D.'
      },
      {
        id: '2',
        rating: 4,
        comment: 'Good prices and reliable delivery.',
        userName: 'Sarah M.'
      }
    ]
  }
];

function HomePage() {
  const [vendors, setVendors] = useState(mockVendors);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLocation, setSelectedLocation] = useState('');
  const { showToast } = useToast();

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const handleLocationSelect = (location: string) => {
    setSelectedLocation(location);
    showToast('info', `Showing vendors in ${location}`);
  };

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
              ) : (
                // Show actual vendor cards
                vendors.map((vendor) => (
                  <VendorCard
                    key={vendor.id}
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
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Layout><HomePage /></Layout>} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Protected routes */}
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute roles={['customer']}>
                    <Layout><CustomerDashboard /></Layout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/*" 
                element={
                  <ProtectedRoute roles={['admin']}>
                    <Layout><AdminDashboard /></Layout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/driver" 
                element={
                  <ProtectedRoute roles={['driver']}>
                    <Layout><DriverDashboard /></Layout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/vendor" 
                element={
                  <ProtectedRoute roles={['vendor']}>
                    <Layout><VendorDashboard /></Layout>
                  </ProtectedRoute>
                } 
              />

              {/* Catch all route */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Router>
        </ToastProvider>
      </AuthProvider>
    </ChakraProvider>
  );
}

export default App;
