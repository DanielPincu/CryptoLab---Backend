import { Router } from 'express';
import { requireAuth } from '../../middleware/requireAuth.middleware';
import { getMyAccount } from './account.controller';

const router = Router();

// Get authenticated user's account (cash, baseCurrency, favorites)
router.get('/me', requireAuth, getMyAccount);

export default router;
