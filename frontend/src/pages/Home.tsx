import * as React from 'react';
import VendorGrid from '../components/vendors/VendorGrid';
import { useToast } from '../contexts/ToastContext';
import { Vendor } from '../types';
import { vendorService } from '../services/api';

export default function Home() {
  const [isLoading, setIsLoading] = React.useState(true);
  const [vendors, setVendors] = React.useState<Vendor[]>([]);
  const [location, setLocation] = React.useState('Lagos, Nigeria');
  const { showToast } = useToast();

  // Placeholder for filter state (implement as needed)
  const [filters, setFilters] = React.useState({
    state: '',
    fuelType: '',
    priceMin: 0,
    priceMax: 1000,
    deliveryTime: '',
    minRating: '',
  });

  React.useEffect(() => {
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
    fetchVendors();
  }, [showToast]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleOrder = (vendorId: string) => {
    showToast('success', 'Order request sent successfully!');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Top search and heading */}
      <div className="bg-green-700 py-10 px-4 text-center text-white">
        <div className="max-w-4xl mx-auto">
          <input
            type="text"
            placeholder="Search by location..."
            className="w-full max-w-2xl mx-auto rounded-full px-6 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-400"
            style={{ fontSize: '1.1rem' }}
          />
          <h1 className="mt-8 text-4xl font-extrabold">Find the Best Fuel Prices Near You</h1>
          <p className="mt-4 text-lg">Get real-time fuel prices, compare vendors, and order fuel delivery to your location</p>
          <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
            <button className="bg-white text-green-700 font-semibold px-8 py-3 rounded-full flex items-center justify-center shadow hover:bg-gray-100">
              <span className="material-icons mr-2">my_location</span> Use My Location
            </button>
            <span className="flex items-center font-semibold">or</span>
            <button className="bg-green-500 text-white font-semibold px-8 py-3 rounded-full flex items-center justify-center shadow hover:bg-green-600">
              Browse All Locations
            </button>
          </div>
          <div className="mt-4 text-base">
            Showing results for: <span className="font-bold">{location}</span>
          </div>
        </div>
      </div>

      {/* Main content: filters and vendor grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col md:flex-row gap-8">
        {/* Filter Sidebar */}
        <aside className="w-full md:w-80 bg-white rounded-xl shadow p-6 mb-8 md:mb-0">
          <div className="mb-4">
            <label className="block text-gray-700 font-semibold mb-2">States</label>
            <select name="state" className="w-full rounded border px-3 py-2" value={filters.state} onChange={handleFilterChange}>
              <option value="">Select states</option>
              {/* Add state options here */}
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 font-semibold mb-2">Fuel Types</label>
            <select name="fuelType" className="w-full rounded border px-3 py-2" value={filters.fuelType} onChange={handleFilterChange}>
              <option value="">Select fuel types</option>
              {/* Add fuel type options here */}
            </select>
        </div>
          <div className="mb-4">
            <label className="block text-gray-700 font-semibold mb-2">Price Range (₦/L)</label>
            <div className="flex gap-2 items-center">
              <input type="number" name="priceMin" min={0} max={filters.priceMax} value={filters.priceMin} onChange={handleFilterChange} className="w-20 rounded border px-2 py-1" />
              <span>to</span>
              <input type="number" name="priceMax" min={filters.priceMin} max={1000} value={filters.priceMax} onChange={handleFilterChange} className="w-20 rounded border px-2 py-1" />
                  </div>
                </div>
          <div className="mb-4">
            <label className="block text-gray-700 font-semibold mb-2">Delivery Time</label>
            <select name="deliveryTime" className="w-full rounded border px-3 py-2" value={filters.deliveryTime} onChange={handleFilterChange}>
              <option value="">Select delivery times</option>
              {/* Add delivery time options here */}
            </select>
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 font-semibold mb-2">Minimum Rating</label>
            <select name="minRating" className="w-full rounded border px-3 py-2" value={filters.minRating} onChange={handleFilterChange}>
              <option value="">Any Rating</option>
              <option value="1">1+</option>
              <option value="2">2+</option>
              <option value="3">3+</option>
              <option value="4">4+</option>
              <option value="5">5</option>
            </select>
        </div>
          <button className="w-full bg-green-400 text-white font-semibold py-2 rounded mb-2 hover:bg-green-500">Show Vendors Near Me</button>
          <button className="w-full bg-gray-200 text-gray-700 font-semibold py-2 rounded hover:bg-gray-300">Reset Filters</button>
        </aside>

        {/* Vendor Results Grid */}
        <main className="flex-1">
          <VendorGrid vendors={vendors} isLoading={isLoading} onOrder={handleOrder} />
        </main>
        </div>
    </div>
  );
} 