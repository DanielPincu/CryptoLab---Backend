import type { Types } from 'mongoose';

export interface IAccount {
  userId: Types.ObjectId;
  cashBalance: number;
  baseCurrency: string;
  createdAt: Date;
  updatedAt: Date;
}