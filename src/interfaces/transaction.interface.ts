import type { Types } from 'mongoose';

export type TradeSide = 'BUY' | 'SELL' | 'REWARD';

export interface ITransaction {
  userId: Types.ObjectId;
  symbol: string;
  side: TradeSide;
  qty: number;
  price: number;
  realizedPnl?: number;
  executedAt: Date;
}

export type TransactionListItem = ITransaction & {
  _id: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
  realizedPnlPercent?: number;
};
