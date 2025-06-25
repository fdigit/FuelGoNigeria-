import { NextApiRequest, NextApiResponse } from 'next';

const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'https://fuelgo-nigeria.vercel.app',
  'https://fuelgo-nigeria-git-main.vercel.app',
  'https://fuelgo-nigeria-git-dev.vercel.app'
];

export function cors(req: NextApiRequest, res: NextApiResponse) {
  const origin = req.headers.origin;
  
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return true;
  }
  
  return false;
} 