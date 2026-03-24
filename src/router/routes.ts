import { Router } from 'express';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from '../documentation/doc';
import marketRoutes from '../modules/market/market.routes';
import authRoutes from '../modules/auth/auth.routes';
import userRoutes from '../modules/user/user.routes';
import accountRoutes from '../modules/account/account.routes';
import tradeRoutes  from '../modules/trade/trade.routes';
import positionRoutes from '../modules/position/position.routes';
import transactionRoutes from '../modules/transaction/transaction.routes'
import portfolioRoutes from '../modules/portfolio/portfolio.routes';
import leaderboardRoutes from '../modules/leaderboard/leaderboard.routes';
import gameRoutes from '../modules/game/game.routes'

const router = Router();

// Health check
router.get('/ok', (_req, res) => {
  res.json({ ok: true });
});

// Swagger docs
router.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

router.get('/docs.json', (_req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

router.use('/account', accountRoutes);

// Modules
router.use('/market', marketRoutes); // protected routes apply requireAuth inside market.routes
router.use('/user', authRoutes); // public: register/login
router.use('/user', userRoutes); // protected routes apply requireAuth inside user.routes
router.use('/trade', tradeRoutes); // protected routes apply requireAuth inside trade.routes
router.use('/positions', positionRoutes); // protected routes apply requireAuth inside position.routes
router.use('/transactions', transactionRoutes); // protected routes apply requireAuth inside transaction.routes
router.use('/portfolio', portfolioRoutes);
router.use('/leaderboard', leaderboardRoutes); // public routes, no auth required

router.use('/game', gameRoutes)

router.use((_req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

export default router;