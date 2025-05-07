import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useToast } from '../../../contexts/ToastContext';

interface NotificationTemplate {
  id: string;
  name: string;
  title: string;
  body: string;
  type: 'info' | 'success' | 'warning' | 'error';
  targetAudience: ('all' | 'customers' | 'vendors' | 'drivers')[];
  createdAt: string;
  updatedAt: string;
}

interface Notification {
  id: string;
  templateId: string;
  title: string;
  body: string;
  type: 'info' | 'success' | 'warning' | 'error';
  targetAudience: ('all' | 'customers' | 'vendors' | 'drivers')[];
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'failed';
  scheduledFor?: string;
  sentAt?: string;
  recipients: {
    total: number;
    sent: number;
    failed: number;
  };
  createdAt: string;
}

export default function PushNotifications() {
  const [activeTab, setActiveTab] = useState<'compose' | 'templates' | 'history'>('compose');
  const [selectedTemplate, setSelectedTemplate] = useState<NotificationTemplate | null>(null);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [filters, setFilters] = useState({
    status: '',
    type: '',
    audience: '',
    dateRange: '',
    search: '',
  });

  const { showToast } = useToast();

  const [templates, setTemplates] = useState<NotificationTemplate[]>([
    {
      id: 'TMP001',
      name: 'Order Status Update',
      title: 'Order Status Update',
      body: 'Your order #{orderId} has been {status}',
      type: 'info',
      targetAudience: ['customers'],
      createdAt: '2024-02-22T10:00:00Z',
      updatedAt: '2024-02-22T10:00:00Z',
    },
    {
      id: 'TMP002',
      name: 'Payment Received',
      title: 'Payment Received',
      body: 'Payment of ₦{amount} has been received for order #{orderId}',
      type: 'success',
      targetAudience: ['vendors'],
      createdAt: '2024-02-22T11:00:00Z',
      updatedAt: '2024-02-22T11:00:00Z',
    },
  ]);

  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: 'NOT001',
      templateId: 'TMP001',
      title: 'Order Status Update',
      body: 'Your order #ORD001 has been delivered',
      type: 'info',
      targetAudience: ['customers'],
      status: 'sent',
      sentAt: '2024-02-22T10:05:00Z',
      recipients: {
        total: 1,
        sent: 1,
        failed: 0,
      },
      createdAt: '2024-02-22T10:00:00Z',
    },
    {
      id: 'NOT002',
      templateId: 'TMP002',
      title: 'Payment Received',
      body: 'Payment of ₦50,000 has been received for order #ORD001',
      type: 'success',
      targetAudience: ['vendors'],
      status: 'scheduled',
      scheduledFor: '2024-02-23T10:00:00Z',
      recipients: {
        total: 1,
        sent: 0,
        failed: 0,
      },
      createdAt: '2024-02-22T11:00:00Z',
    },
  ]);

  const [newNotification, setNewNotification] = useState({
    title: '',
    body: '',
    type: 'info' as 'info' | 'success' | 'warning' | 'error',
    targetAudience: [] as ('all' | 'customers' | 'vendors' | 'drivers')[],
    scheduledFor: '',
  });

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleSendNotification = () => {
    const notification: Notification = {
      id: `NOT${notifications.length + 1}`,
      templateId: '',
      title: newNotification.title,
      body: newNotification.body,
      type: newNotification.type,
      targetAudience: newNotification.targetAudience,
      status: newNotification.scheduledFor ? 'scheduled' : 'sending',
      scheduledFor: newNotification.scheduledFor,
      recipients: {
        total: 0,
        sent: 0,
        failed: 0,
      },
      createdAt: new Date().toISOString(),
    };

    setNotifications([...notifications, notification]);
    setNewNotification({
      title: '',
      body: '',
      type: 'info',
      targetAudience: [],
      scheduledFor: '',
    });
    showToast('success', 'Notification sent successfully');
  };

  const handleSaveTemplate = () => {
    const template: NotificationTemplate = {
      id: `TMP${templates.length + 1}`,
      name: newNotification.title,
      title: newNotification.title,
      body: newNotification.body,
      type: newNotification.type,
      targetAudience: newNotification.targetAudience,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setTemplates([...templates, template]);
    setNewNotification({
      title: '',
      body: '',
      type: 'info',
      targetAudience: [],
      scheduledFor: '',
    });
    showToast('success', 'Template saved successfully');
  };

  const handleCancelScheduled = (notificationId: string) => {
    setNotifications(
      notifications.map((notif) =>
        notif.id === notificationId
          ? {
              ...notif,
              status: 'draft',
              scheduledFor: undefined,
            }
          : notif
      )
    );
    showToast('success', 'Scheduled notification cancelled');
  };

  const filteredNotifications = notifications.filter((notif) => {
    return (
      (!filters.status || notif.status === filters.status) &&
      (!filters.type || notif.type === filters.type) &&
      (!filters.audience ||
        notif.targetAudience.includes(filters.audience as any)) &&
      (!filters.search ||
        notif.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        notif.body.toLowerCase().includes(filters.search.toLowerCase()))
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Push Notifications
        </h2>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('compose')}
            className={`${
              activeTab === 'compose'
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Compose
          </button>
          <button
            onClick={() => setActiveTab('templates')}
            className={`${
              activeTab === 'templates'
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Templates
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`${
              activeTab === 'history'
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            History
          </button>
        </nav>
      </div>

      {activeTab === 'compose' ? (
        <div className="space-y-6">
          {/* Compose Form */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Title
                </label>
                <input
                  type="text"
                  value={newNotification.title}
                  onChange={(e) =>
                    setNewNotification({ ...newNotification, title: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="Enter notification title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Message
                </label>
                <textarea
                  value={newNotification.body}
                  onChange={(e) =>
                    setNewNotification({ ...newNotification, body: e.target.value })
                  }
                  rows={4}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="Enter notification message"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Type
                </label>
                <select
                  value={newNotification.type}
                  onChange={(e) =>
                    setNewNotification({
                      ...newNotification,
                      type: e.target.value as 'info' | 'success' | 'warning' | 'error',
                    })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="info">Info</option>
                  <option value="success">Success</option>
                  <option value="warning">Warning</option>
                  <option value="error">Error</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Target Audience
                </label>
                <div className="mt-2 space-y-2">
                  {(['all', 'customers', 'vendors', 'drivers'] as const).map((audience) => (
                    <label key={audience} className="inline-flex items-center mr-4">
                      <input
                        type="checkbox"
                        checked={newNotification.targetAudience.includes(audience)}
                        onChange={(e) => {
                          const newAudience = e.target.checked
                            ? [...newNotification.targetAudience, audience]
                            : newNotification.targetAudience.filter((a) => a !== audience);
                          setNewNotification({
                            ...newNotification,
                            targetAudience: newAudience,
                          });
                        }}
                        className="rounded border-gray-300 text-primary-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700"
                      />
                      <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                        {audience.charAt(0).toUpperCase() + audience.slice(1)}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Schedule (Optional)
                </label>
                <input
                  type="datetime-local"
                  value={newNotification.scheduledFor}
                  onChange={(e) =>
                    setNewNotification({
                      ...newNotification,
                      scheduledFor: e.target.value,
                    })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              <div className="flex justify-end space-x-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSaveTemplate}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  Save as Template
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSendNotification}
                  className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                >
                  {newNotification.scheduledFor ? 'Schedule' : 'Send Now'}
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      ) : activeTab === 'templates' ? (
        <div className="space-y-6">
          {/* Templates */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Target Audience
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Last Updated
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {templates.map((template) => (
                    <tr key={template.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {template.name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {template.body}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            template.type === 'success'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : template.type === 'warning'
                              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                              : template.type === 'error'
                              ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                              : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                          }`}
                        >
                          {template.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-wrap gap-1">
                          {template.targetAudience.map((audience) => (
                            <span
                              key={audience}
                              className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                            >
                              {audience}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {new Date(template.updatedAt).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setSelectedTemplate(template)}
                            className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300"
                          >
                            View
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => {
                              setNewNotification({
                                title: template.title,
                                body: template.body,
                                type: template.type,
                                targetAudience: template.targetAudience,
                                scheduledFor: '',
                              });
                              setActiveTab('compose');
                            }}
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                          >
                            Use
                          </motion.button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Filters */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Status
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="">All Status</option>
                  <option value="draft">Draft</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="sending">Sending</option>
                  <option value="sent">Sent</option>
                  <option value="failed">Failed</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Type
                </label>
                <select
                  value={filters.type}
                  onChange={(e) => handleFilterChange('type', e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="">All Types</option>
                  <option value="info">Info</option>
                  <option value="success">Success</option>
                  <option value="warning">Warning</option>
                  <option value="error">Error</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Audience
                </label>
                <select
                  value={filters.audience}
                  onChange={(e) => handleFilterChange('audience', e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="">All Audiences</option>
                  <option value="all">All</option>
                  <option value="customers">Customers</option>
                  <option value="vendors">Vendors</option>
                  <option value="drivers">Drivers</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Search
                </label>
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  placeholder="Search notifications..."
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Notification History */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Title
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Audience
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Recipients
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredNotifications.map((notif) => (
                    <tr key={notif.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {notif.title}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {notif.body}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            notif.type === 'success'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : notif.type === 'warning'
                              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                              : notif.type === 'error'
                              ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                              : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                          }`}
                        >
                          {notif.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-wrap gap-1">
                          {notif.targetAudience.map((audience) => (
                            <span
                              key={audience}
                              className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                            >
                              {audience}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            notif.status === 'sent'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : notif.status === 'failed'
                              ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                              : notif.status === 'sending'
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                              : notif.status === 'scheduled'
                              ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                          }`}
                        >
                          {notif.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        <div>Total: {notif.recipients.total}</div>
                        <div>Sent: {notif.recipients.sent}</div>
                        <div>Failed: {notif.recipients.failed}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {new Date(notif.createdAt).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setSelectedNotification(notif)}
                            className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300"
                          >
                            View Details
                          </motion.button>
                          {notif.status === 'scheduled' && (
                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => handleCancelScheduled(notif.id)}
                              className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                            >
                              Cancel
                            </motion.button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* View Template Details Modal */}
      {selectedTemplate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Template Details - {selectedTemplate.name}
              </h3>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedTemplate(null)}
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
              >
                ✕
              </motion.button>
            </div>
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Template Information
                </h4>
                <p className="mt-1 text-sm text-gray-900 dark:text-white">
                  Title: {selectedTemplate.title}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Body: {selectedTemplate.body}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Type: {selectedTemplate.type}
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Target Audience
                </h4>
                <div className="mt-2 flex flex-wrap gap-2">
                  {selectedTemplate.targetAudience.map((audience) => (
                    <span
                      key={audience}
                      className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                    >
                      {audience}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Timestamps
                </h4>
                <p className="mt-1 text-sm text-gray-900 dark:text-white">
                  Created: {new Date(selectedTemplate.createdAt).toLocaleString()}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Last Updated: {new Date(selectedTemplate.updatedAt).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Notification Details Modal */}
      {selectedNotification && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Notification Details - {selectedNotification.id}
              </h3>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedNotification(null)}
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
              >
                ✕
              </motion.button>
            </div>
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Notification Information
                </h4>
                <p className="mt-1 text-sm text-gray-900 dark:text-white">
                  Title: {selectedNotification.title}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Body: {selectedNotification.body}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Type: {selectedNotification.type}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Status: {selectedNotification.status}
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Target Audience
                </h4>
                <div className="mt-2 flex flex-wrap gap-2">
                  {selectedNotification.targetAudience.map((audience) => (
                    <span
                      key={audience}
                      className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                    >
                      {audience}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Recipients
                </h4>
                <p className="mt-1 text-sm text-gray-900 dark:text-white">
                  Total: {selectedNotification.recipients.total}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Sent: {selectedNotification.recipients.sent}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Failed: {selectedNotification.recipients.failed}
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Timestamps
                </h4>
                <p className="mt-1 text-sm text-gray-900 dark:text-white">
                  Created: {new Date(selectedNotification.createdAt).toLocaleString()}
                </p>
                {selectedNotification.scheduledFor && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Scheduled For: {new Date(selectedNotification.scheduledFor).toLocaleString()}
                  </p>
                )}
                {selectedNotification.sentAt && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Sent At: {new Date(selectedNotification.sentAt).toLocaleString()}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 