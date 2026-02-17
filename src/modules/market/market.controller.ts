import type { Request, Response } from 'express';
import { latestPrices } from '../../websocket/finnhub.websocket';

export async function getLatest(_req: Request, res: Response) {
  if (latestPrices.size === 0) {
    return res.status(503).json({ error: 'Live feed not ready yet' });
  }

  const data = Array.from(latestPrices.entries()).map(([symbol, v]) => ({
    symbol,
    price: v.price,
    marketTimestamp: new Date(v.marketTimestamp)
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

  res.json({
    symbol,
    price: v.price,
    marketTimestamp: new Date(v.marketTimestamp)
  });
}