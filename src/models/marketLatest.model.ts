import { Schema, model } from 'mongoose';
import type { IMarketLatest } from '../interfaces/marketLatest.interface';

const MarketLatestSchema = new Schema(
  {
    symbol: { type: String, required: true, unique: true }, // business-rule uniqueness
    price: { type: Number, required: true },
    marketTimestamp: { type: Date, required: true },
    source: { type: String, required: true, enum: ['finnhub'], default: 'finnhub' }
  },
  { timestamps: true }
);

export const MarketLatestModel = model<IMarketLatest>('MarketLatest', MarketLatestSchema);