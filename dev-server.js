const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { PrismaClient, OrderStatus } = require('@prisma/client');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const prisma = new PrismaClient();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/logos';
    console.log('Multer destination called with uploadDir:', uploadDir);
    console.log('Current working directory:', process.cwd());
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      console.log('Creating upload directory:', uploadDir);
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    const fullPath = path.resolve(uploadDir);
    console.log('Full upload path:', fullPath);
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const filename = 'logo-' + uniqueSuffix + path.extname(file.originalname);
    console.log('Generated filename:', filename);
    cb(null, filename);
  }
});

const fileFilter = (req, file, cb) => {
  // Accept only image files
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));

// Serve uploaded files statically
app.use('/uploads', express.static('uploads'));

// Test endpoint for static file serving
app.get('/api/test-static', (req, res) => {
  const uploadDir = path.resolve('uploads/logos');
  const files = fs.readdirSync(uploadDir).filter(file => file.endsWith('.jpeg') || file.endsWith('.jpg') || file.endsWith('.png'));
  res.json({
    uploadDir,
    files,
    testUrl: files.length > 0 ? `/uploads/logos/${files[0]}` : null
  });
});

// Test endpoint to show all vendors and their logos
app.get('/api/test-vendors', async (req, res) => {
  try {
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

    const vendorData = vendors.map(vendor => ({
      id: vendor.id,
      businessName: vendor.businessName,
      logo: vendor.logo,
      isActive: vendor.isActive,
      user: vendor.user
    }));

    res.json({
      totalVendors: vendors.length,
      activeVendors: vendors.filter(v => v.isActive).length,
      vendors: vendorData
    });
  } catch (error) {
    console.error('Error fetching vendors for test:', error);
    res.status(500).json({ message: 'Error fetching vendors' });
  }
});

// Test endpoint to query specific vendor by email
app.get('/api/test-vendor/:email', async (req, res) => {
  try {
    const { email } = req.params;
    
    const vendor = await prisma.vendor.findFirst({
      where: {
        user: {
          email: email
        }
      },
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

    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    res.json({
      id: vendor.id,
      businessName: vendor.businessName,
      logo: vendor.logo,
      isActive: vendor.isActive,
      user: vendor.user
    });
  } catch (error) {
    console.error('Error fetching vendor by email:', error);
    res.status(500).json({ message: 'Error fetching vendor' });
  }
});

// Add request logging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - ${new Date().toISOString()}`);
  next();
});

app.use(express.json());

// Auth middleware
const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' });
  }
  const token = authHeader.substring(7);
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

const adminMiddleware = (req, res, next) => {
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Development server running with Prisma' });
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const { firstName, lastName, email, password, phone, role } = req.body;
    
    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { phoneNumber: phone }
        ]
      }
    });

    if (existingUser) {
      return res.status(400).json({ 
        message: existingUser.email === email ? 'Email already exists' : 'Phone number already exists' 
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Convert role to uppercase to match Prisma enum
    const normalizedRole = role ? role.toUpperCase() : 'CUSTOMER';

    // Create user
    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        password: hashedPassword,
        phoneNumber: phone,
        role: normalizedRole,
        status: 'PENDING'
      }
    });

    // If user is a vendor, create vendor record
    if (normalizedRole === 'VENDOR') {
      await prisma.vendor.create({
        data: {
          userId: user.id,
          businessName: req.body.businessName || 'TBD',
          address: {
            city: 'Lagos',
            state: 'Lagos',
            country: 'Nigeria'
          },
          operatingHours: {
            open: '06:00',
            close: '22:00',
            days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
          },
          fuelTypes: ['PMS', 'Diesel'],
          services: ['Fuel Delivery'],
          paymentMethods: ['Cash', 'Card'],
          minimumOrder: 0,
          deliveryFee: 0,
          rating: 0,
          totalReviews: 0,
          isVerified: false,
          isActive: true
        }
      });
    }

    // Generate token
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'Registration successful',
      user: {
        _id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        status: user.status
      },
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Error during registration' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check if account is pending
    if (user.status === 'PENDING') {
      return res.status(403).json({
        message: 'Account pending approval',
        status: 'pending',
      });
    }

    // Check if account is rejected
    if (user.status === 'REJECTED') {
      return res.status(403).json({
        message: 'Account has been rejected',
        status: 'rejected',
      });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        _id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        status: user.status,
        phoneNumber: user.phoneNumber
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Error during login' });
  }
});

// Token validation endpoint
app.get('/api/auth/validate-token', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        status: true,
        phoneNumber: true
      }
    });

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    res.json({
      valid: true,
      user: {
        _id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        status: user.status,
        phoneNumber: user.phoneNumber
      }
    });
  } catch (error) {
    console.error('Token validation error:', error);
    res.status(401).json({ message: 'Invalid token' });
  }
});

app.get('/api/admin/vendors', authMiddleware, adminMiddleware, async (req, res) => {
  try {
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
});

app.patch('/api/admin/vendors/:vendorId/verify', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { vendorId } = req.params;
    const { status } = req.body;
    
    const vendor = await prisma.vendor.update({
      where: { id: vendorId },
      data: { 
        verificationStatus: status.toUpperCase(),
        isVerified: status.toUpperCase() === 'VERIFIED'
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            status: true
          }
        }
      }
    });

    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    // If vendor is being verified, also approve the user account
    if (status.toUpperCase() === 'VERIFIED' && vendor.user.status === 'PENDING') {
      await prisma.user.update({
        where: { id: vendor.user.id },
        data: { status: 'ACTIVE' }
      });
    }

    // Transform vendor data
    const transformedVendor = {
      _id: vendor.id,
      business_name: vendor.businessName,
      logo: vendor.logo,
      address: vendor.address,
      contact: {
        email: vendor.user?.email || ''
      },
      is_active: vendor.isActive
    };

    res.json({
      message: `Vendor ${status} successfully`,
      vendor: transformedVendor
    });
  } catch (error) {
    console.error('Error updating vendor:', error);
    res.status(500).json({ message: 'Error updating vendor' });
  }
});

app.get('/api/vendor', async (req, res) => {
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
      address: v.address,
      fullVendor: v
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
});

// Vendor Product Endpoints - MUST COME BEFORE /api/vendor/:vendorId
app.get('/api/vendor/products', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    
    // Find vendor by userId
    const vendor = await prisma.vendor.findUnique({
      where: { userId },
      include: {
        products: true
      }
    });

    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    // Transform products to match frontend expectations
    const transformedProducts = vendor.products.map(product => ({
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
      specifications: product.specifications ? {
        octane_rating: product.specifications.octaneRating,
        cetane_number: product.specifications.cetaneNumber,
        flash_point: product.specifications.flashPoint,
        pressure: product.specifications.pressure
      } : undefined
    }));

    res.json(transformedProducts);
  } catch (error) {
    console.error('Error fetching vendor products:', error);
    res.status(500).json({ message: 'Error fetching products' });
  }
});

app.post('/api/vendor/products', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const {
      name,
      type,
      description,
      price_per_unit,
      min_order_qty,
      max_order_qty,
      available_qty,
      specifications
    } = req.body;

    console.log('Received product data:', {
      name,
      type,
      description,
      price_per_unit,
      min_order_qty,
      max_order_qty,
      available_qty,
      specifications
    });

    // Find vendor by userId
    const vendor = await prisma.vendor.findUnique({
      where: { userId }
    });

    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    // Validate fuel type
    const validFuelTypes = ['PMS', 'DIESEL', 'KEROSENE', 'GAS'];
    if (!validFuelTypes.includes(type.toUpperCase())) {
      return res.status(400).json({ message: 'Invalid fuel type' });
    }

    // Determine unit based on fuel type
    const unit = type.toUpperCase() === 'GAS' ? 'KG' : 'LITRE';

    // Prepare specifications for Prisma
    const prismaSpecifications = specifications ? {
      octaneRating: specifications.octane_rating || null,
      cetaneNumber: specifications.cetane_number || null,
      flashPoint: specifications.flash_point || null,
      pressure: specifications.pressure || null
    } : null;

    console.log('Prisma specifications:', prismaSpecifications);

    // Create product
    const product = await prisma.product.create({
      data: {
        vendorId: vendor.id,
        type: type.toUpperCase(),
        name,
        description,
        pricePerUnit: parseFloat(price_per_unit),
        unit,
        availableQty: parseFloat(available_qty),
        minOrderQty: parseFloat(min_order_qty),
        maxOrderQty: parseFloat(max_order_qty),
        status: 'AVAILABLE',
        specifications: prismaSpecifications
      }
    });

    // Transform response
    const transformedProduct = {
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
      specifications: product.specifications ? {
        octane_rating: product.specifications.octaneRating,
        cetane_number: product.specifications.cetaneNumber,
        flash_point: product.specifications.flashPoint,
        pressure: product.specifications.pressure
      } : undefined
    };

    res.status(201).json(transformedProduct);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ message: 'Error creating product' });
  }
});

app.put('/api/vendor/products/:productId', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { productId } = req.params;
    const {
      name,
      type,
      description,
      price_per_unit,
      min_order_qty,
      max_order_qty,
      available_qty,
      specifications
    } = req.body;

    console.log('Received update product data:', {
      productId,
      name,
      type,
      description,
      price_per_unit,
      min_order_qty,
      max_order_qty,
      available_qty,
      specifications
    });

    // Find vendor by userId
    const vendor = await prisma.vendor.findUnique({
      where: { userId }
    });

    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    // Check if product belongs to this vendor
    const existingProduct = await prisma.product.findFirst({
      where: {
        id: productId,
        vendorId: vendor.id
      }
    });

    if (!existingProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Validate fuel type
    const validFuelTypes = ['PMS', 'DIESEL', 'KEROSENE', 'GAS'];
    if (!validFuelTypes.includes(type.toUpperCase())) {
      return res.status(400).json({ message: 'Invalid fuel type' });
    }

    // Determine unit based on fuel type
    const unit = type.toUpperCase() === 'GAS' ? 'KG' : 'LITRE';

    // Prepare specifications for Prisma
    const prismaSpecifications = specifications ? {
      octaneRating: specifications.octane_rating || null,
      cetaneNumber: specifications.cetane_number || null,
      flashPoint: specifications.flash_point || null,
      pressure: specifications.pressure || null
    } : null;

    console.log('Prisma specifications for update:', prismaSpecifications);

    // Update product
    const product = await prisma.product.update({
      where: { id: productId },
      data: {
        type: type.toUpperCase(),
        name,
        description,
        pricePerUnit: parseFloat(price_per_unit),
        unit,
        availableQty: parseFloat(available_qty),
        minOrderQty: parseFloat(min_order_qty),
        maxOrderQty: parseFloat(max_order_qty),
        specifications: prismaSpecifications
      }
    });

    // Transform response
    const transformedProduct = {
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
      specifications: product.specifications ? {
        octane_rating: product.specifications.octaneRating,
        cetane_number: product.specifications.cetaneNumber,
        flash_point: product.specifications.flashPoint,
        pressure: product.specifications.pressure
      } : undefined
    };

    res.json(transformedProduct);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ message: 'Error updating product' });
  }
});

app.delete('/api/vendor/products/:productId', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { productId } = req.params;

    // Find vendor by userId
    const vendor = await prisma.vendor.findUnique({
      where: { userId }
    });

    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    // Check if product belongs to this vendor
    const existingProduct = await prisma.product.findFirst({
      where: {
        id: productId,
        vendorId: vendor.id
      }
    });

    if (!existingProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Delete product
    await prisma.product.delete({
      where: { id: productId }
    });

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ message: 'Error deleting product' });
  }
});

// Driver Management Routes
app.get('/api/vendor/drivers', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    
    // Find vendor by userId
    const vendor = await prisma.vendor.findUnique({
      where: { userId }
    });

    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }
    
    const drivers = await prisma.driver.findMany({
      where: {
        vendorId: vendor.id,
        isActive: true
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            phoneNumber: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const transformedDrivers = drivers.map(driver => ({
      id: driver.id,
      name: `${driver.firstName} ${driver.lastName}`,
      email: driver.email,
      phone: driver.phoneNumber,
      status: driver.status.toLowerCase(),
      currentLocation: driver.currentLocation,
      rating: driver.rating,
      totalDeliveries: driver.totalDeliveries,
      activeOrders: 0, // TODO: Calculate from orders
      vehicleDetails: {
        type: driver.vehicleType,
        plateNumber: driver.vehiclePlate,
        capacity: driver.vehicleCapacity || 0
      },
      licenseNumber: driver.licenseNumber,
      licenseExpiry: driver.licenseExpiry,
      isActive: driver.isActive,
      createdAt: driver.createdAt
    }));

    res.json(transformedDrivers);
  } catch (error) {
    console.error('Error fetching drivers:', error);
    res.status(500).json({ message: 'Error fetching drivers' });
  }
});

app.post('/api/vendor/drivers', authMiddleware, async (req, res) => {
  try {
    console.log('Received driver creation request:', req.body);
    console.log('User ID from token:', req.user.userId);
    
    const userId = req.user.userId;
    const {
      firstName,
      lastName,
      email,
      phoneNumber,
      password,
      licenseNumber,
      licenseExpiry,
      licenseType,
      vehicleType,
      vehiclePlate,
      vehicleModel,
      vehicleColor,
      vehicleCapacity,
      emergencyContact
    } = req.body;

    console.log('Parsed driver data:', {
      firstName,
      lastName,
      email,
      phoneNumber,
      licenseNumber,
      licenseExpiry,
      licenseType,
      vehicleType,
      vehiclePlate,
      vehicleModel,
      vehicleColor,
      vehicleCapacity,
      emergencyContact
    });

    // Find vendor by userId
    const vendor = await prisma.vendor.findUnique({
      where: { userId }
    });

    console.log('Found vendor:', vendor);

    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    // Check if driver already exists
    const existingDriver = await prisma.driver.findFirst({
      where: {
        OR: [
          { email },
          { phoneNumber }
        ]
      }
    });

    console.log('Existing driver check:', existingDriver);

    if (existingDriver) {
      return res.status(400).json({
        message: existingDriver.email === email ? 'Email already exists' : 'Phone number already exists'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('Password hashed successfully');

    // Create user first
    console.log('Creating user...');
    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        password: hashedPassword,
        phoneNumber,
        role: 'DRIVER',
        status: 'ACTIVE'
      }
    });

    console.log('User created:', user);

    // Create driver record
    console.log('Creating driver record...');
    const driver = await prisma.driver.create({
      data: {
        userId: user.id,
        vendorId: vendor.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        status: 'AVAILABLE',
        rating: 4.5,
        totalDeliveries: 0,
        totalEarnings: 0,
        licenseNumber: 'DL123456',
        licenseExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        licenseType: 'Commercial',
        vehicleType: 'Motorcycle',
        vehiclePlate: 'TEST123',
        vehicleModel: 'Honda CG125',
        vehicleColor: 'Red',
        vehicleCapacity: 50,
        isActive: true
      }
    });

    console.log('Driver created successfully:', driver);

    res.status(201).json({
      message: 'Driver added successfully',
      driver: {
        id: driver.id,
        name: `${driver.firstName} ${driver.lastName}`,
        email: driver.email,
        phone: driver.phoneNumber,
        status: driver.status.toLowerCase(),
        vehicleDetails: {
          type: driver.vehicleType,
          plateNumber: driver.vehiclePlate,
          capacity: driver.vehicleCapacity || 0
        }
      }
    });
  } catch (error) {
    console.error('Error adding driver:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      meta: error.meta,
      stack: error.stack
    });
    res.status(500).json({ 
      message: 'Error adding driver',
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

app.patch('/api/vendor/drivers/:driverId/status', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { driverId } = req.params;
    const { status } = req.body;

    // Find vendor by userId
    const vendor = await prisma.vendor.findUnique({
      where: { userId }
    });

    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    // Verify driver belongs to vendor
    const driver = await prisma.driver.findFirst({
      where: {
        id: driverId,
        vendorId: vendor.id
      }
    });

    if (!driver) {
      return res.status(404).json({ message: 'Driver not found' });
    }

    const updatedDriver = await prisma.driver.update({
      where: { id: driverId },
      data: { status: status.toUpperCase() },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            phoneNumber: true
          }
        }
      }
    });

    res.json({
      message: 'Driver status updated successfully',
      driver: {
        id: updatedDriver.id,
        name: `${updatedDriver.firstName} ${updatedDriver.lastName}`,
        status: updatedDriver.status.toLowerCase()
      }
    });
  } catch (error) {
    console.error('Error updating driver status:', error);
    res.status(500).json({ message: 'Error updating driver status' });
  }
});

app.put('/api/vendor/drivers/:driverId', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { driverId } = req.params;
    const updateData = req.body;

    // Find vendor by userId
    const vendor = await prisma.vendor.findUnique({
      where: { userId }
    });

    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    // Verify driver belongs to vendor
    const driver = await prisma.driver.findFirst({
      where: {
        id: driverId,
        vendorId: vendor.id
      }
    });

    if (!driver) {
      return res.status(404).json({ message: 'Driver not found' });
    }

    // Prepare update data
    const dataToUpdate = {};
    
    if (updateData.firstName) dataToUpdate.firstName = updateData.firstName;
    if (updateData.lastName) dataToUpdate.lastName = updateData.lastName;
    if (updateData.phoneNumber) dataToUpdate.phoneNumber = updateData.phoneNumber;
    if (updateData.licenseNumber) dataToUpdate.licenseNumber = updateData.licenseNumber;
    if (updateData.licenseExpiry) dataToUpdate.licenseExpiry = new Date(updateData.licenseExpiry);
    if (updateData.licenseType) dataToUpdate.licenseType = updateData.licenseType;
    if (updateData.vehicleType) dataToUpdate.vehicleType = updateData.vehicleType;
    if (updateData.vehiclePlate) dataToUpdate.vehiclePlate = updateData.vehiclePlate;
    if (updateData.vehicleModel) dataToUpdate.vehicleModel = updateData.vehicleModel;
    if (updateData.vehicleColor) dataToUpdate.vehicleColor = updateData.vehicleColor;
    if (updateData.vehicleCapacity) dataToUpdate.vehicleCapacity = parseFloat(updateData.vehicleCapacity);
    if (updateData.emergencyContact) {
      dataToUpdate.emergencyContact = {
        name: updateData.emergencyContact.name,
        phone: updateData.emergencyContact.phone,
        relationship: updateData.emergencyContact.relationship
      };
    }

    const updatedDriver = await prisma.driver.update({
      where: { id: driverId },
      data: dataToUpdate,
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            phoneNumber: true
          }
        }
      }
    });

    res.json({
      message: 'Driver profile updated successfully',
      driver: {
        id: updatedDriver.id,
        name: `${updatedDriver.firstName} ${updatedDriver.lastName}`,
        email: updatedDriver.email,
        phone: updatedDriver.phoneNumber,
        status: updatedDriver.status.toLowerCase(),
        vehicleDetails: {
          type: updatedDriver.vehicleType,
          plateNumber: updatedDriver.vehiclePlate,
          capacity: updatedDriver.vehicleCapacity || 0
        }
      }
    });
  } catch (error) {
    console.error('Error updating driver profile:', error);
    res.status(500).json({ message: 'Error updating driver profile' });
  }
});

app.patch('/api/vendor/drivers/:driverId/deactivate', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { driverId } = req.params;

    // Find vendor by userId
    const vendor = await prisma.vendor.findUnique({
      where: { userId }
    });

    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    // Verify driver belongs to vendor
    const driver = await prisma.driver.findFirst({
      where: {
        id: driverId,
        vendorId: vendor.id
      }
    });

    if (!driver) {
      return res.status(404).json({ message: 'Driver not found' });
    }

    await prisma.driver.update({
      where: { id: driverId },
      data: { 
        isActive: false,
        status: 'SUSPENDED'
      }
    });

    res.json({ message: 'Driver deactivated successfully' });
  } catch (error) {
    console.error('Error deactivating driver:', error);
    res.status(500).json({ message: 'Error deactivating driver' });
  }
});

app.get('/api/vendor/drivers/:driverId', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { driverId } = req.params;

    // Find vendor by userId
    const vendor = await prisma.vendor.findUnique({
      where: { userId }
    });

    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    const driver = await prisma.driver.findFirst({
      where: {
        id: driverId,
        vendorId: vendor.id
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            phoneNumber: true
          }
        }
      }
    });

    if (!driver) {
      return res.status(404).json({ message: 'Driver not found' });
    }

    res.json({
      id: driver.id,
      firstName: driver.firstName,
      lastName: driver.lastName,
      email: driver.email,
      phoneNumber: driver.phoneNumber,
      licenseNumber: driver.licenseNumber,
      licenseExpiry: driver.licenseExpiry,
      licenseType: driver.licenseType,
      vehicleType: driver.vehicleType,
      vehiclePlate: driver.vehiclePlate,
      vehicleModel: driver.vehicleModel,
      vehicleColor: driver.vehicleColor,
      vehicleCapacity: driver.vehicleCapacity,
      status: driver.status.toLowerCase(),
      isActive: driver.isActive,
      rating: driver.rating,
      totalDeliveries: driver.totalDeliveries,
      totalEarnings: driver.totalEarnings,
      emergencyContact: driver.emergencyContact,
      currentLocation: driver.currentLocation,
      createdAt: driver.createdAt
    });
  } catch (error) {
    console.error('Error fetching driver details:', error);
    res.status(500).json({ message: 'Error fetching driver details' });
  }
});

// Vendor Profile Endpoints
app.get('/api/vendor/profile', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    console.log('Fetching vendor profile for userId:', userId);
    
    // Find vendor by userId
    const vendor = await prisma.vendor.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            phoneNumber: true
          }
        }
      }
    });

    console.log('Found vendor:', vendor);

    if (!vendor) {
      console.log('Vendor not found for userId:', userId);
      return res.status(404).json({ message: 'Vendor not found' });
    }

    // Transform vendor data to match frontend expectations
    const profileData = {
      id: vendor.id,
      name: vendor.businessName || '',
      email: vendor.user?.email || '',
      phone: vendor.user?.phoneNumber || '',
      address: vendor.address?.street || '',
      city: vendor.address?.city || '',
      state: vendor.address?.state || '',
      licenseNumber: vendor.documents?.fuelLicense || '',
      logo: vendor.logo || null,
      businessType: 'Filling Station', // Default value
      operatingHours: {
        monday: { 
          open: vendor.operatingHours?.open || '06:00', 
          close: vendor.operatingHours?.close || '22:00', 
          isOpen: vendor.operatingHours?.days?.includes('Monday') || true
        },
        tuesday: { 
          open: vendor.operatingHours?.open || '06:00', 
          close: vendor.operatingHours?.close || '22:00', 
          isOpen: vendor.operatingHours?.days?.includes('Tuesday') || true
        },
        wednesday: { 
          open: vendor.operatingHours?.open || '06:00', 
          close: vendor.operatingHours?.close || '22:00', 
          isOpen: vendor.operatingHours?.days?.includes('Wednesday') || true
        },
        thursday: { 
          open: vendor.operatingHours?.open || '06:00', 
          close: vendor.operatingHours?.close || '22:00', 
          isOpen: vendor.operatingHours?.days?.includes('Thursday') || true
        },
        friday: { 
          open: vendor.operatingHours?.open || '06:00', 
          close: vendor.operatingHours?.close || '22:00', 
          isOpen: vendor.operatingHours?.days?.includes('Friday') || true
        },
        saturday: { 
          open: vendor.operatingHours?.open || '07:00', 
          close: vendor.operatingHours?.close || '20:00', 
          isOpen: vendor.operatingHours?.days?.includes('Saturday') || true
        },
        sunday: { 
          open: vendor.operatingHours?.open || '08:00', 
          close: vendor.operatingHours?.close || '18:00', 
          isOpen: vendor.operatingHours?.days?.includes('Sunday') || true
        },
      },
      paymentMethods: vendor.paymentMethods || ['Cash', 'Card', 'Bank Transfer'],
      notificationPreferences: {
        email: true,
        sms: true,
        push: true,
      },
    };

    console.log('Sending profile data:', profileData);
    res.json(profileData);
  } catch (error) {
    console.error('Error fetching vendor profile:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ message: 'Error fetching vendor profile', error: error.message });
  }
});

app.put('/api/vendor/profile', authMiddleware, async (req, res) => {
  console.log('=== VENDOR PROFILE UPDATE ENDPOINT HIT ===');
  try {
    const userId = req.user.userId;
    const updateData = req.body;
    
    console.log('=== VENDOR PROFILE UPDATE REQUEST ===');
    console.log('UserId:', userId);
    console.log('Update data received:', updateData);
    
    // Find vendor by userId
    const vendor = await prisma.vendor.findUnique({
      where: { userId }
    });

    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    console.log('Current vendor address:', vendor.address);

    // Prepare update data for vendor
    const vendorUpdateData = {};
    
    if (updateData.name) vendorUpdateData.businessName = updateData.name;
    if (updateData.paymentMethods) vendorUpdateData.paymentMethods = updateData.paymentMethods;
    
    // Handle address updates properly by building the address object incrementally
    if (updateData.address || updateData.city || updateData.state) {
      vendorUpdateData.address = {
        ...vendor.address,
        ...(updateData.address && { street: updateData.address }),
        ...(updateData.city && { city: updateData.city }),
        ...(updateData.state && { state: updateData.state })
      };
      console.log('New address object to be saved:', vendorUpdateData.address);
    }
    
    // Handle operating hours update
    if (updateData.operatingHours) {
      const days = [];
      const operatingHours = updateData.operatingHours;
      
      // Determine which days are open
      Object.keys(operatingHours).forEach(day => {
        if (operatingHours[day].isOpen) {
          days.push(day.charAt(0).toUpperCase() + day.slice(1));
        }
      });
      
      vendorUpdateData.operatingHours = {
        open: operatingHours.monday?.open || '06:00',
        close: operatingHours.monday?.close || '22:00',
        days: days
      };
    }

    // Handle documents update
    if (updateData.licenseNumber) {
      vendorUpdateData.documents = {
        ...vendor.documents,
        fuelLicense: updateData.licenseNumber
      };
    }

    console.log('Final vendor update data:', vendorUpdateData);

    // Update vendor
    const updatedVendor = await prisma.vendor.update({
      where: { id: vendor.id },
      data: vendorUpdateData,
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            phoneNumber: true
          }
        }
      }
    });

    console.log('Updated vendor address:', updatedVendor.address);

    // Update user data if email or phone changed
    const userUpdateData = {};
    if (updateData.email) userUpdateData.email = updateData.email;
    if (updateData.phone) userUpdateData.phoneNumber = updateData.phone;

    if (Object.keys(userUpdateData).length > 0) {
      await prisma.user.update({
        where: { id: userId },
        data: userUpdateData
      });
    }

    // Return updated profile data
    const profileData = {
      id: updatedVendor.id,
      name: updatedVendor.businessName,
      email: updateData.email || updatedVendor.user?.email || '',
      phone: updateData.phone || updatedVendor.user?.phoneNumber || '',
      address: updatedVendor.address.street || '',
      city: updatedVendor.address.city || '',
      state: updatedVendor.address.state || '',
      licenseNumber: updatedVendor.documents?.fuelLicense || '',
      logo: updatedVendor.logo || null,
      businessType: 'Filling Station',
      operatingHours: updateData.operatingHours || {
        monday: { open: '06:00', close: '22:00', isOpen: true },
        tuesday: { open: '06:00', close: '22:00', isOpen: true },
        wednesday: { open: '06:00', close: '22:00', isOpen: true },
        thursday: { open: '06:00', close: '22:00', isOpen: true },
        friday: { open: '06:00', close: '22:00', isOpen: true },
        saturday: { open: '07:00', close: '20:00', isOpen: true },
        sunday: { open: '08:00', close: '18:00', isOpen: true },
      },
      paymentMethods: updatedVendor.paymentMethods || ['Cash', 'Card', 'Bank Transfer'],
      notificationPreferences: {
        email: true,
        sms: true,
        push: true,
      },
    };

    console.log('Sending profile data:', profileData);

    res.json({
      message: 'Profile updated successfully',
      profile: profileData
    });
  } catch (error) {
    console.error('Error updating vendor profile:', error);
    res.status(500).json({ message: 'Error updating vendor profile' });
  }
});

// GET /api/vendor/orders - Get vendor orders (MUST COME BEFORE /api/vendor/:vendorId)
app.get('/api/vendor/orders', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { status, dateRange, search } = req.query;

    console.log('Vendor orders request - userId:', userId);
    console.log('Vendor orders request - user role:', req.user.role);

    // Find vendor by userId
    const vendor = await prisma.vendor.findUnique({
      where: { userId }
    });

    console.log('Vendor orders request - vendor found:', vendor ? 'Yes' : 'No');

    if (!vendor) {
      console.log('Vendor orders request - vendor not found for userId:', userId);
      return res.status(404).json({ message: 'Vendor not found' });
    }

    let whereClause = { vendorId: vendor.id };

    // Add status filter
    if (status && status !== '') {
      whereClause.status = status.toUpperCase();
    }

    // Add date range filter
    if (dateRange) {
      const now = new Date();
      let startDate;

      switch (dateRange) {
        case 'today':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        default:
          startDate = new Date(0);
      }

      whereClause.createdAt = {
        gte: startDate
      };
    }

    const orders = await prisma.order.findMany({
      where: whereClause,
      include: {
        orderItems: {
          include: {
            product: true
          }
        },
        user: {
          select: {
            firstName: true,
            lastName: true,
            phoneNumber: true,
            email: true
          }
        },
        driver: {
          select: {
            firstName: true,
            lastName: true,
            phoneNumber: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Filter by search if provided
    let filteredOrders = orders;
    if (search) {
      const searchTerm = search.toString().toLowerCase();
      filteredOrders = orders.filter(order => 
        order.id.toLowerCase().includes(searchTerm) ||
        order.user.firstName.toLowerCase().includes(searchTerm) ||
        order.user.lastName.toLowerCase().includes(searchTerm) ||
        order.user.phoneNumber.includes(searchTerm)
      );
    }

    // Transform orders to match frontend expectations
    const transformedOrders = filteredOrders.map(order => ({
      _id: order.id,
      userId: order.userId,
      vendorId: order.vendorId,
      driverId: order.driverId,
      status: order.status.toLowerCase(),
      totalAmount: order.totalAmount,
      deliveryFee: order.deliveryFee,
      address: order.address,
      deliveryAddress: order.deliveryAddress,
      deliveryTime: order.deliveryTime?.toISOString(),
      estimatedDelivery: order.estimatedDelivery?.toISOString(),
      paymentStatus: order.paymentStatus.toLowerCase().replace(/_/g, '_'),
      paymentMethod: order.paymentMethod,
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
      orderItems: order.orderItems.map(item => ({
        _id: item.id,
        orderId: item.orderId,
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
        product: item.product ? {
          _id: item.product.id,
          name: item.product.name,
          type: item.product.type,
          price_per_unit: item.product.pricePerUnit,
          unit: item.product.unit.toLowerCase()
        } : null
      })),
      customer: {
        firstName: order.user.firstName,
        lastName: order.user.lastName,
        phoneNumber: order.user.phoneNumber,
        email: order.user.email
      },
      driver: order.driver ? {
        firstName: order.driver.firstName,
        lastName: order.driver.lastName,
        phoneNumber: order.driver.phoneNumber
      } : undefined
    }));

    console.log('Transformed vendor orders:', JSON.stringify(transformedOrders, null, 2));

    res.json(transformedOrders);
  } catch (error) {
    console.error('Error fetching vendor orders:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ message: 'Error fetching orders' });
  }
});

// GET /api/vendor/drivers - Get vendor drivers
app.get('/api/vendor/drivers', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;

    // Find vendor by userId
    const vendor = await prisma.vendor.findUnique({
      where: { userId }
    });

    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    const drivers = await prisma.driver.findMany({
      where: { vendorId: vendor.id },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            phoneNumber: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Transform drivers to match frontend expectations
    const transformedDrivers = drivers.map(driver => ({
      _id: driver.id,
      firstName: driver.firstName,
      lastName: driver.lastName,
      email: driver.email,
      phoneNumber: driver.phoneNumber,
      licenseNumber: driver.licenseNumber,
      licenseExpiry: driver.licenseExpiry?.toISOString(),
      licenseType: driver.licenseType,
      vehicleType: driver.vehicleType,
      vehiclePlate: driver.vehiclePlate,
      vehicleModel: driver.vehicleModel,
      vehicleColor: driver.vehicleColor,
      vehicleCapacity: driver.vehicleCapacity,
      status: driver.status.toLowerCase(),
      isActive: driver.isActive,
      rating: driver.rating,
      totalDeliveries: driver.totalDeliveries,
      totalEarnings: driver.totalEarnings,
      currentLocation: driver.currentLocation,
      emergencyContact: driver.emergencyContact,
      createdAt: driver.createdAt?.toISOString(),
      updatedAt: driver.updatedAt?.toISOString()
    }));

    res.json(transformedDrivers);
  } catch (error) {
    console.error('Error fetching vendor drivers:', error);
    res.status(500).json({ message: 'Error fetching drivers' });
  }
});

// GET /api/vendor/:vendorId - Get single vendor details (MUST COME AFTER SPECIFIC ROUTES)
app.get('/api/vendor/:vendorId', async (req, res) => {
  try {
    const { vendorId } = req.params;
    console.log('=== VENDOR DETAIL ENDPOINT CALLED ===', vendorId);
    
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
});

// Logo upload endpoint
app.post('/api/vendor/logo', authMiddleware, upload.single('logo'), async (req, res) => {
  try {
    const userId = req.user.userId;
    
    console.log('Logo upload request received for userId:', userId);
    console.log('Uploaded file:', req.file);
    
    if (!req.file) {
      console.log('No file uploaded');
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Find vendor by userId
    const vendor = await prisma.vendor.findUnique({
      where: { userId }
    });

    if (!vendor) {
      console.log('Vendor not found for userId:', userId);
      return res.status(404).json({ message: 'Vendor not found' });
    }

    console.log('Found vendor:', vendor.id);

    // Delete old logo file if it exists
    if (vendor.logo) {
      const oldLogoPath = path.join(process.cwd(), vendor.logo.replace(/^\//, ''));
      console.log('Attempting to delete old logo at:', oldLogoPath);
      if (fs.existsSync(oldLogoPath)) {
        fs.unlinkSync(oldLogoPath);
        console.log('Old logo deleted successfully');
      }
    }

    // Update vendor with new logo path
    const logoUrl = `/uploads/logos/${req.file.filename}`;
    console.log('Updating vendor with new logo URL:', logoUrl);
    console.log('File saved at:', req.file.path);
    
    await prisma.vendor.update({
      where: { id: vendor.id },
      data: { logo: logoUrl }
    });

    console.log('Vendor updated successfully');

    res.json({
      message: 'Logo uploaded successfully',
      logoUrl: logoUrl
    });
  } catch (error) {
    console.error('Error uploading logo:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ message: 'Error uploading logo', error: error.message });
  }
});

// Admin User Management Endpoints
app.get('/api/admin/users', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { page = 1, limit = 50, status, role, search } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build where clause
    const where = {};
    
    if (status && status !== 'all') {
      where.status = status.toUpperCase();
    }
    
    if (role && role !== 'all') {
      where.role = role.toUpperCase();
    }
    
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phoneNumber: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Get users with pagination
    const users = await prisma.user.findMany({
      where,
      skip,
      take: parseInt(limit),
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phoneNumber: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true
      }
    });

    // Get total count for pagination
    const total = await prisma.user.count({ where });

    // Transform users to match frontend expectations
    const transformedUsers = users.map(user => ({
      _id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      role: user.role.toLowerCase(),
      status: user.status.toLowerCase(),
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString()
    }));

    res.json({
      users: transformedUsers,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Error fetching users' });
  }
});

app.get('/api/admin/users/stats', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const totalUsers = await prisma.user.count();
    const pendingUsers = await prisma.user.count({ where: { status: 'PENDING' } });
    const activeUsers = await prisma.user.count({ where: { status: 'ACTIVE' } });
    const suspendedUsers = await prisma.user.count({ where: { status: 'SUSPENDED' } });
    const rejectedUsers = await prisma.user.count({ where: { status: 'REJECTED' } });

    const usersByRole = await prisma.user.groupBy({
      by: ['role'],
      _count: { role: true }
    });

    const recentRegistrations = await prisma.user.count({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
        }
      }
    });

    res.json({
      totalUsers,
      pendingUsers,
      activeUsers,
      suspendedUsers,
      rejectedUsers,
      usersByRole: usersByRole.map(item => ({
        role: item.role.toLowerCase(),
        count: item._count.role
      })),
      recentRegistrations
    });
  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({ message: 'Error fetching user stats' });
  }
});

app.get('/api/admin/users/:userId', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phoneNumber: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get additional data based on role
    let additionalData = {};
    
    if (user.role === 'VENDOR') {
      const vendor = await prisma.vendor.findUnique({
        where: { userId: user.id }
      });
      if (vendor) {
        additionalData = {
          businessName: vendor.businessName,
          businessAddress: vendor.address,
          verificationStatus: vendor.verificationStatus,
          isVerified: vendor.isVerified,
          isActive: vendor.isActive
        };
      }
    } else if (user.role === 'DRIVER') {
      // Add driver-specific data when driver model is implemented
      additionalData = {
        licenseNumber: 'N/A',
        vehicleType: 'N/A',
        vehiclePlate: 'N/A'
      };
    }

    const transformedUser = {
      _id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      role: user.role.toLowerCase(),
      status: user.status.toLowerCase(),
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
      ...additionalData
    };

    res.json(transformedUser);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Error fetching user' });
  }
});

app.post('/api/admin/approve-user/:userId', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.status !== 'PENDING') {
      return res.status(400).json({ message: 'User is not pending approval' });
    }

    // Update user status to active
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { status: 'ACTIVE' }
    });

    // If user is a vendor, also update vendor verification status
    if (user.role === 'VENDOR') {
      await prisma.vendor.updateMany({
        where: { userId },
        data: { 
          verificationStatus: 'VERIFIED',
          isVerified: true
        }
      });
    }

    res.json({ 
      message: 'User approved successfully',
      user: {
        _id: updatedUser.id,
        status: updatedUser.status.toLowerCase()
      }
    });
  } catch (error) {
    console.error('Error approving user:', error);
    res.status(500).json({ message: 'Error approving user' });
  }
});

app.post('/api/admin/reject-user/:userId', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;
    const { reason } = req.body;
    
    if (!reason || !reason.trim()) {
      return res.status(400).json({ message: 'Rejection reason is required' });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.status !== 'PENDING') {
      return res.status(400).json({ message: 'User is not pending approval' });
    }

    // Update user status to rejected
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { status: 'REJECTED' }
    });

    // Store rejection reason (you might want to create a separate table for this)
    // For now, we'll just update the user

    res.json({ 
      message: 'User rejected successfully',
      user: {
        _id: updatedUser.id,
        status: updatedUser.status.toLowerCase()
      }
    });
  } catch (error) {
    console.error('Error rejecting user:', error);
    res.status(500).json({ message: 'Error rejecting user' });
  }
});

app.patch('/api/admin/users/:userId/status', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;
    const { status } = req.body;
    
    const validStatuses = ['ACTIVE', 'SUSPENDED', 'REJECTED'];
    if (!validStatuses.includes(status.toUpperCase())) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { status: status.toUpperCase() }
    });

    res.json({ 
      message: 'User status updated successfully',
      user: {
        _id: updatedUser.id,
        status: updatedUser.status.toLowerCase()
      }
    });
  } catch (error) {
    console.error('Error updating user status:', error);
    res.status(500).json({ message: 'Error updating user status' });
  }
});

app.patch('/api/admin/users/:userId/role', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;
    
    const validRoles = ['CUSTOMER', 'DRIVER', 'VENDOR', 'ADMIN'];
    if (!validRoles.includes(role.toUpperCase())) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role: role.toUpperCase() }
    });

    res.json({ 
      message: 'User role updated successfully',
      user: {
        _id: updatedUser.id,
        role: updatedUser.role.toLowerCase()
      }
    });
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({ message: 'Error updating user role' });
  }
});

app.patch('/api/admin/users/:userId', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;
    const { firstName, lastName, email, phoneNumber } = req.body;
    
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if email is already taken by another user
    if (email && email !== user.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email }
      });
      if (existingUser) {
        return res.status(400).json({ message: 'Email already exists' });
      }
    }

    const updateData = {};
    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;
    if (email) updateData.email = email;
    if (phoneNumber) updateData.phoneNumber = phoneNumber;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData
    });

    res.json({ 
      message: 'User updated successfully',
      user: {
        _id: updatedUser.id,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        email: updatedUser.email,
        phoneNumber: updatedUser.phoneNumber
      }
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Error updating user' });
  }
});

app.delete('/api/admin/users/:userId', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent deletion of admin users
    if (user.role === 'ADMIN') {
      return res.status(403).json({ message: 'Cannot delete admin users' });
    }

    // Delete related data first
    if (user.role === 'VENDOR') {
      await prisma.vendor.deleteMany({
        where: { userId }
      });
    }

    // Delete user
    await prisma.user.delete({
      where: { id: userId }
    });

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Error deleting user' });
  }
});

app.post('/api/admin/users/bulk-action', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { userIds, action, reason } = req.body;
    
    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ message: 'User IDs are required' });
    }

    if (!action || !['approve', 'reject', 'suspend', 'activate', 'delete'].includes(action)) {
      return res.status(400).json({ message: 'Valid action is required' });
    }

    let updateData = {};
    let message = '';

    switch (action) {
      case 'approve':
        updateData = { status: 'ACTIVE' };
        message = 'Users approved successfully';
        break;
      case 'reject':
        if (!reason) {
          return res.status(400).json({ message: 'Rejection reason is required' });
        }
        updateData = { status: 'REJECTED' };
        message = 'Users rejected successfully';
        break;
      case 'suspend':
        updateData = { status: 'SUSPENDED' };
        message = 'Users suspended successfully';
        break;
      case 'activate':
        updateData = { status: 'ACTIVE' };
        message = 'Users activated successfully';
        break;
      case 'delete':
        // Delete users (excluding admins)
        const usersToDelete = await prisma.user.findMany({
          where: {
            id: { in: userIds },
            role: { not: 'ADMIN' }
          }
        });

        const deleteIds = usersToDelete.map(user => user.id);
        
        // Delete related vendor data
        await prisma.vendor.deleteMany({
          where: { userId: { in: deleteIds } }
        });

        // Delete users
        await prisma.user.deleteMany({
          where: { id: { in: deleteIds } }
        });

        res.json({ 
          message: `${deleteIds.length} users deleted successfully`,
          deletedCount: deleteIds.length
        });
        return;
    }

    // Update users
    const result = await prisma.user.updateMany({
      where: { id: { in: userIds } },
      data: updateData
    });

    // If approving vendors, also update their verification status
    if (action === 'approve') {
      await prisma.vendor.updateMany({
        where: { userId: { in: userIds } },
        data: { 
          verificationStatus: 'VERIFIED',
          isVerified: true
        }
      });
    }

    res.json({ 
      message,
      updatedCount: result.count
    });
  } catch (error) {
    console.error('Error performing bulk action:', error);
    res.status(500).json({ message: 'Error performing bulk action' });
  }
});

app.get('/api/admin/users/export', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { format = 'csv' } = req.query;
    
    // Get all users for export
    const users = await prisma.user.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phoneNumber: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: { createdAt: 'desc' }
    });

    // Transform users
    const transformedUsers = users.map(user => ({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      role: user.role.toLowerCase(),
      status: user.status.toLowerCase(),
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString()
    }));

    if (format === 'json') {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="users-export-${new Date().toISOString().split('T')[0]}.json"`);
      res.json(transformedUsers);
    } else {
      // CSV format
      const csvHeaders = ['ID', 'First Name', 'Last Name', 'Email', 'Phone Number', 'Role', 'Status', 'Created At', 'Updated At'];
      const csvRows = transformedUsers.map(user => [
        user.id,
        user.firstName,
        user.lastName,
        user.email,
        user.phoneNumber,
        user.role,
        user.status,
        user.createdAt,
        user.updatedAt
      ]);

      const csvContent = [csvHeaders, ...csvRows]
        .map(row => row.map(field => `"${field}"`).join(','))
        .join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="users-export-${new Date().toISOString().split('T')[0]}.csv"`);
      res.send(csvContent);
    }
  } catch (error) {
    console.error('Error exporting users:', error);
    res.status(500).json({ message: 'Error exporting users' });
  }
});

// Order Routes

// GET /api/orders/customer - Get customer orders
app.get('/api/orders/customer', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { status, dateRange, search } = req.query;

    let whereClause = { userId };

    // Add status filter
    if (status && status !== '') {
      whereClause.status = status.toUpperCase();
    }

    // Add date range filter
    if (dateRange) {
      const now = new Date();
      let startDate;

      switch (dateRange) {
        case 'today':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        default:
          startDate = new Date(0);
      }

      whereClause.createdAt = {
        gte: startDate
      };
    }

    const orders = await prisma.order.findMany({
      where: whereClause,
      include: {
        orderItems: {
          include: {
            product: true
          }
        },
        vendor: {
          select: {
            businessName: true,
            address: true
          }
        },
        driver: {
          select: {
            firstName: true,
            lastName: true,
            phoneNumber: true
          }
        },
        user: {
          select: {
            firstName: true,
            lastName: true,
            phoneNumber: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Filter by search if provided
    let filteredOrders = orders;
    if (search) {
      const searchTerm = search.toString().toLowerCase();
      filteredOrders = orders.filter(order => 
        order.id.toLowerCase().includes(searchTerm) ||
        order.user.firstName.toLowerCase().includes(searchTerm) ||
        order.user.lastName.toLowerCase().includes(searchTerm) ||
        order.user.phoneNumber.includes(searchTerm)
      );
    }

    // Transform orders to match frontend expectations
    const transformedOrders = filteredOrders.map(order => ({
      _id: order.id,
      userId: order.userId,
      vendorId: order.vendorId,
      driverId: order.driverId,
      status: order.status.toLowerCase(),
      totalAmount: order.totalAmount,
      deliveryFee: order.deliveryFee,
      address: order.address,
      deliveryAddress: order.deliveryAddress,
      deliveryTime: order.deliveryTime?.toISOString(),
      estimatedDelivery: order.estimatedDelivery?.toISOString(),
      paymentStatus: order.paymentStatus.toLowerCase().replace(/_/g, '_'),
      paymentMethod: order.paymentMethod,
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
      orderItems: order.orderItems.map(item => ({
        _id: item.id,
        orderId: item.orderId,
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
        product: item.product ? {
          _id: item.product.id,
          name: item.product.name,
          type: item.product.type,
          price_per_unit: item.product.pricePerUnit,
          unit: item.product.unit.toLowerCase()
        } : null
      })),
      customer: {
        firstName: order.user.firstName,
        lastName: order.user.lastName,
        phoneNumber: order.user.phoneNumber,
        email: order.user.email
      },
      vendor: {
        businessName: order.vendor.businessName,
        address: order.vendor.address
      },
      driver: order.driver ? {
        firstName: order.driver.firstName,
        lastName: order.driver.lastName,
        phoneNumber: order.driver.phoneNumber
      } : undefined
    }));

    res.json(transformedOrders);
  } catch (error) {
    console.error('Error fetching customer orders:', error);
    res.status(500).json({ message: 'Error fetching orders' });
  }
});

// POST /api/orders - Create new order
app.post('/api/orders', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { vendorId, orderItems, deliveryAddress, phoneNumber, paymentMethod, specialInstructions } = req.body;

    console.log('Order creation - userId:', userId);
    console.log('Order creation - vendorId:', vendorId);
    console.log('Order creation - user from token:', req.user);

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      console.log('Order creation - user not found for userId:', userId);
      return res.status(404).json({ message: 'User not found' });
    }

    console.log('Order creation - user found:', user.id);

    // Validate vendor exists
    const vendor = await prisma.vendor.findUnique({
      where: { id: vendorId }
    });

    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    // Update user's phone number if provided and different from current
    if (phoneNumber) {
      const currentUser = await prisma.user.findUnique({
        where: { id: userId },
        select: { phoneNumber: true }
      });

      // Only update if phone number is different and not already taken by another user
      if (currentUser?.phoneNumber !== phoneNumber) {
        try {
          await prisma.user.update({
            where: { id: userId },
            data: { phoneNumber }
          });
        } catch (error) {
          // If phone number is already taken by another user, just continue without updating
          console.log('Phone number already exists for another user, skipping update');
        }
      }
    }

    // Calculate total amount
    let subtotal = 0;
    for (const item of orderItems) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId }
      });

      if (!product) {
        return res.status(404).json({ message: `Product ${item.productId} not found` });
      }

      if (product.availableQty < item.quantity) {
        return res.status(400).json({ message: `Insufficient stock for ${product.name}` });
      }

      subtotal += product.pricePerUnit * item.quantity;
    }

    const totalAmount = subtotal + vendor.deliveryFee;

    // Create order
    console.log('Creating order with data:', {
      userId,
      vendorId,
      totalAmount,
      deliveryFee: vendor.deliveryFee,
      orderItemsCount: orderItems.length
    });

    // Ensure address has the correct structure
    const formattedAddress = {
      street: deliveryAddress.street || '',
      city: deliveryAddress.city || 'Lagos',
      state: deliveryAddress.state || 'Lagos',
      country: deliveryAddress.country || 'Nigeria',
      coordinates: deliveryAddress.coordinates || null
    };

    console.log('Formatted address:', formattedAddress);

    const order = await prisma.order.create({
      data: {
        userId,
        vendorId,
        status: 'PENDING',
        totalAmount,
        deliveryFee: vendor.deliveryFee,
        address: formattedAddress,
        deliveryAddress: formattedAddress,
        deliveryInstructions: specialInstructions,
        paymentStatus: paymentMethod.toUpperCase() === 'CASH' ? 'PENDING' : 'PENDING',
        paymentMethod: paymentMethod.toUpperCase(),
        orderItems: {
          create: orderItems.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            price: 0 // Will be calculated below
          }))
        }
      },
      include: {
        orderItems: {
          include: {
            product: true
          }
        },
        user: {
          select: {
            firstName: true,
            lastName: true,
            phoneNumber: true,
            email: true
          }
        }
      }
    });

    console.log('Order created successfully:', order.id);

    // Update order items with correct prices
    for (const item of orderItems) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId }
      });

      if (product) {
        await prisma.orderItem.update({
          where: { id: order.orderItems.find(oi => oi.productId === item.productId)?.id },
          data: { price: product.pricePerUnit }
        });

        // Update product stock
        await prisma.product.update({
          where: { id: item.productId },
          data: { availableQty: product.availableQty - item.quantity }
        });
      }
    }

    // Transform response
    const transformedOrder = {
      _id: order.id,
      userId: order.userId,
      vendorId: order.vendorId,
      status: order.status.toLowerCase(),
      totalAmount: order.totalAmount,
      deliveryFee: order.deliveryFee,
      address: order.address,
      deliveryAddress: order.deliveryAddress,
      paymentStatus: order.paymentStatus.toLowerCase().replace(/_/g, '_'),
      paymentMethod: order.paymentMethod,
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
      orderItems: order.orderItems.map(item => ({
        _id: item.id,
        orderId: item.orderId,
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
        product: item.product ? {
          _id: item.product.id,
          name: item.product.name,
          type: item.product.type,
          price_per_unit: item.product.pricePerUnit,
          unit: item.product.unit.toLowerCase()
        } : null
      })),
      customer: {
        firstName: order.user.firstName,
        lastName: order.user.lastName,
        phoneNumber: order.user.phoneNumber,
        email: order.user.email
      }
    };

    // Send notifications to both vendor and customer
    try {
      // Get vendor's user ID
      const vendorUser = await prisma.vendor.findUnique({
        where: { id: vendorId },
        select: { userId: true }
      });

      if (vendorUser) {
        // Create notification for vendor
        const vendorNotification = await prisma.notification.create({
          data: {
            userId: vendorUser.userId,
            type: 'ORDER_STATUS',
            title: 'New Order Received',
            message: `New order #${order.id.slice(-8)} received from ${order.user.firstName} ${order.user.lastName}`,
            data: {
              orderId: order.id,
              customerName: `${order.user.firstName} ${order.user.lastName}`,
              customerPhone: order.user.phoneNumber,
              totalAmount: order.totalAmount,
              items: orderItems.length
            },
            priority: 'HIGH',
            channel: ['IN_APP', 'EMAIL'],
            isRead: false
          }
        });

        // Send real-time notification to vendor via WebSocket
        if (global.io) {
          global.io.to(`user:${vendorUser.userId}`).emit('notification_received', {
            notification: {
              id: vendorNotification.id,
              type: vendorNotification.type,
              title: vendorNotification.title,
              message: vendorNotification.message,
              data: vendorNotification.data,
              isRead: vendorNotification.isRead,
              priority: vendorNotification.priority,
              createdAt: vendorNotification.createdAt.toISOString()
            },
            timestamp: new Date().toISOString()
          });
        }
      }

      // Create notification for customer
      const customerNotification = await prisma.notification.create({
        data: {
          userId: userId,
          type: 'ORDER_STATUS',
          title: 'Order Placed Successfully',
          message: `Your order #${order.id.slice(-8)} has been placed and sent to ${vendor.businessName}`,
          data: {
            orderId: order.id,
            vendorName: vendor.businessName,
            totalAmount: order.totalAmount,
            items: orderItems.length
          },
          priority: 'MEDIUM',
          channel: ['IN_APP'],
          isRead: false
        }
      });

      // Send real-time notification to customer via WebSocket
      if (global.io) {
        global.io.to(`user:${userId}`).emit('notification_received', {
          notification: {
            id: customerNotification.id,
            type: customerNotification.type,
            title: customerNotification.title,
            message: customerNotification.message,
            data: customerNotification.data,
            isRead: customerNotification.isRead,
            priority: customerNotification.priority,
            createdAt: customerNotification.createdAt.toISOString()
          },
          timestamp: new Date().toISOString()
        });
      }

      // Send email notifications
      try {
        // Send email to vendor
        if (vendorUser) {
          const vendorEmail = await prisma.user.findUnique({
            where: { id: vendorUser.userId },
            select: { email: true }
          });

          if (vendorEmail) {
            console.log(`Sending email notification to vendor: ${vendorEmail.email}`);
          }
        }

        // Send email to customer
        const customerEmail = await prisma.user.findUnique({
          where: { id: userId },
          select: { email: true }
        });

        if (customerEmail) {
          console.log(`Sending email notification to customer: ${customerEmail.email}`);
        }
      } catch (emailError) {
        console.error('Error sending email notifications:', emailError);
      }
    } catch (notificationError) {
      console.error('Error creating notifications:', notificationError);
      // Don't fail the order creation if notification fails
    }

    res.status(201).json(transformedOrder);
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ message: 'Error creating order' });
  }
});

// GET /api/orders/:orderId - Get single order
app.get('/api/orders/:orderId', authMiddleware, async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user.userId;

    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        OR: [
          { userId }, // Customer can view their own orders
          { vendor: { userId } } // Vendor can view orders for their business
        ]
      },
      include: {
        orderItems: {
          include: {
            product: true
          }
        },
        vendor: {
          select: {
            businessName: true,
            address: true
          }
        },
        driver: {
          select: {
            firstName: true,
            lastName: true,
            phoneNumber: true
          }
        },
        user: {
          select: {
            firstName: true,
            lastName: true,
            phoneNumber: true,
            email: true
          }
        }
      }
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Transform order to match frontend expectations
    const transformedOrder = {
      _id: order.id,
      userId: order.userId,
      vendorId: order.vendorId,
      driverId: order.driverId,
      status: order.status.toLowerCase(),
      totalAmount: order.totalAmount,
      deliveryFee: order.deliveryFee,
      address: order.address,
      deliveryAddress: order.deliveryAddress,
      deliveryTime: order.deliveryTime?.toISOString(),
      estimatedDelivery: order.estimatedDelivery?.toISOString(),
      paymentStatus: order.paymentStatus.toLowerCase().replace(/_/g, '_'),
      paymentMethod: order.paymentMethod,
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
      orderItems: order.orderItems.map(item => ({
        _id: item.id,
        orderId: item.orderId,
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
        product: item.product ? {
          _id: item.product.id,
          name: item.product.name,
          type: item.product.type,
          price_per_unit: item.product.pricePerUnit,
          unit: item.product.unit.toLowerCase()
        } : null
      })),
      customer: {
        firstName: order.user.firstName,
        lastName: order.user.lastName,
        phoneNumber: order.user.phoneNumber,
        email: order.user.email
      },
      vendor: {
        businessName: order.vendor.businessName,
        address: order.vendor.address
      },
      driver: order.driver ? {
        firstName: order.driver.firstName,
        lastName: order.driver.lastName,
        phoneNumber: order.driver.phoneNumber
      } : undefined
    };

    res.json(transformedOrder);
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ message: 'Error fetching order' });
  }
});

// POST /api/orders/summary - Get order summary for pricing
app.post('/api/orders/summary', authMiddleware, async (req, res) => {
  try {
    const { vendorId, orderItems } = req.body;

    // Validate vendor exists
    const vendor = await prisma.vendor.findUnique({
      where: { id: vendorId }
    });

    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    // Calculate subtotal
    let subtotal = 0;
    for (const item of orderItems) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId }
      });

      if (!product) {
        return res.status(404).json({ message: `Product ${item.productId} not found` });
      }

      subtotal += product.pricePerUnit * item.quantity;
    }

    const total = subtotal + vendor.deliveryFee;
    const estimatedDelivery = new Date(Date.now() + 30 * 60 * 1000).toISOString(); // 30 minutes from now

    res.json({
      subtotal,
      deliveryFee: vendor.deliveryFee,
      total,
      estimatedDelivery
    });
  } catch (error) {
    console.error('Error calculating order summary:', error);
    res.status(500).json({ message: 'Error calculating order summary' });
  }
});

// PATCH /api/vendor/orders/:orderId/status - Update order status (vendor only)
app.patch('/api/vendor/orders/:orderId/status', authMiddleware, async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;
    const userId = req.user.userId;

    // Verify vendor owns this order
    const vendor = await prisma.vendor.findUnique({
      where: { userId }
    });

    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        vendorId: vendor.id
      }
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { 
        status: status.toUpperCase(),
        updatedAt: new Date()
      },
      include: {
        orderItems: {
          include: {
            product: true
          }
        },
        user: {
          select: {
            firstName: true,
            lastName: true,
            phoneNumber: true,
            email: true
          }
        },
        driver: {
          select: {
            firstName: true,
            lastName: true,
            phoneNumber: true
          }
        }
      }
    });

    // Transform response
    const transformedOrder = {
      _id: updatedOrder.id,
      userId: updatedOrder.userId,
      vendorId: updatedOrder.vendorId,
      driverId: updatedOrder.driverId,
      status: updatedOrder.status.toLowerCase().replace(/_/g, '_'),
      totalAmount: updatedOrder.totalAmount,
      deliveryFee: updatedOrder.deliveryFee,
      address: updatedOrder.address,
      deliveryAddress: updatedOrder.deliveryAddress,
      deliveryTime: updatedOrder.deliveryTime?.toISOString(),
      estimatedDelivery: updatedOrder.estimatedDelivery?.toISOString(),
      paymentStatus: updatedOrder.paymentStatus.toLowerCase().replace(/_/g, '_'),
      paymentMethod: updatedOrder.paymentMethod,
      createdAt: updatedOrder.createdAt.toISOString(),
      updatedAt: updatedOrder.updatedAt.toISOString(),
      orderItems: updatedOrder.orderItems.map(item => ({
        _id: item.id,
        orderId: item.orderId,
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
        product: item.product ? {
          _id: item.product.id,
          name: item.product.name,
          type: item.product.type,
          price_per_unit: item.product.pricePerUnit,
          unit: item.product.unit.toLowerCase()
        } : null
      })),
      customer: {
        firstName: updatedOrder.user.firstName,
        lastName: updatedOrder.user.lastName,
        phoneNumber: updatedOrder.user.phoneNumber,
        email: updatedOrder.user.email
      },
      driver: updatedOrder.driver ? {
        firstName: updatedOrder.driver.firstName,
        lastName: updatedOrder.driver.lastName,
        phoneNumber: updatedOrder.driver.phoneNumber
      } : undefined
    };

    // Send notification to customer about order status update
    try {
      const statusMessages = {
        'CONFIRMED': 'Your order has been confirmed and is being prepared',
        'PREPARING': 'Your order is being prepared for delivery',
        'OUT_FOR_DELIVERY': 'Your order is out for delivery',
        'DELIVERED': 'Your order has been delivered successfully',
        'CANCELLED': 'Your order has been cancelled'
      };

      const message = statusMessages[status.toUpperCase()] || `Your order status has been updated to ${status}`;

      // Create notification for customer
      const notification = await prisma.notification.create({
        data: {
          userId: updatedOrder.userId,
          type: 'ORDER_STATUS',
          title: 'Order Status Updated',
          message: `Order #${orderId.slice(-8)}: ${message}`,
          data: {
            orderId: orderId,
            status: status.toLowerCase(),
            vendorName: vendor.businessName
          },
          priority: 'HIGH',
          channel: ['IN_APP'],
          isRead: false
        }
      });

      // Send real-time notification to customer via WebSocket
      if (global.io) {
        global.io.to(`user:${updatedOrder.userId}`).emit('order_status_updated', {
          orderId: orderId,
          status: status.toLowerCase(),
          timestamp: new Date().toISOString()
        });

        global.io.to(`user:${updatedOrder.userId}`).emit('notification_received', {
          notification: {
            id: notification.id,
            type: notification.type,
            title: notification.title,
            message: notification.message,
            data: notification.data,
            isRead: notification.isRead,
            priority: notification.priority,
            createdAt: notification.createdAt.toISOString()
          },
          timestamp: new Date().toISOString()
        });
      }
    } catch (notificationError) {
      console.error('Error creating status update notification:', notificationError);
      // Don't fail the status update if notification fails
    }

    res.json(transformedOrder);
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ message: 'Error updating order status' });
  }
});

// PATCH /api/vendor/orders/:orderId/assign-driver - Assign driver to order (vendor only)
app.patch('/api/vendor/orders/:orderId/assign-driver', authMiddleware, async (req, res) => {
  try {
    const { orderId } = req.params;
    const { driverId } = req.body;
    const userId = req.user.userId;

    // Verify vendor owns this order
    const vendor = await prisma.vendor.findUnique({
      where: { userId }
    });

    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        vendorId: vendor.id
      }
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Verify driver belongs to vendor
    const driver = await prisma.driver.findFirst({
      where: {
        id: driverId,
        vendorId: vendor.id
      }
    });

    if (!driver) {
      return res.status(404).json({ message: 'Driver not found' });
    }

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { 
        driverId,
        updatedAt: new Date()
      },
      include: {
        orderItems: {
          include: {
            product: true
          }
        },
        user: {
          select: {
            firstName: true,
            lastName: true,
            phoneNumber: true,
            email: true
          }
        },
        driver: {
          select: {
            firstName: true,
            lastName: true,
            phoneNumber: true,
            email: true
          }
        }
      }
    });

    // Transform response
    const transformedOrder = {
      _id: updatedOrder.id,
      userId: updatedOrder.userId,
      vendorId: updatedOrder.vendorId,
      driverId: updatedOrder.driverId,
      status: updatedOrder.status.toLowerCase().replace(/_/g, '_'),
      totalAmount: updatedOrder.totalAmount,
      deliveryFee: updatedOrder.deliveryFee,
      address: updatedOrder.address,
      deliveryAddress: updatedOrder.deliveryAddress,
      deliveryTime: updatedOrder.deliveryTime?.toISOString(),
      estimatedDelivery: updatedOrder.estimatedDelivery?.toISOString(),
      paymentStatus: updatedOrder.paymentStatus.toLowerCase().replace(/_/g, '_'),
      paymentMethod: updatedOrder.paymentMethod,
      createdAt: updatedOrder.createdAt.toISOString(),
      updatedAt: updatedOrder.updatedAt.toISOString(),
      orderItems: updatedOrder.orderItems.map(item => ({
        _id: item.id,
        orderId: item.orderId,
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
        product: item.product ? {
          _id: item.product.id,
          name: item.product.name,
          type: item.product.type,
          price_per_unit: item.product.pricePerUnit,
          unit: item.product.unit.toLowerCase()
        } : null
      })),
      customer: {
        firstName: updatedOrder.user.firstName,
        lastName: updatedOrder.user.lastName,
        phoneNumber: updatedOrder.user.phoneNumber,
        email: updatedOrder.user.email
      },
      driver: updatedOrder.driver ? {
        firstName: updatedOrder.driver.firstName,
        lastName: updatedOrder.driver.lastName,
        phoneNumber: updatedOrder.driver.phoneNumber
      } : undefined
    };

    res.json(transformedOrder);
  } catch (error) {
    console.error('Error assigning driver:', error);
    res.status(500).json({ message: 'Error assigning driver' });
  }
});

// PATCH /api/orders/:orderId/cancel - Cancel order (customer only)
app.patch('/api/orders/:orderId/cancel', authMiddleware, async (req, res) => {
  try {
    const { orderId } = req.params;
    const { reason } = req.body;
    const userId = req.user.userId;

    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        userId
      }
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.status !== 'PENDING') {
      return res.status(400).json({ message: 'Order cannot be cancelled at this stage' });
    }

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { 
        status: 'CANCELLED',
        updatedAt: new Date()
      },
      include: {
        orderItems: {
          include: {
            product: true
          }
        },
        user: {
          select: {
            firstName: true,
            lastName: true,
            phoneNumber: true,
            email: true
          }
        }
      }
    });

    // Restore product stock
    for (const item of updatedOrder.orderItems) {
      await prisma.product.update({
        where: { id: item.productId },
        data: {
          availableQty: {
            increment: item.quantity
          }
        }
      });
    }

    // Transform response
    const transformedOrder = {
      _id: updatedOrder.id,
      userId: updatedOrder.userId,
      vendorId: updatedOrder.vendorId,
      driverId: updatedOrder.driverId,
      status: updatedOrder.status.toLowerCase().replace(/_/g, '_'),
      totalAmount: updatedOrder.totalAmount,
      deliveryFee: updatedOrder.deliveryFee,
      address: updatedOrder.address,
      deliveryAddress: updatedOrder.deliveryAddress,
      deliveryTime: updatedOrder.deliveryTime?.toISOString(),
      estimatedDelivery: updatedOrder.estimatedDelivery?.toISOString(),
      paymentStatus: updatedOrder.paymentStatus.toLowerCase().replace(/_/g, '_'),
      paymentMethod: updatedOrder.paymentMethod,
      createdAt: updatedOrder.createdAt.toISOString(),
      updatedAt: updatedOrder.updatedAt.toISOString(),
      orderItems: updatedOrder.orderItems.map(item => ({
        _id: item.id,
        orderId: item.orderId,
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
        product: item.product ? {
          _id: item.product.id,
          name: item.product.name,
          type: item.product.type,
          price_per_unit: item.product.pricePerUnit,
          unit: item.product.unit.toLowerCase()
        } : null
      })),
      customer: {
        firstName: updatedOrder.user.firstName,
        lastName: updatedOrder.user.lastName,
        phoneNumber: updatedOrder.user.phoneNumber,
        email: updatedOrder.user.email
      }
    };

    res.json(transformedOrder);
  } catch (error) {
    console.error('Error cancelling order:', error);
    res.status(500).json({ message: 'Error cancelling order' });
  }
});

// GET /api/vendors/:vendorId/products - Get vendor products for ordering
app.get('/api/vendors/:vendorId/products', async (req, res) => {
  try {
    const { vendorId } = req.params;

    const products = await prisma.product.findMany({
      where: {
        vendorId,
        status: 'AVAILABLE'
      },
      orderBy: {
        name: 'asc'
      }
    });

    const transformedProducts = products.map(product => ({
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
    }));

    res.json(transformedProducts);
  } catch (error) {
    console.error('Error fetching vendor products:', error);
    res.status(500).json({ message: 'Error fetching products' });
  }
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

app.listen(PORT, () => {
  console.log(`
🚀 FuelGo Nigeria Development Server
📡 Server running on port ${PORT}
🌐 Frontend: http://localhost:3000
🔗 API: http://localhost:${PORT}/api
📊 Health check: http://localhost:${PORT}/api/health
  `);
});

// Test endpoint to create a sample driver
app.post('/api/test/create-driver', async (req, res) => {
  try {
    // Find the first vendor to assign the driver to
    const vendor = await prisma.vendor.findFirst({
      where: { isActive: true }
    });

    if (!vendor) {
      return res.status(404).json({ message: 'No active vendor found' });
    }

    // Create a test user for the driver
    const hashedPassword = await bcrypt.hash('password123', 10);
    const user = await prisma.user.create({
      data: {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@fuelgo.com',
        password: hashedPassword,
        phoneNumber: '+2341234567890',
        role: 'DRIVER',
        status: 'ACTIVE'
      }
    });

    // Create the driver
    const driver = await prisma.driver.create({
      data: {
        userId: user.id,
        vendorId: vendor.id,
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@fuelgo.com',
        phoneNumber: '+2341234567890',
        licenseNumber: 'DL123456',
        licenseExpiry: new Date('2025-12-31'),
        licenseType: 'Commercial',
        vehicleType: 'Truck',
        vehiclePlate: 'ABC123',
        vehicleModel: 'Honda CG125',
        vehicleColor: 'Red',
        vehicleCapacity: 1000,
        status: 'AVAILABLE',
        isActive: true
      }
    });

    res.json({
      message: 'Test driver created successfully',
      driver: {
        id: driver.id,
        name: `${driver.firstName} ${driver.lastName}`,
        email: driver.email,
        phone: driver.phoneNumber,
        status: driver.status.toLowerCase()
      }
    });
  } catch (error) {
    console.error('Error creating test driver:', error);
    res.status(500).json({ message: 'Error creating test driver' });
  }
});

// Test endpoint to create a sample order
app.post('/api/test/create-order', async (req, res) => {
  try {
    // Find the first vendor and user to create an order
    const vendor = await prisma.vendor.findFirst({
      where: { isActive: true }
    });

    const user = await prisma.user.findFirst({
      where: { role: 'CUSTOMER' }
    });

    if (!vendor || !user) {
      return res.status(404).json({ message: 'Vendor or user not found' });
    }

    // Find a product to order
    const product = await prisma.product.findFirst({
      where: { vendorId: vendor.id, status: 'AVAILABLE' }
    });

    if (!product) {
      return res.status(404).json({ message: 'No available products found' });
    }

    // Create the order
    const order = await prisma.order.create({
      data: {
        userId: user.id,
        vendorId: vendor.id,
        status: 'PENDING',
        totalAmount: product.pricePerUnit * 50, // 50 liters
        deliveryFee: 500,
        address: '123 Test Street, Lagos',
        deliveryAddress: '123 Test Street, Lagos',
        paymentStatus: 'PENDING',
        paymentMethod: 'CASH',
        orderItems: {
          create: [
            {
              productId: product.id,
              quantity: 50,
              price: product.pricePerUnit
            }
          ]
        }
      },
      include: {
        orderItems: {
          include: {
            product: true
          }
        },
        vendor: {
          select: {
            businessName: true,
            address: true
          }
        },
        user: {
          select: {
            firstName: true,
            lastName: true,
            phoneNumber: true,
            email: true
          }
        }
      }
    });

    // Transform the order to match frontend expectations
    const transformedOrder = {
      _id: order.id,
      userId: order.userId,
      vendorId: order.vendorId,
      driverId: order.driverId,
      status: order.status.toLowerCase().replace(/_/g, '_'),
      totalAmount: order.totalAmount,
      deliveryFee: order.deliveryFee,
      address: order.address,
      deliveryAddress: order.deliveryAddress,
      deliveryTime: order.deliveryTime?.toISOString(),
      estimatedDelivery: order.estimatedDelivery?.toISOString(),
      paymentStatus: order.paymentStatus.toLowerCase().replace(/_/g, '_'),
      paymentMethod: order.paymentMethod,
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
      orderItems: order.orderItems.map(item => ({
        _id: item.id,
        orderId: item.orderId,
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
        product: item.product ? {
          _id: item.product.id,
          name: item.product.name,
          type: item.product.type,
          price_per_unit: item.product.pricePerUnit,
          unit: item.product.unit.toLowerCase()
        } : null
      })),
      customer: {
        firstName: order.user.firstName,
        lastName: order.user.lastName,
        phoneNumber: order.user.phoneNumber,
        email: order.user.email
      },
      vendor: {
        businessName: order.vendor.businessName,
        address: order.vendor.address
      }
    };

    res.json({
      message: 'Test order created successfully',
      order: transformedOrder
    });
  } catch (error) {
    console.error('Error creating test order:', error);
    res.status(500).json({ message: 'Error creating test order' });
  }
});

// GET /api/driver/deliveries - Get driver's assigned deliveries
app.get('/api/driver/deliveries', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    console.log('=== DRIVER DELIVERIES DEBUG ===');
    console.log('Driver deliveries requested for user:', userId);

    // Find driver by userId
    const driver = await prisma.driver.findUnique({
      where: { userId }
    });
    console.log('Driver lookup result:', driver);

    if (!driver) {
      // If no driver record exists, return empty array instead of error
      console.log(`No driver record found for user ${userId}, returning empty deliveries`);
      console.log(`=== END DRIVER DELIVERIES DEBUG ===`);
      return res.json([]);
    }

    console.log(`Driver found: ${driver.id}, vendor: ${driver.vendorId}, status: ${driver.status}`);

    // Get orders assigned to this driver
    const orders = await prisma.order.findMany({
      where: {
        driverId: driver.id,
        status: {
          in: [OrderStatus.PREPARING, OrderStatus.OUT_FOR_DELIVERY]
        }
      },
      include: {
        orderItems: {
          include: {
            product: true
          }
        },
        user: {
          select: {
            firstName: true,
            lastName: true,
            phoneNumber: true,
            email: true
          }
        },
        vendor: {
          select: {
            businessName: true,
            address: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log(`Found ${orders.length} orders assigned to driver ${driver.id}`);
    
    // Log each order for debugging
    orders.forEach((order, index) => {
      console.log(`Order ${index + 1}: ID=${order.id}, Status=${order.status}, DriverId=${order.driverId}`);
    });

    // Transform orders to delivery format
    const deliveries = orders.map(order => {
      const customerName = `${order.user.firstName} ${order.user.lastName}`;
      const fuelType = order.orderItems.length > 0 
        ? order.orderItems[0].product.name 
        : 'Fuel';
      const totalQuantity = order.orderItems.reduce((sum, item) => sum + item.quantity, 0);

      // Map backend status to frontend expected status
      const mapStatus = (status) => {
        switch (status) {
          case 'PREPARING':
            return 'pending';
          case 'OUT_FOR_DELIVERY':
            return 'in_progress';
          case 'DELIVERED':
            return 'completed';
          case 'CANCELLED':
            return 'cancelled';
          default:
            return 'pending';
        }
      };

      // Helper function to format address
      const formatAddress = (address) => {
        if (!address) return 'Address not provided';
        if (typeof address === 'string') return address;
        
        const parts = [];
        if (address.street) parts.push(address.street);
        if (address.city) parts.push(address.city);
        if (address.state) parts.push(address.state);
        if (address.country) parts.push(address.country);
        
        return parts.length > 0 ? parts.join(', ') : 'Address not provided';
      };

      return {
        _id: order.id,
        orderId: order.id,
        customerName,
        customerPhone: order.user.phoneNumber,
        address: formatAddress(order.address),
        deliveryAddress: formatAddress(order.deliveryAddress),
        fuelType,
        quantity: totalQuantity,
        status: mapStatus(order.status),
        estimatedTime: '15-30 minutes', // This could be calculated based on distance
        specialInstructions: order.deliveryInstructions || 'Please call when arriving',
        orderItems: order.orderItems.map(item => ({
          _id: item.id,
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
          product: {
            _id: item.product.id,
            name: item.product.name,
            type: item.product.type,
            unit: item.product.unit.toLowerCase()
          }
        })),
        totalAmount: order.totalAmount,
        deliveryFee: order.deliveryFee,
        createdAt: order.createdAt.toISOString(),
        updatedAt: order.updatedAt.toISOString()
      };
    });

    console.log(`Returning ${deliveries.length} deliveries`);
    console.log(`=== END DRIVER DELIVERIES DEBUG ===`);
    res.json(deliveries);
  } catch (error) {
    console.error('Error fetching driver deliveries:', error);
    res.status(500).json({ message: 'Error fetching deliveries' });
  }
});

// PATCH /api/driver/deliveries/:deliveryId/status - Update delivery status
app.patch('/api/driver/deliveries/:deliveryId/status', authMiddleware, async (req, res) => {
  try {
    const { deliveryId } = req.params;
    const { status } = req.body;
    const userId = req.user.userId;

    // Find driver by userId
    const driver = await prisma.driver.findUnique({
      where: { userId }
    });

    if (!driver) {
      return res.status(404).json({ message: 'Driver not found' });
    }

    // Verify the order is assigned to this driver
    const order = await prisma.order.findFirst({
      where: {
        id: deliveryId,
        driverId: driver.id
      }
    });

    if (!order) {
      return res.status(404).json({ message: 'Delivery not found or not assigned to this driver' });
    }

    // Map frontend status to database status
    let dbStatus;
    switch (status) {
      case 'in_progress':
        dbStatus = OrderStatus.OUT_FOR_DELIVERY;
        break;
      case 'completed':
        dbStatus = OrderStatus.DELIVERED;
        break;
      case 'cancelled':
        dbStatus = OrderStatus.CANCELLED;
        break;
      default:
        return res.status(400).json({ message: 'Invalid status' });
    }

    // Update order status and handle payment for COD orders
    const updatedOrder = await prisma.$transaction(async (tx) => {
      const updateData = {
        status: dbStatus,
        updatedAt: new Date()
      };

      // If order is being completed and it's a COD order, mark payment as completed
      if (status === 'completed' && order.paymentMethod === 'CASH') {
        updateData.paymentStatus = 'COMPLETED';
        
        // Create payment record for COD
        await tx.payment.create({
          data: {
            orderId: order.id,
            userId: order.userId,
            amount: order.totalAmount,
            method: 'CASH',
            status: 'COMPLETED',
            transactionId: `COD_${order.id}_${Date.now()}`
          }
        });
      }

      return await tx.order.update({
        where: { id: deliveryId },
        data: updateData,
        include: {
          orderItems: {
            include: {
              product: true
            }
          },
          user: {
            select: {
              firstName: true,
              lastName: true,
              phoneNumber: true,
              email: true
            }
          },
          vendor: {
            select: {
              businessName: true,
              address: true
            }
          }
        }
      });
    });

    // Transform response
    const customerName = `${updatedOrder.user.firstName} ${updatedOrder.user.lastName}`;
    const fuelType = updatedOrder.orderItems.length > 0 
      ? updatedOrder.orderItems[0].product.name 
      : 'Fuel';
    const totalQuantity = updatedOrder.orderItems.reduce((sum, item) => sum + item.quantity, 0);

    // Helper function to format address
    const formatAddress = (address) => {
      if (!address) return 'Address not provided';
      if (typeof address === 'string') return address;
      
      const parts = [];
      if (address.street) parts.push(address.street);
      if (address.city) parts.push(address.city);
      if (address.state) parts.push(address.state);
      if (address.country) parts.push(address.country);
      
      return parts.length > 0 ? parts.join(', ') : 'Address not provided';
    };

    // Map backend status to frontend expected status
    const mapStatus = (status) => {
      switch (status) {
        case 'PREPARING':
          return 'pending';
        case 'OUT_FOR_DELIVERY':
          return 'in_progress';
        case 'DELIVERED':
          return 'completed';
        case 'CANCELLED':
          return 'cancelled';
        default:
          return 'pending';
      }
    };

    const delivery = {
      _id: updatedOrder.id,
      orderId: updatedOrder.id,
      customerName,
      customerPhone: updatedOrder.user.phoneNumber,
      address: formatAddress(updatedOrder.address),
      deliveryAddress: formatAddress(updatedOrder.deliveryAddress),
      fuelType,
      quantity: totalQuantity,
      status: mapStatus(updatedOrder.status),
      estimatedTime: '15-30 minutes',
      specialInstructions: updatedOrder.deliveryInstructions || 'Please call when arriving',
      orderItems: updatedOrder.orderItems.map(item => ({
        _id: item.id,
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
        product: {
          _id: item.product.id,
          name: item.product.name,
          type: item.product.type,
          unit: item.product.unit.toLowerCase()
        }
      })),
      totalAmount: updatedOrder.totalAmount,
      deliveryFee: updatedOrder.deliveryFee,
      paymentStatus: updatedOrder.paymentStatus.toLowerCase(),
      paymentMethod: updatedOrder.paymentMethod,
      createdAt: updatedOrder.createdAt.toISOString(),
      updatedAt: updatedOrder.updatedAt.toISOString()
    };

    // Send payment confirmation notification for COD orders
    if (status === 'completed' && order.paymentMethod === 'CASH') {
      try {
        // Create notification for customer
        const notification = await prisma.notification.create({
          data: {
            userId: updatedOrder.userId,
            type: 'PAYMENT',
            title: 'Payment Confirmed',
            message: `Payment of ₦${updatedOrder.totalAmount.toLocaleString()} for order #${deliveryId.slice(-8)} has been confirmed`,
            data: {
              orderId: deliveryId,
              amount: updatedOrder.totalAmount,
              paymentMethod: 'Cash on Delivery'
            },
            priority: 'HIGH',
            channel: ['IN_APP'],
            isRead: false
          }
        });

        // Send real-time notification
        if (global.io) {
          global.io.to(`user:${updatedOrder.userId}`).emit('payment_updated', {
            orderId: deliveryId,
            status: 'completed',
            timestamp: new Date().toISOString()
          });

          global.io.to(`user:${updatedOrder.userId}`).emit('notification_received', {
            notification: {
              id: notification.id,
              type: notification.type,
              title: notification.title,
              message: notification.message,
              data: notification.data,
              isRead: notification.isRead,
              priority: notification.priority,
              createdAt: notification.createdAt.toISOString()
            },
            timestamp: new Date().toISOString()
          });
        }
      } catch (error) {
        console.error('Error sending payment notification:', error);
      }
    }

    res.json({
      message: 'Delivery status updated successfully',
      delivery
    });
  } catch (error) {
    console.error('Error updating delivery status:', error);
    res.status(500).json({ message: 'Error updating delivery status' });
  }
});

// PATCH /api/orders/:orderId/confirm-payment - Confirm payment for COD orders
app.patch('/api/orders/:orderId/confirm-payment', authMiddleware, async (req, res) => {
  try {
    const { orderId } = req.params;
    const { paymentAmount, paymentMethod = 'CASH' } = req.body;
    const userId = req.user.userId;

    // Find driver by userId
    const driver = await prisma.driver.findUnique({
      where: { userId }
    });

    if (!driver) {
      return res.status(404).json({ message: 'Driver not found' });
    }

    // Verify the order is assigned to this driver
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        driverId: driver.id
      }
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found or not assigned to this driver' });
    }

    // Verify payment amount matches order total
    if (paymentAmount !== order.totalAmount) {
      return res.status(400).json({ 
        message: `Payment amount (₦${paymentAmount}) does not match order total (₦${order.totalAmount})` 
      });
    }

    // Update order and create payment record
    const updatedOrder = await prisma.$transaction(async (tx) => {
      // Update order payment status
      const updatedOrder = await tx.order.update({
        where: { id: orderId },
        data: {
          paymentStatus: 'COMPLETED',
          updatedAt: new Date()
        },
        include: {
          orderItems: {
            include: {
              product: true
            }
          },
          user: {
            select: {
              firstName: true,
              lastName: true,
              phoneNumber: true,
              email: true
            }
          },
          vendor: {
            select: {
              businessName: true,
              address: true
            }
          }
        }
      });

      // Create payment record
      await tx.payment.create({
        data: {
          orderId: order.id,
          userId: order.userId,
          amount: paymentAmount,
          method: paymentMethod,
          status: 'COMPLETED',
          transactionId: `COD_${order.id}_${Date.now()}`
        }
      });

      return updatedOrder;
    });

    // Send payment confirmation notification
    try {
      const notification = await prisma.notification.create({
        data: {
          userId: updatedOrder.userId,
          type: 'PAYMENT',
          title: 'Payment Confirmed',
          message: `Payment of ₦${paymentAmount.toLocaleString()} for order #${orderId.slice(-8)} has been confirmed`,
          data: {
            orderId: orderId,
            amount: paymentAmount,
            paymentMethod: paymentMethod
          },
          priority: 'HIGH',
          channel: ['IN_APP'],
          isRead: false
        }
      });

      // Send real-time notification
      if (global.io) {
        global.io.to(`user:${updatedOrder.userId}`).emit('payment_updated', {
          orderId: orderId,
          status: 'completed',
          timestamp: new Date().toISOString()
        });

        global.io.to(`user:${updatedOrder.userId}`).emit('notification_received', {
          notification: {
            id: notification.id,
            type: notification.type,
            title: notification.title,
            message: notification.message,
            data: notification.data,
            isRead: notification.isRead,
            priority: notification.priority,
            createdAt: notification.createdAt.toISOString()
          },
          timestamp: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Error sending payment notification:', error);
    }

    res.json({
      message: 'Payment confirmed successfully',
      order: {
        _id: updatedOrder.id,
        paymentStatus: updatedOrder.paymentStatus.toLowerCase(),
        totalAmount: updatedOrder.totalAmount,
        paymentMethod: updatedOrder.paymentMethod
      }
    });
  } catch (error) {
    console.error('Error confirming payment:', error);
    res.status(500).json({ message: 'Error confirming payment' });
  }
});

// GET /api/driver/profile - Get driver profile
app.get('/api/driver/profile', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;

    const driver = await prisma.driver.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            phoneNumber: true
          }
        }
      }
    });

    if (!driver) {
      return res.status(404).json({ message: 'Driver not found' });
    }

    // Transform to match frontend expectations
    const transformedDriver = {
      _id: driver.id,
      firstName: driver.firstName,
      lastName: driver.lastName,
      email: driver.email,
      phoneNumber: driver.phoneNumber,
      licenseNumber: driver.licenseNumber,
      licenseExpiry: driver.licenseExpiry?.toISOString(),
      licenseType: driver.licenseType,
      vehicleType: driver.vehicleType,
      vehiclePlate: driver.vehiclePlate,
      vehicleModel: driver.vehicleModel,
      vehicleColor: driver.vehicleColor,
      vehicleCapacity: driver.vehicleCapacity,
      status: driver.status.toLowerCase().replace(/_/g, '_'),
      isActive: driver.isActive,
      createdAt: driver.createdAt.toISOString(),
      updatedAt: driver.updatedAt.toISOString()
    };

    res.json(transformedDriver);
  } catch (error) {
    console.error('Error fetching driver profile:', error);
    res.status(500).json({ message: 'Error fetching driver profile' });
  }
});

// PATCH /api/driver/availability - Update driver availability
app.patch('/api/driver/availability', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { isAvailable } = req.body;

    const driver = await prisma.driver.findUnique({
      where: { userId }
    });

    if (!driver) {
      return res.status(404).json({ message: 'Driver not found' });
    }

    const updatedDriver = await prisma.driver.update({
      where: { userId },
      data: {
        status: isAvailable ? 'AVAILABLE' : 'UNAVAILABLE',
        updatedAt: new Date()
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            phoneNumber: true
          }
        }
      }
    });

    // Transform response
    const transformedDriver = {
      _id: updatedDriver.id,
      firstName: updatedDriver.firstName,
      lastName: updatedDriver.lastName,
      email: updatedDriver.email,
      phoneNumber: updatedDriver.phoneNumber,
      licenseNumber: updatedDriver.licenseNumber,
      licenseExpiry: updatedDriver.licenseExpiry?.toISOString(),
      licenseType: updatedDriver.licenseType,
      vehicleType: updatedDriver.vehicleType,
      vehiclePlate: updatedDriver.vehiclePlate,
      vehicleModel: updatedDriver.vehicleModel,
      vehicleColor: updatedDriver.vehicleColor,
      vehicleCapacity: updatedDriver.vehicleCapacity,
      status: updatedDriver.status.toLowerCase().replace(/_/g, '_'),
      isActive: updatedDriver.isActive,
      createdAt: updatedDriver.createdAt.toISOString(),
      updatedAt: updatedDriver.updatedAt.toISOString()
    };

    res.json({
      message: 'Availability updated successfully',
      driver: transformedDriver
    });
  } catch (error) {
    console.error('Error updating driver availability:', error);
    res.status(500).json({ message: 'Error updating availability' });
  }
});

// Test endpoint to create an order and assign to driver
app.post('/api/test/create-order-with-driver', async (req, res) => {
  try {
    // Find the first vendor and user to create an order
    const vendor = await prisma.vendor.findFirst({
      where: { isActive: true }
    });

    const user = await prisma.user.findFirst({
      where: { role: 'CUSTOMER' }
    });

    const driver = await prisma.driver.findFirst({
      where: { status: 'AVAILABLE' }
    });

    if (!vendor || !user) {
      return res.status(404).json({ message: 'Vendor or user not found' });
    }

    // Find a product to order
    const product = await prisma.product.findFirst({
      where: { vendorId: vendor.id, status: 'AVAILABLE' }
    });

    if (!product) {
      return res.status(404).json({ message: 'No available products found' });
    }

    // Create the order
    const order = await prisma.order.create({
      data: {
        userId: user.id,
        vendorId: vendor.id,
        driverId: driver?.id, // Assign to driver if available
        status: driver ? 'OUT_FOR_DELIVERY' : 'PENDING',
        totalAmount: product.pricePerUnit * 50, // 50 liters
        deliveryFee: 500,
        address: '123 Test Street, Lagos',
        deliveryAddress: '123 Test Street, Lagos',
        deliveryInstructions: 'Please call when arriving',
        paymentStatus: 'PENDING',
        paymentMethod: 'CASH',
        orderItems: {
          create: [
            {
              productId: product.id,
              quantity: 50,
              price: product.pricePerUnit
            }
          ]
        }
      },
      include: {
        orderItems: {
          include: {
            product: true
          }
        },
        vendor: {
          select: {
            businessName: true,
            address: true
          }
        },
        user: {
          select: {
            firstName: true,
            lastName: true,
            phoneNumber: true,
            email: true
          }
        },
        driver: {
          select: {
            firstName: true,
            lastName: true,
            phoneNumber: true
          }
        }
      }
    });

    // Transform the order to match frontend expectations
    const transformedOrder = {
      _id: order.id,
      userId: order.userId,
      vendorId: order.vendorId,
      driverId: order.driverId,
      status: order.status.toLowerCase().replace(/_/g, '_'),
      totalAmount: order.totalAmount,
      deliveryFee: order.deliveryFee,
      address: order.address,
      deliveryAddress: order.deliveryAddress,
      deliveryTime: order.deliveryTime?.toISOString(),
      estimatedDelivery: order.estimatedDelivery?.toISOString(),
      paymentStatus: order.paymentStatus.toLowerCase().replace(/_/g, '_'),
      paymentMethod: order.paymentMethod,
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
      orderItems: order.orderItems.map(item => ({
        _id: item.id,
        orderId: item.orderId,
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
        product: item.product ? {
          _id: item.product.id,
          name: item.product.name,
          type: item.product.type,
          price_per_unit: item.product.pricePerUnit,
          unit: item.product.unit.toLowerCase()
        } : null
      })),
      customer: {
        firstName: order.user.firstName,
        lastName: order.user.lastName,
        phoneNumber: order.user.phoneNumber,
        email: order.user.email
      },
      vendor: {
        businessName: order.vendor.businessName,
        address: order.vendor.address
      },
      driver: order.driver ? {
        firstName: order.driver.firstName,
        lastName: order.driver.lastName,
        phoneNumber: order.driver.phoneNumber
      } : null
    };

    res.json({
      message: 'Test order created and assigned to driver successfully',
      order: transformedOrder
    });
  } catch (error) {
    console.error('Error creating test order with driver:', error);
    res.status(500).json({ message: 'Error creating test order with driver' });
  }
});

// Test endpoint to create a sample order with product
app.post('/api/test/create-order-with-product', async (req, res) => {
  try {
    // Find the first vendor
    const vendor = await prisma.vendor.findFirst({
      where: { isActive: true }
    });

    if (!vendor) {
      return res.status(404).json({ message: 'No active vendor found' });
    }

    // Create a test product if none exists
    let product = await prisma.product.findFirst({
      where: { vendorId: vendor.id }
    });

    if (!product) {
      product = await prisma.product.create({
        data: {
          vendorId: vendor.id,
          name: 'Premium Petrol',
          type: 'PETROL',
          pricePerUnit: 650,
          unit: 'LITERS',
          availableQty: 1000,
          minOrderQty: 5,
          maxOrderQty: 500,
          status: 'AVAILABLE',
          description: 'High-quality premium petrol',
          specifications: {
            octaneRating: 95,
            sulfurContent: 'Low'
          }
        }
      });
    }

    // Find or create a test user
    let user = await prisma.user.findFirst({
      where: { role: 'CUSTOMER' }
    });

    if (!user) {
      const hashedPassword = await bcrypt.hash('password123', 10);
      user = await prisma.user.create({
        data: {
          firstName: 'Test',
          lastName: 'Customer',
          email: 'test.customer@example.com',
          password: hashedPassword,
          phoneNumber: '+2349876543210',
          role: 'CUSTOMER',
          status: 'ACTIVE'
        }
      });
    }

    // Create the order
    const order = await prisma.order.create({
      data: {
        userId: user.id,
        vendorId: vendor.id,
        status: 'PENDING',
        totalAmount: product.pricePerUnit * 50 + 500, // 50 liters + delivery fee
        deliveryFee: 500,
        address: '123 Test Street, Lagos',
        deliveryAddress: '123 Test Street, Lagos',
        paymentStatus: 'PENDING',
        paymentMethod: 'CASH',
        orderItems: {
          create: [
            {
              productId: product.id,
              quantity: 50,
              price: product.pricePerUnit
            }
          ]
        }
      },
      include: {
        orderItems: {
          include: {
            product: true
          }
        },
        vendor: {
          select: {
            businessName: true,
            address: true
          }
        },
        user: {
          select: {
            firstName: true,
            lastName: true,
            phoneNumber: true,
            email: true
          }
        }
      }
    });

    // Transform the order to match frontend expectations
    const transformedOrder = {
      _id: order.id,
      userId: order.userId,
      vendorId: order.vendorId,
      driverId: order.driverId,
      status: order.status.toLowerCase().replace(/_/g, '_'),
      totalAmount: order.totalAmount,
      deliveryFee: order.deliveryFee,
      address: order.address,
      deliveryAddress: order.deliveryAddress,
      deliveryTime: order.deliveryTime?.toISOString(),
      estimatedDelivery: order.estimatedDelivery?.toISOString(),
      paymentStatus: order.paymentStatus.toLowerCase().replace(/_/g, '_'),
      paymentMethod: order.paymentMethod,
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
      orderItems: order.orderItems.map(item => ({
        _id: item.id,
        orderId: item.orderId,
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
        product: item.product ? {
          _id: item.product.id,
          name: item.product.name,
          type: item.product.type,
          price_per_unit: item.product.pricePerUnit,
          unit: item.product.unit.toLowerCase()
        } : null
      })),
      customer: {
        firstName: order.user.firstName,
        lastName: order.user.lastName,
        phoneNumber: order.user.phoneNumber,
        email: order.user.email
      },
      vendor: {
        businessName: order.vendor.businessName,
        address: order.vendor.address
      }
    };

    res.json({
      message: 'Test order with product created successfully',
      order: transformedOrder
    });
  } catch (error) {
    console.error('Error creating test order with product:', error);
    res.status(500).json({ message: 'Error creating test order with product' });
  }
});

// Test endpoint to create a driver for the current user
app.post('/api/test/create-driver-for-user', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    console.log(`Creating driver for user: ${userId}`);

    // Check if user already has a driver record
    const existingDriver = await prisma.driver.findUnique({
      where: { userId }
    });

    if (existingDriver) {
      console.log(`Driver record already exists for user ${userId}`);
      return res.json({
        message: 'Driver record already exists for this user',
        driver: existingDriver
      });
    }

    // Get user details
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { firstName: true, lastName: true, email: true, phoneNumber: true }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Create driver record
    const driver = await prisma.driver.create({
      data: {
        userId,
        firstName: user.firstName || 'Driver',
        lastName: user.lastName || 'User',
        email: user.email,
        phone: user.phoneNumber || '+2348012345678',
        status: 'available',
        rating: 4.5,
        totalDeliveries: 0,
        activeOrders: 0,
        vehicleDetails: {
          type: 'Motorcycle',
          plateNumber: 'ABC123',
          capacity: 50
        },
        licenseNumber: 'DL123456',
        licenseExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        isActive: true
      }
    });

    console.log(`Created driver record: ${driver.id}`);
    res.json({
      message: 'Driver record created successfully',
      driver
    });
  } catch (error) {
    console.error('Error creating driver for user:', error);
    res.status(500).json({ message: 'Error creating driver record' });
  }
});

// Test endpoint to create a driver and test deliveries
app.post('/api/test/create-driver-and-test-deliveries', async (req, res) => {
  try {
    // Try to find an existing user or create a new one with a unique email
    let user = await prisma.user.findFirst({
      where: { role: 'DRIVER' }
    });

    if (!user) {
      // Create a test user with a unique email
      const hashedPassword = await bcrypt.hash('password123', 10);
      const timestamp = Date.now();
      user = await prisma.user.create({
        data: {
          firstName: 'Test',
          lastName: 'Driver',
          email: `testdriver${timestamp}@example.com`,
          phoneNumber: `+2348012345${timestamp.toString().slice(-4)}`,
          password: hashedPassword,
          role: 'DRIVER'
        }
      });
      console.log(`Created test user: ${user.id}`);
    } else {
      console.log(`Using existing user: ${user.id}`);
    }

    // Check if user already has a driver record
    let driver = await prisma.driver.findUnique({
      where: { userId: user.id }
    });

    if (!driver) {
      // Create a driver record for this user
      const vendor = await prisma.vendor.findFirst({
        where: { isActive: true }
      });

      if (!vendor) {
        return res.status(404).json({ message: 'No active vendor found' });
      }

      driver = await prisma.driver.create({
        data: {
          userId: user.id,
          vendorId: vendor.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phoneNumber: user.phoneNumber,
          status: 'AVAILABLE',
          rating: 4.5,
          totalDeliveries: 0,
          totalEarnings: 0,
          licenseNumber: 'DL123456',
          licenseExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
          licenseType: 'Commercial',
          vehicleType: 'Motorcycle',
          vehiclePlate: 'TEST123',
          vehicleModel: 'Honda CG125',
          vehicleColor: 'Red',
          vehicleCapacity: 50,
          isActive: true
        }
      });
      console.log(`Created test driver: ${driver.id}`);
    } else {
      console.log(`Using existing driver: ${driver.id}`);
    }

    // Create a test order assigned to this driver
    const vendor = await prisma.vendor.findFirst({
      where: { isActive: true }
    });

    if (!vendor) {
      return res.status(404).json({ message: 'No active vendor found' });
    }

    // Create a test product
    const product = await prisma.product.create({
      data: {
        vendorId: vendor.id,
        name: 'Test Petrol',
        type: 'PMS', // Use valid FuelType enum value
        pricePerUnit: 650,
        unit: 'LITRE',
        availableQty: 1000,
        minOrderQty: 5,
        maxOrderQty: 500,
        description: 'Test product for driver deliveries'
      }
    });

    // Create a test order
    const order = await prisma.order.create({
      data: {
        userId: user.id,
        vendorId: vendor.id,
        driverId: driver.id,
        status: 'OUT_FOR_DELIVERY',
        totalAmount: 3250,
        deliveryFee: 500,
        paymentStatus: 'PAID',
        paymentMethod: 'CASH',
        address: {
          street: '123 Test Street',
          city: 'Lagos',
          state: 'Lagos',
          country: 'Nigeria'
        },
        deliveryAddress: {
          street: '456 Delivery Street',
          city: 'Lagos',
          state: 'Lagos',
          country: 'Nigeria'
        },
        deliveryInstructions: 'Please call when arriving',
        orderItems: {
          create: {
            productId: product.id,
            quantity: 5,
            price: 650
          }
        }
      }
    });

    console.log(`Created test order: ${order.id}`);

    // Now test the driver deliveries endpoint
    const deliveries = await prisma.order.findMany({
      where: {
        driverId: driver.id,
        status: {
          in: ['OUT_FOR_DELIVERY', 'IN_PROGRESS']
        }
      },
      include: {
        orderItems: {
          include: {
            product: true
          }
        },
        user: {
          select: {
            firstName: true,
            lastName: true,
            phoneNumber: true,
            email: true
          }
        },
        vendor: {
          select: {
            businessName: true,
            address: true
          }
        }
      }
    });

    console.log(`Found ${deliveries.length} deliveries for test driver`);

    res.json({
      message: 'Test driver and deliveries created successfully',
      user: {
        id: user.id,
        email: user.email,
        token: jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '24h' })
      },
      driver: driver,
      order: order,
      deliveries: deliveries
    });

  } catch (error) {
    console.error('Error creating test driver and deliveries:', error);
    res.status(500).json({ message: 'Error creating test data', error: error.message });
  }
});

// Test endpoint to create a driver record for the current user
app.post('/api/test/create-driver-for-current-user', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    console.log(`Creating driver record for current user: ${userId}`);

    // Check if user already has a driver record
    const existingDriver = await prisma.driver.findUnique({
      where: { userId }
    });

    if (existingDriver) {
      console.log(`Driver record already exists for user ${userId}`);
      return res.json({
        message: 'Driver record already exists for this user',
        driver: existingDriver
      });
    }

    // Get user details
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { firstName: true, lastName: true, email: true, phoneNumber: true }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Find the first vendor to assign the driver to
    const vendor = await prisma.vendor.findFirst({
      where: { isActive: true }
    });

    if (!vendor) {
      return res.status(404).json({ message: 'No active vendor found' });
    }

    // Create driver record
    const driver = await prisma.driver.create({
      data: {
        userId: userId,
        vendorId: vendor.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        status: 'AVAILABLE',
        rating: 4.5,
        totalDeliveries: 0,
        totalEarnings: 0,
        licenseNumber: 'DL123456',
        licenseExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        licenseType: 'Commercial',
        vehicleType: 'Motorcycle',
        vehiclePlate: 'TEST123',
        vehicleModel: 'Honda CG125',
        vehicleColor: 'Red',
        vehicleCapacity: 50,
        isActive: true
      }
    });

    console.log(`Created driver record: ${driver.id} for user: ${userId}`);

    res.json({
      message: 'Driver record created successfully',
      driver: driver
    });
  } catch (error) {
    console.error('Error creating driver record:', error);
    res.status(500).json({ message: 'Error creating driver record' });
  }
});

// Test endpoint to debug driver situation
app.get('/api/test/debug-drivers', async (req, res) => {
  try {
    console.log('=== DEBUGGING DRIVER SITUATION ===');
    
    // Get all drivers with their user information
    const drivers = await prisma.driver.findMany({
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phoneNumber: true,
            role: true
          }
        },
        vendor: {
          select: {
            id: true,
            businessName: true
          }
        }
      }
    });

    console.log(`Found ${drivers.length} drivers in database:`);
    drivers.forEach((driver, index) => {
      console.log(`Driver ${index + 1}:`);
      console.log(`  Driver ID: ${driver.id}`);
      console.log(`  User ID: ${driver.userId}`);
      console.log(`  Name: ${driver.firstName} ${driver.lastName}`);
      console.log(`  Email: ${driver.email}`);
      console.log(`  Status: ${driver.status}`);
      console.log(`  Vendor: ${driver.vendor?.businessName || 'No vendor'}`);
      console.log(`  User record: ${driver.user ? 'Exists' : 'Missing'}`);
      if (driver.user) {
        console.log(`    User email: ${driver.user.email}`);
        console.log(`    User role: ${driver.user.role}`);
      }
      console.log('---');
    });

    // Get all orders with driver assignments
    const orders = await prisma.order.findMany({
      where: {
        driverId: {
          not: null
        }
      },
      select: {
        id: true,
        status: true,
        driverId: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log(`Found ${orders.length} orders with driver assignments:`);
    orders.forEach((order, index) => {
      console.log(`Order ${index + 1}: ID=${order.id}, Status=${order.status}, DriverId=${order.driverId}, Created=${order.createdAt.toISOString()}`);
    });

    console.log('=== END DEBUGGING ===');

    res.json({
      drivers: drivers.map(driver => ({
        driverId: driver.id,
        userId: driver.userId,
        name: `${driver.firstName} ${driver.lastName}`,
        email: driver.email,
        status: driver.status.toLowerCase().replace(/_/g, '_'),
        vendor: driver.vendor?.businessName,
        userExists: !!driver.user,
        userEmail: driver.user?.email,
        userRole: driver.user?.role
      })),
      orders: orders.map(order => ({
        orderId: order.id,
        status: order.status.toLowerCase().replace(/_/g, '_'),
        driverId: order.driverId,
        createdAt: order.createdAt.toISOString()
      }))
    });
  } catch (error) {
    console.error('Error debugging drivers:', error);
    res.status(500).json({ message: 'Error debugging drivers', error: error.message });
  }
});
