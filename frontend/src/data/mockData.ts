import { Vendor } from '../types';

export interface FuelStation {
  id: string;
  name: string;
  location: {
    address: string;
    city: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  rating: number;
  reviews: number;
  fuelTypes: {
    type: string;
    price: number;
    unit: string;
  }[];
  services: string[];
  operatingHours: string;
  contact: {
    phone: string;
    email: string;
  };
  images: string[];
}

export const fuelStations: FuelStation[] = [
  {
    id: '1',
    name: 'Shell Express',
    location: {
      address: '123 Victoria Island Road',
      city: 'Lagos',
      coordinates: { lat: 6.4281, lng: 3.4219 },
    },
    rating: 4.5,
    reviews: 128,
    fuelTypes: [
      { type: 'Premium', price: 650, unit: 'NGN/L' },
      { type: 'Regular', price: 580, unit: 'NGN/L' },
      { type: 'Diesel', price: 620, unit: 'NGN/L' },
    ],
    services: ['24/7 Service', 'Air Pump', 'Car Wash', 'Convenience Store'],
    operatingHours: '24/7',
    contact: {
      phone: '+234 801 234 5678',
      email: 'shell.express@example.com',
    },
    images: [
      'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    ],
  },
  {
    id: '2',
    name: 'Total Energies',
    location: {
      address: '45 Lekki Expressway',
      city: 'Lagos',
      coordinates: { lat: 6.4281, lng: 3.4219 },
    },
    rating: 4.3,
    reviews: 95,
    fuelTypes: [
      { type: 'Premium', price: 645, unit: 'NGN/L' },
      { type: 'Regular', price: 575, unit: 'NGN/L' },
      { type: 'Diesel', price: 615, unit: 'NGN/L' },
    ],
    services: ['24/7 Service', 'Air Pump', 'Car Wash'],
    operatingHours: '24/7',
    contact: {
      phone: '+234 802 345 6789',
      email: 'total.energies@example.com',
    },
    images: [
      'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    ],
  },
  {
    id: '3',
    name: 'Mobil Super',
    location: {
      address: '78 Ikoyi Road',
      city: 'Lagos',
      coordinates: { lat: 6.4281, lng: 3.4219 },
    },
    rating: 4.7,
    reviews: 156,
    fuelTypes: [
      { type: 'Premium', price: 655, unit: 'NGN/L' },
      { type: 'Regular', price: 585, unit: 'NGN/L' },
      { type: 'Diesel', price: 625, unit: 'NGN/L' },
    ],
    services: ['24/7 Service', 'Air Pump', 'Car Wash', 'Convenience Store', 'ATM'],
    operatingHours: '24/7',
    contact: {
      phone: '+234 803 456 7890',
      email: 'mobil.super@example.com',
    },
    images: [
      'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    ],
  },
];

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
    location: {
      city: 'Lagos',
      address: 'Victoria Island'
    },
    rating: 4.5,
    fuelTypes: [
      { type: 'Petrol (PMS)', price: 650 },
      { type: 'Diesel (AGO)', price: 680 }
    ],
    deliveryTime: 'Within 30 mins',
    isTopVendor: true,
    isFastDelivery: true,
    hasHotPrice: true,
    reviews: [
      {
        id: '1',
        rating: 5,
        comment: 'Fast delivery and great service!',
        userName: 'John D.'
      },
      {
        id: '2',
        rating: 4,
        comment: 'Good prices and reliable delivery.',
        userName: 'Sarah M.'
      }
    ]
  },
  {
    id: '2',
    name: 'City Gas Station',
    location: {
      city: 'Lagos',
      address: 'Ikeja'
    },
    rating: 4.2,
    fuelTypes: [
      { type: 'Petrol (PMS)', price: 645 },
      { type: 'Diesel (AGO)', price: 675 }
    ],
    deliveryTime: 'Within 45 mins',
    isTopVendor: false,
    isFastDelivery: true,
    hasHotPrice: false,
    reviews: [
      {
        id: '3',
        rating: 4,
        comment: 'Reliable service.',
        userName: 'Mike R.'
      }
    ]
  }
]; 