import type { Request, Response } from 'express';
import { MarketLatestModel } from '../../models/marketLatest.model';

export async function getLatest(req: Request, res: Response) {
  const data = await MarketLatestModel.find().lean();
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

  const doc = await MarketLatestModel.findOne({ symbol }).lean();
  if (!doc) {
    return res.status(404).json({ error: 'symbol not found' });
  }

  res.json(doc);
}