import { Schema, model } from 'mongoose';
import type { ITransaction } from '../interfaces/transaction.interface';

const TransactionSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    symbol: { type: String, required: true },
    side: { type: String, required: true, enum: ['BUY', 'SELL', 'REWARD'] },
    qty: { type: Number, required: true },
    price: { type: Number, required: true },
    realizedPnl: { type: Number },
    executedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

export const TransactionModel = model<ITransaction>('Transaction', TransactionSchema);