import { Schema, model } from 'mongoose';
import type { IAccount } from '../interfaces/account.interface';

const AccountSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    cashBalance: { type: Number, required: true },
    baseCurrency: { type: String, required: true, default: 'USD' }
  },
  { timestamps: true }
);

export const AccountModel = model<IAccount>('Account', AccountSchema);