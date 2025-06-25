import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FunnelIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { Listbox } from '@headlessui/react';
import { ChevronUpDownIcon, CheckIcon } from '@heroicons/react/24/solid';
import { Filters } from '../../types/vendor';

interface FilterBarProps {
  onFilterChange: (filters: Filters) => void;
  onReset: () => void;
  onShowNearby: () => void;
}

const states = [
  'Lagos',
  'Abuja',
  'Port Harcourt',
  'Ibadan',
  'Kano',
  'Calabar',
  'Enugu',
  'Benin City',
];

const fuelTypes = [
  'Petrol (PMS)',
  'Diesel (AGO)',
  'Kerosene (DPK)',
  'CNG',
];

const deliveryTimes = [
  'Within 30 mins',
  'Within 1 hour',
  'Within 2 hours',
  'Same day',
];

export default function FilterBar({ onFilterChange, onReset, onShowNearby }: FilterBarProps) {
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    state: '',
    fuelType: '',
    priceMin: 0,
    priceMax: 1000,
    deliveryTime: '',
    minRating: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const newFilters = {
      ...filters,
      [e.target.name]: e.target.value,
    };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleReset = () => {
    setFilters({
      state: '',
      fuelType: '',
      priceMin: 0,
      priceMax: 1000,
      deliveryTime: '',
      minRating: '',
    });
    onReset();
  };

  const FilterSection = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-2">States</label>
        <select
          name="state"
          className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          value={filters.state}
          onChange={handleChange}
        >
          <option value="">Select states</option>
          <option value="lagos">Lagos</option>
          <option value="abuja">Abuja</option>
          <option value="port-harcourt">Port Harcourt</option>
        </select>
      </div>

      <div>
        <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-2">Fuel Types</label>
        <select
          name="fuelType"
          className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          value={filters.fuelType}
          onChange={handleChange}
        >
          <option value="">Select fuel types</option>
          <option value="petrol">Petrol</option>
          <option value="diesel">Diesel</option>
          <option value="cng">CNG</option>
        </select>
      </div>

      <div>
        <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-2">Price Range (₦/L)</label>
        <div className="flex gap-2 items-center">
          <input
            type="number"
            name="priceMin"
            min={0}
            max={filters.priceMax}
            value={filters.priceMin}
            onChange={handleChange}
            className="w-20 rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          />
          <span className="text-gray-500 dark:text-gray-400">to</span>
          <input
            type="number"
            name="priceMax"
            min={filters.priceMin}
            max={1000}
            value={filters.priceMax}
            onChange={handleChange}
            className="w-20 rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          />
        </div>
      </div>

      <div>
        <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-2">Delivery Time</label>
        <select
          name="deliveryTime"
          className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          value={filters.deliveryTime}
          onChange={handleChange}
        >
          <option value="">Select delivery times</option>
          <option value="30">Within 30 minutes</option>
          <option value="60">Within 1 hour</option>
          <option value="120">Within 2 hours</option>
        </select>
      </div>

      <div>
        <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-2">Minimum Rating</label>
        <select
          name="minRating"
          className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          value={filters.minRating}
          onChange={handleChange}
        >
          <option value="">Any Rating</option>
          <option value="1">1+</option>
          <option value="2">2+</option>
          <option value="3">3+</option>
          <option value="4">4+</option>
          <option value="5">5</option>
        </select>
      </div>

      <div className="space-y-2">
        <button
          onClick={onShowNearby}
          className="w-full bg-green-600 text-white font-semibold py-2 rounded-lg hover:bg-green-700 transition-colors duration-200"
        >
          Show Vendors Near Me
        </button>
        <button
          onClick={handleReset}
          className="w-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200"
        >
          Reset Filters
        </button>
      </div>
    </div>
  );

  return (
    <div className="relative">
      {/* Mobile Filter Button */}
      <div className="lg:hidden">
        <button
          onClick={() => setIsMobileFiltersOpen(true)}
          className="flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 dark:hover:bg-gray-700"
        >
          <FunnelIcon className="w-5 h-5 mr-2" />
          Filters
        </button>
      </div>

      {/* Mobile Filter Panel */}
      <AnimatePresence>
        {isMobileFiltersOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            className="fixed inset-0 z-40 lg:hidden"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" onClick={() => setIsMobileFiltersOpen(false)} />
            <div className="fixed inset-y-0 right-0 max-w-xs w-full bg-white dark:bg-gray-900 shadow-xl">
              <div className="h-full flex flex-col">
                <div className="px-4 py-6 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-medium text-gray-900 dark:text-white">Filters</h2>
                    <button
                      onClick={() => setIsMobileFiltersOpen(false)}
                      className="text-gray-400 hover:text-gray-500"
                    >
                      <XMarkIcon className="h-6 w-6" />
                    </button>
                  </div>
                </div>
                <div className="flex-1 px-4 py-6 overflow-y-auto">
                  <FilterSection />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop Filter Panel */}
      <div className="hidden lg:block w-64 space-y-6">
        <FilterSection />
      </div>
    </div>
  );
} 