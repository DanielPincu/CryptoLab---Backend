import { PositionModel } from '../../schemas/position.schema'
import { latestPrices } from '../../websocket/finnhub.websocket'

function normalizeSymbol(s: string) {
  return String(s || '').replace(/^BINANCE:/i, '').toUpperCase().trim()
}

export async function getUserPositions(userId: string) {
  const positions = await PositionModel.find({ userId }).lean()

  return Promise.all(positions.map(async (p) => {
    const symbol = normalizeSymbol(p.symbol)

    let currentPrice: number | null = null

    // 1. Try WebSocket cache first
    const live = latestPrices.get(symbol)
    if (typeof live?.price === 'number') {
      currentPrice = live.price
    }

    // 2. Fallback to Binance REST if WS cache misses the symbol
    if (currentPrice == null) {
      try {
        const res = await fetch(
          `https://api.binance.com/api/v3/ticker/price?symbol=${encodeURIComponent(symbol)}`
        )
        const json: { price?: string } = await res.json()
        const restPrice = Number(json?.price)

        if (Number.isFinite(restPrice)) {
          currentPrice = restPrice
        }
      } catch {
        // ignore REST failure and keep null
      }
    }

    const marketValue = currentPrice ? currentPrice * p.qty : null
    const unrealizedPnl =
      currentPrice ? (currentPrice - p.avgEntryPrice) * p.qty : null

    return {
      ...p,
      currentPrice,
      marketValue,
      unrealizedPnl
    }
  }))
}