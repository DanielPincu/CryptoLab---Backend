import type { Request, Response } from 'express'
import { getUserPositions } from './position.service'

export async function getMyPositions(req: Request, res: Response) {
  try {
    const userId = req.user?.id
    if (!userId) return res.status(401).json({ error: 'Unauthorized' })

    const positions = await getUserPositions(userId)

    res.json(positions)
  } catch {
    res.status(500).json({ error: 'Failed to load positions' })
  }
}
