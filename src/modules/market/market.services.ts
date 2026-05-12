// ---- Live quote from Binance REST ----
export async function getQuote(symbol: string) {
  const clean = String(symbol).replace(/^BINANCE:/i, '').toUpperCase().trim();

  const url =
    `https://api.binance.com/api/v3/ticker/24hr` +
    `?symbol=${encodeURIComponent(clean)}`;

  const r = await fetch(url);
  if (!r.ok) {
    const text = await r.text();
    throw new Error(`Binance API error: ${text}`);
  }

  const data = (await r.json()) as { lastPrice: string; closeTime: number };

  return {
    symbol: `BINANCE:${clean}`,
    price: Number(data.lastPrice),
    ts: data.closeTime,
    source: 'binance'
  };
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
