const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testCODPayment() {
  try {
    console.log('=== TESTING CASH ON DELIVERY PAYMENT SYSTEM ===\n');

    // Check existing orders with COD payment method
    const codOrders = await prisma.order.findMany({
      where: {
        paymentMethod: 'CASH'
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
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log(`Found ${codOrders.length} COD orders:`);
    codOrders.forEach((order, index) => {
      console.log(`Order ${index + 1}: ID=${order.id}, Status=${order.status}, PaymentStatus=${order.paymentStatus}, Amount=₦${order.totalAmount}, Customer=${order.user.firstName} ${order.user.lastName}`);
    });

    // Check payment records
    const payments = await prisma.payment.findMany({
      where: {
        method: 'CASH'
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log(`\nFound ${payments.length} cash payment records`);

    console.log('\n=== COD PAYMENT SYSTEM TEST COMPLETED ===');

  } catch (error) {
    console.error('Error testing COD payment system:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testCODPayment(); 