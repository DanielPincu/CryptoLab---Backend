import type { Request, Response } from 'express';
import { UserModel } from '../../models/user.model';
import bcrypt from 'bcrypt';

export async function getUserInfo(req: Request, res: Response) {
  try {
    const user = (req as any).user;
    return res.json({ user });
  } catch (e: any) {
    return res.status(500).json({ error: e?.message ?? 'Failed to get user info' });
  }
}

export async function updateMe(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.id || (req as any).user?._id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { username, email } = req.body as { username?: string; email?: string };

    const updated = await UserModel.findByIdAndUpdate(
      userId,
      { ...(username ? { username } : {}), ...(email ? { email } : {}) },
      { returnDocument: 'after', runValidators: true }
    ).select('_id username email');

    if (!updated) return res.status(404).json({ error: 'User not found' });

    res.json({ user: updated });
  } catch (e: any) {
    console.error('Update user failed:', e);
    res.status(400).json({ error: e?.message ?? 'Failed to update user' });
  }
}

export async function changePassword(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.id || (req as any).user?._id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { currentPassword, newPassword } = req.body as { currentPassword?: string; newPassword?: string };

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'currentPassword and newPassword are required' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'New password must be at least 8 characters long' });
    }

    const user = await UserModel.findById(userId).select('_id passwordHash');
    if (!user) return res.status(404).json({ error: 'User not found' });

    const ok = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!ok) return res.status(400).json({ error: 'Current password is incorrect' });

    const passwordHash = await bcrypt.hash(newPassword, 10);

    await UserModel.findByIdAndUpdate(
      userId,
      { passwordHash },
      { returnDocument: 'after' }
    );

    res.json({ ok: true });
  } catch (e: any) {
    console.error('Change password failed:', e);
    res.status(400).json({ error: e?.message ?? 'Failed to change password' });
  }
}