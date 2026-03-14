import { Router } from 'express';
import {  getLatest, getLatestBySymbol, quote, getHistory } from './market.controller';
import { requireAuth } from '../../middleware/requireAuth.middleware';

const router = Router();

router.get('/latest', requireAuth, getLatest);
router.get('/latest/:symbol', requireAuth, getLatestBySymbol);
router.get('/quote', quote);
router.get('/history', getHistory);

export default router;