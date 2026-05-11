import type { Request, Response } from 'express'
import {
  getPortfolioSummary
} from './portfolio.service'

function errorMessage(err: unknown, fallback: string) {
  return err instanceof Error ? err.message : fallback
}

export async function portfolioSummary(req: Request, res: Response) {
  try {
    const userId = req.user?.id
    if (!userId) return res.status(401).json({ error: 'Unauthorized' })

    const data = await getPortfolioSummary(userId)
    res.json(data)
  } catch (err: unknown) {
    res.status(400).json({ error: errorMessage(err, 'Failed to load portfolio summary') })
  }
}
