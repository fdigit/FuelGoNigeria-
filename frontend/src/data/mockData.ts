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
    _id: '1',
    business_name: 'QuickFuel Station',
    image: '/images/station1.jpg',
    verification_status: 'verified',
    address: {
      city: 'Lagos',
      state: 'Lagos',
      country: 'Nigeria',
    },
    average_rating: 4.5,
    total_ratings: 120,
    operating_hours: {
      open: '06:00',
      close: '22:00',
    },
    fuel_types: ['PMS', 'Diesel'],
    contact: {
      phone: '+2341234567890',
      email: 'john@quickfuel.com',
    },
    services: ['Car Wash', 'Mini Mart'],
    payment_methods: ['Cash', 'Card'],
    minimum_order: 20,
    delivery_fee: 500,
    rating: 4.5,
    reviews: 120,
    is_verified: true,
    is_active: true,
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z',
  },
  {
    _id: '2',
    business_name: 'CityGas',
    image: '/images/station2.jpg',
    verification_status: 'pending',
    address: {
      city: 'Abuja',
      state: 'FCT',
      country: 'Nigeria',
    },
    average_rating: 4.2,
    total_ratings: 80,
    operating_hours: {
      open: '07:00',
      close: '21:00',
    },
    fuel_types: ['PMS', 'Diesel', 'Kerosene'],
    contact: {
      phone: '+2349876543210',
      email: 'jane@citygas.com',
    },
    services: ['Tyre Service'],
    payment_methods: ['Cash', 'Card', 'Transfer'],
    minimum_order: 10,
    delivery_fee: 700,
    rating: 4.2,
    reviews: 80,
    is_verified: false,
    is_active: true,
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z',
  },
]; 