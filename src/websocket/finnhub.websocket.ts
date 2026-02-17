// WebSocket server (clients) + Finnhub WebSocket (upstream) integration
import WebSocket, { WebSocketServer, type RawData } from 'ws';
import type { Server as HttpServer } from 'http';

// Load environment variables from .env files (dotenv-flow supports env variants)
import dotenvFlow from 'dotenv-flow';
dotenvFlow.config();

// Helper to fail fast when required environment variables are missing
function required(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required env var: ${name}`);
  return v;
}

// Finnhub API key and list of symbols to subscribe to on startup
// SYMBOLS comes from process.env.SYMBOLS (comma-separated)
const FINNHUB_API_KEY = required('FINNHUB_API_KEY');
const SYMBOLS = (process.env.SYMBOLS?.split(',') || []).map((s) => s.trim()).filter((s) => s.length > 0);

// Minimal shape of Finnhub trade messages we care about
type FinnhubTradeMsg = {
  type: string;
  data?: Array<{ s: string; p: number; t: number }>;
};

// In-memory cache of the latest price per symbol (live snapshot for REST endpoints)
export const latestPrices = new Map<string, { price: number; marketTimestamp: number }>();

// Default client subscriptions (normalized symbols without BINANCE: prefix)
const DEFAULT_SUBS = new Set<string>(
  SYMBOLS.map((s) => String(s).replace('BINANCE:', ''))
);

// Attaches a WebSocket server for clients and connects to Finnhub upstream
// - Clients receive real-time price updates
// - Finnhub provides the live trade feed
export function attachFinnhubAndClientWS(server: HttpServer) {
  const wss = new WebSocketServer({ server });

  // Tracks per-client symbol subscriptions (each client can subscribe/unsubscribe)
  const clientSubs = new Map<WebSocket, Set<string>>();

  // Handle new client connections and initialize their default subscriptions
  wss.on('connection', (client: WebSocket) => {
    // Default subscriptions for new connections
    clientSubs.set(client, new Set(DEFAULT_SUBS));
    client.send(JSON.stringify({ type: 'info', message: 'connected', defaults: Array.from(DEFAULT_SUBS) }));

    // Handle client subscription commands: subscribe / unsubscribe / set
    client.on('message', (raw) => {
      let msg: any;
      try { msg = JSON.parse(raw.toString()); } catch { return; }

      if (msg?.type === 'subscribe' && Array.isArray(msg.symbols)) {
        const set = clientSubs.get(client) ?? new Set<string>();
        msg.symbols.forEach((s: string) => set.add(String(s).replace('BINANCE:', '')));
        clientSubs.set(client, set);
      }

      if (msg?.type === 'unsubscribe' && Array.isArray(msg.symbols)) {
        const set = clientSubs.get(client) ?? new Set<string>();
        msg.symbols.forEach((s: string) => set.delete(String(s).replace('BINANCE:', '')));
        clientSubs.set(client, set);
      }

      if (msg?.type === 'set' && Array.isArray(msg.symbols)) {
        const set: Set<string> = new Set(
          msg.symbols.map((s: string) => String(s).replace('BINANCE:', ''))
        );
        clientSubs.set(client, set);
      }
    });

    // Cleanup when a client disconnects
    client.on('close', () => {
      clientSubs.delete(client);
    });
  });

  let finnhub: WebSocket | null = null;

  // Broadcast a price update to all connected clients that are subscribed to the symbol
  function broadcast(payload: { symbol: string; price: number; time: number }) {
    const msg = JSON.stringify(payload);
    wss.clients.forEach((c: WebSocket) => {
      if (c.readyState !== WebSocket.OPEN) return;
      const subs = clientSubs.get(c);
      if (!subs || subs.has(payload.symbol)) {
        c.send(msg);
      }
    });
  }

  // Connects to Finnhub WebSocket and manages lifecycle (open, message, close, error)
  // Guard prevents multiple parallel connections
  function connectFinnhub() {
    if (finnhub && finnhub.readyState === WebSocket.OPEN) return;

    console.log('Connecting to Finnhub WS...');
    finnhub = new WebSocket(`wss://ws.finnhub.io?token=${FINNHUB_API_KEY}`);

    // Subscribe to all configured symbols once connected to Finnhub
    finnhub.on('open', () => {
      console.log('Connected to Finnhub');
      SYMBOLS.forEach((symbol) => {
        finnhub?.send(JSON.stringify({ type: 'subscribe', symbol }));
      });
    });

    // Process incoming Finnhub messages: ignore pings, handle trade ticks
    // Update in-memory latestPrices and broadcast to clients
    finnhub.on('message', async (data: RawData) => {
      let msg: FinnhubTradeMsg;
      try {
        msg = JSON.parse(data.toString());
      } catch {
        return;
      }

      if (msg.type === 'ping') return;

      if (msg.type === 'trade' && Array.isArray(msg.data)) {
        for (const t of msg.data) {
          const symbol = String(t.s).replace('BINANCE:', '');
          const price = Number(t.p);
          const marketTs = new Date(Number(t.t));

          // Update live in-memory snapshot
          latestPrices.set(symbol, {
            price,
            marketTimestamp: marketTs.getTime()
          });

          broadcast({ symbol, price, time: marketTs.getTime() });
        }
      }
    });

    // Reconnect with a fixed delay to avoid hammering Finnhub (handles 429/backoff)
    finnhub.on('close', () => {
      console.log('Finnhub WS closed. Reconnecting in 120s...');
      setTimeout(connectFinnhub, 120_000);
    });

    // Log errors and force close to trigger reconnect via the close handler
    finnhub.on('error', (err: Error) => {
      console.error('Finnhub WS error:', err.message);
      try { finnhub?.close(); } catch {}
    });
  }

  // Kick off the initial Finnhub connection on server startup
  connectFinnhub();
}