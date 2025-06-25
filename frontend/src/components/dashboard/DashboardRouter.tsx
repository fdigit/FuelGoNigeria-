import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import CustomerDashboard from '../../pages/dashboard/CustomerDashboard';
import AdminDashboard from '../../pages/admin/AdminDashboard';
import DriverDashboard from '../../pages/dashboard/DriverDashboard';
import VendorDashboard from '../../pages/dashboard/VendorDashboard';

export default function DashboardRouter() {
  const { user } = useAuth();

  // Use role directly since we now use uppercase values consistently
  const userRole = user?.role;

  switch (userRole) {
    case 'ADMIN':
      return <AdminDashboard />;
    case 'DRIVER':
      return <DriverDashboard />;
    case 'VENDOR':
      return <VendorDashboard />;
    default:
      return <CustomerDashboard />;
  }
} 