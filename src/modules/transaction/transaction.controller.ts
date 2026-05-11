import type { Request, Response } from 'express'
import { getUserTransactions } from './transaction.service'

export async function getMyTransactions(req: Request, res: Response) {
  try {
    const userId = req.user?.id
    if (!userId) return res.status(401).json({ error: 'Unauthorized' })

    const symbol = req.query.symbol ? String(req.query.symbol) : undefined
    const limit = req.query.limit ? Number(req.query.limit) : undefined
    const cursor = req.query.cursor ? String(req.query.cursor) : undefined

    const txs = await getUserTransactions({
      userId: String(userId),
      symbol,
      limit,
      cursor
    })

    const cleaned = txs.map((tx) => {
      const item = { ...tx }

      if (item.side === 'BUY') {
        delete item.realizedPnl
      }

      return item
    })

    const nextCursor = cleaned.at(-1)?._id.toString() ?? null

    res.json({ items: cleaned, nextCursor })
  } catch (err) {
    console.error('Failed to load transactions:', err)
    res.status(500).json({ error: 'Failed to load transactions' })
  }
}
