export interface FinnhubTradeMsg {
  type: string;
  data?: Array<{ s: string; p: number; t: number }>;
}

export interface ClientSymbolsMsg {
  type: 'subscribe' | 'unsubscribe' | 'set';
  symbols: string[];
}
