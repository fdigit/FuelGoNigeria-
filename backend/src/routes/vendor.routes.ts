import express from 'express';
import { auth } from '../middleware/auth';
import { authorize } from '../middleware/authorize.middleware';
import multer from 'multer';
import path from 'path';

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

// Protected routes - require authentication and vendor authorization
router.use(auth);
router.use(authorize(['vendor']));

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