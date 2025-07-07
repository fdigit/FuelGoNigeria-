export const API_URL = process.env.REACT_APP_API_URL || 
  (process.env.NODE_ENV === 'production' 
    ? 'https://fuelgo-nigeria.vercel.app/api' 
    : 'http://localhost:5000/api'); 