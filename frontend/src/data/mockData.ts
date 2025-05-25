import { Vendor } from '../types';

export const fuelPrices = {
  premium: {
    min: 575,
    max: 655,
    average: 615,
    unit: 'NGN/L',
  },
  regular: {
    min: 505,
    max: 585,
    average: 545,
    unit: 'NGN/L',
  },
  diesel: {
    min: 545,
    max: 625,
    average: 585,
    unit: 'NGN/L',
  },
};

export const testimonials = [
  {
    id: 1,
    name: 'John Doe',
    role: 'Regular Customer',
    content: 'FuelGo has made refueling so convenient. I can order fuel anytime, anywhere!',
    rating: 5,
  },
  {
    id: 2,
    name: 'Sarah Johnson',
    role: 'Business Owner',
    content: 'As a fleet manager, FuelGo has streamlined our fuel management process significantly.',
    rating: 5,
  },
  {
    id: 3,
    name: 'Michael Chen',
    role: 'Driver',
    content: 'The app is intuitive and the delivery service is reliable. Highly recommended!',
    rating: 4,
  },
];

export const mockVendors: Vendor[] = [
  {
    id: '1',
    name: 'Quick Fuel Station',
    location: 'Lagos, Victoria Island',
    rating: 4.5,
    totalRatings: 128,
    isTopVendor: true,
    hasFastDelivery: true,
    hasHotPrice: true,
    priceRange: {
      min: 650,
      max: 680
    },
    deliveryTime: 'Within 30 mins',
    fuelTypes: ['Petrol (PMS)', 'Diesel (AGO)'],
    contact: {
      name: 'John Doe',
      email: 'john@quickfuel.com',
      phone: '+2341234567890'
    },
    products: [
      {
        _id: 'p1',
        type: 'PMS',
        name: 'Premium Petrol',
        description: 'High-quality premium petrol',
        price_per_unit: 650,
        unit: 'litre',
        available_qty: 1000,
        min_order_qty: 5,
        max_order_qty: 100,
        status: 'available',
        specifications: {
          octane_rating: 95
        }
      },
      {
        _id: 'p2',
        type: 'Diesel',
        name: 'Automotive Diesel',
        description: 'High-quality diesel fuel',
        price_per_unit: 680,
        unit: 'litre',
        available_qty: 800,
        min_order_qty: 5,
        max_order_qty: 100,
        status: 'available',
        specifications: {
          cetane_number: 51
        }
      }
    ]
  },
  {
    id: '2',
    name: 'City Gas Station',
    location: 'Lagos, Ikeja',
    rating: 4.2,
    totalRatings: 95,
    isTopVendor: false,
    hasFastDelivery: true,
    hasHotPrice: false,
    priceRange: {
      min: 645,
      max: 675
    },
    deliveryTime: 'Within 45 mins',
    fuelTypes: ['Petrol (PMS)', 'Diesel (AGO)'],
    contact: {
      name: 'Jane Smith',
      email: 'jane@citygas.com',
      phone: '+2349876543210'
    },
    products: [
      {
        _id: 'p3',
        type: 'PMS',
        name: 'Regular Petrol',
        description: 'Standard quality petrol',
        price_per_unit: 645,
        unit: 'litre',
        available_qty: 1200,
        min_order_qty: 5,
        max_order_qty: 100,
        status: 'available',
        specifications: {
          octane_rating: 87
        }
      },
      {
        _id: 'p4',
        type: 'Diesel',
        name: 'Automotive Diesel',
        description: 'Standard quality diesel fuel',
        price_per_unit: 675,
        unit: 'litre',
        available_qty: 900,
        min_order_qty: 5,
        max_order_qty: 100,
        status: 'available',
        specifications: {
          cetane_number: 48
        }
      }
    ]
  }
]; 