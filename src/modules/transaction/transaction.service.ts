import mongoose from 'mongoose'
import type { QueryFilter } from 'mongoose'
import type { ITransaction, TransactionListItem } from '../../interfaces/transaction.interface'
import { TransactionModel } from '../../schemas/transaction.schema'

function normalizeSymbol(s: string) {
  return String(s || '').replace(/^BINANCE:/i, '').toUpperCase().trim()
}

export async function getUserTransactions(opts: {
  userId: string
  symbol?: string
  limit?: number
  cursor?: string
}) {
  const { userId } = opts
  const symbol = opts.symbol ? normalizeSymbol(opts.symbol) : undefined
  const limit = Math.min(Number(opts.limit ?? 100) || 100, 500)

  const q: QueryFilter<ITransaction> = {
    userId: new mongoose.Types.ObjectId(userId)
  }
  if (symbol) q.symbol = symbol

  if (opts.cursor) {
    try {
      q._id = { $lt: new mongoose.Types.ObjectId(String(opts.cursor)) }
    } catch {
      // ignore invalid cursor
    }
  }

  const txs = await TransactionModel.find(q)
    .sort({ _id: -1 })
    .limit(limit)
    .lean<TransactionListItem[]>()

  const enriched = txs.map((t) => {
    if (typeof t.realizedPnl === 'number' && typeof t.price === 'number' && typeof t.qty === 'number') {
      const sellValue = t.price * t.qty
      const costBasis = sellValue - t.realizedPnl

      if (costBasis !== 0) {
        t.realizedPnlPercent = (t.realizedPnl / costBasis) * 100
      }
    }

    return t
  })

  return enriched
}
