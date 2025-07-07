const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function debugDriverDeliveries() {
  try {
    console.log('=== DEBUGGING DRIVER DELIVERIES ===\n');

    // Get the driver
    const driver = await prisma.driver.findFirst({
      where: {
        status: 'AVAILABLE'
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });

    if (!driver) {
      console.log('No driver found');
      return;
    }

    console.log('Driver found:');
    console.log(`- Driver ID: ${driver.id}`);
    console.log(`- User ID: ${driver.userId}`);
    console.log(`- Name: ${driver.firstName} ${driver.lastName}`);
    console.log(`- Email: ${driver.user.email}`);
    console.log(`- Status: ${driver.status}\n`);

    // Check orders assigned to this driver
    const orders = await prisma.order.findMany({
      where: {
        driverId: driver.id,
        status: {
          in: ['PREPARING', 'OUT_FOR_DELIVERY']
        }
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            phoneNumber: true,
            email: true
          }
        },
        vendor: {
          select: {
            businessName: true,
            address: true
          }
        }
      }
    });

    console.log(`Found ${orders.length} orders assigned to driver ${driver.firstName} ${driver.lastName}:`);
    orders.forEach((order, index) => {
      console.log(`Order ${index + 1}: ID=${order.id}, Status=${order.status}, DriverId=${order.driverId}, Customer=${order.user.firstName} ${order.user.lastName}`);
    });

    // Test the exact query from the driver deliveries endpoint
    console.log('\n=== TESTING DRIVER DELIVERIES ENDPOINT LOGIC ===');
    
    // Simulate the endpoint logic
    const userId = driver.userId;
    console.log(`Looking for driver with userId: ${userId}`);
    
    const driverByUserId = await prisma.driver.findUnique({
      where: { userId }
    });
    
    console.log('Driver lookup result:', driverByUserId ? `Found driver ID: ${driverByUserId.id}` : 'No driver found');
    
    if (driverByUserId) {
      const endpointOrders = await prisma.order.findMany({
        where: {
          driverId: driverByUserId.id,
          status: {
            in: ['PREPARING', 'OUT_FOR_DELIVERY']
          }
        }
      });
      
      console.log(`Endpoint query found ${endpointOrders.length} orders`);
      endpointOrders.forEach((order, index) => {
        console.log(`Endpoint Order ${index + 1}: ID=${order.id}, Status=${order.status}, DriverId=${order.driverId}`);
      });
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugDriverDeliveries(); 