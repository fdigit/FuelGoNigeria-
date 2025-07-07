import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const router = Router();
const prisma = new PrismaClient();

// Get all drivers for a vendor
router.get('/', async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
    const vendorId = req.user.vendorId;
    
    const drivers = await prisma.driver.findMany({
      where: {
        vendorId: vendorId,
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
  return;
});

// Add a new driver
router.post('/', async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
    const vendorId = req.user.vendorId;
    if (!vendorId) return res.status(400).json({ message: 'Vendor ID is required' });
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

    // Check if driver already exists
    const existingDriver = await prisma.driver.findFirst({
      where: {
        OR: [
          { email },
          { phoneNumber }
        ]
      }
    });

    if (existingDriver) {
      return res.status(400).json({
        message: existingDriver.email === email ? 'Email already exists' : 'Phone number already exists'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user first
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

    // Create driver record
    const driver = await prisma.driver.create({
      data: {
        userId: user.id,
        vendorId: vendorId,
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
    res.status(500).json({ message: 'Error adding driver' });
  }
  return;
});

// Update driver status
router.patch('/:driverId/status', async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
    const { driverId } = req.params;
    const { status } = req.body;
    const vendorId = req.user.vendorId;

    // Verify driver belongs to vendor
    const driver = await prisma.driver.findFirst({
      where: {
        id: driverId,
        vendorId: vendorId
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
  return;
});

// Update driver profile
router.put('/:driverId', async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
    const { driverId } = req.params;
    const vendorId = req.user.vendorId;
    const updateData = req.body;

    // Verify driver belongs to vendor
    const driver = await prisma.driver.findFirst({
      where: {
        id: driverId,
        vendorId: vendorId
      }
    });

    if (!driver) {
      return res.status(404).json({ message: 'Driver not found' });
    }

    // Prepare update data
    const dataToUpdate: any = {};
    
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
  return;
});

// Deactivate driver
router.patch('/:driverId/deactivate', async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
    const { driverId } = req.params;
    const vendorId = req.user.vendorId;

    // Verify driver belongs to vendor
    const driver = await prisma.driver.findFirst({
      where: {
        id: driverId,
        vendorId: vendorId
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
  return;
});

// Get driver details
router.get('/:driverId', async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
    const { driverId } = req.params;
    const vendorId = req.user.vendorId;

    const driver = await prisma.driver.findFirst({
      where: {
        id: driverId,
        vendorId: vendorId
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
  return;
});

export default router; 