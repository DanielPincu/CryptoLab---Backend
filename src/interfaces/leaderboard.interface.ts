import type { TradeSide } from './transaction.interface';

export interface LeaderboardTrade {
  symbol: string;
  side: TradeSide;
  qty: number;
  price: number;
  realizedPnl: number;
  executedAt: Date;
}

export interface LeaderboardPosition {
  symbol: string;
  qty: number;
  avgEntryPrice: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface LeaderboardUser {
  username: string;
  totalPnl: number;
  bestTrade: number;
  worstTrade: number;
  bestTradeDetails?: LeaderboardTrade;
  worstTradeDetails?: LeaderboardTrade;
  mostSuccessfulTransactions: LeaderboardTrade[];
  openPositions: LeaderboardPosition[];
}
