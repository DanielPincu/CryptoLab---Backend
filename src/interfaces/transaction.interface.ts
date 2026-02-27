import type { Types } from 'mongoose';

export type TradeSide = 'BUY' | 'SELL';

export interface ITransaction {
  userId: Types.ObjectId;
  symbol: string;
  side: TradeSide;
  qty: number;
  price: number;
  realizedPnl?: number;
  executedAt: Date;
}