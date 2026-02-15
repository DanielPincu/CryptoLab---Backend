import WebSocket, { WebSocketServer, type RawData } from 'ws';
import type { Server as HttpServer } from 'http';

import dotenvFlow from 'dotenv-flow';
dotenvFlow.config();

function required(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required env var: ${name}`);
  return v;
}

const FINNHUB_API_KEY = required('FINNHUB_API_KEY');
const SYMBOLS = (process.env.SYMBOLS?.split(',') || []).map((s) => s.trim()).filter((s) => s.length > 0);
import { MarketLatestModel } from '../models/marketLatest.model';

type FinnhubTradeMsg = {
  type: string;
  data?: Array<{ s: string; p: number; t: number }>;
};

const DEFAULT_SUBS = new Set<string>(
  SYMBOLS.map((s) => String(s).replace('BINANCE:', ''))
);

export function attachFinnhubAndClientWS(server: HttpServer) {
  const wss = new WebSocketServer({ server });

  // Per-client subscriptions
  const clientSubs = new Map<WebSocket, Set<string>>();

  wss.on('connection', (client: WebSocket) => {
    // Default subscriptions for new connections
    clientSubs.set(client, new Set(DEFAULT_SUBS));
    client.send(JSON.stringify({ type: 'info', message: 'connected', defaults: Array.from(DEFAULT_SUBS) }));

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

    client.on('close', () => {
      clientSubs.delete(client);
    });
  });

  let finnhub: WebSocket | null = null;

  // Throttle DB writes: at most once per symbol per 10s
  const lastWriteMs: Record<string, number> = {};
  const WRITE_INTERVAL_MS = 10_000;

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

  function connectFinnhub() {
    if (finnhub && finnhub.readyState === WebSocket.OPEN) return;

    console.log('Connecting to Finnhub WS...');
    finnhub = new WebSocket(`wss://ws.finnhub.io?token=${FINNHUB_API_KEY}`);

    finnhub.on('open', () => {
      console.log('Connected to Finnhub');
      SYMBOLS.forEach((symbol) => {
        finnhub?.send(JSON.stringify({ type: 'subscribe', symbol }));
      });
    });

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

          const now = Date.now();
          const last = lastWriteMs[symbol] ?? 0;

          if (now - last >= WRITE_INTERVAL_MS) {
            lastWriteMs[symbol] = now;
            await MarketLatestModel.updateOne(
              { symbol },
              { $set: { symbol, price, marketTimestamp: marketTs, source: 'finnhub' } },
              { upsert: true }
            );
          }

          broadcast({ symbol, price, time: marketTs.getTime() });
        }
      }
    });

    finnhub.on('close', () => {
      console.log('Finnhub WS closed. Reconnecting in 120s...');
      setTimeout(connectFinnhub, 120_000);
    });

    finnhub.on('error', (err: Error) => {
      console.error('Finnhub WS error:', err.message);
      try { finnhub?.close(); } catch {}
    });
  }

  connectFinnhub();
}