import { Router } from 'express';
import marketRoutes from '../modules/market/market.routes';
import authRoutes from '../modules/auth/auth.routes';
import { requireAuth } from '../middleware/requireAuth.middleware';

const router = Router();

// Health check
router.get('/ok', (_req, res) => {
  res.json({ ok: true });
});

//Auth check
router.get('/user/me', requireAuth, (req, res) => {
  res.json({ user: (req as any).user });
});


// Modules
router.use('/market', marketRoutes);
router.use('/user', authRoutes);

export default router;