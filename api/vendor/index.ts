import { ApiRequest, ApiResponse } from '../types/api';
import { prisma } from '../db';
import { cors } from '../middleware/cors';

export default async function handler(req: ApiRequest, res: ApiResponse) {
  // Handle CORS
  if (cors(req, res)) return;

  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    console.log('=== VENDOR LISTING ENDPOINT CALLED ===');
    
    const vendors = await prisma.vendor.findMany({
      where: { isActive: true },
      select: {
        id: true,
        businessName: true,
        logo: true,
        isActive: true,
        address: true,
        verificationStatus: true,
        averageRating: true,
        totalRatings: true,
        operatingHours: true,
        fuelTypes: true,
        services: true,
        paymentMethods: true,
        minimumOrder: true,
        deliveryFee: true,
        rating: true,
        totalReviews: true,
        isVerified: true,
        createdAt: true,
        updatedAt: true,
        user: {
          select: {
            email: true
          }
        }
      }
    });

    console.log('Raw vendors from database:', vendors.map(v => ({ 
      id: v.id, 
      businessName: v.businessName, 
      logo: v.logo,
      isActive: v.isActive,
      userEmail: v.user?.email,
      address: v.address
    })));

    // Transform data to match frontend expectations
    const transformedVendors = vendors.map(vendor => {
      const transformed = {
        _id: vendor.id,
        business_name: vendor.businessName,
        logo: vendor.logo,
        verification_status: vendor.verificationStatus?.toLowerCase() || 'pending',
        address: vendor.address,
        average_rating: vendor.averageRating || 0,
        total_ratings: vendor.totalRatings || 0,
        operating_hours: vendor.operatingHours || { open: '08:00', close: '18:00' },
        fuel_types: vendor.fuelTypes || [],
        contact: {
          phone: '',
          email: vendor.user?.email || ''
        },
        services: vendor.services || [],
        payment_methods: vendor.paymentMethods || [],
        minimum_order: vendor.minimumOrder || 0,
        delivery_fee: vendor.deliveryFee || 0,
        rating: vendor.rating || 0,
        reviews: vendor.totalReviews || 0,
        is_verified: vendor.isVerified || false,
        is_active: vendor.isActive,
        created_at: vendor.createdAt?.toISOString() || new Date().toISOString(),
        updated_at: vendor.updatedAt?.toISOString() || new Date().toISOString()
      };
      console.log('Transformed vendor:', { 
        id: transformed._id, 
        business_name: transformed.business_name, 
        logo: transformed.logo,
        userEmail: transformed.contact.email,
        address: transformed.address,
        fuel_types: transformed.fuel_types
      });
      return transformed;
    });

    console.log('Final vendor list with logos:', transformedVendors.map(v => ({ 
      id: v._id, 
      business_name: v.business_name, 
      logo: v.logo,
      userEmail: v.contact.email
    })));

    res.json(transformedVendors);
  } catch (error) {
    console.error('Error fetching vendors:', error);
    res.status(500).json({ message: 'Error fetching vendors' });
  }
} 