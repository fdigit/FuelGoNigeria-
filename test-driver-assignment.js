const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testDriverAssignment() {
  try {
    console.log('=== TESTING DRIVER ASSIGNMENT ===\n');

    // Get an order that has a driver assigned but status is still PREPARING
    const orderWithDriver = await prisma.order.findFirst({
      where: {
        driverId: { not: null },
        status: 'PREPARING'
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true
          }
        },
        vendor: {
          select: {
            businessName: true
          }
        },
        driver: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      }
    });

    if (!orderWithDriver) {
      console.log('No order found with driver assignment but PREPARING status');
      
      // Let's check all orders
      const allOrders = await prisma.order.findMany({
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true
            }
          },
          driver: {
            select: {
              firstName: true,
              lastName: true
            }
          }
        }
      });
      
      console.log('\nAll orders in database:');
      allOrders.forEach((order, index) => {
        console.log(`Order ${index + 1}: ID=${order.id}, Status=${order.status}, DriverId=${order.driverId}, Driver=${order.driver ? `${order.driver.firstName} ${order.driver.lastName}` : 'None'}`);
      });
      return;
    }

    console.log('Found order with driver but PREPARING status:');
    console.log(`- ID: ${orderWithDriver.id}`);
    console.log(`- Status: ${orderWithDriver.status}`);
    console.log(`- Customer: ${orderWithDriver.user.firstName} ${orderWithDriver.user.lastName}`);
    console.log(`- Vendor: ${orderWithDriver.vendor.businessName}`);
    console.log(`- DriverId: ${orderWithDriver.driverId}`);
    console.log(`- Driver: ${orderWithDriver.driver ? `${orderWithDriver.driver.firstName} ${orderWithDriver.driver.lastName}` : 'None'}\n`);

    // Update the order status to OUT_FOR_DELIVERY
    console.log('Updating order status to OUT_FOR_DELIVERY...');
    const updatedOrder = await prisma.order.update({
      where: { id: orderWithDriver.id },
      data: { 
        status: 'OUT_FOR_DELIVERY',
        updatedAt: new Date()
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true
          }
        },
        driver: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      }
    });

    console.log('Order updated successfully:');
    console.log(`- ID: ${updatedOrder.id}`);
    console.log(`- Status: ${updatedOrder.status}`);
    console.log(`- DriverId: ${updatedOrder.driverId}`);
    console.log(`- Driver: ${updatedOrder.driver ? `${updatedOrder.driver.firstName} ${updatedOrder.driver.lastName}` : 'None'}\n`);

    // Now test the driver deliveries query
    console.log('Testing driver deliveries query...');
    const driverDeliveries = await prisma.order.findMany({
      where: {
        driverId: updatedOrder.driverId,
        status: {
          in: ['PREPARING', 'OUT_FOR_DELIVERY']
        }
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      }
    });

    console.log(`Found ${driverDeliveries.length} deliveries for driver ${updatedOrder.driver.firstName} ${updatedOrder.driver.lastName}:`);
    driverDeliveries.forEach((delivery, index) => {
      console.log(`Delivery ${index + 1}: ID=${delivery.id}, Status=${delivery.status}, Customer=${delivery.user.firstName} ${delivery.user.lastName}`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testDriverAssignment(); 