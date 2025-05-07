import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useToast } from '../../../contexts/ToastContext';

interface FAQ {
  question: string;
  answer: string;
  category: 'general' | 'orders' | 'payment' | 'account';
}

const faqs: FAQ[] = [
  {
    question: 'How do I place an order?',
    answer: 'To place an order, simply select your preferred fuel type, enter the quantity, choose a delivery location, and proceed to payment. You can track your order status in real-time through the app.',
    category: 'orders'
  },
  {
    question: 'What payment methods are accepted?',
    answer: 'We accept various payment methods including credit/debit cards, bank transfers, and mobile money. All transactions are secure and encrypted.',
    category: 'payment'
  },
  {
    question: 'How long does delivery take?',
    answer: 'Delivery times vary based on your location and current demand. Typically, deliveries are made within 30-60 minutes in urban areas. You can track your delivery in real-time through the app.',
    category: 'orders'
  },
  {
    question: 'How do I reset my password?',
    answer: 'To reset your password, click on the "Forgot Password" link on the login page. You will receive a password reset link via email. Follow the instructions to set a new password.',
    category: 'account'
  },
  {
    question: 'What if I receive the wrong fuel type?',
    answer: 'If you receive the wrong fuel type, please do not use it. Contact our customer support immediately, and we will arrange for a replacement and proper disposal of the incorrect fuel.',
    category: 'orders'
  },
  {
    question: 'How do I update my delivery address?',
    answer: 'You can update your delivery address in your profile settings. Go to Profile > Address and click on "Edit" to modify your address information.',
    category: 'account'
  }
];

export default function Help() {
  const [selectedCategory, setSelectedCategory] = useState<FAQ['category']>('general');
  const [searchQuery, setSearchQuery] = useState('');
  const { showToast } = useToast();

  const filteredFaqs = faqs.filter(faq => 
    (selectedCategory === 'general' || faq.category === selectedCategory) &&
    (faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
     faq.answer.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleContactSupport = () => {
    showToast('info', 'Opening support chat...');
    // In a real app, you would open a chat window or redirect to a support page
  };

  return (
    <div className="space-y-6">
      {/* Search and Filter */}
      <div className="bg-white dark:bg-gray-700 rounded-lg shadow p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search FAQs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-600 dark:border-gray-500 dark:text-white"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value as FAQ['category'])}
            className="rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-600 dark:border-gray-500 dark:text-white"
          >
            <option value="general">All Categories</option>
            <option value="orders">Orders & Delivery</option>
            <option value="payment">Payment & Billing</option>
            <option value="account">Account & Security</option>
          </select>
        </div>
      </div>

      {/* FAQs */}
      <div className="bg-white dark:bg-gray-700 rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Frequently Asked Questions
        </h2>

        <div className="space-y-4">
          {filteredFaqs.map((faq, index) => (
            <div
              key={index}
              className="border border-gray-200 dark:border-gray-600 rounded-lg p-4"
            >
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                {faq.question}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {faq.answer}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Contact Support */}
      <div className="bg-white dark:bg-gray-700 rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Need More Help?
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Contact Us
            </h3>
            <div className="space-y-2">
              <p className="text-gray-600 dark:text-gray-400">
                Customer Support: +234 800 FUELGO
              </p>
              <p className="text-gray-600 dark:text-gray-400">
                Email: support@fuelgo.ng
              </p>
              <p className="text-gray-600 dark:text-gray-400">
                Hours: 24/7
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Quick Support
            </h3>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleContactSupport}
              className="w-full bg-primary-600 text-white px-6 py-3 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            >
              Start Live Chat
            </motion.button>
          </div>
        </div>
      </div>

      {/* Resources */}
      <div className="bg-white dark:bg-gray-700 rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Helpful Resources
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              User Guide
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Learn how to use all features of the FuelGo app
            </p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
            >
              Read Guide →
            </motion.button>
          </div>

          <div className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Safety Tips
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Important safety guidelines for handling fuel
            </p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
            >
              View Tips →
            </motion.button>
          </div>

          <div className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Video Tutorials
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Watch step-by-step video guides
            </p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
            >
              Watch Videos →
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
} 