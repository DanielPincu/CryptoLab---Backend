import { Router } from 'express';
import { getBinanceSymbols, getLatest, getLatestBySymbol, quote, getHistory } from './market.controller';

const router = Router();

router.get('/latest', getLatest);
router.get('/latest/:symbol', getLatestBySymbol);
router.get('/symbols', getBinanceSymbols);
router.get('/quote', quote);
router.get('/history', getHistory);

export default router;