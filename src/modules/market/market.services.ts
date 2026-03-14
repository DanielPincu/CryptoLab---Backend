import { latestPrices } from '../../websocket/finnhub.websocket';

function required(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required env var: ${name}`);
  return v;
}

// ---- Simple in-memory cache for symbols (avoid spamming API) ----
let symbolsCache: any[] | null = null;
let symbolsCacheAt = 0;
const SYMBOLS_CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours


// ---- Live quote from Finnhub WS (in-memory snapshot) ----
export async function getQuote(symbol: string) {
  const clean = String(symbol).replace(/^BINANCE:/i, '').toUpperCase().trim();

  // ---- Try WebSocket live price first ----
  const tick = latestPrices.get(clean);

  if (tick) {
    return {
      symbol: `BINANCE:${clean}`,
      price: tick.price,
      ts: tick.marketTimestamp,
      source: tick.source
    };
  }

  throw new Error('No live price available for symbol');
}

// ---- History from Binance REST ----
export async function fetchBinanceHistory(
  symbol: string,
  interval = '5m',
  limit = '120'
) {
  const binanceSymbol = String(symbol)
    .replace(/^BINANCE:/i, '')
    .toUpperCase()
    .trim();

  const url =
    `https://api.binance.com/api/v3/klines` +
    `?symbol=${encodeURIComponent(binanceSymbol)}` +
    `&interval=${encodeURIComponent(interval)}` +
    `&limit=${encodeURIComponent(limit)}`;

  const r = await fetch(url);
  if (!r.ok) {
    const text = await r.text();
    throw new Error(`Binance API error: ${text}`);
  }

  const data = (await r.json()) as any[];

  const candles = data.map((k) => ({
    time: k[0],
    open: Number(k[1]),
    high: Number(k[2]),
    low: Number(k[3]),
    close: Number(k[4]),
    volume: Number(k[5])
  }));

  return { symbol: `BINANCE:${binanceSymbol}`, interval, candles };
}