import type { Request, Response } from 'express';
import { AccountModel } from '../../models/account.model';

export async function getMyAccount(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.id || (req as any).user?._id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const account = await AccountModel.findOne({ userId }).lean();

    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }

    res.json(account);
  } catch (err) {
    console.error('Failed to load account:', err);
    res.status(500).json({ error: 'Failed to load account' });
  }
}