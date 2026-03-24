import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { UserModel } from '../../schemas/user.schema';
import { AccountModel } from '../../schemas/account.schema';
import { env } from '../../config/env';

export async function registerUser(input: { username: string; email: string; password: string }) {
  const existing = await UserModel.findOne({ $or: [{ email: input.email }, { username: input.username }] }).lean();
  if (existing) throw new Error('User already exists (email or username)');

  const passwordHash = await bcrypt.hash(input.password, 12);
  const user = await UserModel.create({ username: input.username, email: input.email, passwordHash });

  await AccountModel.create({
    userId: user._id,
    cashBalance: env.STARTING_CASH
  });

  const token = jwt.sign(
    { sub: String(user._id) },
    env.JWT_SECRET as jwt.Secret,
    { expiresIn: env.JWT_EXPIRES_IN } as jwt.SignOptions
  );
  return { token, user: { id: String(user._id), username: user.username, email: user.email } };
}

export async function loginUser(input: { email: string; password: string }) {
  const user = await UserModel.findOne({ email: input.email }).select('+passwordHash');
  if (!user) throw new Error('Invalid credentials');

  const ok = await bcrypt.compare(input.password, user.passwordHash);
  if (!ok) throw new Error('Invalid credentials');

  const token = jwt.sign(
    { sub: String(user._id) },
    env.JWT_SECRET as jwt.Secret,
    { expiresIn: env.JWT_EXPIRES_IN } as jwt.SignOptions
  );
  return { token, user: { id: String(user._id), username: user.username, email: user.email } };
}
