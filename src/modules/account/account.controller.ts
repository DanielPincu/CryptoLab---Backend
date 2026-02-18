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

export async function getMyFavorites(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.id || (req as any).user?._id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const account = await AccountModel.findOne({ userId }).lean();

    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }

    res.json({ favorites: account.favorites ?? [] });
  } catch (err) {
    console.error('Failed to load favorites:', err);
    res.status(500).json({ error: 'Failed to load favorites' });
  }
}

export async function updateMyFavorites(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.id || (req as any).user?._id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    // Supports three modes:
    // 1) Full replace: { favorites: string[] }
    // 2) Add one:      { add: string }
    // 3) Remove one:   { remove: string }
    const { favorites, add, remove } = req.body as {
      favorites?: string[];
      add?: string;
      remove?: string;
    };

    const account = await AccountModel.findOne({ userId });
    if (!account) return res.status(404).json({ error: 'Account not found' });

    const normalize = (s: string) => {
      let v = String(s || '').toUpperCase().trim();
      if (!v) return '';
      // Auto-append USDT if missing
      if (!v.endsWith('USDT')) v = `${v}USDT`;
      return v;
    };

    if (Array.isArray(favorites)) {
      // Full replace
      const normalized = Array.from(
        new Set(
          favorites
            .map((s) => normalize(s))
            .filter((s) => s.length > 0)
        )
      );
      account.favorites = normalized;
    } else if (typeof add === 'string') {
      // Add single symbol
      const sym = normalize(add);
      if (!sym) return res.status(400).json({ error: 'add must be a non-empty symbol' });
      if (!account.favorites.includes(sym)) {
        account.favorites.push(sym);
      }
    } else if (typeof remove === 'string') {
      // Remove single symbol
      const sym = normalize(remove);
      if (!sym) return res.status(400).json({ error: 'remove must be a non-empty symbol' });
      account.favorites = account.favorites.filter((s) => s !== sym);
    } else {
      return res.status(400).json({
        error: 'Provide one of: { favorites: string[] } | { add: string } | { remove: string }'
      });
    }

    await account.save();
    res.json({ favorites: account.favorites });
  } catch (err) {
    console.error('Failed to update favorites:', err);
    res.status(500).json({ error: 'Failed to update favorites' });
  }
}