import { Router, Request, Response } from 'express';

const router = Router();

// Test endpoint
router.get('/', (_req: Request, res: Response) => {
  res.json({ message: 'Test route working' });
});

export default router; 