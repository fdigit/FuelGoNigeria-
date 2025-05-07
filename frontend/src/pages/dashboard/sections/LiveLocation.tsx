import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useToast } from '../../../contexts/ToastContext';

interface Location {
  latitude: number;
  longitude: number;
  timestamp: string;
  address: string;
}

interface LocationHistory {
  id: string;
  startTime: string;
  endTime: string;
  distance: number;
  duration: string;
  status: 'active' | 'completed';
}

export default function LiveLocation() {
  const [isSharing, setIsSharing] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null);
  const [locationHistory, setLocationHistory] = useState<LocationHistory[]>([
    {
      id: 'LOC001',
      startTime: '2024-02-20 08:00',
      endTime: '2024-02-20 17:00',
      distance: 45.5,
      duration: '9h 0m',
      status: 'completed',
    },
    {
      id: 'LOC002',
      startTime: '2024-02-21 08:00',
      endTime: '2024-02-21 17:00',
      distance: 38.2,
      duration: '9h 0m',
      status: 'completed',
    },
    {
      id: 'LOC003',
      startTime: '2024-02-22 08:00',
      endTime: '2024-02-22 17:00',
      distance: 42.7,
      duration: '9h 0m',
      status: 'completed',
    },
  ]);

  const { showToast } = useToast();

  useEffect(() => {
    // In a real app, this would connect to a WebSocket or use a location service
    const mockLocation: Location = {
      latitude: 6.5244,
      longitude: 3.3792,
      timestamp: new Date().toISOString(),
      address: 'Lagos, Nigeria',
    };
    setCurrentLocation(mockLocation);
  }, []);

  const handleToggleSharing = () => {
    setIsSharing(!isSharing);
    showToast(
      'success',
      `Location sharing ${!isSharing ? 'enabled' : 'disabled'}`
    );
  };

  const handleRefreshLocation = () => {
    // In a real app, this would request a new location update
    showToast('info', 'Refreshing location...');
  };

  const handleViewOnMap = () => {
    // In a real app, this would open Google Maps with the current location
    if (currentLocation) {
      const url = `https://www.google.com/maps?q=${currentLocation.latitude},${currentLocation.longitude}`;
      window.open(url, '_blank');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Live Location
        </h2>
        <div className="flex space-x-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleRefreshLocation}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
          >
            Refresh Location
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleToggleSharing}
            className={`px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              isSharing
                ? 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-500 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            {isSharing ? 'Stop Sharing' : 'Start Sharing'}
          </motion.button>
        </div>
      </div>

      {/* Current Location */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Current Location
        </h3>
        {currentLocation ? (
          <div className="space-y-4">
            <div className="aspect-w-16 aspect-h-9 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
              {/* In a real app, this would be a map component */}
              <div className="w-full h-full flex items-center justify-center">
                <p className="text-gray-500 dark:text-gray-400">
                  Map View (Coming Soon)
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Latitude
                </p>
                <p className="text-lg font-medium text-gray-900 dark:text-white">
                  {currentLocation.latitude}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Longitude
                </p>
                <p className="text-lg font-medium text-gray-900 dark:text-white">
                  {currentLocation.longitude}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Address
                </p>
                <p className="text-lg font-medium text-gray-900 dark:text-white">
                  {currentLocation.address}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Last Updated
                </p>
                <p className="text-lg font-medium text-gray-900 dark:text-white">
                  {new Date(currentLocation.timestamp).toLocaleString()}
                </p>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleViewOnMap}
              className="w-full px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            >
              View on Google Maps
            </motion.button>
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400">
            Loading location...
          </p>
        )}
      </div>

      {/* Location History */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Location History
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Track your location history and travel statistics
          </p>
        </div>

        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {locationHistory.map((record) => (
            <div key={record.id} className="px-6 py-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {new Date(record.startTime).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date(record.startTime).toLocaleTimeString()} -{' '}
                    {new Date(record.endTime).toLocaleTimeString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {record.distance} km
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {record.duration}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 