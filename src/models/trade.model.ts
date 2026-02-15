import { Schema, model } from 'mongoose';
import type { ITrade } from '../interfaces/trade.interface';

const TradeSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    symbol: { type: String, required: true },
    side: { type: String, required: true, enum: ['BUY', 'SELL'] },
    qty: { type: Number, required: true },
    price: { type: Number, required: true },
    executedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

export const TradeModel = model<ITrade>('Trade', TradeSchema);