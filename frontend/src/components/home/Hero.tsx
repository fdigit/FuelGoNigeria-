import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { MapPinIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

interface HeroProps {
  onLocationSelect: (location: string) => void;
}

export default function Hero({ onLocationSelect }: HeroProps) {
  const [userLocation, setUserLocation] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const detectLocation = useCallback(async () => {
    setIsLoading(true);
    setError('');

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });

      const { latitude, longitude } = position.coords;
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
      );
      const data = await response.json();
      const location = `${data.address.state}, ${data.address.city || data.address.town || data.address.village}`;
      setUserLocation(location);
      onLocationSelect(location);
    } catch (err) {
      setError('Unable to detect your location. Please try again or select a location manually.');
      console.error('Error detecting location:', err);
    } finally {
      setIsLoading(false);
    }
  }, [onLocationSelect]);

  return (
    <div className="relative bg-gradient-to-r from-primary-600 to-primary-800 dark:from-primary-800 dark:to-primary-900">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-600 to-primary-800 dark:from-primary-800 dark:to-primary-900 mix-blend-multiply" />
      </div>
      <div className="relative max-w-7xl mx-auto py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-white">
            Find the Best Fuel Prices Near You
          </h1>
          <p className="mt-4 sm:mt-6 text-lg sm:text-xl text-primary-100 max-w-3xl mx-auto px-4">
            Get real-time fuel prices, compare vendors, and order fuel delivery to your location
          </p>

          <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4 px-4">
            <button
              onClick={detectLocation}
              disabled={isLoading}
              className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-full text-primary-700 bg-white hover:bg-primary-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200"
            >
              <MapPinIcon className="h-5 w-5 mr-2" />
              {isLoading ? 'Detecting...' : 'Use My Location'}
            </button>
            <span className="text-white hidden sm:inline">or</span>
            <button
              onClick={() => onLocationSelect('')}
              className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-full text-white bg-primary-500 hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200"
            >
              Browse All Locations
              <ChevronRightIcon className="h-5 w-5 ml-2" />
            </button>
          </div>

          {error && (
            <p className="mt-4 text-sm text-red-200 px-4">
              {error}
            </p>
          )}

          {userLocation && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-4 text-sm text-primary-100 px-4"
            >
              Showing results for: <span className="font-semibold">{userLocation}</span>
            </motion.p>
          )}
        </motion.div>
      </div>
    </div>
  );
} 