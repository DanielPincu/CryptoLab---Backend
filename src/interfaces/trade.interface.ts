import type { Types } from 'mongoose';

export type TradeSide = 'BUY' | 'SELL';

export interface ITrade {
  userId: Types.ObjectId;
  symbol: string;
  side: TradeSide;
  qty: number;
  price: number;
  executedAt: Date;
}