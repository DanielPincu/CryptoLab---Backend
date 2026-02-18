import { Router } from 'express';
import marketRoutes from '../modules/market/market.routes';
import authRoutes from '../modules/auth/auth.routes';
import userRoutes from '../modules/user/user.routes';

const router = Router();

// Health check
router.get('/ok', (_req, res) => {
  res.json({ ok: true });
});


// Modules
router.use('/market', marketRoutes); // public routes for now
router.use('/user', authRoutes); // public: register/login
router.use('/user', userRoutes); // protected routes apply requireAuth inside user.routes

export default router;