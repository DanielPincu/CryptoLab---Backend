import { Router } from 'express';
import marketRoutes from '../modules/market/market.routes';
import authRoutes from '../modules/auth/auth.routes';
import userRoutes from '../modules/user/user.routes';
import accountRoutes from '../modules/account/account.routes';
import  tradeRoutes  from '../modules/trade/trade.routes';
import positionRoutes from '../modules/position/position.routes';

const router = Router();

// Health check
router.get('/ok', (_req, res) => {
  res.json({ ok: true });
});

router.use('/account', accountRoutes);

// Modules
router.use('/market', marketRoutes); // protected routes apply requireAuth inside market.routes
router.use('/user', authRoutes); // public: register/login
router.use('/user', userRoutes); // protected routes apply requireAuth inside user.routes
router.use('/trade', tradeRoutes); // protected routes apply requireAuth inside trade.routes
router.use('/positions', positionRoutes); // protected routes apply requireAuth inside position.routes

router.use((_req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

export default router;