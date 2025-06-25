import express, { Express, Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import connectDB from './config/database';
import testRoutes from './routes/test';
import vendorRoutes from './routes/vendor';

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app: Express = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(helmet());

// Configure CORS
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://127.0.0.1:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ 
    status: 'OK', 
    message: 'FuelGo Nigeria API is running',
    timestamp: new Date().toISOString()
  });
});

// Routes
app.use('/api/test', testRoutes);
app.use('/api/vendor', vendorRoutes);

// Basic route
app.get('/', (_req: Request, res: Response) => {
  res.json({ message: 'Welcome to FuelGo Nigeria API' });
});

// 404 handler
app.use('*', (_req: Request, res: Response) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error handling middleware
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Error:', err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Start server
app.listen(port, () => {
  console.log(`🚀 Server is running on port ${port}`);
  console.log(`📱 Frontend should be running on http://localhost:3000`);
  console.log(`🔗 API endpoints available at http://localhost:${port}/api/*`);
}); 