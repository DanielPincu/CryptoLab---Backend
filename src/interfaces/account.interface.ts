import type { Types } from 'mongoose';

export interface IAccount {
  userId: Types.ObjectId;
  cashBalance: number;
  baseCurrency: string;
  favorites: string[];
  dailyStartBalance: number;
  luckyStrikeClaimedToday: boolean;
  lastLuckyStrikeReset: Date;
  createdAt: Date;
  updatedAt: Date;
}