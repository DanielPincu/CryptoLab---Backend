import { Request, Response } from 'express'
import { startGame, answerGame } from './game.service'

export async function start(req: Request, res: Response) {
  try {
    const user = (req as any).user
    const userId = user?.userId || user?.id || user?.sub

    const data = startGame(userId)
    res.json(data)
  } catch (err: any) {
    res.status(400).json({ message: err.message })
  }
}

export async function answer(req: Request, res: Response) {
  try {
    const { sessionId, answer } = req.body

    const data = await answerGame(sessionId, answer)
    res.json(data)
  } catch (err: any) {
    res.status(400).json({ message: err.message })
  }
}