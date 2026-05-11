import type { Request, Response } from 'express'
import { updateFavorites } from './account.services'
import { AccountModel } from '../../schemas/account.schema'
import type { UpdateFavoritesBody } from '../../interfaces/account.interface'

function errorMessage(err: unknown) {
  return err instanceof Error ? err.message : undefined
}

export async function getMyAccount(req: Request, res: Response) {
  try {
    const userId = req.user!.id

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
    const userId = req.user!.id

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

    const userId = req.user!.id

    const result = await updateFavorites(String(userId), req.body as UpdateFavoritesBody)

    res.json(result)

  } catch (err: unknown) {
    const message = errorMessage(err)

    if (message === 'Account not found') {
      return res.status(404).json({ error: message })
    }

    if (message === 'Cannot unsubscribe while position is open') {
      return res.status(400).json({ error: message })
    }

    console.error(err)
    res.status(500).json({ error: 'Failed to update favorites' })
  }
}
