import { Router } from 'express';
import productsRouter from './products';
import driversRouter from './drivers';

const router = Router();

router.use('/products', productsRouter);
router.use('/drivers', driversRouter);

export default router; 