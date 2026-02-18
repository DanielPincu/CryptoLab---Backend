import { Router } from 'express';

import marketRoutes from '../modules/market/market.routes';
import authRoutes from '../modules/auth/auth.routes';

const router = Router();

// Health check
router.get('/ok', (_req, res) => {
  res.json({ ok: true });
});

// Modules
router.use('/market', marketRoutes);
router.use('/user', authRoutes);

export default router;