import { PositionModel } from '../../schemas/position.schema'
import { latestPrices } from '../../websocket/finnhub.websocket'

function normalizeSymbol(s: string) {
  return String(s || '').replace(/^BINANCE:/i, '').toUpperCase().trim()
}

export async function getUserPositions(userId: string) {
  const positions = await PositionModel.find({ userId }).lean()

  return positions.map((p) => {
    const symbol = normalizeSymbol(p.symbol)
    const live = latestPrices.get(symbol)

    const currentPrice = live?.price ?? null
    const marketValue = currentPrice ? currentPrice * p.qty : null
    const unrealizedPnl =
      currentPrice ? (currentPrice - p.avgEntryPrice) * p.qty : null

    return {
      ...p,
      currentPrice,
      marketValue,
      unrealizedPnl
    }
  })
}