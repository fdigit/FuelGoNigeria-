import axios from 'axios';

const termii = axios.create({
  baseURL: 'https://api.ng.termii.com/api',
  headers: {
    'Content-Type': 'application/json',
    'Api-Key': process.env.TERMII_API_KEY,
  },
});

// Send verification SMS
export const sendVerificationSMS = async (phoneNumber: string, code: string): Promise<void> => {
  try {
    await termii.post('/sms/send', {
      to: phoneNumber,
      from: process.env.TERMII_SENDER_ID,
      sms: `Your FuelGo verification code is: ${code}`,
      type: 'plain',
      channel: 'generic',
    });
  } catch (error) {
    console.error('SMS sending error:', error);
    throw new Error('Failed to send verification SMS');
  }
};

// Send order status update SMS
export const sendOrderStatusSMS = async (phoneNumber: string, status: string): Promise<void> => {
  try {
    await termii.post('/sms/send', {
      to: phoneNumber,
      from: process.env.TERMII_SENDER_ID,
      sms: `Your FuelGo order status has been updated to: ${status}`,
      type: 'plain',
      channel: 'generic',
    });
  } catch (error) {
    console.error('SMS sending error:', error);
    throw new Error('Failed to send order status SMS');
  }
};

// Send delivery notification SMS
export const sendDeliveryNotificationSMS = async (phoneNumber: string, deliveryTime: string): Promise<void> => {
  try {
    await termii.post('/sms/send', {
      to: phoneNumber,
      from: process.env.TERMII_SENDER_ID,
      sms: `Your FuelGo delivery is scheduled for: ${deliveryTime}`,
      type: 'plain',
      channel: 'generic',
    });
  } catch (error) {
    console.error('SMS sending error:', error);
    throw new Error('Failed to send delivery notification SMS');
  }
}; 