import { ApiRequest, ApiResponse } from '../../types/api';
import { prisma } from '../../db';
import { cors } from '../../middleware/cors';

export default async function handler(req: ApiRequest, res: ApiResponse) {
  // Handle CORS
  if (cors(req, res)) return;

  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { vendorId } = req.query;
    console.log('=== VENDOR DETAIL ENDPOINT CALLED ===', vendorId);
    
    if (!vendorId || typeof vendorId !== 'string') {
      return res.status(400).json({ message: 'Vendor ID is required' });
    }
    
    const vendor = await prisma.vendor.findUnique({
      where: { 
        id: vendorId,
        isActive: true 
      },
      include: {
        user: {
          select: {
            email: true,
            phoneNumber: true
          }
        },
        products: {
          where: {
            status: 'AVAILABLE'
          },
          orderBy: {
            name: 'asc'
          }
        }
      }
    });

    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    // Transform data to match frontend expectations
    const transformedVendor = {
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
        phone: vendor.user?.phoneNumber || '',
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
      updated_at: vendor.updatedAt?.toISOString() || new Date().toISOString(),
      products: vendor.products.map(product => ({
        _id: product.id,
        name: product.name,
        type: product.type,
        description: product.description,
        price_per_unit: product.pricePerUnit,
        unit: product.unit.toLowerCase(),
        available_qty: product.availableQty,
        min_order_qty: product.minOrderQty,
        max_order_qty: product.maxOrderQty,
        status: product.status.toLowerCase().replace('_', ''),
        image_url: product.imageUrl,
        specifications: product.specifications
      }))
    };

    console.log('Vendor detail response:', {
      id: transformedVendor._id,
      business_name: transformedVendor.business_name,
      products_count: transformedVendor.products.length
    });

    res.json(transformedVendor);
  } catch (error) {
    console.error('Error fetching vendor details:', error);
    res.status(500).json({ message: 'Error fetching vendor details' });
  }
} 