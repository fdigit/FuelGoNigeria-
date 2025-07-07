import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useToast } from '../../../contexts/ToastContext';
import driverService from '../../../services/driver.service';
import Modal from '../../../components/common/Modal';

interface Delivery {
  _id: string;
  orderId: string;
  customerName: string;
  customerPhone: string;
  address: string;
  deliveryAddress: string;
  fuelType: string;
  quantity: number;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  estimatedTime: string;
  specialInstructions?: string;
  orderItems: Array<{
    _id: string;
    productId: string;
    quantity: number;
    price: number;
    product: {
      _id: string;
      name: string;
      type: string;
      unit: string;
    };
  }>;
  totalAmount: number;
  deliveryFee: number;
  paymentStatus?: string;
  paymentMethod?: string;
  createdAt: string;
  updatedAt: string;
}

export default function AssignedDeliveries() {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [isConfirmingPayment, setIsConfirmingPayment] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string>('');
  const { showToast } = useToast();

  useEffect(() => {
    loadDeliveries();
  }, []);

  const loadDeliveries = async () => {
    setIsLoading(true);
    setDebugInfo('Loading deliveries...');
    try {
      console.log('Loading deliveries...');
      const deliveriesData = await driverService.getAssignedDeliveries();
      console.log('Deliveries data received:', deliveriesData);
      console.log('Deliveries data type:', typeof deliveriesData);
      console.log('Deliveries data length:', Array.isArray(deliveriesData) ? deliveriesData.length : 'Not an array');
      
      setDebugInfo(`API Response: ${JSON.stringify(deliveriesData, null, 2)}`);
      setDeliveries(deliveriesData);
    } catch (error) {
      console.error('Error loading deliveries:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setDebugInfo(`Error: ${errorMessage}`);
      if (error instanceof Error && error.message.includes('Failed to fetch assigned deliveries')) {
        setDeliveries([]);
      } else {
        showToast('error', 'Failed to load assigned deliveries');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartNavigation = (delivery: Delivery) => {
    // In a real app, this would open Google Maps with the destination
    const address = encodeURIComponent(delivery.deliveryAddress || delivery.address);
    window.open(`https://www.google.com/maps/search/?api=1&query=${address}`, '_blank');
    showToast('info', `Opening Google Maps for ${delivery.deliveryAddress || delivery.address}`);
  };

  const handleStartDelivery = async (deliveryId: string) => {
    try {
      await driverService.updateDeliveryStatus(deliveryId, 'in_progress');
      setDeliveries(prev =>
        prev.map(delivery =>
          delivery._id === deliveryId
            ? { ...delivery, status: 'in_progress' }
            : delivery
        )
      );
      showToast('success', 'Delivery started successfully');
    } catch (error) {
      console.error('Error starting delivery:', error);
      showToast('error', 'Failed to start delivery');
    }
  };

  const handleCompleteDelivery = async (delivery: Delivery) => {
    // For COD orders, show payment confirmation modal
    if (delivery.paymentMethod === 'CASH' && delivery.paymentStatus !== 'completed') {
      setSelectedDelivery(delivery);
      setPaymentAmount(delivery.totalAmount);
      setShowPaymentModal(true);
      return;
    }

    // For non-COD orders, complete delivery directly
    try {
      await driverService.updateDeliveryStatus(delivery._id, 'completed');
      setDeliveries(prev =>
        prev.map(d =>
          d._id === delivery._id
            ? { ...d, status: 'completed' }
            : d
        )
      );
      showToast('success', 'Delivery completed successfully');
    } catch (error) {
      console.error('Error completing delivery:', error);
      showToast('error', 'Failed to complete delivery');
    }
  };

  const handleConfirmPayment = async () => {
    if (!selectedDelivery) return;

    setIsConfirmingPayment(true);
    try {
      // First confirm payment
      await driverService.confirmPayment(selectedDelivery._id, paymentAmount, 'CASH');
      
      // Then complete delivery
      await driverService.updateDeliveryStatus(selectedDelivery._id, 'completed');
      
      // Update local state
      setDeliveries(prev =>
        prev.map(d =>
          d._id === selectedDelivery._id
            ? { 
                ...d, 
                status: 'completed',
                paymentStatus: 'completed'
              }
            : d
        )
      );
      
      showToast('success', 'Payment confirmed and delivery completed successfully');
      setShowPaymentModal(false);
      setSelectedDelivery(null);
      setPaymentAmount(0);
    } catch (error) {
      console.error('Error confirming payment:', error);
      showToast('error', 'Failed to confirm payment');
    } finally {
      setIsConfirmingPayment(false);
    }
  };

  const handleCallCustomer = (phone: string) => {
    // In a real app, this would initiate a phone call
    window.open(`tel:${phone}`, '_self');
    showToast('info', `Calling ${phone}`);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-NG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: Delivery['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getPaymentStatusColor = (paymentStatus?: string) => {
    switch (paymentStatus) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'failed':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const filteredDeliveries = deliveries.filter(delivery => {
    if (statusFilter === 'all') return true;
    return delivery.status === statusFilter;
  });

  console.log('Current deliveries state:', deliveries);
  console.log('Filtered deliveries:', filteredDeliveries);
  console.log('Status filter:', statusFilter);
  console.log('Is loading:', isLoading);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Assigned Deliveries</h2>
        </div>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Assigned Deliveries</h2>
        <div className="flex items-center space-x-4">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={loadDeliveries}
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
          >
            Refresh
          </motion.button>
        </div>
      </div>

      {filteredDeliveries.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🚚</div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Deliveries Assigned</h3>
          <p className="text-gray-600 dark:text-gray-400">You don't have any deliveries assigned at the moment.</p>
          
          {/* Debug Information */}
          {debugInfo && (
            <div className="mt-8 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Debug Info:</h4>
              <pre className="text-xs text-gray-600 dark:text-gray-400 whitespace-pre-wrap overflow-auto max-h-40">
                {debugInfo}
              </pre>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDeliveries.map((delivery) => (
            <motion.div
              key={delivery._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      {delivery.customerName}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {delivery.deliveryAddress || delivery.address}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(delivery.status)}`}>
                      {delivery.status.replace('_', ' ').toUpperCase()}
                    </span>
                    {delivery.paymentMethod === 'CASH' && (
                      <div className="mt-1">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getPaymentStatusColor(delivery.paymentStatus)}`}>
                          {delivery.paymentStatus === 'completed' ? 'PAID' : 'COD'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Fuel Type</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {delivery.fuelType}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Quantity</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {delivery.quantity}L
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Total Amount
                    </p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      ₦{delivery.totalAmount.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Delivery Fee
                    </p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      ₦{delivery.deliveryFee.toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="mt-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Customer Phone
                  </p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {delivery.customerPhone}
                  </p>
                </div>

                {delivery.specialInstructions && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Special Instructions
                    </p>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {delivery.specialInstructions}
                    </p>
                  </div>
                )}

                <div className="mt-6 space-y-3">
                  {delivery.status === 'pending' && (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleStartDelivery(delivery._id)}
                      className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
                    >
                      Start Delivery
                    </motion.button>
                  )}

                  {delivery.status === 'in_progress' && (
                    <div className="space-y-2">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleStartNavigation(delivery)}
                        className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700"
                      >
                        Start Navigation
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleCompleteDelivery(delivery)}
                        className="w-full bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700"
                      >
                        {delivery.paymentMethod === 'CASH' && delivery.paymentStatus !== 'completed' 
                          ? 'Complete & Confirm Payment' 
                          : 'Complete Delivery'
                        }
                      </motion.button>
                    </div>
                  )}

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleCallCustomer(delivery.customerPhone)}
                    className="w-full bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700"
                  >
                    Call Customer
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Payment Confirmation Modal */}
      <Modal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        title="Confirm Payment"
        size="md"
      >
        <div className="space-y-6">
          <div className="text-center">
            <div className="text-4xl mb-4">💰</div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Confirm Cash Payment
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Please confirm the payment amount received from the customer.
            </p>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Order Total:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  ₦{selectedDelivery?.totalAmount.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Payment Method:</span>
                <span className="font-medium text-gray-900 dark:text-white">Cash on Delivery</span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Amount Received (₦)
            </label>
            <input
              type="number"
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
              placeholder="Enter amount received"
            />
            {paymentAmount !== selectedDelivery?.totalAmount && paymentAmount > 0 && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                Amount must match order total (₦{selectedDelivery?.totalAmount.toLocaleString()})
              </p>
            )}
          </div>

          <div className="flex space-x-3">
            <button
              onClick={() => setShowPaymentModal(false)}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmPayment}
              disabled={isConfirmingPayment || paymentAmount !== selectedDelivery?.totalAmount}
              className="flex-1 bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isConfirmingPayment ? 'Confirming...' : 'Confirm Payment'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
} 