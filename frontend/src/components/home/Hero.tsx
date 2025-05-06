import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPinIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

interface HeroProps {
  onLocationSelect: (location: string) => void;
}

export default function Hero({ onLocationSelect }: HeroProps) {
  const [userLocation, setUserLocation] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    detectLocation();
  }, []);

  const detectLocation = () => {
    setIsLoading(true);
    setError('');

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      setIsLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          // In a real app, you would use a geocoding service here
          // For now, we'll use a mock response
          const mockLocation = 'Lagos, Nigeria';
          setUserLocation(mockLocation);
          onLocationSelect(mockLocation);
        } catch (err) {
          setError('Error getting location');
        } finally {
          setIsLoading(false);
        }
      },
      (error) => {
        setError('Unable to retrieve your location');
        setIsLoading(false);
      }
    );
  };

  return (
    <div className="relative bg-gradient-to-r from-primary-600 to-primary-800 dark:from-primary-800 dark:to-primary-900">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-600 to-primary-800 dark:from-primary-800 dark:to-primary-900 mix-blend-multiply" />
      </div>
      <div className="relative max-w-7xl mx-auto py-24 px-4 sm:py-32 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Find the Best Fuel Prices Near You
          </h1>
          <p className="mt-6 text-xl text-primary-100 max-w-3xl mx-auto">
            Get real-time fuel prices, compare vendors, and order fuel delivery to your location
          </p>

          <div className="mt-10 max-w-xl mx-auto">
            <div className="flex items-center justify-center space-x-4">
              <button
                onClick={detectLocation}
                disabled={isLoading}
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-full text-primary-700 bg-white hover:bg-primary-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <MapPinIcon className="h-5 w-5 mr-2" />
                {isLoading ? 'Detecting...' : 'Use My Location'}
              </button>
              <span className="text-white">or</span>
              <button
                onClick={() => onLocationSelect('')}
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-full text-white bg-primary-500 hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Browse All Locations
                <ChevronRightIcon className="h-5 w-5 ml-2" />
              </button>
            </div>

            {error && (
              <p className="mt-4 text-sm text-red-200">
                {error}
              </p>
            )}

            {userLocation && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-4 text-sm text-primary-100"
              >
                Showing results for: <span className="font-semibold">{userLocation}</span>
              </motion.p>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
} 