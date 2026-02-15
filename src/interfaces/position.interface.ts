import type { Types } from 'mongoose';

export interface IPosition {
  userId: Types.ObjectId;
  symbol: string;
  qty: number;
  avgEntryPrice: number;
  createdAt: Date;
  updatedAt: Date;
}