import type { Request, Response } from 'express';
import { latestPrices } from '../../websocket/finnhub.websocket';
import { fetchBinanceSymbols } from './market.services';
import type { IMarketLatest } from '../../interfaces/marketLatest.interface';

export async function getLatest(_req: Request, res: Response) {
  if (latestPrices.size === 0) {
    return res.status(503).json({ error: 'Live feed not ready yet' });
  }

  const data: IMarketLatest[] = Array.from(latestPrices.entries()).map(([symbol, v]) => ({
    symbol,
    price: typeof v.price === 'number' ? v.price : null,
    marketTimestamp: typeof v.marketTimestamp === 'number' ? v.marketTimestamp : null
  }));

  res.json(data);
}

export async function getLatestBySymbol(req: Request, res: Response) {
  let symbol = String(req.params.symbol || '').toUpperCase().trim();

  if (!symbol) {
    return res.status(400).json({ error: 'symbol is required' });
  }

  // Auto-append USDT if not provided
  if (!symbol.endsWith('USDT')) {
    symbol = `${symbol}USDT`;
  }

  const v = latestPrices.get(symbol);
  if (!v) {
    return res.status(404).json({ error: 'symbol not found (not streamed yet)' });
  }

  const result: IMarketLatest = {
    symbol,
    price: typeof v.price === 'number' ? v.price : null,
    marketTimestamp: typeof v.marketTimestamp === 'number' ? v.marketTimestamp : null
  };

  res.json(result);
}

export async function getBinanceSymbols(_req: Request, res: Response) {
  try {
    const symbols = await fetchBinanceSymbols();

    // Keep only USDT pairs (e.g. BINANCE:BTCUSDT)
    const usdtOnly = Array.isArray(symbols)
      ? symbols.filter((s: any) => typeof s?.symbol === 'string' && s.symbol.endsWith('USDT'))
      : [];

    res.json(usdtOnly);
  } catch (err) {
    console.error('Failed to fetch Binance symbols:', err);
    res.status(502).json({ error: 'Failed to fetch symbols from Finnhub' });
  }
}
