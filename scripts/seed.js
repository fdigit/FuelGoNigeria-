const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env.local' });

const prisma = new PrismaClient();

async function seed() {
  try {
    console.log('🌱 Starting database seeding...');

    // Clear existing data
    await prisma.payment.deleteMany();
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
    await prisma.review.deleteMany();
    await prisma.product.deleteMany();
    await prisma.driver.deleteMany();
    await prisma.vendor.deleteMany();
    await prisma.user.deleteMany();

    console.log('🗑️  Cleared existing data');

    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 10);
    const admin = await prisma.user.create({
      data: {
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@fuelgo.com',
        password: adminPassword,
        phoneNumber: '+2341234567890',
        role: 'ADMIN',
        status: 'ACTIVE'
      }
    });

    console.log('👤 Created admin user');

    // Create test customers
    const customer1Password = await bcrypt.hash('customer123', 10);
    const customer1 = await prisma.user.create({
      data: {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: customer1Password,
        phoneNumber: '+2341234567891',
        role: 'CUSTOMER',
        status: 'ACTIVE'
      }
    });

    const customer2Password = await bcrypt.hash('customer123', 10);
    const customer2 = await prisma.user.create({
      data: {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane@example.com',
        password: customer2Password,
        phoneNumber: '+2341234567892',
        role: 'CUSTOMER',
        status: 'ACTIVE'
      }
    });

    console.log('👥 Created test customers');

    // Create test vendors
    const vendor1Password = await bcrypt.hash('vendor123', 10);
    const vendor1User = await prisma.user.create({
      data: {
        firstName: 'Mike',
        lastName: 'Johnson',
        email: 'mike@quickfuel.com',
        password: vendor1Password,
        phoneNumber: '+2341234567893',
        role: 'VENDOR',
        status: 'ACTIVE'
      }
    });

    const vendor1 = await prisma.vendor.create({
      data: {
        userId: vendor1User.id,
        businessName: 'QuickFuel Station',
        verificationStatus: 'VERIFIED',
        address: {
          street: '123 Main Street',
          city: 'Lagos',
          state: 'Lagos',
          country: 'Nigeria',
          coordinates: {
            lat: 6.5244,
            lng: 3.3792
          }
        },
        averageRating: 4.5,
        totalRatings: 120,
        operatingHours: {
          open: '06:00',
          close: '22:00',
          days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
        },
        fuelTypes: ['PMS', 'DIESEL'],
        services: ['Fuel Delivery', 'Car Wash', 'Mini Mart'],
        paymentMethods: ['Cash', 'Card', 'Transfer'],
        minimumOrder: 20,
        deliveryFee: 500,
        rating: 4.5,
        totalReviews: 120,
        isVerified: true,
        isActive: true,
        bankInfo: {
          bankName: 'First Bank',
          accountNumber: '1234567890',
          accountName: 'QuickFuel Station'
        }
      }
    });

    const vendor2Password = await bcrypt.hash('vendor123', 10);
    const vendor2User = await prisma.user.create({
      data: {
        firstName: 'Sarah',
        lastName: 'Williams',
        email: 'sarah@citygas.com',
        password: vendor2Password,
        phoneNumber: '+2341234567894',
        role: 'VENDOR',
        status: 'ACTIVE'
      }
    });

    const vendor2 = await prisma.vendor.create({
      data: {
        userId: vendor2User.id,
        businessName: 'CityGas',
        verificationStatus: 'PENDING',
        address: {
          street: '456 Business Avenue',
          city: 'Abuja',
          state: 'FCT',
          country: 'Nigeria',
          coordinates: {
            lat: 9.0820,
            lng: 8.6753
          }
        },
        averageRating: 4.2,
        totalRatings: 80,
        operatingHours: {
          open: '07:00',
          close: '21:00',
          days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
        },
        fuelTypes: ['PMS', 'DIESEL', 'KEROSENE'],
        services: ['Fuel Delivery', 'Tyre Service'],
        paymentMethods: ['Cash', 'Card', 'Transfer'],
        minimumOrder: 10,
        deliveryFee: 700,
        rating: 4.2,
        totalReviews: 80,
        isVerified: false,
        isActive: true
      }
    });

    console.log('🏪 Created test vendors');

    // Create products for vendors
    const product1 = await prisma.product.create({
      data: {
        vendorId: vendor1.id,
        type: 'PMS',
        name: 'Premium Motor Spirit',
        description: 'High-quality petrol for your vehicle',
        pricePerUnit: 650,
        unit: 'LITRE',
        availableQty: 10000,
        minOrderQty: 5,
        maxOrderQty: 1000,
        status: 'AVAILABLE',
        specifications: {
          octaneRating: 95,
          flashPoint: 43
        }
      }
    });

    const product2 = await prisma.product.create({
      data: {
        vendorId: vendor1.id,
        type: 'DIESEL',
        name: 'Automotive Gas Oil',
        description: 'Clean diesel fuel for trucks and generators',
        pricePerUnit: 720,
        unit: 'LITRE',
        availableQty: 8000,
        minOrderQty: 10,
        maxOrderQty: 2000,
        status: 'AVAILABLE',
        specifications: {
          cetaneNumber: 50,
          flashPoint: 52
        }
      }
    });

    const product3 = await prisma.product.create({
      data: {
        vendorId: vendor2.id,
        type: 'PMS',
        name: 'Premium Petrol',
        description: 'Quality petrol with high octane rating',
        pricePerUnit: 680,
        unit: 'LITRE',
        availableQty: 5000,
        minOrderQty: 5,
        maxOrderQty: 500,
        status: 'AVAILABLE',
        specifications: {
          octaneRating: 92,
          flashPoint: 45
        }
      }
    });

    console.log('⛽ Created test products');

    // Create some reviews
    await prisma.review.create({
      data: {
        userId: customer1.id,
        vendorId: vendor1.id,
        rating: 5,
        comment: 'Excellent service and fast delivery!'
      }
    });

    await prisma.review.create({
      data: {
        userId: customer2.id,
        vendorId: vendor1.id,
        rating: 4,
        comment: 'Good quality fuel, reasonable prices.'
      }
    });

    console.log('⭐ Created test reviews');

    console.log('✅ Database seeding completed successfully!');
    console.log('\n📋 Test Accounts:');
    console.log('Admin: admin@fuelgo.com / admin123');
    console.log('Customer: john@example.com / customer123');
    console.log('Vendor: mike@quickfuel.com / vendor123');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seed(); 