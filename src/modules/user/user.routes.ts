import { Router } from 'express';
import { requireAuth } from '../../middleware/requireAuth.middleware';

const router = Router();

//Auth check
router.get('/me', requireAuth, (req, res) => {
  res.json({ user: (req as any).user });
});

export default router;