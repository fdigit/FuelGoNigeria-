import express from 'express';
import { auth } from '../../middleware/auth';
import Product from '../../models/Product';
import { validateProduct } from '../../validators/product';

const router = express.Router();

// Get all products for a vendor
router.get('/', auth, async (req, res) => {
  try {
    const products = await Product.find({ vendor_id: req.user._id });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching products' });
  }
});

// Add a new product
router.post('/', auth, async (req, res) => {
  try {
    const { error } = validateProduct(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const product = new Product({
      ...req.body,
      vendor_id: req.user._id,
      unit: req.body.type === 'Gas' ? 'kg' : 'litre'
    });

    await product.save();
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: 'Error creating product' });
  }
});

// Update a product
router.put('/:id', auth, async (req, res) => {
  try {
    const { error } = validateProduct(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const product = await Product.findOneAndUpdate(
      { _id: req.params.id, vendor_id: req.user._id },
      {
        ...req.body,
        unit: req.body.type === 'Gas' ? 'kg' : 'litre'
      },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Error updating product' });
  }
});

// Delete a product
router.delete('/:id', auth, async (req, res) => {
  try {
    const product = await Product.findOneAndDelete({
      _id: req.params.id,
      vendor_id: req.user._id
    });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting product' });
  }
});

// Get product details
router.get('/:id', auth, async (req, res) => {
  try {
    const product = await Product.findOne({
      _id: req.params.id,
      vendor_id: req.user._id
    });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching product details' });
  }
});

export default router; 