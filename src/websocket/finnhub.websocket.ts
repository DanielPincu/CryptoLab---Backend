// WebSocket server (clients) + Finnhub WebSocket (upstream) integration
import WebSocket, { WebSocketServer, type RawData } from 'ws';
import type { Server as HttpServer } from 'http';

import { env } from '../config/env';
import { AccountModel } from '../schemas/account.schema';

// --- Helpers ---
function normalizeSymbol(s: string) {
  return String(s || '').replace(/^BINANCE:/i, '').toUpperCase().trim();
}

const uniqNorm = (arr: string[] = []) =>
  Array.from(new Set(arr.map(normalizeSymbol))).filter(Boolean);

// --- State ---
const userSockets = new Map<string, WebSocket>();
export const latestPrices = new Map<string, { price: number; marketTimestamp: number; source: 'finnhub' | 'binance' }>();

// Per-socket downstream subscriptions (used for filtered broadcast)
const clientSubs = new Map<WebSocket, Set<string>>();

let finnhubGlobal: WebSocket | null = null;
const pendingUpstreamSubs = new Set<string>();
const upstreamSubs = new Set<string>();

const MAX_LIVE_AGE_MS = 120_000; // consider live tick stale after 120s
const WATCHDOG_INTERVAL_MS = 60_000; // check every 60s

// Finnhub API key
const FINNHUB_API_KEY = env.FINNHUB_API_KEY;

// Minimal shape of Finnhub trade messages we care about
type FinnhubTradeMsg = {
  type: string;
  data?: Array<{ s: string; p: number; t: number }>;
};

// --- Exported helpers ---
export function isFinnhubLive() {
  return finnhubGlobal?.readyState === WebSocket.OPEN
}
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
  const subs = uniqNorm(opts.subscribe)
  const unsubs = uniqNorm(opts.unsubscribe)

  if (!finnhubGlobal || finnhubGlobal.readyState !== WebSocket.OPEN) {
    subs.forEach((s) => pendingUpstreamSubs.add(s))
    unsubs.forEach((s) => pendingUpstreamSubs.delete(s))
    return
  }

  subs.forEach((symbol) => {
    if (!upstreamSubs.has(symbol)) {
      upstreamSubs.add(symbol)
      finnhubGlobal!.send(JSON.stringify({ type: 'subscribe', symbol: `BINANCE:${symbol}` }))
    }
  })

  unsubs.forEach((symbol) => {
    if (upstreamSubs.has(symbol)) {
      upstreamSubs.delete(symbol)
      finnhubGlobal!.send(JSON.stringify({ type: 'unsubscribe', symbol: `BINANCE:${symbol}` }))
    }
  })
}

export function subscribeFavoritesOnLogin(favorites: string[]) {
  const syms = uniqNorm(favorites);
  if (!syms.length) return;
  notifyUpstreamFavoritesChange({ subscribe: syms });
}

// --- WS attach ---
export function attachFinnhubAndClientWS(server: HttpServer) {
  const wss = new WebSocketServer({ server });

  function isSymbolSubscribed(symbol: string) {
    for (const set of clientSubs.values()) {
      if (set?.has(symbol)) return true
    }
    return false
  }

  wss.on('connection', (client: WebSocket, request) => {
    clientSubs.set(client, new Set());
    client.send(JSON.stringify({ type: 'info', message: 'connected' }));

    // Optional userId + favorites via query
    try {
      const url = new URL(request.url || '', 'http://localhost');
      const userId = url.searchParams.get('userId');
      const favsParam = url.searchParams.get('favorites');
      const favorites = favsParam ? uniqNorm(favsParam.split(',')) : [];

      if (userId) registerUserSocket(userId, client, favorites);

      // Populate per-socket subscription state for filtering
      if (favorites.length) {
        const set = clientSubs.get(client)!;
        favorites.forEach((s) => set.add(s));
      }
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

  function broadcast(symbol: string, price: number, time: number, source: 'finnhub' | 'binance') {
    const payload = JSON.stringify({ symbol, price, time, source });

    wss.clients.forEach((c: WebSocket) => {
      if (c.readyState !== WebSocket.OPEN) return;

      const subs = clientSubs.get(c);
      if (!subs || !subs.has(symbol)) return;

      c.send(payload);
    });
  }

  async function broadcastBackupIfStale() {
    const now = Date.now();

    // Only consider symbols that somebody is subscribed to downstream.
    const activeSymbols = new Set<string>();
    for (const set of clientSubs.values()) {
      for (const s of set) activeSymbols.add(s);
    }

    await Promise.all(
      Array.from(activeSymbols).map(async (symbol) => {
        const live = latestPrices.get(symbol);
        const isStale = !live || now - Number(live.marketTimestamp || 0) > MAX_LIVE_AGE_MS;
        if (!isStale) return;

        try {
          // ---- Try REST price from Binance first ----
          try {
            const r = await fetch(
              `https://api.binance.com/api/v3/ticker/price?symbol=${encodeURIComponent(symbol)}`
            );

            if (r.ok) {
              const j = await r.json() as { price?: string };
              const restPrice = Number(j?.price);

              if (!Number.isNaN(restPrice)) {
                // update in‑memory cache
                latestPrices.set(symbol, { price: restPrice, marketTimestamp: now, source: 'binance' });

                broadcast(symbol, restPrice, now, 'binance');
                return;
              }
            }
          } catch {}

        } catch (e: any) {
          console.error('watchdog fallback failed:', e?.message || e);
        }
      })
    );
  }

  // Periodically push backup prices for symbols that are stale on WS.
  setInterval(() => {
    void broadcastBackupIfStale();
  }, WATCHDOG_INTERVAL_MS);

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
          if (!upstreamSubs.has(symbol)) {
            upstreamSubs.add(symbol)
            finnhubGlobal!.send(JSON.stringify({ type: 'subscribe', symbol: `BINANCE:${symbol}` }))
          }
        });
      } catch (e) {
        console.error('Failed to rehydrate Finnhub subscriptions from DB:', e);
      }

      // Flush queued subscriptions
      pendingUpstreamSubs.forEach((symbol) => {
        if (!upstreamSubs.has(symbol)) {
          upstreamSubs.add(symbol)
          finnhubGlobal!.send(JSON.stringify({ type: 'subscribe', symbol: `BINANCE:${symbol}` }))
        }
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

          latestPrices.set(symbol, { price, marketTimestamp: marketTs, source: 'finnhub' });

          if (upstreamSubs.has(symbol) || isSymbolSubscribed(symbol)) {
            // no DB backup persistence anymore
          }

          broadcast(symbol, price, marketTs, 'finnhub');
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
