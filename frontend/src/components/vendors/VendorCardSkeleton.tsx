import React from 'react';
import { motion } from 'framer-motion';

export default function VendorCardSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
      <div className="p-6">
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <motion.div
              initial={{ opacity: 0.5 }}
              animate={{ opacity: 1 }}
              transition={{ repeat: Infinity, duration: 1, repeatType: 'reverse' }}
              className="h-6 w-48 bg-gray-200 dark:bg-gray-700 rounded"
            />
            <motion.div
              initial={{ opacity: 0.5 }}
              animate={{ opacity: 1 }}
              transition={{ repeat: Infinity, duration: 1, repeatType: 'reverse', delay: 0.2 }}
              className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded"
            />
          </div>
          <motion.div
            initial={{ opacity: 0.5 }}
            animate={{ opacity: 1 }}
            transition={{ repeat: Infinity, duration: 1, repeatType: 'reverse', delay: 0.4 }}
            className="h-5 w-24 bg-gray-200 dark:bg-gray-700 rounded"
          />
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {[...Array(3)].map((_, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0.5 }}
              animate={{ opacity: 1 }}
              transition={{ repeat: Infinity, duration: 1, repeatType: 'reverse', delay: index * 0.2 }}
              className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded-full"
            />
          ))}
        </div>

        <div className="mt-4">
          <div className="flex justify-between items-center">
            <motion.div
              initial={{ opacity: 0.5 }}
              animate={{ opacity: 1 }}
              transition={{ repeat: Infinity, duration: 1, repeatType: 'reverse', delay: 0.6 }}
              className="h-8 w-32 bg-gray-200 dark:bg-gray-700 rounded"
            />
            <motion.div
              initial={{ opacity: 0.5 }}
              animate={{ opacity: 1 }}
              transition={{ repeat: Infinity, duration: 1, repeatType: 'reverse', delay: 0.8 }}
              className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded"
            />
          </div>
        </div>

        <div className="mt-4">
          <div className="flex flex-wrap gap-2">
            {[...Array(2)].map((_, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0.5 }}
                animate={{ opacity: 1 }}
                transition={{ repeat: Infinity, duration: 1, repeatType: 'reverse', delay: index * 0.2 }}
                className="h-6 w-24 bg-gray-200 dark:bg-gray-700 rounded-full"
              />
            ))}
          </div>
        </div>

        <div className="mt-6">
          <motion.div
            initial={{ opacity: 0.5 }}
            animate={{ opacity: 1 }}
            transition={{ repeat: Infinity, duration: 1, repeatType: 'reverse', delay: 1 }}
            className="h-10 w-full bg-gray-200 dark:bg-gray-700 rounded-lg"
          />
        </div>
      </div>
    </div>
  );
} 