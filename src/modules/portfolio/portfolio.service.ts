import mongoose from 'mongoose'
import { AccountModel } from '../../schemas/account.schema'
import { PositionModel } from '../../schemas/position.schema'
import { TransactionModel } from '../../schemas/transaction.schema'
import { latestPrices } from '../../websocket/finnhub.websocket'

function normalizeSymbol(s: string) {
  return String(s || '').replace(/^BINANCE:/i, '').toUpperCase().trim()
}

async function getPrice(symbolRaw: string): Promise<number | null> {
  const symbol = normalizeSymbol(symbolRaw)

  const tick = latestPrices.get(symbol)
  if (tick?.price) return tick.price

  return null
}

function roundUsd(n: number) {
  return Number(n.toFixed(2))
}

function roundQty(n: number) {
  return Number(n.toFixed(8))
}

export async function getPortfolioSummary(userId: string) {
  const account = await AccountModel.findOne({ userId }).lean()
  if (!account) throw new Error('Account not found')

  const positions = await PositionModel.find({ userId }).lean()

  let positionsValue = 0
  let unrealizedPnl = 0

  for (const p of positions) {
    const symbol = normalizeSymbol(p.symbol)
    const price = await getPrice(symbol)

    if (!price) continue

    const mv = price * p.qty
    positionsValue += mv
    unrealizedPnl += (price - p.avgEntryPrice) * p.qty
  }

  const userObjectId = new mongoose.Types.ObjectId(userId)

  const txAgg = await TransactionModel.aggregate([
    { $match: { userId: userObjectId } },
    {
      $group: {
        _id: null,
        realizedPnl: { $sum: { $ifNull: ['$realizedPnl', 0] } },
        totalBuyVolume: {
          $sum: {
            $cond: [
              { $eq: ['$side', 'BUY'] },
              { $multiply: ['$qty', '$price'] },
              0
            ]
          }
        },
        totalSellVolume: {
          $sum: {
            $cond: [
              { $eq: ['$side', 'SELL'] },
              { $multiply: ['$qty', '$price'] },
              0
            ]
          }
        }
      }
    }
  ])

  const realizedPnl = Number(txAgg?.[0]?.realizedPnl ?? 0)
  const totalBuyVolume = Number(txAgg?.[0]?.totalBuyVolume ?? 0)
  const totalSellVolume = Number(txAgg?.[0]?.totalSellVolume ?? 0)

  const cashBalance = Number(account.cashBalance ?? 0)
  const totalValue = cashBalance + positionsValue

  const netPnl = realizedPnl + unrealizedPnl
  const totalReturnPct = totalBuyVolume > 0
    ? netPnl / totalBuyVolume
    : 0

  return {
    cashBalance: roundUsd(cashBalance),
    positionsValue: roundUsd(positionsValue),
    totalValue: roundUsd(totalValue),
    unrealizedPnl: roundUsd(unrealizedPnl),
    realizedPnl: roundUsd(realizedPnl),
    netPnl: roundUsd(netPnl),
    totalReturnPct: Number(totalReturnPct.toFixed(6)),
    totalInvested: roundUsd(totalBuyVolume),
    totalSold: roundUsd(totalSellVolume),
    updatedAt: new Date().toISOString()
  }
}