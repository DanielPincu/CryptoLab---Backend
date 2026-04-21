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

    // set JWT cookie
    res.cookie('token', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60 * 24
    })

    return res.status(201).json({ user: result.user });
  } catch (e: unknown) {
    return res.status(400).json({ error: e instanceof Error ? e.message : 'Register failed' });
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

    // set JWT cookie
    res.cookie('token', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60 * 24
    })

    return res.json({ user: result.user });
  } catch (e: unknown) {
    return res.status(401).json({ error: e instanceof Error ? e.message : 'Login failed' });
  }
}

export async function logout(req: Request, res: Response) {
  try {
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    })

    return res.json({ message: 'Logged out' })
  } catch (e: unknown) {
    return res.status(500).json({ error: 'Logout failed' })
  }
}
