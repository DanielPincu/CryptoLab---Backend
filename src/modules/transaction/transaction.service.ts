import { TransactionModel } from '../../models/transaction.model'

function normalizeSymbol(s: string) {
  return String(s || '').replace(/^BINANCE:/i, '').toUpperCase().trim()
}

export async function getUserTransactions(opts: {
  userId: string
  symbol?: string
  limit?: number
}) {
  const { userId } = opts
  const symbol = opts.symbol ? normalizeSymbol(opts.symbol) : undefined
  const limit = Math.min(Number(opts.limit ?? 100) || 100, 500)

  const q: Record<string, any> = { userId }
  if (symbol) q.symbol = symbol

  const txs = await TransactionModel.find(q)
    .sort({ executedAt: -1, createdAt: -1 })
    .limit(limit)
    .lean()

  return txs
}