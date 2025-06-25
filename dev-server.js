const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const app = express();
const PORT = 3001;
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
        address: vendor.address,
        contact: {
          email: vendor.user?.email || ''
        },
        is_active: vendor.isActive
      };
      console.log('Transformed vendor:', { 
        id: transformed._id, 
        business_name: transformed.business_name, 
        logo: transformed.logo,
        userEmail: transformed.contact.email,
        address: transformed.address
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
        address: vendor.address,
        contact: {
          email: vendor.user?.email || ''
        },
        is_active: vendor.isActive
      };
      console.log('Transformed vendor:', { 
        id: transformed._id, 
        business_name: transformed.business_name, 
        logo: transformed.logo,
        userEmail: transformed.contact.email,
        address: transformed.address
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

// Vendor Product Endpoints
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
        firstName,
        lastName,
        email,
        phoneNumber,
        licenseNumber,
        licenseExpiry: new Date(licenseExpiry),
        licenseType,
        vehicleType,
        vehiclePlate,
        vehicleModel,
        vehicleColor,
        vehicleCapacity: vehicleCapacity ? parseFloat(vehicleCapacity) : null,
        emergencyContact: emergencyContact ? {
          name: emergencyContact.name,
          phone: emergencyContact.phone,
          relationship: emergencyContact.relationship
        } : null,
        status: 'AVAILABLE',
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