// WebSocket server (clients) + Finnhub WebSocket (upstream) integration
import WebSocket, { WebSocketServer, type RawData } from 'ws';
import type { Server as HttpServer } from 'http';

import { env } from '../config/env';
import { AccountModel } from '../models/account.model';

// --- Helpers ---
function normalizeSymbol(s: string) {
  return String(s || '').replace(/^BINANCE:/i, '').toUpperCase().trim();
}

const uniqNorm = (arr: string[] = []) =>
  Array.from(new Set(arr.map(normalizeSymbol))).filter(Boolean);

// --- State ---
const userSockets = new Map<string, WebSocket>();
export const latestPrices = new Map<string, { price: number; marketTimestamp: number }>();

let finnhubGlobal: WebSocket | null = null;
const pendingUpstreamSubs = new Set<string>();

// Finnhub API key
const FINNHUB_API_KEY = env.FINNHUB_API_KEY;

// Minimal shape of Finnhub trade messages we care about
type FinnhubTradeMsg = {
  type: string;
  data?: Array<{ s: string; p: number; t: number }>;
};

// --- Exported helpers ---
export function registerUserSocket(userId: string, ws: WebSocket, favorites?: string[]) {
  userSockets.set(userId, ws);

  if (Array.isArray(favorites) && favorites.length) {
    const syms = uniqNorm(favorites);
    notifyUpstreamFavoritesChange({ subscribe: syms });
    ws.send(JSON.stringify({ type: 'subscribe', symbols: syms }));
  }
}

export function unregisterUserSocket(userId: string) {
  userSockets.delete(userId);
}

export function notifyUserFavoritesChange(
  userId: string,
  opts: { subscribe?: string[]; unsubscribe?: string[] }
) {
  const ws = userSockets.get(userId);
  if (!ws || ws.readyState !== WebSocket.OPEN) return;

  const subs = uniqNorm(opts.subscribe);
  const unsubs = uniqNorm(opts.unsubscribe);

  if (subs.length) ws.send(JSON.stringify({ type: 'subscribe', symbols: subs }));
  if (unsubs.length) ws.send(JSON.stringify({ type: 'unsubscribe', symbols: unsubs }));
}

export function notifyUpstreamFavoritesChange(
  opts: { subscribe?: string[]; unsubscribe?: string[] }
) {
  const subs = uniqNorm(opts.subscribe);
  const unsubs = uniqNorm(opts.unsubscribe);

  // If upstream not ready, queue desired subscriptions
  if (!finnhubGlobal || finnhubGlobal.readyState !== WebSocket.OPEN) {
    subs.forEach((s) => pendingUpstreamSubs.add(s));
    unsubs.forEach((s) => pendingUpstreamSubs.delete(s));
    return;
  }

  subs.forEach((symbol) => {
    finnhubGlobal!.send(JSON.stringify({ type: 'subscribe', symbol: `BINANCE:${symbol}` }));
  });

  unsubs.forEach((symbol) => {
    finnhubGlobal!.send(JSON.stringify({ type: 'unsubscribe', symbol: `BINANCE:${symbol}` }));
  });
}

export function subscribeFavoritesOnLogin(favorites: string[]) {
  const syms = uniqNorm(favorites);
  if (!syms.length) return;
  notifyUpstreamFavoritesChange({ subscribe: syms });
}

// --- WS attach ---
export function attachFinnhubAndClientWS(server: HttpServer) {
  const wss = new WebSocketServer({ server });
  const clientSubs = new Map<WebSocket, Set<string>>();

  wss.on('connection', (client: WebSocket) => {
    clientSubs.set(client, new Set());
    client.send(JSON.stringify({ type: 'info', message: 'connected' }));

    // Optional userId + favorites via query
    try {
      const url = new URL((client as any).url || '', 'http://localhost');
      const userId = url.searchParams.get('userId');
      const favsParam = url.searchParams.get('favorites');
      const favorites = favsParam ? uniqNorm(favsParam.split(',')) : undefined;
      if (userId) registerUserSocket(userId, client, favorites);
    } catch {}

    client.on('message', (raw) => {
      let msg: any;
      try { msg = JSON.parse(raw.toString()); } catch { return; }

      if (msg?.type === 'subscribe' && Array.isArray(msg.symbols)) {
        const set = clientSubs.get(client) ?? new Set<string>();
        uniqNorm(msg.symbols).forEach((s) => set.add(s));
        clientSubs.set(client, set);
      }

      if (msg?.type === 'unsubscribe' && Array.isArray(msg.symbols)) {
        const set = clientSubs.get(client) ?? new Set<string>();
        uniqNorm(msg.symbols).forEach((s) => set.delete(s));
        clientSubs.set(client, set);
      }

      if (msg?.type === 'set' && Array.isArray(msg.symbols)) {
        clientSubs.set(client, new Set(uniqNorm(msg.symbols)));
      }
    });

    client.on('close', () => {
      for (const [uid, ws] of userSockets.entries()) {
        if (ws === client) userSockets.delete(uid);
      }
      clientSubs.delete(client);
    });
  });

  function broadcast(payload: { symbol: string; price: number; time: number }) {
    const msg = JSON.stringify(payload);
    wss.clients.forEach((c: WebSocket) => {
      if (c.readyState === WebSocket.OPEN) {
        c.send(msg);
      }
    });
  }

  function connectFinnhub() {
    if (finnhubGlobal && finnhubGlobal.readyState === WebSocket.OPEN) return;

    console.log('Connecting to Finnhub WS...');
    finnhubGlobal = new WebSocket(`wss://ws.finnhub.io?token=${FINNHUB_API_KEY}`);

    finnhubGlobal.on('open', async () => {
      console.log('Connected to Finnhub');

      // Rehydrate upstream subscriptions from DB on server start/restart
      try {
        const accounts = await AccountModel.find({ favorites: { $exists: true, $ne: [] } })
          .select('favorites')
          .lean();

        const allFavs = accounts.flatMap((a: any) => uniqNorm(a.favorites ?? []));
        const unique = Array.from(new Set(allFavs));

        unique.forEach((symbol) => {
          finnhubGlobal!.send(JSON.stringify({ type: 'subscribe', symbol: `BINANCE:${symbol}` }));
        });
      } catch (e) {
        console.error('Failed to rehydrate Finnhub subscriptions from DB:', e);
      }

      // Flush queued subscriptions
      pendingUpstreamSubs.forEach((symbol) => {
        finnhubGlobal!.send(JSON.stringify({ type: 'subscribe', symbol: `BINANCE:${symbol}` }));
      });
      pendingUpstreamSubs.clear();
    });

    finnhubGlobal.on('message', (data: RawData) => {
      let msg: FinnhubTradeMsg;
      try { msg = JSON.parse(data.toString()); } catch { return; }
      if (msg.type === 'ping') return;

      if (msg.type === 'trade' && Array.isArray(msg.data)) {
        for (const t of msg.data) {
          const symbol = normalizeSymbol(t.s);
          const price = Number(t.p);
          const marketTs = Number(t.t);

          latestPrices.set(symbol, { price, marketTimestamp: marketTs });
          broadcast({ symbol, price, time: marketTs });
        }
      }
    });

    finnhubGlobal.on('close', () => {
      console.log('Finnhub WS closed. Reconnecting in 120s...');
      setTimeout(connectFinnhub, 120_000);
    });

    finnhubGlobal.on('error', (err: Error) => {
      console.error('Finnhub WS error:', err.message);
      try { finnhubGlobal?.close(); } catch {}
    });
  }

  connectFinnhub();
}
