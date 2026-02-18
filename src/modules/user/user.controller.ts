export async function getUserInfo(req: any, res: any) {
  try {
    const user = req.user;
    return res.json({ user });
  } catch (e: any) {
    return res.status(500).json({ error: e.message ?? 'Failed to get user info' });
  }
}