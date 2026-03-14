import { PositionModel } from '../../schemas/position.schema'
import type { IPosition } from '../../interfaces/position.interface'
import { latestPrices } from '../../websocket/finnhub.websocket'

function normalizeSymbol(s: string) {
  return String(s || '').replace(/^BINANCE:/i, '').toUpperCase().trim()
}

export async function getUserPositions(userId: string): Promise<IPosition[]> {
  const positions = await PositionModel.find({ userId }).lean<IPosition[]>()

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

    const positionCost = p.qty * p.avgEntryPrice
    const marketValue = currentPrice ? currentPrice * p.qty : null

    const unrealizedPnl =
      currentPrice ? (currentPrice - p.avgEntryPrice) * p.qty : null

    const unrealizedPnlPercent =
      currentPrice && p.avgEntryPrice > 0
        ? ((currentPrice - p.avgEntryPrice) / p.avgEntryPrice) * 100
        : null

    return {
      ...p,
      currentPrice,
      positionCost,
      marketValue,
      unrealizedPnl,
      unrealizedPnlPercent
    }
  }))
}