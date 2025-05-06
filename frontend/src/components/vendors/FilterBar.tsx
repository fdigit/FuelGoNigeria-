import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FunnelIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { Listbox } from '@headlessui/react';
import { ChevronUpDownIcon, CheckIcon } from '@heroicons/react/24/solid';

interface FilterBarProps {
  onFilterChange: (filters: Filters) => void;
  onReset: () => void;
  onShowNearby: () => void;
}

interface Filters {
  states: string[];
  fuelTypes: string[];
  priceRange: [number, number];
  deliveryTime: string[];
  rating: number;
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
    states: [],
    fuelTypes: [],
    priceRange: [0, 1000],
    deliveryTime: [],
    rating: 0,
  });

  const handleFilterChange = (key: keyof Filters, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleReset = () => {
    setFilters({
      states: [],
      fuelTypes: [],
      priceRange: [0, 1000],
      deliveryTime: [],
      rating: 0,
    });
    onReset();
  };

  const FilterSection = () => (
    <div className="space-y-4">
      {/* States Multi-select */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          States
        </label>
        <Listbox
          value={filters.states}
          onChange={(value) => handleFilterChange('states', value)}
          multiple
        >
          <div className="relative mt-1">
            <Listbox.Button className="relative w-full cursor-default rounded-lg bg-white dark:bg-gray-800 py-2 pl-3 pr-10 text-left border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500">
              <span className="block truncate">
                {filters.states.length > 0
                  ? `${filters.states.length} selected`
                  : 'Select states'}
              </span>
              <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                <ChevronUpDownIcon className="h-5 w-5 text-gray-400" />
              </span>
            </Listbox.Button>
            <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white dark:bg-gray-800 py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
              {states.map((state) => (
                <Listbox.Option
                  key={state}
                  value={state}
                  className={({ active }) =>
                    `relative cursor-default select-none py-2 pl-10 pr-4 ${
                      active
                        ? 'bg-primary-100 text-primary-900'
                        : 'text-gray-900 dark:text-gray-100'
                    }`
                  }
                >
                  {({ selected }) => (
                    <>
                      <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                        {state}
                      </span>
                      {selected && (
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-primary-600">
                          <CheckIcon className="h-5 w-5" />
                        </span>
                      )}
                    </>
                  )}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </div>
        </Listbox>
      </div>

      {/* Fuel Types Multi-select */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Fuel Types
        </label>
        <Listbox
          value={filters.fuelTypes}
          onChange={(value) => handleFilterChange('fuelTypes', value)}
          multiple
        >
          <div className="relative mt-1">
            <Listbox.Button className="relative w-full cursor-default rounded-lg bg-white dark:bg-gray-800 py-2 pl-3 pr-10 text-left border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500">
              <span className="block truncate">
                {filters.fuelTypes.length > 0
                  ? `${filters.fuelTypes.length} selected`
                  : 'Select fuel types'}
              </span>
              <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                <ChevronUpDownIcon className="h-5 w-5 text-gray-400" />
              </span>
            </Listbox.Button>
            <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white dark:bg-gray-800 py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
              {fuelTypes.map((type) => (
                <Listbox.Option
                  key={type}
                  value={type}
                  className={({ active }) =>
                    `relative cursor-default select-none py-2 pl-10 pr-4 ${
                      active
                        ? 'bg-primary-100 text-primary-900'
                        : 'text-gray-900 dark:text-gray-100'
                    }`
                  }
                >
                  {({ selected }) => (
                    <>
                      <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                        {type}
                      </span>
                      {selected && (
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-primary-600">
                          <CheckIcon className="h-5 w-5" />
                        </span>
                      )}
                    </>
                  )}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </div>
        </Listbox>
      </div>

      {/* Price Range */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Price Range (₦/L)
        </label>
        <div className="mt-1 flex items-center space-x-4">
          <input
            type="number"
            value={filters.priceRange[0]}
            onChange={(e) =>
              handleFilterChange('priceRange', [
                Number(e.target.value),
                filters.priceRange[1],
              ])
            }
            className="block w-full rounded-md border-gray-300 dark:border-gray-700 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-800"
            placeholder="Min"
          />
          <span className="text-gray-500">to</span>
          <input
            type="number"
            value={filters.priceRange[1]}
            onChange={(e) =>
              handleFilterChange('priceRange', [
                filters.priceRange[0],
                Number(e.target.value),
              ])
            }
            className="block w-full rounded-md border-gray-300 dark:border-gray-700 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-800"
            placeholder="Max"
          />
        </div>
      </div>

      {/* Delivery Time */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Delivery Time
        </label>
        <Listbox
          value={filters.deliveryTime}
          onChange={(value) => handleFilterChange('deliveryTime', value)}
          multiple
        >
          <div className="relative mt-1">
            <Listbox.Button className="relative w-full cursor-default rounded-lg bg-white dark:bg-gray-800 py-2 pl-3 pr-10 text-left border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500">
              <span className="block truncate">
                {filters.deliveryTime.length > 0
                  ? `${filters.deliveryTime.length} selected`
                  : 'Select delivery times'}
              </span>
              <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                <ChevronUpDownIcon className="h-5 w-5 text-gray-400" />
              </span>
            </Listbox.Button>
            <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white dark:bg-gray-800 py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
              {deliveryTimes.map((time) => (
                <Listbox.Option
                  key={time}
                  value={time}
                  className={({ active }) =>
                    `relative cursor-default select-none py-2 pl-10 pr-4 ${
                      active
                        ? 'bg-primary-100 text-primary-900'
                        : 'text-gray-900 dark:text-gray-100'
                    }`
                  }
                >
                  {({ selected }) => (
                    <>
                      <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                        {time}
                      </span>
                      {selected && (
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-primary-600">
                          <CheckIcon className="h-5 w-5" />
                        </span>
                      )}
                    </>
                  )}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </div>
        </Listbox>
      </div>

      {/* Rating */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Minimum Rating
        </label>
        <div className="mt-1">
          <select
            value={filters.rating}
            onChange={(e) => handleFilterChange('rating', Number(e.target.value))}
            className="block w-full rounded-md border-gray-300 dark:border-gray-700 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-800"
          >
            <option value={0}>Any Rating</option>
            <option value={3}>3+ Stars</option>
            <option value={4}>4+ Stars</option>
            <option value={4.5}>4.5+ Stars</option>
          </select>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col space-y-2">
        <button
          onClick={onShowNearby}
          className="w-full btn-secondary"
        >
          Show Vendors Near Me
        </button>
        <button
          onClick={handleReset}
          className="w-full btn-outline"
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