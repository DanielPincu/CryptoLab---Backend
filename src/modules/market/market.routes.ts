import { Router } from 'express';
import { getBinanceSymbols, getLatest, getLatestBySymbol } from './market.controller';

const router = Router();

router.get('/latest', getLatest);
router.get('/latest/:symbol', getLatestBySymbol);
router.get('/symbols', getBinanceSymbols);

export default router;