import type {} from '../types/express'
import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserModel } from '../schemas/user.schema';
import { env } from '../config/env';

const JWT_SECRET = env.JWT_SECRET;

type JwtPayload = {
  sub: string; // user id
};

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const token = req.cookies?.token;

    if (!token) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;

    const user = await UserModel.findById(decoded.sub).select('_id username email');

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    // attach safe user to request
    req.user = {
      id: user._id.toString(),
      username: user.username,
      email: user.email
    };

    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}