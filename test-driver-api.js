const fetch = require('node-fetch');

async function testDriverAPI() {
  try {
    console.log('=== TESTING DRIVER DELIVERIES API ===\n');

    // First, let's get a driver's user ID and token
    const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'driver@fuelgo.com',
        password: '12345678955'
      })
    });

    if (!loginResponse.ok) {
      console.log('Failed to login driver');
      const errorData = await loginResponse.text();
      console.log('Login error:', errorData);
      return;
    }

    const loginData = await loginResponse.json();
    const token = loginData.token;
    const userId = loginData.user.id;

    console.log('Driver login successful:');
    console.log(`- User ID: ${userId}`);
    console.log(`- Token: ${token.substring(0, 20)}...\n`);

    // Now test the driver deliveries endpoint
    const deliveriesResponse = await fetch('http://localhost:5000/api/driver/deliveries', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('Driver deliveries response status:', deliveriesResponse.status);
    
    if (!deliveriesResponse.ok) {
      console.log('Failed to get driver deliveries');
      const errorData = await deliveriesResponse.text();
      console.log('Error response:', errorData);
      return;
    }

    const deliveriesData = await deliveriesResponse.json();
    console.log('Driver deliveries response:');
    console.log(JSON.stringify(deliveriesData, null, 2));

  } catch (error) {
    console.error('Error testing driver API:', error);
  }
}

testDriverAPI(); 