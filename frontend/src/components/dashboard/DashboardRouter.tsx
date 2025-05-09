import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import CustomerDashboard from '../../pages/dashboard/CustomerDashboard';
import AdminDashboard from '../../pages/admin/AdminDashboard';
import DriverDashboard from '../../pages/dashboard/DriverDashboard';
import VendorDashboard from '../../pages/dashboard/VendorDashboard';

export default function DashboardRouter() {
  const { user } = useAuth();

  switch (user?.role) {
    case 'admin':
      return <AdminDashboard />;
    case 'driver':
      return <DriverDashboard />;
    case 'vendor':
      return <VendorDashboard />;
    default:
      return <CustomerDashboard />;
  }
} 