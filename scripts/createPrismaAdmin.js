const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const prisma = new PrismaClient();

const createPrismaAdmin = async () => {
  try {
    console.log('🔍 Checking MongoDB Cloud connection...');
    
    // Test connection
    await prisma.$connect();
    console.log('✅ Connected to MongoDB Cloud via Prisma');

    // Check if admin already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: 'admin@fuelgo.com' }
    });

    if (existingAdmin) {
      console.log('⚠️  Removing existing admin user...');
      await prisma.user.delete({
        where: { email: 'admin@fuelgo.com' }
      });
    }

    // Create admin user
    const password = 'Admin@123';
    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await prisma.user.create({
      data: {
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@fuelgo.com',
        password: hashedPassword,
        phoneNumber: '+2348000000000',
        role: 'ADMIN',
        status: 'ACTIVE'
      }
    });

    console.log('🎉 Admin user created successfully in Prisma database!');
    console.log('📧 Email:', admin.email);
    console.log('🔑 Password:', password);
    console.log('👤 Role:', admin.role);
    console.log('📊 Status:', admin.status);
    console.log('⚠️  Please change this password after first login');

    await prisma.$disconnect();
    console.log('✅ Disconnected from MongoDB Cloud');
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
};

createPrismaAdmin(); 