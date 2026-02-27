import type { Request, Response } from 'express'
import { getUserTransactions } from './transaction.service'

export async function getMyTransactions(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.id || (req as any).user?._id
    if (!userId) return res.status(401).json({ error: 'Unauthorized' })

    const symbol = req.query.symbol ? String(req.query.symbol) : undefined
    const limit = req.query.limit ? Number(req.query.limit) : undefined

    const txs = await getUserTransactions({
      userId: String(userId),
      symbol,
      limit
    })

    const cleaned = txs.map((t: any) => {
      const obj = t.toObject ? t.toObject() : { ...t }

      if (obj.side === 'BUY') {
        delete obj.realizedPnl
      }

      return obj
    })

    res.json(cleaned)
  } catch (err) {
    console.error('Failed to load transactions:', err)
    res.status(500).json({ error: 'Failed to load transactions' })
  }
}