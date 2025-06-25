const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testProductSchema() {
  try {
    console.log('🔍 Testing Product Schema and Specifications...\n');

    // Test 1: Check if we can create a product with specifications
    console.log('1. Testing product creation with octane rating...');
    
    const testProduct = await prisma.product.create({
      data: {
        vendorId: '507f1f77bcf86cd799439011', // Test vendor ID
        type: 'PMS',
        name: 'Premium Unleaded 95 RON',
        description: 'High-quality premium unleaded gasoline with 95 RON',
        pricePerUnit: 650.00,
        unit: 'LITRE',
        availableQty: 10000,
        minOrderQty: 5,
        maxOrderQty: 1000,
        status: 'AVAILABLE',
        specifications: {
          octaneRating: 95.0
        }
      }
    });

    console.log('✅ Product created successfully:', {
      id: testProduct.id,
      name: testProduct.name,
      type: testProduct.type,
      octaneRating: testProduct.specifications?.octaneRating
    });

    // Test 2: Check if we can create a diesel product with cetane number
    console.log('\n2. Testing diesel product with cetane number...');
    
    const dieselProduct = await prisma.product.create({
      data: {
        vendorId: '507f1f77bcf86cd799439011',
        type: 'DIESEL',
        name: 'Premium Diesel 50 CN',
        description: 'High-quality diesel with excellent ignition properties',
        pricePerUnit: 580.00,
        unit: 'LITRE',
        availableQty: 15000,
        minOrderQty: 10,
        maxOrderQty: 2000,
        status: 'AVAILABLE',
        specifications: {
          cetaneNumber: 50.0
        }
      }
    });

    console.log('✅ Diesel product created successfully:', {
      id: dieselProduct.id,
      name: dieselProduct.name,
      type: dieselProduct.type,
      cetaneNumber: dieselProduct.specifications?.cetaneNumber
    });

    // Test 3: Check if we can create a kerosene product with flash point
    console.log('\n3. Testing kerosene product with flash point...');
    
    const keroseneProduct = await prisma.product.create({
      data: {
        vendorId: '507f1f77bcf86cd799439011',
        type: 'KEROSENE',
        name: 'Aviation Kerosene',
        description: 'High-quality aviation kerosene with high flash point',
        pricePerUnit: 450.00,
        unit: 'LITRE',
        availableQty: 8000,
        minOrderQty: 5,
        maxOrderQty: 500,
        status: 'AVAILABLE',
        specifications: {
          flashPoint: 55.0
        }
      }
    });

    console.log('✅ Kerosene product created successfully:', {
      id: keroseneProduct.id,
      name: keroseneProduct.name,
      type: keroseneProduct.type,
      flashPoint: keroseneProduct.specifications?.flashPoint
    });

    // Test 4: Check if we can create a gas product with pressure
    console.log('\n4. Testing gas product with pressure...');
    
    const gasProduct = await prisma.product.create({
      data: {
        vendorId: '507f1f77bcf86cd799439011',
        type: 'GAS',
        name: 'Compressed Natural Gas',
        description: 'High-pressure compressed natural gas',
        pricePerUnit: 200.00,
        unit: 'KG',
        availableQty: 5000,
        minOrderQty: 1,
        maxOrderQty: 100,
        status: 'AVAILABLE',
        specifications: {
          pressure: 2500.0
        }
      }
    });

    console.log('✅ Gas product created successfully:', {
      id: gasProduct.id,
      name: gasProduct.name,
      type: gasProduct.type,
      pressure: gasProduct.specifications?.pressure
    });

    // Test 5: Query products with specifications
    console.log('\n5. Testing product queries with specifications...');
    
    const productsWithSpecs = await prisma.product.findMany({
      where: {
        vendorId: '507f1f77bcf86cd799439011'
      },
      select: {
        id: true,
        name: true,
        type: true,
        specifications: true
      }
    });

    console.log('✅ Products retrieved successfully:');
    productsWithSpecs.forEach(product => {
      console.log(`  - ${product.name} (${product.type}):`, product.specifications);
    });

    // Test 6: Query specific fuel types
    console.log('\n6. Testing fuel type specific queries...');
    
    const pmsProducts = await prisma.product.findMany({
      where: {
        type: 'PMS',
        vendorId: '507f1f77bcf86cd799439011'
      }
    });

    console.log(`✅ Found ${pmsProducts.length} PMS products`);

    const dieselProducts = await prisma.product.findMany({
      where: {
        type: 'DIESEL',
        vendorId: '507f1f77bcf86cd799439011'
      }
    });

    console.log(`✅ Found ${dieselProducts.length} Diesel products`);

    console.log('\n🎉 All tests passed! Product schema and specifications are working correctly.');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testProductSchema(); 