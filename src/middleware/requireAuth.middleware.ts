import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserModel } from '../models/user.model';
import { env } from '../config/env';

const JWT_SECRET = env.JWT_SECRET;

type JwtPayload = {
  sub: string; // user id
};

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const header = req.headers.authorization;

    if (!header || !header.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid Authorization header' });
    }

    const token = header.replace('Bearer ', '').trim();

    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;

    const user = await UserModel.findById(decoded.sub).select('_id username email favorites');

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    // attach safe user to request
    (req as any).user = {
      id: user._id.toString(),
      username: user.username,
      email: user.email,
      favorites: user.favorites
    };

    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}