import type { Types } from 'mongoose';

export interface IPosition {
  userId: Types.ObjectId;
  symbol: string;
  qty: number;
  avgEntryPrice: number;

  currentPrice?: number | null;
  positionCost?: number;
  marketValue?: number | null;
  unrealizedPnl?: number | null;
  unrealizedPnlPercent?: number | null;

  createdAt: Date;
  updatedAt: Date;
}