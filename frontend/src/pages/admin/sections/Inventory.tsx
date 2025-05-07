import React, { useState, ChangeEvent } from 'react';
import { motion } from 'framer-motion';
import { useToast } from '../../../contexts/ToastContext';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface FuelProduct {
  id: string;
  name: string;
  type: 'petrol' | 'diesel' | 'premium';
  price: number;
  stock: number;
  unit: 'liters';
  status: 'available' | 'low' | 'out_of_stock';
  lastUpdated: string;
}

interface StockUpdate {
  id: string;
  productId: string;
  quantity: number;
  type: 'add' | 'remove';
  reason: string;
  timestamp: string;
  performedBy: string;
}

export default function Inventory() {
  const { showToast } = useToast();
  const [products, setProducts] = useState<FuelProduct[]>([
    {
      id: '1',
      name: 'Regular Petrol',
      type: 'petrol',
      price: 650,
      stock: 5000,
      unit: 'liters',
      status: 'available',
      lastUpdated: '2024-03-01T10:00:00Z',
    },
    {
      id: '2',
      name: 'Premium Petrol',
      type: 'premium',
      price: 700,
      stock: 3000,
      unit: 'liters',
      status: 'available',
      lastUpdated: '2024-03-01T10:00:00Z',
    },
    {
      id: '3',
      name: 'Diesel',
      type: 'diesel',
      price: 680,
      stock: 200,
      unit: 'liters',
      status: 'low',
      lastUpdated: '2024-03-01T10:00:00Z',
    },
  ]);

  const [stockUpdates, setStockUpdates] = useState<StockUpdate[]>([
    {
      id: '1',
      productId: '1',
      quantity: 1000,
      type: 'add',
      reason: 'Regular stock replenishment',
      timestamp: '2024-03-01T09:00:00Z',
      performedBy: 'Admin User',
    },
    {
      id: '2',
      productId: '2',
      quantity: 500,
      type: 'remove',
      reason: 'Customer order #12345',
      timestamp: '2024-03-01T10:30:00Z',
      performedBy: 'System',
    },
  ]);

  const [selectedProduct, setSelectedProduct] = useState<FuelProduct | null>(null);
  const [isUpdatingStock, setIsUpdatingStock] = useState(false);
  const [updateData, setUpdateData] = useState({
    quantity: 0,
    type: 'add' as 'add' | 'remove',
    reason: '',
  });

  const handleUpdateStock = (product: FuelProduct) => {
    setSelectedProduct(product);
    setIsUpdatingStock(true);
    setUpdateData({
      quantity: 0,
      type: 'add',
      reason: '',
    });
  };

  const handleSubmitStockUpdate = () => {
    if (!selectedProduct) return;

    const newStock = updateData.type === 'add'
      ? selectedProduct.stock + updateData.quantity
      : selectedProduct.stock - updateData.quantity;

    if (newStock < 0) {
      showToast('Insufficient stock for removal' as ToastType, 'error');
      return;
    }

    const updatedProduct: FuelProduct = {
      ...selectedProduct,
      stock: newStock,
      status: newStock === 0
        ? 'out_of_stock'
        : newStock < 500
        ? 'low'
        : 'available',
      lastUpdated: new Date().toISOString(),
    };

    const newUpdate: StockUpdate = {
      id: Date.now().toString(),
      productId: selectedProduct.id,
      quantity: updateData.quantity,
      type: updateData.type,
      reason: updateData.reason,
      timestamp: new Date().toISOString(),
      performedBy: 'Admin User', // This would come from the auth context
    };

    setProducts(products.map(p => p.id === selectedProduct.id ? updatedProduct : p));
    setStockUpdates([newUpdate, ...stockUpdates]);
    setIsUpdatingStock(false);
    setSelectedProduct(null);
    showToast('Stock updated successfully' as ToastType, 'success');
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('en-NG', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(dateString));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Inventory Management</h2>
      </div>

      {/* Products Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Product
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Price
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Stock
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Last Updated
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {products.map((product) => (
              <tr key={product.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {product.name}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                    {product.type}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                  ₦{product.price.toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                  {product.stock.toLocaleString()} {product.unit}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      product.status === 'available'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : product.status === 'low'
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    }`}
                  >
                    {product.status.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                  {formatDate(product.lastUpdated)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => handleUpdateStock(product)}
                    className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    Update Stock
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Stock Updates History */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Stock Update History
        </h3>
        <div className="space-y-4">
          {stockUpdates.map((update) => {
            const product = products.find(p => p.id === update.productId);
            return (
              <div
                key={update.id}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {product?.name}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {update.type === 'add' ? 'Added' : 'Removed'} {update.quantity} {product?.unit}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Reason: {update.reason}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {formatDate(update.timestamp)}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    By: {update.performedBy}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Update Stock Modal */}
      {isUpdatingStock && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Update Stock - {selectedProduct.name}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Current Stock
                </label>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {selectedProduct.stock.toLocaleString()} {selectedProduct.unit}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Update Type
                </label>
                <select
                  value={updateData.type}
                  onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                    setUpdateData(prev => ({ ...prev, type: e.target.value as 'add' | 'remove' }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="add">Add Stock</option>
                  <option value="remove">Remove Stock</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Quantity ({selectedProduct.unit})
                </label>
                <input
                  type="number"
                  value={updateData.quantity}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setUpdateData(prev => ({ ...prev, quantity: parseInt(e.target.value) }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Reason
                </label>
                <textarea
                  value={updateData.reason}
                  onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                    setUpdateData(prev => ({ ...prev, reason: e.target.value }))}
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setIsUpdatingStock(false);
                  setSelectedProduct(null);
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitStockUpdate}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                Update Stock
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 