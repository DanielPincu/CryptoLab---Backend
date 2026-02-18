import type { Request, Response } from 'express';
import { latestPrices } from '../../websocket/finnhub.websocket';
import { fetchBinanceSymbols, getQuote, fetchBinanceHistory } from './market.services';
import type { IMarketTick } from '../../interfaces/marketTick.interface';
import type { IMarketLatest } from '../../interfaces/marketLatest.interface';

export async function getLatest(_req: Request, res: Response) {
  if (latestPrices.size === 0) {
    return res.status(503).json({ error: 'Live feed not ready yet' });
  }

  const data: IMarketTick[] = Array.from(latestPrices.entries()).map(([symbol, tick]) => ({
    symbol,
    price: typeof tick.price === 'number' ? tick.price : null
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

  const tick = latestPrices.get(symbol);

  // Fallback to REST quote if WS has not streamed this symbol yet
  if (!tick) {
    try {
      const q = await getQuote(`BINANCE:${symbol}`);
      const fallback: IMarketTick = {
        symbol,
        price: typeof q?.price === 'number' ? q.price : null
      };
      return res.json(fallback);
    } catch (e: any) {
      return res.status(404).json({ error: e?.message ?? 'symbol not found (not streamed yet)' });
    }
  }

  const result: IMarketTick = {
    symbol,
    price: typeof tick.price === 'number' ? tick.price : null
  };

  res.json(result);
}

export async function getBinanceSymbols(_req: Request, res: Response) {
  try {
    const symbols = await fetchBinanceSymbols();

    // Keep only USDT pairs (e.g. BINANCE:BTCUSDT)
    const usdtOnly: IMarketLatest[] = Array.isArray(symbols)
      ? (symbols as IMarketLatest[]).filter(
          (s) => typeof s.symbol === 'string' && s.symbol.endsWith('USDT')
        )
      : [];

    res.json(usdtOnly);
  } catch (err) {
    console.error('Failed to fetch Binance symbols:', err);
    res.status(502).json({ error: 'Failed to fetch symbols from Finnhub' });
  }
}

export async function quote(req: Request, res: Response) {
  try {
    let symbol = String(req.query.symbol ?? '').trim().toUpperCase();
    if (!symbol) return res.status(400).json({ error: 'symbol is required' });

    // Remove BINANCE: prefix if present
    if (symbol.startsWith('BINANCE:')) {
      symbol = symbol.replace(/^BINANCE:/, '');
    }

    // Auto-append USDT if not provided
    if (!symbol.endsWith('USDT')) {
      symbol = `${symbol}USDT`;
    }

    const normalized = `BINANCE:${symbol}`;

    const data = await getQuote(normalized);
    return res.json(data);
  } catch (e: any) {
    return res.status(404).json({ error: e?.message ?? 'Not found' });
  }
}

export async function getHistory(req: Request, res: Response) {
  try {
    let { symbol, interval = '5m', limit = '120' } = req.query as any;

    if (!symbol) return res.status(400).json({ error: 'symbol is required' });

    let s = String(symbol).trim().toUpperCase();

    // Remove BINANCE: prefix if present
    if (s.startsWith('BINANCE:')) {
      s = s.replace(/^BINANCE:/, '');
    }

    // Auto-append USDT if not provided
    if (!s.endsWith('USDT')) {
      s = `${s}USDT`;
    }

    const normalized = `BINANCE:${s}`;

    const result = await fetchBinanceHistory(normalized, String(interval), String(limit));
    return res.json(result);
  } catch (e: any) {
    console.error('Failed to fetch history from Binance:', e?.message || e);
    return res.status(502).json({ error: 'Failed to fetch history from Binance' });
  }
}
