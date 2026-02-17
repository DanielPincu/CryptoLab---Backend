function required(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required env var: ${name}`);
  return v;
}

const FINNHUB_API_KEY = required('FINNHUB_API_KEY');

export async function fetchBinanceSymbols() {
  const url = `https://finnhub.io/api/v1/crypto/symbol?exchange=BINANCE&token=${FINNHUB_API_KEY}`;

  const res = await fetch(url);

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Finnhub API error: ${res.status} ${text}`);
  }

  return res.json();
}