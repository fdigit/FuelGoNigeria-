import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useToast } from '../../../contexts/ToastContext';

interface Delivery {
  id: string;
  customerName: string;
  address: string;
  fuelType: string;
  quantity: number;
  status: 'picked_up' | 'on_the_way' | 'delivered';
  estimatedTime: string;
  proofOfDelivery?: {
    type: 'photo' | 'signature';
    url: string;
    timestamp: string;
  };
}

export default function DeliveryStatus() {
  const [deliveries, setDeliveries] = useState<Delivery[]>([
    {
      id: 'DEL001',
      customerName: 'John Doe',
      address: '123 Main Street, Lagos',
      fuelType: 'Premium (PMS)',
      quantity: 50,
      status: 'picked_up',
      estimatedTime: '15 minutes',
    },
    {
      id: 'DEL002',
      customerName: 'Jane Smith',
      address: '456 Park Avenue, Lagos',
      fuelType: 'Diesel (AGO)',
      quantity: 75,
      status: 'on_the_way',
      estimatedTime: '25 minutes',
    },
  ]);

  const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const { showToast } = useToast();

  const handleStatusChange = (deliveryId: string, newStatus: Delivery['status']) => {
    setDeliveries(prev =>
      prev.map(delivery =>
        delivery.id === deliveryId ? { ...delivery, status: newStatus } : delivery
      )
    );
    showToast('success', `Delivery status updated to ${newStatus.replace('_', ' ')}`);
  };

  const handleUploadProof = (deliveryId: string, type: 'photo' | 'signature') => {
    // In a real app, this would handle file upload or signature capture
    const proof = {
      type,
      url: type === 'photo' ? 'https://example.com/photo.jpg' : 'https://example.com/signature.png',
      timestamp: new Date().toISOString(),
    };

    setDeliveries(prev =>
      prev.map(delivery =>
        delivery.id === deliveryId
          ? { ...delivery, proofOfDelivery: proof }
          : delivery
      )
    );
    setShowUploadModal(false);
    showToast('success', 'Proof of delivery uploaded successfully');
  };

  const getStatusColor = (status: Delivery['status']) => {
    switch (status) {
      case 'picked_up':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'on_the_way':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'delivered':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
        Delivery Status
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {deliveries.map((delivery) => (
          <div
            key={delivery.id}
            className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden"
          >
            <div className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    {delivery.customerName}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {delivery.address}
                  </p>
                </div>
                <span
                  className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                    delivery.status
                  )}`}
                >
                  {delivery.status.replace('_', ' ').toUpperCase()}
                </span>
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
              </div>

              {delivery.proofOfDelivery && (
                <div className="mt-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Proof of Delivery
                  </p>
                  <div className="mt-2 flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {delivery.proofOfDelivery.type === 'photo' ? '📸' : '✍️'}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date(delivery.proofOfDelivery.timestamp).toLocaleString()}
                    </span>
                  </div>
                </div>
              )}

              <div className="mt-6 space-y-3">
                <select
                  value={delivery.status}
                  onChange={(e) =>
                    handleStatusChange(delivery.id, e.target.value as Delivery['status'])
                  }
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="picked_up">Picked Up</option>
                  <option value="on_the_way">On The Way</option>
                  <option value="delivered">Delivered</option>
                </select>

                {delivery.status === 'delivered' && !delivery.proofOfDelivery && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setSelectedDelivery(delivery);
                      setShowUploadModal(true);
                    }}
                    className="w-full px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                  >
                    Upload Proof of Delivery
                  </motion.button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Upload Modal */}
      {showUploadModal && selectedDelivery && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Upload Proof of Delivery
            </h3>
            <div className="space-y-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleUploadProof(selectedDelivery.id, 'photo')}
                className="w-full px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              >
                Take Photo
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleUploadProof(selectedDelivery.id, 'signature')}
                className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              >
                Get Signature
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowUploadModal(false)}
                className="w-full px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              >
                Cancel
              </motion.button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 