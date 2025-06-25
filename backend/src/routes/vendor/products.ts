import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const router = Router();

// TODO: Replace with real authentication middleware
const fakeAuth = (req: Request, res: Response, next: any) => {
  // Simulate vendor userId from token
  req.user = { userId: req.headers['x-user-id'] || 'FAKE_VENDOR_ID' };
  next();
};

// GET /api/vendor/products
router.get('/', fakeAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user.userId;
    const vendor = await prisma.vendor.findUnique({
      where: { userId },
      include: { products: true }
    });
    if (!vendor) return res.status(404).json({ message: 'Vendor not found' });
    const products = vendor.products.map(product => ({
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
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching products' });
  }
});

// POST /api/vendor/products
router.post('/', fakeAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user.userId;
    const vendor = await prisma.vendor.findUnique({ where: { userId } });
    if (!vendor) return res.status(404).json({ message: 'Vendor not found' });
    const { name, type, description, price_per_unit, min_order_qty, max_order_qty, available_qty, specifications } = req.body;
    const unit = type.toUpperCase() === 'GAS' ? 'KG' : 'LITRE';
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
        specifications: specifications || {}
      }
    });
    res.status(201).json({
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
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating product' });
  }
});

// PUT /api/vendor/products/:productId
router.put('/:productId', fakeAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user.userId;
    const { productId } = req.params;
    const vendor = await prisma.vendor.findUnique({ where: { userId } });
    if (!vendor) return res.status(404).json({ message: 'Vendor not found' });
    const existingProduct = await prisma.product.findFirst({ where: { id: productId, vendorId: vendor.id } });
    if (!existingProduct) return res.status(404).json({ message: 'Product not found' });
    const { name, type, description, price_per_unit, min_order_qty, max_order_qty, available_qty, specifications } = req.body;
    const unit = type.toUpperCase() === 'GAS' ? 'KG' : 'LITRE';
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
        specifications: specifications || {}
      }
    });
    res.json({
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
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating product' });
  }
});

// DELETE /api/vendor/products/:productId
router.delete('/:productId', fakeAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user.userId;
    const { productId } = req.params;
    const vendor = await prisma.vendor.findUnique({ where: { userId } });
    if (!vendor) return res.status(404).json({ message: 'Vendor not found' });
    const existingProduct = await prisma.product.findFirst({ where: { id: productId, vendorId: vendor.id } });
    if (!existingProduct) return res.status(404).json({ message: 'Product not found' });
    await prisma.product.delete({ where: { id: productId } });
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting product' });
  }
});

export default router; 