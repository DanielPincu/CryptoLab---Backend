import { Router } from 'express';
import { getLatest, getLatestBySymbol } from './market.controller';

const router = Router();

router.get('/latest', getLatest);
router.get('/latest/:symbol', getLatestBySymbol);

export default router;