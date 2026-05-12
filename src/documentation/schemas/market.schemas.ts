import { OpenAPIV3 } from 'openapi-types'

export const marketSchemas: Record<string, OpenAPIV3.SchemaObject> = {
  MarketTick: {
    type: 'object',
    properties: {
      symbol: { type: 'string', example: 'BTCUSDT' },
      price: {
        type: 'number',
        nullable: true,
        example: 67342.15,
        description: 'Latest in-memory Finnhub WebSocket price. Null when no tick has been received yet.',
      },
      ts: {
        type: 'number',
        nullable: true,
        example: 1778582400000,
        description: 'Market timestamp from the latest cached tick. Null when no tick has been received yet.',
      },
      source: {
        type: 'string',
        nullable: true,
        enum: ['finnhub', 'binance'],
        example: 'finnhub',
        description: 'Data source for the latest cached tick. Null when no tick has been received yet.',
      },
    },
  },

  MarketQuoteResponse: {
    type: 'object',
    properties: {
      symbol: { type: 'string', example: 'BINANCE:BTCUSDT' },
      price: { type: 'number', example: 67342.15 },
      ts: {
        type: 'number',
        example: 1778582400000,
        description: 'Binance ticker close time in milliseconds.',
      },
      source: { type: 'string', example: 'binance' },
    },
  },

  MarketCandle: {
    type: 'object',
    properties: {
      time: {
        type: 'number',
        example: 1778582400000,
        description: 'Candle open time in milliseconds.',
      },
      open: { type: 'number', example: 67210.25 },
      high: { type: 'number', example: 67420.12 },
      low: { type: 'number', example: 67198.5 },
      close: { type: 'number', example: 67342.15 },
      volume: { type: 'number', example: 128.4512 },
    },
  },

  MarketHistoryResponse: {
    type: 'object',
    properties: {
      symbol: { type: 'string', example: 'BINANCE:BTCUSDT' },
      interval: { type: 'string', example: '5m' },
      candles: {
        type: 'array',
        items: { $ref: '#/components/schemas/MarketCandle' },
      },
    },
  },
}
