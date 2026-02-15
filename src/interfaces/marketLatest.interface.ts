export type MarketSource = 'finnhub';

export interface IMarketLatest {
  symbol: string;
  price: number;
  marketTimestamp: Date;
  source: MarketSource;
  createdAt: Date;
  updatedAt: Date;
}