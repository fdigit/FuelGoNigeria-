import { ApiRequest, ApiResponse } from './types/api';
import { cors } from './middleware/cors';

export default async function handler(req: ApiRequest, res: ApiResponse) {
  // Handle CORS
  if (cors(req, res)) return;

  const { pathname } = new URL(req.url || '', `http://${req.headers.host}`);
  const path = pathname.replace('/api', '');

  try {
    // Route to appropriate handler based on path
    if (path.startsWith('/auth/login')) {
      const authLogin = (await import('./auth/login')).default;
      return await authLogin(req, res);
    } else if (path.startsWith('/auth/register')) {
      const authRegister = (await import('./auth/register')).default;
      return await authRegister(req, res);
    } else if (path.startsWith('/auth/validate-token')) {
      const authValidateToken = (await import('./auth/validate-token')).default;
      return await authValidateToken(req, res);
    } else if (path.startsWith('/vendor')) {
      const vendorIndex = (await import('./vendor/index')).default;
      return await vendorIndex(req, res);
    } else {
      // Default health check
      res.json({ 
        status: 'OK', 
        message: 'FuelGo Nigeria API is running',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        endpoints: [
          '/api/auth/login',
          '/api/auth/register', 
          '/api/auth/validate-token',
          '/api/vendor'
        ]
      });
    }
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
  }
} 