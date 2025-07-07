const { PrismaClient, OrderStatus } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

async function testDriverDeliveries() {
  try {
    console.log('=== TESTING DRIVER DELIVERIES ===');
    
    // Check existing orders
    const orders = await prisma.order.findMany({
      include: {
        driver: true,
        user: true,
        vendor: true
      }
    });
    
    console.log(`Total orders in database: ${orders.length}`);
    orders.forEach((order, i) => {
      console.log(`Order ${i+1}: ID=${order.id}, Status=${order.status}, DriverId=${order.driverId}, Customer=${order.user?.firstName} ${order.user?.lastName}`);
    });
    
    // Check existing drivers
    const drivers = await prisma.driver.findMany({
      include: {
        user: true,
        vendor: true
      }
    });
    
    console.log(`\nTotal drivers in database: ${drivers.length}`);
    drivers.forEach((driver, i) => {
      console.log(`Driver ${i+1}: ID=${driver.id}, UserId=${driver.userId}, Status=${driver.status}, Name=${driver.user?.firstName} ${driver.user?.lastName}`);
    });
    
    // Check existing vendors
    const vendors = await prisma.vendor.findMany({
      include: {
        user: true
      }
    });
    
    console.log(`\nTotal vendors in database: ${vendors.length}`);
    vendors.forEach((vendor, i) => {
      console.log(`Vendor ${i+1}: ID=${vendor.id}, Name=${vendor.businessName}, UserId=${vendor.userId}`);
    });
    
    // Check existing users
    const users = await prisma.user.findMany({
      where: {
        role: 'CUSTOMER'
      }
    });
    
    console.log(`\nTotal customers in database: ${users.length}`);
    users.forEach((user, i) => {
      console.log(`Customer ${i+1}: ID=${user.id}, Name=${user.firstName} ${user.lastName}, Email=${user.email}`);
    });
    
    // Check existing products
    const products = await prisma.product.findMany({
      include: {
        vendor: true
      }
    });
    
    console.log(`\nTotal products in database: ${products.length}`);
    products.forEach((product, i) => {
      console.log(`Product ${i+1}: ID=${product.id}, Name=${product.name}, Vendor=${product.vendor?.businessName}`);
    });
    
    // Create a test order if we have the necessary data
    if (drivers.length > 0 && vendors.length > 0 && users.length > 0 && products.length > 0) {
      console.log('\n=== CREATING TEST ORDER ===');
      
      const driver = drivers[0];
      const vendor = vendors[0];
      const customer = users[0];
      const product = products[0];
      
      console.log(`Using driver: ${driver.user?.firstName} ${driver.user?.lastName} (ID: ${driver.id})`);
      console.log(`Using vendor: ${vendor.businessName} (ID: ${vendor.id})`);
      console.log(`Using customer: ${customer.firstName} ${customer.lastName} (ID: ${customer.id})`);
      console.log(`Using product: ${product.name} (ID: ${product.id})`);
      
      // Create the order first
      const addressObj = {
        street: '123 Test Street',
        city: 'Lagos',
        state: 'Lagos',
        country: 'Nigeria'
      };
      const newOrder = await prisma.order.create({
        data: {
          userId: customer.id,
          vendorId: vendor.id,
          driverId: driver.id,
          status: OrderStatus.PREPARING,
          totalAmount: (product.price || 500) * 50,
          deliveryFee: 500,
          address: addressObj,
          deliveryAddress: addressObj,
          deliveryInstructions: 'Please call when arriving',
          paymentMethod: 'CASH',
          paymentStatus: 'PENDING'
        }
      });

      // Now create the order item and connect to the order and product
      const orderItem = await prisma.orderItem.create({
        data: {
          orderId: newOrder.id,
          productId: product.id,
          quantity: 50,
          price: product.price || 500
        }
      });

      console.log(`Created test order with ID: ${newOrder.id}`);
      
      // Verify the order was created
      const testOrder = await prisma.order.findUnique({
        where: { id: newOrder.id },
        include: {
          orderItems: {
            include: {
              product: true
            }
          },
          driver: true,
          user: true,
          vendor: true
        }
      });
      
      console.log(`\nTest order details:`);
      console.log(`- ID: ${testOrder.id}`);
      console.log(`- Status: ${testOrder.status}`);
      console.log(`- Driver: ${testOrder.driver?.user?.firstName} ${testOrder.driver?.user?.lastName}`);
      console.log(`- Customer: ${testOrder.user?.firstName} ${testOrder.user?.lastName}`);
      console.log(`- Vendor: ${testOrder.vendor?.businessName}`);
      console.log(`- Total Amount: ${testOrder.totalAmount}`);
      console.log(`- Items: ${testOrder.orderItems.length}`);
      
    } else {
      console.log('\nCannot create test order - missing required data');
      console.log(`Need: ${drivers.length > 0 ? '✓' : '✗'} drivers, ${vendors.length > 0 ? '✓' : '✗'} vendors, ${users.length > 0 ? '✓' : '✗'} customers, ${products.length > 0 ? '✓' : '✗'} products`);
    }
    
  } catch (error) {
    console.error('Error testing driver deliveries:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testDriverDeliveries(); 