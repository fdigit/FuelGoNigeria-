import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useToast } from '../../../contexts/ToastContext';

interface WorkingHours {
  day: string;
  start: string;
  end: string;
  isActive: boolean;
}

export default function Availability() {
  const [isOnline, setIsOnline] = useState(false);
  const [workingHours, setWorkingHours] = useState<WorkingHours[]>([
    { day: 'Monday', start: '08:00', end: '17:00', isActive: true },
    { day: 'Tuesday', start: '08:00', end: '17:00', isActive: true },
    { day: 'Wednesday', start: '08:00', end: '17:00', isActive: true },
    { day: 'Thursday', start: '08:00', end: '17:00', isActive: true },
    { day: 'Friday', start: '08:00', end: '17:00', isActive: true },
    { day: 'Saturday', start: '09:00', end: '14:00', isActive: true },
    { day: 'Sunday', start: '09:00', end: '14:00', isActive: false },
  ]);

  const { showToast } = useToast();

  const handleToggleStatus = () => {
    setIsOnline(!isOnline);
    showToast(
      'success',
      `You are now ${!isOnline ? 'online' : 'offline'} and ${!isOnline ? 'available' : 'unavailable'} for deliveries`
    );
  };

  const handleWorkingHoursChange = (
    index: number,
    field: keyof Omit<WorkingHours, 'day'>,
    value: string | boolean
  ) => {
    const newWorkingHours = [...workingHours];
    newWorkingHours[index] = {
      ...newWorkingHours[index],
      [field]: value,
    };
    setWorkingHours(newWorkingHours);
  };

  const handleSaveWorkingHours = () => {
    // In a real app, this would save to the backend
    showToast('success', 'Working hours updated successfully');
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
        Availability
      </h2>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Online Status
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Toggle your availability for deliveries
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleToggleStatus}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
              isOnline ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-700'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                isOnline ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </motion.button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Working Hours
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Set your preferred working hours for each day
          </p>
        </div>

        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {workingHours.map((day, index) => (
            <div key={day.day} className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <input
                    type="checkbox"
                    checked={day.isActive}
                    onChange={(e) =>
                      handleWorkingHoursChange(index, 'isActive', e.target.checked)
                    }
                    className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700"
                  />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {day.day}
                  </span>
                </div>
                <div className="flex items-center space-x-4">
                  <input
                    type="time"
                    value={day.start}
                    onChange={(e) =>
                      handleWorkingHoursChange(index, 'start', e.target.value)
                    }
                    disabled={!day.isActive}
                    className="rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:opacity-50"
                  />
                  <span className="text-sm text-gray-500 dark:text-gray-400">to</span>
                  <input
                    type="time"
                    value={day.end}
                    onChange={(e) =>
                      handleWorkingHoursChange(index, 'end', e.target.value)
                    }
                    disabled={!day.isActive}
                    className="rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:opacity-50"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSaveWorkingHours}
            className="w-full px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          >
            Save Working Hours
          </motion.button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          Break Time
        </h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          You can take breaks during your working hours. Your status will be automatically set to "On Break" during these times.
        </p>
        <div className="mt-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
          >
            Schedule Break
          </motion.button>
        </div>
      </div>
    </div>
  );
} 