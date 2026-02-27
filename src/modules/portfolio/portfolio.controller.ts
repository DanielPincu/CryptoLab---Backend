import type { Request, Response } from 'express'
import {
  getPortfolioSummary
} from './portfolio.service'

export async function portfolioSummary(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.id
    if (!userId) return res.status(401).json({ error: 'Unauthorized' })

    const data = await getPortfolioSummary(userId)
    res.json(data)
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to load portfolio summary' })
  }
}
