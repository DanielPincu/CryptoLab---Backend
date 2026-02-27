import type { Request, Response } from 'express';
import { registerUser, loginUser } from './auth.service';
import { AccountModel } from '../../schemas/account.schema';
import { notifyUpstreamFavoritesChange } from '../../websocket/finnhub.websocket';

export async function register(req: Request, res: Response) {
  try {
    const result = await registerUser(req.body);

    // Subscribe Finnhub upstream for this user's default favorites on register
    const userId = result.user?.id;
    if (userId) {
      const account = await AccountModel.findOne({ userId }).lean();
      if (account?.favorites?.length) {
        notifyUpstreamFavoritesChange({ subscribe: account.favorites });
      }
    }

    return res.status(201).json(result);
  } catch (e: any) {
    return res.status(400).json({ error: e.message ?? 'Register failed' });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const result = await loginUser(req.body);

    // Re-subscribe Finnhub upstream for this user's favorites on login (after server restart, etc.)
    const userId = result.user?.id;
    if (userId) {
      const account = await AccountModel.findOne({ userId }).lean();
      if (account?.favorites?.length) {
        notifyUpstreamFavoritesChange({ subscribe: account.favorites });
      }
    }

    return res.json(result);
  } catch (e: any) {
    return res.status(401).json({ error: e.message ?? 'Login failed' });
  }
}
