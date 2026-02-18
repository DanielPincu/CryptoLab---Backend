import { Schema, model } from 'mongoose';
import type { IUser } from '../interfaces/user.interface';

const DEFAULT_FAVORITES = [
  'BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT', 'ADAUSDT', 'XRPUSDT', 'DOGEUSDT',
  'AVAXUSDT','DOTUSDT', 'LINKUSDT','TRXUSDT','ATOMUSDT','LTCUSDT','ETCUSDT'
];

const UserSchema = new Schema(
  {
    username: { type: String, required: true, unique: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true, select: false },
    favorites: { type: [String], default: () => DEFAULT_FAVORITES }
  },
  { timestamps: true }
);

export const UserModel = model<IUser>('User', UserSchema);