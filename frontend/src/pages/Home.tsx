import * as React from 'react';
import VendorGrid from '../components/vendors/VendorGrid';
import { useToast } from '../contexts/ToastContext';
import { Vendor, Filters } from '../types/vendor';
import { vendorService } from '../services/api';
import FilterBar from '../components/vendors/FilterBar';

export default function Home() {
  const [isLoading, setIsLoading] = React.useState(true);
  const [vendors, setVendors] = React.useState<Vendor[]>([]);
  const [location, setLocation] = React.useState('Lagos, Nigeria');
  const [showFilters, setShowFilters] = React.useState(false);
  const { showToast } = useToast();

  const [filters, setFilters] = React.useState<Filters>({
    state: '',
    fuelType: '',
    priceMin: 0,
    priceMax: 1000,
    deliveryTime: '',
    minRating: '',
  });

  React.useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    setIsLoading(true);
    try {
      const data = await vendorService.getVendors();
      console.log('Fetched vendors:', data);
      setVendors(data);
    } catch (error) {
      console.error('Error fetching vendors:', error);
      showToast('error', 'Failed to load vendors.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (newFilters: Filters) => {
    setFilters(newFilters);
  };

  const handleOrder = (vendorId: string) => {
    showToast('success', 'Order request sent successfully!');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Top search and heading */}
      <div className="bg-green-700 py-8 sm:py-10 px-4 text-center text-white">
        <div className="max-w-4xl mx-auto">
          <input
            type="text"
            placeholder="Search by location..."
            className="w-full max-w-2xl mx-auto rounded-full px-6 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-400"
            style={{ fontSize: '1.1rem' }}
          />
          <h1 className="mt-6 sm:mt-8 text-3xl sm:text-4xl font-extrabold">Find the Best Fuel Prices Near You</h1>
          <p className="mt-3 sm:mt-4 text-base sm:text-lg">Get real-time fuel prices, compare vendors, and order fuel delivery to your location</p>
          <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row justify-center gap-4">
            <button className="bg-white text-green-700 font-semibold px-6 sm:px-8 py-3 rounded-full flex items-center justify-center shadow hover:bg-gray-100">
              <span className="material-icons mr-2">my_location</span> Use My Location
            </button>
            <span className="flex items-center font-semibold">or</span>
            <button className="bg-green-500 text-white font-semibold px-6 sm:px-8 py-3 rounded-full flex items-center justify-center shadow hover:bg-green-600">
              Browse All Locations
            </button>
          </div>
          <div className="mt-4 text-sm sm:text-base">
            Showing results for: <span className="font-bold">{location}</span>
          </div>
        </div>
      </div>

      {/* Main content: filters and vendor grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Mobile Filter Toggle */}
        <div className="md:hidden mb-4">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="w-full flex items-center justify-center px-4 py-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <span className="material-icons mr-2">filter_list</span>
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </button>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Filter Sidebar */}
          <div className={`w-full md:w-80 ${showFilters ? 'block' : 'hidden md:block'}`}>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 sm:p-6">
              <FilterBar
                onFilterChange={handleFilterChange}
                onReset={() => setFilters({
                  state: '',
                  fuelType: '',
                  priceMin: 0,
                  priceMax: 1000,
                  deliveryTime: '',
                  minRating: '',
                })}
                onShowNearby={() => {
                  // Implement nearby functionality
                  showToast('info', 'Showing vendors near your location');
                }}
              />
            </div>
          </div>

          {/* Vendor Grid */}
          <div className="flex-1">
            <VendorGrid
              vendors={vendors}
              isLoading={isLoading}
              onOrder={handleOrder}
            />
          </div>
        </div>
      </div>
    </div>
  );
} 