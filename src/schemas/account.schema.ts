import { Schema, model } from 'mongoose';
import type { IAccount } from '../interfaces/account.interface';

const DEFAULT_FAVORITES = [
  'BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT', 'ADAUSDT', 'XRPUSDT', 'DOGEUSDT',
  'AVAXUSDT','DOTUSDT', 'LINKUSDT','TRXUSDT','ATOMUSDT','LTCUSDT'
];

const AccountSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    cashBalance: { type: Number, required: true },
    baseCurrency: { type: String, required: true, default: 'USD' },
    favorites: { type: [String], default: () => DEFAULT_FAVORITES }
  },
  { timestamps: true }
);

export const AccountModel = model<IAccount>('Account', AccountSchema);