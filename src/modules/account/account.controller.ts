import type { Request, Response } from 'express'
import { updateFavorites } from './account.services'
import { AccountModel } from '../../schemas/account.schema'

export async function getMyAccount(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.id || (req as any).user?._id
    if (!userId) return res.status(401).json({ error: 'Unauthorized' })

    const account = await AccountModel.findOne({ userId }).lean()
    if (!account) return res.status(404).json({ error: 'Account not found' })

    res.json(account)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch account' })
  }
}

export async function getMyFavorites(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.id || (req as any).user?._id
    if (!userId) return res.status(401).json({ error: 'Unauthorized' })

    const account = await AccountModel.findOne({ userId }).lean()
    if (!account) return res.status(404).json({ error: 'Account not found' })

    res.json({ favorites: account.favorites ?? [] })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch favorites' })
  }
}

export async function updateMyFavorites(req: Request, res: Response) {
  try {

    const userId = (req as any).user?.id || (req as any).user?._id
    if (!userId) return res.status(401).json({ error: 'Unauthorized' })

    const result = await updateFavorites(String(userId), req.body as any)

    res.json(result)

  } catch (err: any) {

    if (err.message === 'Account not found') {
      return res.status(404).json({ error: err.message })
    }

    if (err.message === 'Cannot unsubscribe while position is open') {
      return res.status(400).json({ error: err.message })
    }

    console.error(err)
    res.status(500).json({ error: 'Failed to update favorites' })
  }
}