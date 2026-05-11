import { Request, Response } from 'express'
import { startGame, answerGame } from './game.service'

function errorMessage(err: unknown, fallback: string) {
  return err instanceof Error ? err.message : fallback
}

export async function start(req: Request, res: Response) {
  try {
    const userId = req.user?.id
    if (!userId) return res.status(401).json({ error: 'Unauthorized' })

    const data = startGame(userId)
    res.json(data)
  } catch (err: unknown) {
    res.status(400).json({ message: errorMessage(err, 'Failed to start game') })
  }
}

export async function answer(req: Request, res: Response) {
  try {
    const { sessionId, answer } = req.body

    const data = await answerGame(sessionId, answer)
    res.json(data)
  } catch (err: unknown) {
    res.status(400).json({ message: errorMessage(err, 'Failed to answer game') })
  }
}
