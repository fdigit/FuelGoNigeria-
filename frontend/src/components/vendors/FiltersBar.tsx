import React from 'react';
import { motion } from 'framer-motion';

interface FiltersBarProps {
  onFilterChange: (filters: {
    state?: string;
    fuelTypes?: string[];
    deliveryAvailable?: boolean;
    minRating?: number;
  }) => void;
}

export default function FiltersBar({ onFilterChange }: FiltersBarProps) {
  const [filters, setFilters] = React.useState({
    state: '',
    fuelTypes: [] as string[],
    deliveryAvailable: false,
    minRating: 0,
  });

  const handleFilterChange = (key: string, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-lg p-6 mb-6"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* State Filter */}
        <div>
          <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
            State
          </label>
          <select
            id="state"
            value={filters.state}
            onChange={(e) => handleFilterChange('state', e.target.value)}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          >
            <option value="">All States</option>
            <option value="Lagos">Lagos</option>
            <option value="Abuja">Abuja</option>
            <option value="Port Harcourt">Port Harcourt</option>
            {/* Add more states as needed */}
          </select>
        </div>

        {/* Fuel Types Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Fuel Types
          </label>
          <div className="space-y-2">
            {['Petrol', 'Diesel', 'Kerosene', 'Gas'].map((type) => (
              <label key={type} className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.fuelTypes.includes(type)}
                  onChange={(e) => {
                    const newTypes = e.target.checked
                      ? [...filters.fuelTypes, type]
                      : filters.fuelTypes.filter((t) => t !== type);
                    handleFilterChange('fuelTypes', newTypes);
                  }}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">{type}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Delivery Availability Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Delivery
          </label>
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={filters.deliveryAvailable}
              onChange={(e) => handleFilterChange('deliveryAvailable', e.target.checked)}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <span className="ml-2 text-sm text-gray-700">Available for Delivery</span>
          </div>
        </div>

        {/* Rating Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Minimum Rating
          </label>
          <select
            value={filters.minRating}
            onChange={(e) => handleFilterChange('minRating', Number(e.target.value))}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          >
            <option value="0">Any Rating</option>
            <option value="4">4+ Stars</option>
            <option value="3">3+ Stars</option>
            <option value="2">2+ Stars</option>
          </select>
        </div>
      </div>

      {/* Clear Filters Button */}
      <div className="mt-4 flex justify-end">
        <button
          onClick={() => {
            setFilters({
              state: '',
              fuelTypes: [],
              deliveryAvailable: false,
              minRating: 0,
            });
            onFilterChange({});
          }}
          className="text-sm text-gray-600 hover:text-gray-900"
        >
          Clear all filters
        </button>
      </div>
    </motion.div>
  );
} 