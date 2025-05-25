import express from 'express';
import { auth } from '../middleware/auth';
import { authorize } from '../middleware/authorize.middleware';
import multer from 'multer';
import path from 'path';
import productRoutes from './vendor/products';
import Vendor from '../models/Vendor';
import Product from '../models/Product';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (_req: Express.Request, _file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
    cb(null, 'uploads/vendor');
  },
  filename: (_req: Express.Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// Public routes
router.get('/', async (_req, res) => {
  try {
    console.log('Fetching vendors...');
    const vendors = await Vendor.find()
      .populate('user_id', 'firstName lastName email phoneNumber')
      .select('-documents -bank_info');
    // Fetch products for each vendor
    const vendorsWithProducts = await Promise.all(
      vendors.map(async (vendor) => {
        const products = await Product.find({ vendor_id: vendor._id, status: 'available' });
        return {
          ...vendor.toObject(),
          products,
        };
      })
    );
    console.log('Found vendors with products:', vendorsWithProducts);
    res.json(vendorsWithProducts);
  } catch (error) {
    console.error('Error fetching vendors:', error);
    res.status(500).json({ message: 'Error fetching vendors' });
  }
});

// Protected routes - require authentication and vendor authorization
router.use(auth);
router.use(authorize(['vendor']));

// Mount product routes
router.use('/products', productRoutes);

// Vendor profile routes
router.get('/profile', (req, res) => {
  res.json({ message: 'Vendor profile route' });
});

router.put('/profile', (req, res) => {
  res.json({ message: 'Update vendor profile route' });
});

// Document upload routes
router.post('/documents', upload.single('document'), (req, res) => {
  res.json({ message: 'Upload vendor document route' });
});

router.get('/documents', (req, res) => {
  res.json({ message: 'Get vendor documents route' });
});

export default router; 