import type { Request, Response } from 'express';
import { UserModel } from '../../schemas/user.schema';
import bcrypt from 'bcrypt';

function errorMessage(err: unknown, fallback: string) {
  return err instanceof Error ? err.message : fallback;
}

export async function getUserInfo(req: Request, res: Response) {
  try {
    const user = req.user;
    return res.json({ user });
  } catch (e: unknown) {
    return res.status(500).json({ error: errorMessage(e, 'Failed to get user info') });
  }
}

export async function updateMe(req: Request, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { username, email } = req.body as { username?: string; email?: string };

    const updated = await UserModel.findByIdAndUpdate(
      userId,
      { ...(username ? { username } : {}), ...(email ? { email } : {}) },
      { returnDocument: 'after', runValidators: true }
    ).select('_id username email');

    if (!updated) return res.status(404).json({ error: 'User not found' });

    res.json({ user: updated });
  } catch (e: unknown) {
    console.error('Update user failed:', e);
    res.status(400).json({ error: errorMessage(e, 'Failed to update user') });
  }
}

export async function changePassword(req: Request, res: Response) {
  try {
    const userId = req.user?.id;
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
  } catch (e: unknown) {
    console.error('Change password failed:', e);
    res.status(400).json({ error: errorMessage(e, 'Failed to change password') });
  }
}
