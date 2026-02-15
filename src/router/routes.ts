import { Router } from 'express';

import marketRoutes from '../modules/market/market.routes';

const router = Router();

// Health check
router.get('/ok', (_req, res) => {
  res.json({ ok: true });
});

// Modules
router.use('/market', marketRoutes);

export default router;