import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useToast } from '../../../contexts/ToastContext';

interface SystemConfig {
  maintenanceMode: boolean;
  registrationEnabled: boolean;
  maxOrderAmount: number;
  minOrderAmount: number;
  maxDeliveryDistance: number;
  supportEmail: string;
  supportPhone: string;
}

interface PaymentConfig {
  paymentMethods: {
    card: boolean;
    bankTransfer: boolean;
    wallet: boolean;
  };
  defaultCurrency: string;
  transactionFee: number;
  minimumPayout: number;
  payoutSchedule: 'daily' | 'weekly' | 'monthly';
}

interface NotificationConfig {
  emailNotifications: boolean;
  smsNotifications: boolean;
  pushNotifications: boolean;
  notificationTemplates: {
    orderStatus: boolean;
    paymentStatus: boolean;
    deliveryStatus: boolean;
    marketing: boolean;
  };
}

interface IntegrationConfig {
  googleMaps: {
    enabled: boolean;
    apiKey: string;
  };
  paymentGateway: {
    provider: string;
    apiKey: string;
    secretKey: string;
  };
  smsGateway: {
    provider: string;
    apiKey: string;
    senderId: string;
  };
}

export default function PlatformSettings() {
  const [activeTab, setActiveTab] = useState<'system' | 'payment' | 'notification' | 'integration'>('system');
  const { showToast } = useToast();

  const [systemConfig, setSystemConfig] = useState<SystemConfig>({
    maintenanceMode: false,
    registrationEnabled: true,
    maxOrderAmount: 1000000,
    minOrderAmount: 1000,
    maxDeliveryDistance: 50,
    supportEmail: 'support@fuelgo.com',
    supportPhone: '+2348000000000',
  });

  const [paymentConfig, setPaymentConfig] = useState<PaymentConfig>({
    paymentMethods: {
      card: true,
      bankTransfer: true,
      wallet: true,
    },
    defaultCurrency: 'NGN',
    transactionFee: 2.5,
    minimumPayout: 5000,
    payoutSchedule: 'daily',
  });

  const [notificationConfig, setNotificationConfig] = useState<NotificationConfig>({
    emailNotifications: true,
    smsNotifications: true,
    pushNotifications: true,
    notificationTemplates: {
      orderStatus: true,
      paymentStatus: true,
      deliveryStatus: true,
      marketing: false,
    },
  });

  const [integrationConfig, setIntegrationConfig] = useState<IntegrationConfig>({
    googleMaps: {
      enabled: true,
      apiKey: 'YOUR_GOOGLE_MAPS_API_KEY',
    },
    paymentGateway: {
      provider: 'Paystack',
      apiKey: 'YOUR_PAYSTACK_API_KEY',
      secretKey: 'YOUR_PAYSTACK_SECRET_KEY',
    },
    smsGateway: {
      provider: 'Twilio',
      apiKey: 'YOUR_TWILIO_API_KEY',
      senderId: 'FUELGO',
    },
  });

  const handleSystemConfigChange = (key: keyof SystemConfig, value: any) => {
    setSystemConfig((prev) => ({ ...prev, [key]: value }));
    showToast('success', 'System configuration updated');
  };

  const handlePaymentConfigChange = (key: keyof PaymentConfig, value: any) => {
    setPaymentConfig((prev) => ({ ...prev, [key]: value }));
    showToast('success', 'Payment configuration updated');
  };

  const handleNotificationConfigChange = (key: keyof NotificationConfig, value: any) => {
    setNotificationConfig((prev) => ({ ...prev, [key]: value }));
    showToast('success', 'Notification configuration updated');
  };

  const handleIntegrationConfigChange = (section: keyof IntegrationConfig, key: string, value: any) => {
    setIntegrationConfig((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value,
      },
    }));
    showToast('success', 'Integration configuration updated');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Platform Settings
        </h2>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('system')}
            className={`${
              activeTab === 'system'
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            System
          </button>
          <button
            onClick={() => setActiveTab('payment')}
            className={`${
              activeTab === 'payment'
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Payment
          </button>
          <button
            onClick={() => setActiveTab('notification')}
            className={`${
              activeTab === 'notification'
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Notifications
          </button>
          <button
            onClick={() => setActiveTab('integration')}
            className={`${
              activeTab === 'integration'
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Integrations
          </button>
        </nav>
      </div>

      {activeTab === 'system' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              System Configuration
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Maintenance Mode
                </label>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleSystemConfigChange('maintenanceMode', !systemConfig.maintenanceMode)}
                  className={`${
                    systemConfig.maintenanceMode
                      ? 'bg-primary-600'
                      : 'bg-gray-200 dark:bg-gray-700'
                  } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2`}
                >
                  <span
                    className={`${
                      systemConfig.maintenanceMode
                        ? 'translate-x-6'
                        : 'translate-x-1'
                    } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                  />
                </motion.button>
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Registration Enabled
                </label>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleSystemConfigChange('registrationEnabled', !systemConfig.registrationEnabled)}
                  className={`${
                    systemConfig.registrationEnabled
                      ? 'bg-primary-600'
                      : 'bg-gray-200 dark:bg-gray-700'
                  } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2`}
                >
                  <span
                    className={`${
                      systemConfig.registrationEnabled
                        ? 'translate-x-6'
                        : 'translate-x-1'
                    } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                  />
                </motion.button>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Maximum Order Amount (₦)
                </label>
                <input
                  type="number"
                  value={systemConfig.maxOrderAmount}
                  onChange={(e) => handleSystemConfigChange('maxOrderAmount', Number(e.target.value))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Minimum Order Amount (₦)
                </label>
                <input
                  type="number"
                  value={systemConfig.minOrderAmount}
                  onChange={(e) => handleSystemConfigChange('minOrderAmount', Number(e.target.value))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Maximum Delivery Distance (km)
                </label>
                <input
                  type="number"
                  value={systemConfig.maxDeliveryDistance}
                  onChange={(e) => handleSystemConfigChange('maxDeliveryDistance', Number(e.target.value))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Support Email
                </label>
                <input
                  type="email"
                  value={systemConfig.supportEmail}
                  onChange={(e) => handleSystemConfigChange('supportEmail', e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Support Phone
                </label>
                <input
                  type="tel"
                  value={systemConfig.supportPhone}
                  onChange={(e) => handleSystemConfigChange('supportPhone', e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'payment' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Payment Configuration
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Payment Methods
                </label>
                <div className="space-y-2">
                  {Object.entries(paymentConfig.paymentMethods).map(([method, enabled]) => (
                    <div key={method} className="flex items-center justify-between">
                      <label className="text-sm text-gray-700 dark:text-gray-300">
                        {method.charAt(0).toUpperCase() + method.slice(1)}
                      </label>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() =>
                          handlePaymentConfigChange('paymentMethods', {
                            ...paymentConfig.paymentMethods,
                            [method]: !enabled,
                          })
                        }
                        className={`${
                          enabled ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-700'
                        } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2`}
                      >
                        <span
                          className={`${
                            enabled ? 'translate-x-6' : 'translate-x-1'
                          } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                        />
                      </motion.button>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Default Currency
                </label>
                <select
                  value={paymentConfig.defaultCurrency}
                  onChange={(e) => handlePaymentConfigChange('defaultCurrency', e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="NGN">Nigerian Naira (₦)</option>
                  <option value="USD">US Dollar ($)</option>
                  <option value="EUR">Euro (€)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Transaction Fee (%)
                </label>
                <input
                  type="number"
                  value={paymentConfig.transactionFee}
                  onChange={(e) => handlePaymentConfigChange('transactionFee', Number(e.target.value))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Minimum Payout Amount (₦)
                </label>
                <input
                  type="number"
                  value={paymentConfig.minimumPayout}
                  onChange={(e) => handlePaymentConfigChange('minimumPayout', Number(e.target.value))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Payout Schedule
                </label>
                <select
                  value={paymentConfig.payoutSchedule}
                  onChange={(e) => handlePaymentConfigChange('payoutSchedule', e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'notification' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Notification Configuration
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Notification Channels
                </label>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm text-gray-700 dark:text-gray-300">
                      Email Notifications
                    </label>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() =>
                        handleNotificationConfigChange('emailNotifications', !notificationConfig.emailNotifications)
                      }
                      className={`${
                        notificationConfig.emailNotifications
                          ? 'bg-primary-600'
                          : 'bg-gray-200 dark:bg-gray-700'
                      } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2`}
                    >
                      <span
                        className={`${
                          notificationConfig.emailNotifications
                            ? 'translate-x-6'
                            : 'translate-x-1'
                        } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                      />
                    </motion.button>
                  </div>
                  <div className="flex items-center justify-between">
                    <label className="text-sm text-gray-700 dark:text-gray-300">
                      SMS Notifications
                    </label>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() =>
                        handleNotificationConfigChange('smsNotifications', !notificationConfig.smsNotifications)
                      }
                      className={`${
                        notificationConfig.smsNotifications
                          ? 'bg-primary-600'
                          : 'bg-gray-200 dark:bg-gray-700'
                      } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2`}
                    >
                      <span
                        className={`${
                          notificationConfig.smsNotifications
                            ? 'translate-x-6'
                            : 'translate-x-1'
                        } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                      />
                    </motion.button>
                  </div>
                  <div className="flex items-center justify-between">
                    <label className="text-sm text-gray-700 dark:text-gray-300">
                      Push Notifications
                    </label>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() =>
                        handleNotificationConfigChange('pushNotifications', !notificationConfig.pushNotifications)
                      }
                      className={`${
                        notificationConfig.pushNotifications
                          ? 'bg-primary-600'
                          : 'bg-gray-200 dark:bg-gray-700'
                      } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2`}
                    >
                      <span
                        className={`${
                          notificationConfig.pushNotifications
                            ? 'translate-x-6'
                            : 'translate-x-1'
                        } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                      />
                    </motion.button>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Notification Templates
                </label>
                <div className="space-y-2">
                  {Object.entries(notificationConfig.notificationTemplates).map(([template, enabled]) => (
                    <div key={template} className="flex items-center justify-between">
                      <label className="text-sm text-gray-700 dark:text-gray-300">
                        {template.split(/(?=[A-Z])/).join(' ')}
                      </label>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() =>
                          handleNotificationConfigChange('notificationTemplates', {
                            ...notificationConfig.notificationTemplates,
                            [template]: !enabled,
                          })
                        }
                        className={`${
                          enabled ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-700'
                        } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2`}
                      >
                        <span
                          className={`${
                            enabled ? 'translate-x-6' : 'translate-x-1'
                          } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                        />
                      </motion.button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'integration' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Integration Configuration
            </h3>
            <div className="space-y-6">
              {/* Google Maps Integration */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                  Google Maps
                </h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-sm text-gray-700 dark:text-gray-300">
                      Enable Google Maps
                    </label>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() =>
                        handleIntegrationConfigChange('googleMaps', 'enabled', !integrationConfig.googleMaps.enabled)
                      }
                      className={`${
                        integrationConfig.googleMaps.enabled
                          ? 'bg-primary-600'
                          : 'bg-gray-200 dark:bg-gray-700'
                      } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2`}
                    >
                      <span
                        className={`${
                          integrationConfig.googleMaps.enabled
                            ? 'translate-x-6'
                            : 'translate-x-1'
                        } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                      />
                    </motion.button>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      API Key
                    </label>
                    <input
                      type="password"
                      value={integrationConfig.googleMaps.apiKey}
                      onChange={(e) =>
                        handleIntegrationConfigChange('googleMaps', 'apiKey', e.target.value)
                      }
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Gateway Integration */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                  Payment Gateway
                </h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Provider
                    </label>
                    <select
                      value={integrationConfig.paymentGateway.provider}
                      onChange={(e) =>
                        handleIntegrationConfigChange('paymentGateway', 'provider', e.target.value)
                      }
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    >
                      <option value="Paystack">Paystack</option>
                      <option value="Flutterwave">Flutterwave</option>
                      <option value="Stripe">Stripe</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      API Key
                    </label>
                    <input
                      type="password"
                      value={integrationConfig.paymentGateway.apiKey}
                      onChange={(e) =>
                        handleIntegrationConfigChange('paymentGateway', 'apiKey', e.target.value)
                      }
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Secret Key
                    </label>
                    <input
                      type="password"
                      value={integrationConfig.paymentGateway.secretKey}
                      onChange={(e) =>
                        handleIntegrationConfigChange('paymentGateway', 'secretKey', e.target.value)
                      }
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              {/* SMS Gateway Integration */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                  SMS Gateway
                </h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Provider
                    </label>
                    <select
                      value={integrationConfig.smsGateway.provider}
                      onChange={(e) =>
                        handleIntegrationConfigChange('smsGateway', 'provider', e.target.value)
                      }
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    >
                      <option value="Twilio">Twilio</option>
                      <option value="Africa's Talking">Africa's Talking</option>
                      <option value="MessageBird">MessageBird</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      API Key
                    </label>
                    <input
                      type="password"
                      value={integrationConfig.smsGateway.apiKey}
                      onChange={(e) =>
                        handleIntegrationConfigChange('smsGateway', 'apiKey', e.target.value)
                      }
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Sender ID
                    </label>
                    <input
                      type="text"
                      value={integrationConfig.smsGateway.senderId}
                      onChange={(e) =>
                        handleIntegrationConfigChange('smsGateway', 'senderId', e.target.value)
                      }
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 