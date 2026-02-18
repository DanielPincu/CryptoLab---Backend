import { latestPrices } from '../../websocket/finnhub.websocket';

function required(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required env var: ${name}`);
  return v;
}

const FINNHUB_API_KEY = required('FINNHUB_API_KEY');

// ---- Simple in-memory cache for Finnhub symbols (avoid spamming API) ----
let symbolsCache: any[] | null = null;
let symbolsCacheAt = 0;
const SYMBOLS_CACHE_TTL_MS = 60_000; // 1 minute

export async function fetchBinanceSymbols() {
  const now = Date.now();
  if (symbolsCache && now - symbolsCacheAt < SYMBOLS_CACHE_TTL_MS) {
    return symbolsCache;
  }

  const url = `https://finnhub.io/api/v1/crypto/symbol?exchange=BINANCE&token=${FINNHUB_API_KEY}`;
  const res = await fetch(url);

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Finnhub API error: ${res.status} ${text}`);
  }

  const data = (await res.json()) as Array<{
    description: string;
    displaySymbol: string;
    symbol: string; // e.g. BINANCE:BTCUSDT
  }>;

  // Filter only USDT pairs
  const usdtOnly = data.filter((x) => x.symbol?.toUpperCase().endsWith('USDT'));

  symbolsCache = usdtOnly;
  symbolsCacheAt = now;
  return usdtOnly;
}

// ---- Live quote from Finnhub WS (in-memory snapshot) ----
export async function getQuote(symbol: string) {
  const clean = String(symbol).replace(/^BINANCE:/i, '').toUpperCase().trim();
  const tick = latestPrices.get(clean);

  if (!tick) {
    throw new Error('No live price available for symbol');
  }

  return {
    symbol: `BINANCE:${clean}`,
    price: tick.price,
    ts: tick.marketTimestamp,
    source: 'finnhub'
  };
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