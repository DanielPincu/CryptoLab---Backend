import { PositionModel } from '../../schemas/position.schema'
import { latestPrices } from '../../websocket/finnhub.websocket'
import { MarketBackupSchema } from '../../schemas/marketBackup.schema'

function normalizeSymbol(s: string) {
  return String(s || '').replace(/^BINANCE:/i, '').toUpperCase().trim()
}

export async function getUserPositions(userId: string) {
  const positions = await PositionModel.find({ userId }).lean()

  return Promise.all(positions.map(async (p) => {
    const symbol = normalizeSymbol(p.symbol)

    let currentPrice: number | null = null

    const live = latestPrices.get(symbol)
    if (live?.price) {
      currentPrice = live.price
    } else {
      const backup = await MarketBackupSchema.findOne({ symbol }).lean()
      if (backup?.price) {
        currentPrice = backup.price
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