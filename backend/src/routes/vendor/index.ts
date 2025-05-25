import express from 'express';
import { Vendor } from '../../models/Vendor';
import { authenticateToken } from '../../middleware/auth';

const router = express.Router();

// GET /api/vendor - Get all vendors
router.get('/', async (req, res) => {
  try {
    console.log('Fetching all vendors...');
    const vendors = await Vendor.find()
      .populate('user_id', 'firstName lastName email phoneNumber')
      .lean();
    
    console.log('Found vendors:', vendors);
    res.json(vendors);
  } catch (error) {
    console.error('Error fetching vendors:', error);
    res.status(500).json({ message: 'Error fetching vendors', error: error.message });
  }
});

// GET /api/vendor/:id - Get vendor by ID
router.get('/:id', async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id)
      .populate('user_id', 'firstName lastName email phoneNumber')
      .lean();
    
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }
    
    res.json(vendor);
  } catch (error) {
    console.error('Error fetching vendor:', error);
    res.status(500).json({ message: 'Error fetching vendor', error: error.message });
  }
});

// POST /api/vendor - Create new vendor
router.post('/', authenticateToken, async (req, res) => {
  try {
    const vendor = new Vendor(req.body);
    await vendor.save();
    res.status(201).json(vendor);
  } catch (error) {
    console.error('Error creating vendor:', error);
    res.status(500).json({ message: 'Error creating vendor', error: error.message });
  }
});

// PUT /api/vendor/:id - Update vendor
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const vendor = await Vendor.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).populate('user_id', 'firstName lastName email phoneNumber');
    
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }
    
    res.json(vendor);
  } catch (error) {
    console.error('Error updating vendor:', error);
    res.status(500).json({ message: 'Error updating vendor', error: error.message });
  }
});

// DELETE /api/vendor/:id - Delete vendor
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const vendor = await Vendor.findByIdAndDelete(req.params.id);
    
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }
    
    res.json({ message: 'Vendor deleted successfully' });
  } catch (error) {
    console.error('Error deleting vendor:', error);
    res.status(500).json({ message: 'Error deleting vendor', error: error.message });
  }
});

export default router; 