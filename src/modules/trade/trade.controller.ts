import type { Request, Response } from 'express'
import { executeTrade } from './trade.service'

export async function trade(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.id
    if (!userId) return res.status(401).json({ error: 'Unauthorized' })

    const { symbol, side, qty } = req.body

    const result = await executeTrade(userId, symbol, side, Number(qty))

    res.json(result)
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Trade failed' })
  }
}