const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixDriverOrderStatus() {
  try {
    console.log('=== FIXING DRIVER-ASSIGNED ORDERS WITH PREPARING STATUS ===\n');
    const ordersToFix = await prisma.order.findMany({
      where: {
        driverId: { not: null },
        status: 'PREPARING'
      }
    });

    if (ordersToFix.length === 0) {
      console.log('No orders found that need fixing.');
      return;
    }

    console.log(`Found ${ordersToFix.length} orders to update.`);
    for (const order of ordersToFix) {
      await prisma.order.update({
        where: { id: order.id },
        data: {
          status: 'OUT_FOR_DELIVERY',
          updatedAt: new Date()
        }
      });
      console.log(`Updated order ${order.id} to OUT_FOR_DELIVERY.`);
    }
    console.log('\nAll relevant orders have been updated.');
  } catch (error) {
    console.error('Error updating orders:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixDriverOrderStatus(); 