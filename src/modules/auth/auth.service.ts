import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenvFlow from 'dotenv-flow';
dotenvFlow.config();

function required(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required env var: ${name}`);
  return v;
}

const JWT_SECRET = required('JWT_SECRET');
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '365d';
const STARTING_CASH = Number(process.env.STARTING_CASH || 10_000);

import { UserModel } from '../../models/user.model';
import { AccountModel } from '../../models/account.model';

export async function registerUser(input: { username: string; email: string; password: string }) {
  const existing = await UserModel.findOne({ $or: [{ email: input.email }, { username: input.username }] }).lean();
  if (existing) throw new Error('User already exists (email or username)');

  const passwordHash = await bcrypt.hash(input.password, 12);
  const user = await UserModel.create({ username: input.username, email: input.email, passwordHash });

  await AccountModel.create({ userId: user._id, cashBalance: STARTING_CASH, baseCurrency: 'USD' });

  const token = jwt.sign(
    { sub: String(user._id) },
    JWT_SECRET as jwt.Secret,
    { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions
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
    JWT_SECRET as jwt.Secret,
    { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions
  );
  return { token, user: { id: String(user._id), username: user.username, email: user.email } };
}
