import { Router } from 'express';
import { requireAuth } from '../../middleware/requireAuth.middleware';
import { getMyAccount, updateMyFavorites, getMyFavorites } from './account.controller';

const router = Router();

// Get authenticated user's account (cash, baseCurrency, favorites)
router.get('/me', requireAuth, getMyAccount);

// Get authenticated user's favorites
router.get('/favorites', requireAuth, getMyFavorites);

// Update authenticated user's favorites
router.patch('/favorites', requireAuth, updateMyFavorites);

export default router;
