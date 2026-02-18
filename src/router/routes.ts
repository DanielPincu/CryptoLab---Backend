import { Router } from 'express';
import marketRoutes from '../modules/market/market.routes';
import authRoutes from '../modules/auth/auth.routes';
import userRoutes from '../modules/user/user.routes';
import accountRoutes from '../modules/account/account.routes';
import { requireAuth } from '../middleware/requireAuth.middleware';

const router = Router();

// Health check
router.get('/ok', (_req, res) => {
  res.json({ ok: true });
});

router.use('/account', requireAuth, accountRoutes);

// Modules
router.use('/market', marketRoutes); // public routes for now
router.use('/user', authRoutes); // public: register/login
router.use('/user', userRoutes); // protected routes apply requireAuth inside user.routes

router.use((_req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

export default router;