import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useToast } from '../../../contexts/ToastContext';

interface Feedback {
  id: string;
  customerName: string;
  rating: number;
  comment: string;
  date: string;
  orderId: string;
  driverName: string;
  status: 'pending' | 'resolved' | 'in_progress';
  response?: string;
}

export default function CustomerFeedback() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([
    {
      id: 'FB001',
      customerName: 'John Doe',
      rating: 5,
      comment: 'Excellent service! The driver was very professional and arrived on time.',
      date: '2024-03-15',
      orderId: 'ORD001',
      driverName: 'Michael Johnson',
      status: 'resolved',
      response: 'Thank you for your kind words! We appreciate your feedback.',
    },
    {
      id: 'FB002',
      customerName: 'Jane Smith',
      rating: 4,
      comment: 'Good service overall, but there was a slight delay in delivery.',
      date: '2024-03-14',
      orderId: 'ORD002',
      driverName: 'Sarah Williams',
      status: 'in_progress',
    },
    {
      id: 'FB003',
      customerName: 'Robert Johnson',
      rating: 3,
      comment: 'The fuel quality was good, but the delivery time was longer than expected.',
      date: '2024-03-13',
      orderId: 'ORD003',
      driverName: 'Michael Johnson',
      status: 'pending',
    },
  ]);

  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);
  const [responseText, setResponseText] = useState('');
  const { showToast } = useToast();

  const handleStatusChange = (feedbackId: string, newStatus: Feedback['status']) => {
    setFeedbacks(prev =>
      prev.map(feedback =>
        feedback.id === feedbackId ? { ...feedback, status: newStatus } : feedback
      )
    );
    showToast('success', `Feedback status updated to ${newStatus}`);
  };

  const handleResponseSubmit = (feedbackId: string) => {
    if (!responseText.trim()) {
      showToast('error', 'Please enter a response');
      return;
    }

    setFeedbacks(prev =>
      prev.map(feedback =>
        feedback.id === feedbackId
          ? { ...feedback, response: responseText, status: 'resolved' }
          : feedback
      )
    );
    setResponseText('');
    setSelectedFeedback(null);
    showToast('success', 'Response submitted successfully');
  };

  const getStatusColor = (status: Feedback['status']) => {
    switch (status) {
      case 'resolved':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4) return 'text-green-600 dark:text-green-400';
    if (rating >= 3) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Customer Feedback
        </h2>
        <div className="flex space-x-4">
          <select
            className="rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            onChange={(e) => {
              // In a real app, implement filtering logic
              showToast('info', 'Filtering functionality coming soon!');
            }}
          >
            <option value="all">All Feedback</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>
      </div>

      {/* Feedback List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Rating
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Comment
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Driver
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {feedbacks.map((feedback) => (
                <tr key={feedback.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {feedback.customerName}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {feedback.date}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div
                      className={`text-lg font-semibold ${getRatingColor(
                        feedback.rating
                      )}`}
                    >
                      {feedback.rating} ⭐
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {feedback.comment}
                    </div>
                    {feedback.response && (
                      <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                        <span className="font-medium">Response:</span> {feedback.response}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {feedback.driverName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                        feedback.status
                      )}`}
                    >
                      {feedback.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <select
                        value={feedback.status}
                        onChange={(e) =>
                          handleStatusChange(
                            feedback.id,
                            e.target.value as Feedback['status']
                          )
                        }
                        className="rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      >
                        <option value="pending">Pending</option>
                        <option value="in_progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                      </select>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setSelectedFeedback(feedback)}
                        className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300"
                      >
                        Respond
                      </motion.button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Response Modal */}
      {selectedFeedback && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-lg w-full">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Respond to Feedback
            </h3>
            <div className="mb-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Customer: {selectedFeedback.customerName}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Rating: {selectedFeedback.rating} ⭐
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Comment: {selectedFeedback.comment}
              </p>
            </div>
            <textarea
              value={responseText}
              onChange={(e) => setResponseText(e.target.value)}
              placeholder="Enter your response..."
              className="w-full h-32 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
            <div className="mt-4 flex justify-end space-x-2">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setSelectedFeedback(null);
                  setResponseText('');
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              >
                Cancel
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleResponseSubmit(selectedFeedback.id)}
                className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Submit Response
              </motion.button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 