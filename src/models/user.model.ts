import { Schema, model} from 'mongoose';
import type { IUser } from '../interfaces/user.interface';

const DEFAULT_FAVORITES = [
  'BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT', 'ADAUSDT', 'XRPUSDT', 'DOGEUSDT',
  'AVAXUSDT','DOTUSDT', 'LINKUSDT','TRXUSDT','ATOMUSDT','LTCUSDT','ETCUSDT'
];

const UserSchema = new Schema({
  username: { type: String, required: true, unique: true, index: true },
  email: { type: String, required: true, unique: true, index: true },
  passwordHash: { type: String, required: true },
  favorites: { type: [String], default: () => DEFAULT_FAVORITES },
  createdAt: { type: Date, default: Date.now }
});

export const UserModel = model<IUser>('User', UserSchema);