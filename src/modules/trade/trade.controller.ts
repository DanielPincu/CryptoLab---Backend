import type { Request, Response } from 'express'
import { executeTrade } from './trade.service'

function errorMessage(err: unknown, fallback: string) {
  return err instanceof Error ? err.message : fallback
}

export async function trade(req: Request, res: Response) {
  try {
    const userId = req.user?.id
    if (!userId) return res.status(401).json({ error: 'Unauthorized' })

    const { symbol, side, qty, amountUSD, useAllCash, sellAll } = req.body

    const result = await executeTrade(userId, symbol, side, {
      qty: qty != null ? Number(qty) : undefined,
      amountUSD: amountUSD != null ? Number(amountUSD) : undefined,
      useAllCash: Boolean(useAllCash),
      sellAll: Boolean(sellAll)
    })

    res.json(result)
  } catch (err: unknown) {
    res.status(400).json({ error: errorMessage(err, 'Trade failed') })
  }
}
