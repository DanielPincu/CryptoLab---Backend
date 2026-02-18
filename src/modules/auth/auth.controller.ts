import type { Request, Response } from 'express';
import { registerUser, loginUser } from './auth.service';

export async function register(req: Request, res: Response) {
  try {
    const result = await registerUser(req.body);
    return res.status(201).json(result);
  } catch (e: any) {
    return res.status(400).json({ error: e.message ?? 'Register failed' });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const result = await loginUser(req.body);
    return res.json(result);
  } catch (e: any) {
    return res.status(401).json({ error: e.message ?? 'Login failed' });
  }
}
