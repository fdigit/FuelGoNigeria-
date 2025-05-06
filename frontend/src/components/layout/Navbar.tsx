import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MagnifyingGlassIcon, 
  MapPinIcon, 
  SunIcon, 
  MoonIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline';

interface NavbarProps {
  onSearch: (query: string) => void;
  onLocationSelect: (location: string) => void;
}

export default function Navbar({ onSearch, onLocationSelect }: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const location = useLocation();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle dark mode
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Mock locations for search
  const locations = [
    'Lagos, Nigeria',
    'Port Harcourt, Rivers',
    'Abuja, FCT',
    'Ibadan, Oyo',
    'Kano, Kano State',
  ];

  const filteredLocations = locations.filter(loc =>
    loc.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setShowSearchResults(true);
  };

  const handleLocationSelect = (location: string) => {
    setSearchQuery(location);
    setShowSearchResults(false);
    setIsSearchExpanded(false);
    onLocationSelect(location);
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white dark:bg-gray-900 shadow-lg'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">
              FuelGo
            </span>
          </Link>

          {/* Search Bar - Hidden on mobile unless expanded */}
          <div className={`flex-1 max-w-2xl mx-8 relative ${isSearchExpanded ? 'block' : 'hidden md:block'}`}>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearch}
                onFocus={() => setShowSearchResults(true)}
                placeholder="Search by location..."
                className="w-full pl-10 pr-4 py-2 rounded-full border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-800 dark:text-white"
              />
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            </div>

            {/* Search Results Dropdown */}
            <AnimatePresence>
              {showSearchResults && searchQuery && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute w-full mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden"
                >
                  {filteredLocations.map((location) => (
                    <button
                      key={location}
                      onClick={() => handleLocationSelect(location)}
                      className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                    >
                      <MapPinIcon className="h-5 w-5 text-gray-400 mr-2" />
                      {location}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Mobile Search Button */}
          <button
            onClick={() => setIsSearchExpanded(!isSearchExpanded)}
            className="md:hidden p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
          </button>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-4">
            <Link
              to="/vendors"
              className={`text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 ${
                location.pathname === '/vendors' ? 'text-primary-600 dark:text-primary-400' : ''
              }`}
            >
              Vendors
            </Link>
            <Link
              to="/track"
              className={`text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 ${
                location.pathname === '/track' ? 'text-primary-600 dark:text-primary-400' : ''
              }`}
            >
              Track Order
            </Link>
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              {isDarkMode ? (
                <SunIcon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
              ) : (
                <MoonIcon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
              )}
            </button>
            <Link
              to="/login"
              className="btn-primary"
            >
              Login
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            {isMobileMenuOpen ? (
              <XMarkIcon className="h-6 w-6 text-gray-600 dark:text-gray-300" />
            ) : (
              <Bars3Icon className="h-6 w-6 text-gray-600 dark:text-gray-300" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700"
          >
            <div className="px-4 py-3 space-y-3">
              <Link
                to="/vendors"
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  location.pathname === '/vendors'
                    ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/50'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Vendors
              </Link>
              <Link
                to="/track"
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  location.pathname === '/track'
                    ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/50'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Track Order
              </Link>
              <button
                onClick={() => {
                  setIsDarkMode(!isDarkMode);
                  setIsMobileMenuOpen(false);
                }}
                className="w-full flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                {isDarkMode ? (
                  <>
                    <SunIcon className="h-5 w-5 mr-2" />
                    Light Mode
                  </>
                ) : (
                  <>
                    <MoonIcon className="h-5 w-5 mr-2" />
                    Dark Mode
                  </>
                )}
              </button>
              <Link
                to="/login"
                className="block w-full text-center btn-primary"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Login
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
} 