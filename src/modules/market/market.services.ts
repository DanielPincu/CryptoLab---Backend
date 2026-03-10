import { latestPrices } from '../../websocket/finnhub.websocket';

function required(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required env var: ${name}`);
  return v;
}

// ---- Simple in-memory cache for Finnhub symbols (avoid spamming API) ----
let symbolsCache: any[] | null = null;
let symbolsCacheAt = 0;
const SYMBOLS_CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

export async function fetchBinanceSymbols() {
  const now = Date.now();
  if (symbolsCache && now - symbolsCacheAt < SYMBOLS_CACHE_TTL_MS) {
    return symbolsCache;
  }

  const url = 'https://api.binance.com/api/v3/exchangeInfo';
  const res = await fetch(url);

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Finnhub API error: ${res.status} ${text}`);
  }

  const json = await res.json();

  const data = (json.symbols ?? [])
    .filter((s: any) =>
      s.status === 'TRADING' &&
      s.quoteAsset === 'USDT' &&
      s.isSpotTradingAllowed === true
    )
    .map((s: any) => ({
      description: s.symbol,
      displaySymbol: s.symbol,
      symbol: `BINANCE:${s.symbol}`
    }));

  symbolsCache = data;
  symbolsCacheAt = now;
  return data;
}

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

// ---- History from Binance REST (no axios) ----
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