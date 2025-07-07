import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { useToast } from '../../../contexts/ToastContext';
import { useAuth } from '../../../contexts/AuthContext';
import { orderService } from '../../../services/order.service';
import { vendorService } from '../../../services/api';
import { Vendor, Product, CreateOrderRequest, OrderSummary, Address } from '../../../types';

interface OrderFormData {
  vendorId: string;
  deliveryAddress: string;
  useCurrentLocation: boolean;
  phoneNumber: string;
  specialInstructions?: string;
  paymentMethod: string;
}

interface CartItem {
  product: Product;
  quantity: number;
}

export default function OrderFuel() {
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<OrderFormData>();
  const { showToast } = useToast();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [vendorProducts, setVendorProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orderSummary, setOrderSummary] = useState<OrderSummary | null>(null);
  const [currentStep, setCurrentStep] = useState<'vendor' | 'products' | 'delivery' | 'summary'>('vendor');
  const [useCurrentLocation, setUseCurrentLocation] = useState(false);

  // Load vendors on component mount
  useEffect(() => {
    loadVendors();
  }, []);

  // Load vendor products when vendor is selected
  useEffect(() => {
    if (selectedVendor) {
      loadVendorProducts(selectedVendor._id);
    }
  }, [selectedVendor]);

  // Calculate order summary when cart changes
  useEffect(() => {
    if (selectedVendor && cart.length > 0) {
      calculateOrderSummary();
    }
  }, [cart, selectedVendor]);

  const loadVendors = async () => {
    try {
      const vendorsData = await vendorService.getVendors();
      setVendors(vendorsData);
    } catch (error) {
      showToast('error', 'Failed to load vendors');
    }
  };

  const loadVendorProducts = async (vendorId: string) => {
    try {
      const products = await orderService.getVendorProducts(vendorId);
      setVendorProducts(products);
    } catch (error) {
      showToast('error', 'Failed to load vendor products');
    }
  };

  const calculateOrderSummary = async () => {
    try {
      const orderItems = cart.map(item => ({
        productId: item.product._id,
        quantity: item.quantity
      }));

      const summary = await orderService.getOrderSummary(selectedVendor!._id, orderItems);
      setOrderSummary(summary);
    } catch (error) {
      showToast('error', 'Failed to calculate order summary');
    }
  };

  const handleVendorSelect = (vendor: Vendor) => {
    setSelectedVendor(vendor);
    setCart([]);
    setOrderSummary(null);
    setCurrentStep('products');
  };

  const handleAddToCart = (product: Product, quantity: number) => {
    if (quantity <= 0) return;

    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.product._id === product._id);
      if (existingItem) {
        return prevCart.map(item =>
          item.product._id === product._id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        return [...prevCart, { product, quantity }];
      }
    });
  };

  const handleUpdateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      setCart(prevCart => prevCart.filter(item => item.product._id !== productId));
    } else {
      setCart(prevCart =>
        prevCart.map(item =>
          item.product._id === productId ? { ...item, quantity } : item
        )
      );
    }
  };

  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setValue('deliveryAddress', 'Current Location');
          setUseCurrentLocation(true);
          showToast('success', 'Location captured successfully');
        },
        (error) => {
          showToast('error', 'Failed to get your location. Please enter address manually.');
        }
      );
    } else {
      showToast('error', 'Geolocation is not supported by your browser.');
    }
  };

  const handleProceedToDelivery = () => {
    if (cart.length === 0) {
      showToast('error', 'Please add at least one product to your cart');
      return;
    }
    setCurrentStep('delivery');
  };

  const handleProceedToSummary = () => {
    if (!watch('deliveryAddress') && !useCurrentLocation) {
      showToast('error', 'Please enter delivery address or use current location');
      return;
    }
    setCurrentStep('summary');
  };

  const onSubmit = async (data: OrderFormData) => {
    if (!selectedVendor || cart.length === 0) {
      showToast('error', 'Please select a vendor and add products to cart');
      return;
    }

    setIsLoading(true);
    try {
      const orderData: CreateOrderRequest = {
        vendorId: selectedVendor._id,
        orderItems: cart.map(item => ({
          productId: item.product._id,
          quantity: item.quantity
        })),
        deliveryAddress: {
          street: useCurrentLocation ? undefined : data.deliveryAddress,
          city: selectedVendor.address?.city || '',
          state: selectedVendor.address?.state || '',
          country: selectedVendor.address?.country || 'Nigeria',
          coordinates: useCurrentLocation ? undefined : undefined
        },
        phoneNumber: data.phoneNumber,
        paymentMethod: data.paymentMethod,
        specialInstructions: data.specialInstructions
      };

      const order = await orderService.createOrder(orderData);
      showToast('success', `Order placed successfully! Order ID: ${order._id}`);
      
      // Reset form and cart
      setCart([]);
      setOrderSummary(null);
      setSelectedVendor(null);
      setCurrentStep('vendor');
      setValue('deliveryAddress', '');
      setValue('phoneNumber', '');
      setValue('specialInstructions', '');
      setValue('paymentMethod', '');
      setUseCurrentLocation(false);
    } catch (error: any) {
      showToast('error', error.response?.data?.message || 'Failed to place order');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'out_of_stock':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const renderVendorSelection = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white">Select a Vendor</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {vendors.map((vendor) => (
          <motion.div
            key={vendor._id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`p-4 border rounded-lg cursor-pointer transition-colors ${
              selectedVendor?._id === vendor._id
                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900'
                : 'border-gray-200 dark:border-gray-700 hover:border-primary-300'
            }`}
            onClick={() => handleVendorSelect(vendor)}
          >
            <div className="flex items-center space-x-3">
              {vendor.logo && (
                <img
                  src={vendor.logo}
                  alt={vendor.business_name}
                  className="w-12 h-12 rounded-full object-cover"
                />
              )}
              <div className="flex-1">
                <h4 className="font-medium text-gray-900 dark:text-white">
                  {vendor.business_name}
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {vendor.address?.city}, {vendor.address?.state}
                </p>
                <div className="flex items-center mt-1">
                  <span className="text-yellow-400">★</span>
                  <span className="text-sm text-gray-600 dark:text-gray-400 ml-1">
                    {vendor.average_rating || 0} ({vendor.total_ratings || 0} reviews)
                  </span>
                </div>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-1">
              {vendor.fuel_types && vendor.fuel_types.map((type) => (
                <span
                  key={type}
                  className="px-2 py-1 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded"
                >
                  {type}
                </span>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );

  const renderProductSelection = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          Select Products - {selectedVendor?.business_name}
        </h3>
        <button
          onClick={() => setCurrentStep('vendor')}
          className="text-primary-600 hover:text-primary-700 dark:text-primary-400"
        >
          Change Vendor
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {vendorProducts.map((product) => (
          <div
            key={product._id}
            className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
          >
            <div className="flex justify-between items-start mb-3">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">{product.name}</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">{product.description}</p>
              </div>
              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(product.status)}`}>
                {product.status?.replace('_', ' ').toUpperCase() || 'UNKNOWN'}
              </span>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Price:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  ₦{(product.price_per_unit || 0).toLocaleString()}/{product.unit}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Available:</span>
                <span className="text-gray-900 dark:text-white">
                  {product.available_qty || 0} {product.unit}
                </span>
              </div>
            </div>

            {product.status === 'available' && (
              <div className="mt-3 flex items-center space-x-2">
                <input
                  type="number"
                  min={product.min_order_qty || 1}
                  max={product.available_qty || 0}
                  step="1"
                  placeholder="Qty"
                  className="w-20 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm dark:bg-gray-700 dark:text-white"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      const quantity = parseInt(e.currentTarget.value);
                      if (quantity > 0) {
                        handleAddToCart(product, quantity);
                        e.currentTarget.value = '';
                      }
                    }
                  }}
                />
                <button
                  onClick={() => {
                    const input = document.querySelector(`input[placeholder="Qty"]`) as HTMLInputElement;
                    const quantity = parseInt(input?.value || '1');
                    if (quantity > 0) {
                      handleAddToCart(product, quantity);
                      input.value = '';
                    }
                  }}
                  className="px-3 py-1 bg-primary-600 text-white text-sm rounded hover:bg-primary-700"
                >
                  Add
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {cart.length > 0 && (
        <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <h4 className="font-medium text-gray-900 dark:text-white mb-3">Cart ({cart.length} items)</h4>
          <div className="space-y-2">
            {cart.map((item) => (
              <div key={item.product._id} className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {item.product.name}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
                    ₦{(item.product.price_per_unit || 0).toLocaleString()}/{item.product.unit}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    min="1"
                    max={item.product.available_qty || 0}
                    value={item.quantity}
                    onChange={(e) => handleUpdateCartQuantity(item.product._id, parseInt(e.target.value))}
                    className="w-16 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm dark:bg-gray-700 dark:text-white"
                  />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    ₦{(item.quantity * (item.product.price_per_unit || 0)).toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
            <div className="flex justify-between text-sm font-medium">
              <span className="text-gray-900 dark:text-white">Subtotal:</span>
              <span className="text-gray-900 dark:text-white">
                ₦{cart.reduce((sum, item) => sum + (item.quantity * (item.product.price_per_unit || 0)), 0).toLocaleString()}
              </span>
            </div>
          </div>
          <button
            onClick={handleProceedToDelivery}
            className="mt-3 w-full bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700"
          >
            Proceed to Delivery
          </button>
        </div>
      )}
    </div>
  );

  const renderDeliveryDetails = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Delivery Details</h3>
        <button
          onClick={() => setCurrentStep('products')}
          className="text-primary-600 hover:text-primary-700 dark:text-primary-400"
        >
          Back to Products
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Delivery Address
          </label>
          <div className="flex space-x-2">
            <input
              {...register('deliveryAddress', { required: !useCurrentLocation })}
              type="text"
              placeholder="Enter your delivery address"
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
              disabled={useCurrentLocation}
            />
            <button
              type="button"
              onClick={handleUseCurrentLocation}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              Use Current Location
            </button>
          </div>
          {errors.deliveryAddress && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.deliveryAddress.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Phone Number
          </label>
          <input
            {...register('phoneNumber', { 
              required: 'Phone number is required',
              pattern: {
                value: /^(\+234|0)[789][01]\d{8}$/,
                message: 'Please enter a valid Nigerian phone number'
              }
            })}
            type="tel"
            placeholder="Enter your phone number (e.g., +2348012345678)"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
          />
          {errors.phoneNumber && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.phoneNumber.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Special Instructions (Optional)
          </label>
          <textarea
            {...register('specialInstructions')}
            rows={3}
            placeholder="Any special delivery instructions..."
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Payment Method
          </label>
          <select
            {...register('paymentMethod', { required: true })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="cash">Cash on Delivery</option>
            <option value="card">Card Payment</option>
            <option value="transfer">Bank Transfer</option>
          </select>
          {errors.paymentMethod && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.paymentMethod.message}
            </p>
          )}
        </div>

        <button
          onClick={handleProceedToSummary}
          className="w-full bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700"
        >
          Review Order
        </button>
      </div>
    </div>
  );

  const renderOrderSummary = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Order Summary</h3>
        <button
          onClick={() => setCurrentStep('delivery')}
          className="text-primary-600 hover:text-primary-700 dark:text-primary-400"
        >
          Back to Delivery
        </button>
      </div>

      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">Vendor</h4>
            <p className="text-gray-600 dark:text-gray-400">{selectedVendor?.business_name}</p>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">Items</h4>
            <div className="space-y-2">
              {cart.map((item) => (
                <div key={item.product._id} className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    {item.product.name} x {item.quantity}
                  </span>
                  <span className="text-gray-900 dark:text-white">
                    ₦{(item.quantity * (item.product.price_per_unit || 0)).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">Delivery</h4>
            <p className="text-gray-600 dark:text-gray-400">
              {useCurrentLocation ? 'Current Location' : watch('deliveryAddress')}
            </p>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">Contact</h4>
            <p className="text-gray-600 dark:text-gray-400">
              {watch('phoneNumber')}
            </p>
          </div>

          {orderSummary && (
            <div className="border-t pt-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Subtotal:</span>
                <span className="text-gray-900 dark:text-white">
                  ₦{orderSummary.subtotal.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Delivery Fee:</span>
                <span className="text-gray-900 dark:text-white">
                  ₦{orderSummary.deliveryFee.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-lg font-medium mt-2 pt-2 border-t">
                <span className="text-gray-900 dark:text-white">Total:</span>
                <span className="text-gray-900 dark:text-white">
                  ₦{orderSummary.total.toLocaleString()}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      <button
        onClick={handleSubmit(onSubmit)}
        disabled={isLoading}
        className="w-full bg-primary-600 text-white py-3 px-4 rounded-md hover:bg-primary-700 disabled:opacity-50"
      >
        {isLoading ? 'Placing Order...' : 'Place Order'}
      </button>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Order Fuel</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Select a vendor, choose your fuel products, and place your order for delivery.
        </p>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-center space-x-4">
          {['vendor', 'products', 'delivery', 'summary'].map((step, index) => (
            <div key={step} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentStep === step
                    ? 'bg-primary-600 text-white'
                    : index < ['vendor', 'products', 'delivery', 'summary'].indexOf(currentStep)
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                }`}
              >
                {index + 1}
              </div>
              {index < 3 && (
                <div
                  className={`w-12 h-1 mx-2 ${
                    index < ['vendor', 'products', 'delivery', 'summary'].indexOf(currentStep)
                      ? 'bg-green-500'
                      : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-center mt-4 space-x-8">
          {['Select Vendor', 'Choose Products', 'Delivery Details', 'Review & Pay'].map((label, index) => (
            <span
              key={label}
              className={`text-sm ${
                currentStep === ['vendor', 'products', 'delivery', 'summary'][index]
                  ? 'text-primary-600 font-medium'
                  : 'text-gray-500 dark:text-gray-400'
              }`}
            >
              {label}
            </span>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        {currentStep === 'vendor' && renderVendorSelection()}
        {currentStep === 'products' && renderProductSelection()}
        {currentStep === 'delivery' && renderDeliveryDetails()}
        {currentStep === 'summary' && renderOrderSummary()}
      </div>
    </div>
  );
} 