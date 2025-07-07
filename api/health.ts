import { ApiRequest, ApiResponse } from './types/api';
import { cors } from './middleware/cors';

export default async function handler(req: ApiRequest, res: ApiResponse) {
  // Handle CORS
  if (cors(req, res)) return;

  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  res.json({ 
    status: 'OK', 
    message: 'Serverless API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
} 