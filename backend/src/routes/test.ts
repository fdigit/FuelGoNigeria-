import express, { Request, Response } from 'express';
import mongoose from 'mongoose';

const router = express.Router();

router.get('/db-status', (_req: Request, res: Response) => {
  const dbState = mongoose.connection.readyState;
  const states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };
  
  res.json({
    status: 'success',
    database: {
      state: states[dbState as keyof typeof states],
      readyState: dbState
    },
    timestamp: new Date()
  });
});

export default router; 