#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Get the deployment URL from Vercel environment
const vercelUrl = process.env.VERCEL_URL;
const isProduction = process.env.NODE_ENV === 'production';

let apiUrl;

if (isProduction && vercelUrl) {
  // Use Vercel's provided URL
  apiUrl = `https://${vercelUrl}/api`;
} else if (isProduction) {
  // Fallback to window.location.origin (will be resolved at runtime)
  apiUrl = '/api';
} else {
  // Development
  apiUrl = 'http://localhost:5000/api';
}

// Create the config content
const configContent = `export const API_URL = '${apiUrl}';

// Runtime fallback for production
if (typeof window !== 'undefined' && window.location && window.location.origin) {
  const runtimeUrl = window.location.origin + '/api';
  if (API_URL === '/api') {
    // This will be replaced at runtime
    Object.defineProperty(exports, 'API_URL', {
      get: () => runtimeUrl
    });
  }
}
`;

// Write to the config file
const configPath = path.join(__dirname, '../frontend/src/config.ts');
fs.writeFileSync(configPath, configContent);

console.log(`✅ API URL set to: ${apiUrl}`); 