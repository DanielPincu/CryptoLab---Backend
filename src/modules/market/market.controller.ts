import type { Request, Response } from 'express';
import { latestPrices } from '../../websocket/finnhub.websocket';
import { getQuote, fetchBinanceHistory } from './market.services';
import type { IMarketTick } from '../../interfaces/marketTick.interface';
import type { IMarketLatest } from '../../interfaces/marketLatest.interface';
import { AccountModel } from '../../schemas/account.schema';

export async function getLatest(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const account = await AccountModel.findOne({ userId }).lean();
    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }

    const favorites = (account.favorites ?? []).map((s) => String(s).toUpperCase());

    if (favorites.length === 0) {
      return res.json([]);
    }

    const data: IMarketTick[] = favorites.map((symbol) => {
      const tick = latestPrices.get(symbol);
      return {
        symbol,
        price: typeof tick?.price === 'number' ? tick.price : null
      };
    });

    return res.json(data);
  } catch (err) {
    console.error('Failed to load latest prices:', err);
    res.status(500).json({ error: 'Failed to load latest prices' });
  }
}

export async function getLatestBySymbol(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    let symbol = String(req.params.symbol || '').toUpperCase().trim();
    if (!symbol) {
      return res.status(400).json({ error: 'symbol is required' });
    }

    // Auto-append USDT if not provided
    if (!symbol.endsWith('USDT')) {
      symbol = `${symbol}USDT`;
    }

    const account = await AccountModel.findOne({ userId }).lean();
    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }

    const favorites = (account.favorites ?? []).map((s) => String(s).toUpperCase());
    if (!favorites.includes(symbol)) {
      return res.status(403).json({ error: 'symbol not in favorites' });
    }

    const tick = latestPrices.get(symbol);

    // Do NOT fallback to REST here; favorites-only latest must reflect WS state
    if (!tick) {
      return res.status(404).json({ error: 'symbol not streamed yet' });
    }

    const result: IMarketTick = {
      symbol,
      price: typeof tick.price === 'number' ? tick.price : null
    };

    res.json(result);
  } catch (err) {
    console.error('Failed to load latest price by symbol:', err);
    res.status(500).json({ error: 'Failed to load latest price by symbol' });
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
