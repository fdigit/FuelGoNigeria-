import React, { useState, ChangeEvent } from 'react';
import { motion } from 'framer-motion';
import { useToast } from '../../../contexts/ToastContext';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Transaction {
  id: string;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  date: string;
  status: 'completed' | 'pending' | 'failed';
}

export default function Wallet() {
  const { showToast } = useToast();
  const [balance, setBalance] = useState(50000); // Initial balance in Naira
  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      id: '1',
      type: 'credit',
      amount: 15000,
      description: 'Fuel order payment',
      date: '2024-03-01T10:30:00Z',
      status: 'completed',
    },
    {
      id: '2',
      type: 'debit',
      amount: 5000,
      description: 'Wallet top-up',
      date: '2024-02-28T15:45:00Z',
      status: 'completed',
    },
  ]);

  const [isAddingFunds, setIsAddingFunds] = useState(false);
  const [amount, setAmount] = useState('');

  const handleAddFunds = () => {
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      showToast('Please enter a valid amount' as ToastType, 'error');
      return;
    }

    const newTransaction: Transaction = {
      id: Date.now().toString(),
      type: 'credit',
      amount: amountNum,
      description: 'Wallet top-up',
      date: new Date().toISOString(),
      status: 'completed',
    };

    setTransactions([newTransaction, ...transactions]);
    setBalance(prev => prev + amountNum);
    setAmount('');
    setIsAddingFunds(false);
    showToast('Funds added successfully' as ToastType, 'success');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
    }).format(amount);
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
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Wallet</h2>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          onClick={() => setIsAddingFunds(true)}
        >
          Add Funds
        </motion.button>
      </div>

      {/* Balance Card */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Available Balance</h3>
        <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
          {formatCurrency(balance)}
        </p>
      </div>

      {/* Transaction History */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Transaction History</h3>
        </div>
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {transactions.map((transaction) => (
            <div key={transaction.id} className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {transaction.description}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {formatDate(transaction.date)}
                  </p>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-medium ${
                    transaction.type === 'credit' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                  }`}>
                    {transaction.type === 'credit' ? '+' : '-'}{formatCurrency(transaction.amount)}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                    {transaction.status}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Funds Modal */}
      {isAddingFunds && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Add Funds to Wallet
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Amount (NGN)
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setAmount(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="Enter amount"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setIsAddingFunds(false);
                  setAmount('');
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleAddFunds}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                Add Funds
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 