import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useToast } from '../../../contexts/ToastContext';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { API_URL } from '../../../config';

interface Product {
  _id: string;
  name: string;
  type: 'PMS' | 'Diesel' | 'Kerosene' | 'Gas';
  description: string;
  price_per_unit: number;
  unit: 'litre' | 'kg';
  available_qty: number;
  min_order_qty: number;
  max_order_qty: number;
  status: 'available' | 'out_of_stock' | 'discontinued';
  specifications?: {
    octane_rating?: number;
    cetane_number?: number;
    flash_point?: number;
    pressure?: number;
  };
}

interface ProductFormData {
  name: string;
  type: 'PMS' | 'Diesel' | 'Kerosene' | 'Gas';
  description: string;
  price_per_unit: number;
  min_order_qty: number;
  max_order_qty: number;
  available_qty: number;
  specifications?: {
    octane_rating?: number;
    cetane_number?: number;
    flash_point?: number;
    pressure?: number;
  };
}

export default function ProductManagement() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    type: 'PMS',
    description: '',
    price_per_unit: 0,
    min_order_qty: 1,
    max_order_qty: 100,
    available_qty: 0,
  });
  const { showToast } = useToast();

  const fetchProducts = useCallback(async () => {
    try {
      setIsLoading(true);
      const storedUser = localStorage.getItem('user');
      
      // More detailed debug logging
      console.log('Stored user data:', {
        exists: !!storedUser,
        data: storedUser ? JSON.parse(storedUser) : null
      });
      
      if (!storedUser) {
        console.log('No user data found in localStorage');
        showToast('error', 'Authentication required. Please login.');
        setProducts([]);
        return;
      }

      const userData = JSON.parse(storedUser);
      const token = userData.token;

      if (!token) {
        console.log('No token found in user data');
        showToast('error', 'Authentication required. Please login.');
        setProducts([]);
        return;
      }

      // Format token with Bearer prefix if needed
      const authToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
      console.log('Using auth token:', authToken.substring(0, 15) + '...');
      console.log('Making API request to:', `${API_URL}/api/vendor/products`);

      const response = await fetch(`${API_URL}/api/vendor/products`, {
        headers: {
          'Authorization': authToken,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      // Log response details
      console.log('API Response:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries())
      });

      if (response.status === 401) {
        console.log('Received 401, clearing user data');
        localStorage.removeItem('user');
        showToast('error', 'Session expired. Please login again.');
        setProducts([]);
        return;
      }

      if (!response.ok) {
        const errorData = await response.text();
        console.error('API Error Response:', errorData);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorData}`);
      }

      const data = await response.json();
      console.log('API Response data:', data);
      
      if (Array.isArray(data)) {
        setProducts(data);
      } else {
        console.error('API response is not an array:', data);
        setProducts([]);
        showToast('error', 'Invalid data format received from server');
      }
    } catch (error: unknown) {
      console.error('Error fetching products:', error);
      setProducts([]);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      showToast('error', `Failed to fetch products: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSpecificationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      specifications: {
        ...prev.specifications,
        [name]: Number(value)
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const storedUser = localStorage.getItem('user');
      
      if (!storedUser) {
        showToast('error', 'Authentication required. Please login.');
        return;
      }

      const userData = JSON.parse(storedUser);
      const token = userData.token;

      if (!token) {
        showToast('error', 'Authentication required. Please login.');
        return;
      }

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      console.log('Submitting product data:', formData);
      console.log('Using headers:', headers);

      if (editingProduct) {
        console.log('Updating product:', editingProduct._id);
        const response = await fetch(`${API_URL}/api/vendor/products/${editingProduct._id}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify(formData),
          credentials: 'include'
        });

        console.log('Update response:', {
          status: response.status,
          statusText: response.statusText
        });

        if (response.status === 401) {
          localStorage.removeItem('user');
          showToast('error', 'Session expired. Please login again.');
          return;
        }

        if (!response.ok) {
          const errorData = await response.text();
          console.error('Update Error Response:', errorData);
          throw new Error(`HTTP error! status: ${response.status}, message: ${errorData}`);
        }

        showToast('success', 'Product updated successfully');
      } else {
        console.log('Creating new product');
        const response = await fetch(`${API_URL}/api/vendor/products`, {
          method: 'POST',
          headers,
          body: JSON.stringify(formData),
          credentials: 'include'
        });

        console.log('Create response:', {
          status: response.status,
          statusText: response.statusText
        });

        if (response.status === 401) {
          localStorage.removeItem('user');
          showToast('error', 'Session expired. Please login again.');
          return;
        }

        if (!response.ok) {
          const errorData = await response.text();
          console.error('Create Error Response:', errorData);
          throw new Error(`HTTP error! status: ${response.status}, message: ${errorData}`);
        }

        showToast('success', 'Product added successfully');
      }
      
      setIsAddingProduct(false);
      setEditingProduct(null);
      setFormData({
        name: '',
        type: 'PMS',
        description: '',
        price_per_unit: 0,
        min_order_qty: 1,
        max_order_qty: 100,
        available_qty: 0,
      });
      fetchProducts();
    } catch (error: unknown) {
      console.error('Error saving product:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      showToast('error', `Failed to save product: ${errorMessage}`);
    }
  };

  const handleEdit = (product: Product) => {
    console.log('Editing product:', product);
    setEditingProduct(product);
    setFormData({
      name: product.name,
      type: product.type,
      description: product.description,
      price_per_unit: product.price_per_unit,
      min_order_qty: product.min_order_qty,
      max_order_qty: product.max_order_qty,
      available_qty: product.available_qty,
      specifications: product.specifications
    });
    setIsAddingProduct(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        const storedUser = localStorage.getItem('user');
        
        if (!storedUser) {
          showToast('error', 'Authentication required. Please login.');
          return;
        }

        const userData = JSON.parse(storedUser);
        const token = userData.token;

        if (!token) {
          showToast('error', 'Authentication required. Please login.');
          return;
        }

        const response = await fetch(`${API_URL}/api/vendor/products/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        });

        if (response.status === 401) {
          localStorage.removeItem('user');
          showToast('error', 'Session expired. Please login again.');
          return;
        }

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        showToast('success', 'Product deleted successfully');
        fetchProducts();
      } catch (error) {
        console.error('Error deleting product:', error);
        showToast('error', 'Failed to delete product. Please try again later.');
      }
    }
  };

  const renderSpecificationFields = () => {
    switch (formData.type) {
      case 'PMS':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Octane Rating
              </label>
              <input
                type="number"
                name="octane_rating"
                value={formData.specifications?.octane_rating || ''}
                onChange={handleSpecificationChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
          </div>
        );
      case 'Diesel':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Cetane Number
              </label>
              <input
                type="number"
                name="cetane_number"
                value={formData.specifications?.cetane_number || ''}
                onChange={handleSpecificationChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
          </div>
        );
      case 'Kerosene':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Flash Point (°C)
              </label>
              <input
                type="number"
                name="flash_point"
                value={formData.specifications?.flash_point || ''}
                onChange={handleSpecificationChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
          </div>
        );
      case 'Gas':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Pressure (PSI)
              </label>
              <input
                type="number"
                name="pressure"
                value={formData.specifications?.pressure || ''}
                onChange={handleSpecificationChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  // Add useEffect to check authentication on component mount
  useEffect(() => {
    const checkAuth = () => {
      const storedUser = localStorage.getItem('user');
      console.log('Initial auth check:', {
        hasUser: !!storedUser,
        userData: storedUser ? JSON.parse(storedUser) : null
      });
      
      if (!storedUser) {
        showToast('error', 'Please login to access this feature');
      } else {
        // If we have user data, try to fetch products
        fetchProducts();
      }
    };

    checkAuth();
  }, [fetchProducts]); // Add fetchProducts as dependency

  return (
    <div className="space-y-6">
      {/* Add loading state */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
        </div>
      ) : (
        <>
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Product Management
            </h2>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setIsAddingProduct(true);
                setEditingProduct(null);
                setFormData({
                  name: '',
                  type: 'PMS',
                  description: '',
                  price_per_unit: 0,
                  min_order_qty: 1,
                  max_order_qty: 100,
                  available_qty: 0,
                });
              }}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Add Product
            </motion.button>
          </div>

          {isAddingProduct && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow p-6"
            >
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Product Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Product Type
                    </label>
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleInputChange}
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    >
                      <option value="PMS">Premium Motor Spirit (PMS)</option>
                      <option value="Diesel">Diesel</option>
                      <option value="Kerosene">Kerosene</option>
                      <option value="Gas">Gas</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Price per {formData.type === 'Gas' ? 'kg' : 'litre'}
                    </label>
                    <input
                      type="number"
                      name="price_per_unit"
                      value={formData.price_per_unit}
                      onChange={handleInputChange}
                      required
                      min="0"
                      step="0.01"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      required
                      rows={3}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Minimum Order Quantity
                    </label>
                    <input
                      type="number"
                      name="min_order_qty"
                      value={formData.min_order_qty}
                      onChange={handleInputChange}
                      required
                      min="1"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Maximum Order Quantity
                    </label>
                    <input
                      type="number"
                      name="max_order_qty"
                      value={formData.max_order_qty}
                      onChange={handleInputChange}
                      required
                      min="1"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Available Quantity
                    </label>
                    <input
                      type="number"
                      name="available_qty"
                      value={formData.available_qty}
                      onChange={handleInputChange}
                      required
                      min="0"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                </div>

                {renderSpecificationFields()}

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingProduct(false);
                      setEditingProduct(null);
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    {editingProduct ? 'Update Product' : 'Add Product'}
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Type
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
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {products.map((product) => (
                    <tr key={product._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {product.name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {product.description}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                          {product.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                        ₦{product.price_per_unit.toLocaleString()}/{product.unit}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                        {product.available_qty.toLocaleString()} {product.unit}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            product.status === 'available'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : product.status === 'out_of_stock'
                              ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                          }`}
                        >
                          {product.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleEdit(product)}
                          className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300 mr-4"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(product._id)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Stock Alerts */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Stock Alerts
            </h3>
            <div className="space-y-4">
              {products.map((product) => (
                <div key={product._id} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-700 dark:text-gray-300">{product.name}</span>
                    <span className="text-gray-500 dark:text-gray-400">
                      {product.available_qty} {product.unit}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        product.available_qty < 1000
                          ? 'bg-red-600'
                          : product.available_qty < 2000
                          ? 'bg-yellow-600'
                          : 'bg-green-600'
                      }`}
                      style={{ width: `${(product.available_qty / 5000) * 100}%` }}
                    />
                  </div>
                  {product.available_qty < 1000 && (
                    <p className="text-sm text-red-600 dark:text-red-400">
                      Low stock alert! Please restock soon.
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
} 