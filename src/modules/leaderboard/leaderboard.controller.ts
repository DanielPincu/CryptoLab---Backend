import type { Request, Response } from 'express'
import { getTradeLeaderboard } from './leaderboard.service'

export async function getLeaderboard(req: Request, res: Response) {
  try {
    
    const data = await getTradeLeaderboard()

    res.json(data)
  } catch (err) {
    console.error('Leaderboard error:', err)
    res.status(500).json({ error: 'Failed to load leaderboard' })
  }
}