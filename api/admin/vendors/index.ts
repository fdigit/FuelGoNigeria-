import { ApiRequest, ApiResponse } from '../../types/api';
import { prisma } from '../../db';
import jwt from 'jsonwebtoken';
import { cors } from '../../middleware/cors';

// Auth middleware
const authMiddleware = async (req: ApiRequest, res: ApiResponse) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || typeof authHeader !== 'string' || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' });
  }
  const token = authHeader.substring(7);
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;
    req.user = decoded;
    return null;
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// Admin middleware
const adminMiddleware = async (req: ApiRequest, res: ApiResponse) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  
  if (!['ADMIN', 'SUPER_ADMIN'].includes(req.user.role)) {
    return res.status(403).json({ message: 'Admin access required' });
  }
  
  return null;
};

export default async function handler(req: ApiRequest, res: ApiResponse) {
  // Handle CORS
  if (cors(req, res)) return;

  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Check authentication
    const authError = await authMiddleware(req, res);
    if (authError) return;

    // Check admin access
    const adminError = await adminMiddleware(req, res);
    if (adminError) return;

    const vendors = await prisma.vendor.findMany({
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

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

    res.json(transformedVendors);
  } catch (error) {
    console.error('Error fetching vendors:', error);
    res.status(500).json({ message: 'Error fetching vendors' });
  }
} 