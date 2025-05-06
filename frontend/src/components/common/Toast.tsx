import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  InformationCircleIcon,
  XCircleIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastProps {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
  onClose: (id: string) => void;
}

const icons = {
  success: CheckCircleIcon,
  error: XCircleIcon,
  info: InformationCircleIcon,
  warning: ExclamationCircleIcon,
};

const colors = {
  success: 'bg-green-50 text-green-800 dark:bg-green-900 dark:text-green-200',
  error: 'bg-red-50 text-red-800 dark:bg-red-900 dark:text-red-200',
  info: 'bg-blue-50 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  warning: 'bg-yellow-50 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
};

export default function Toast({ id, type, message, duration = 5000, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(id);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, id, onClose]);

  const Icon = icons[type];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.3 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
        className={`rounded-lg shadow-lg p-4 ${colors[type]} flex items-start`}
      >
        <Icon className="h-5 w-5 flex-shrink-0" />
        <p className="ml-3 text-sm font-medium">{message}</p>
        <button
          onClick={() => onClose(id)}
          className="ml-auto flex-shrink-0 inline-flex text-gray-400 hover:text-gray-500 focus:outline-none"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>
      </motion.div>
    </AnimatePresence>
  );
}

interface ToastContainerProps {
  toasts: Array<{
    id: string;
    type: ToastType;
    message: string;
  }>;
  onClose: (id: string) => void;
}

export function ToastContainer({ toasts, onClose }: ToastContainerProps) {
  return (
    <div className="fixed bottom-0 right-0 p-4 space-y-4 z-50">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          id={toast.id}
          type={toast.type}
          message={toast.message}
          onClose={onClose}
        />
      ))}
    </div>
  );
} 