import { OpenAPIV3 } from 'openapi-types'

export const tradeSchemas: Record<string, OpenAPIV3.SchemaObject> = {
  TradeRequest: {
    type: 'object',
    description: 'Execute a BUY or SELL trade using qty, amountUSD, sellAll, or useAllCash depending on the operation.',
    required: ['symbol', 'side'],
    properties: {
      symbol: {
        type: 'string',
        example: 'BTCUSDT',
        description: 'Trading symbol.',
      },
      side: {
        type: 'string',
        enum: ['BUY', 'SELL'],
        example: 'BUY',
        description: 'Trade side.',
      },
      qty: {
        type: 'number',
        example: 0.01,
        description: 'Quantity to trade.',
      },
      amountUSD: {
        type: 'number',
        example: 1000,
        description: 'USD amount to buy or sell instead of qty.',
      },
      sellAll: {
        type: 'boolean',
        example: true,
        description: 'Sell the entire open position for the symbol.',
      },
      useAllCash: {
        type: 'boolean',
        example: true,
        description: 'Use the full available cash balance for the BUY trade.',
      },
    },
    example: {
      symbol: 'BTCUSDT',
      side: 'BUY',
      amountUSD: 1000,
    },
  },

  TradeResponse: {
    type: 'object',
    required: ['symbol', 'side', 'qty', 'price'],
    properties: {
      symbol: {
        type: 'string',
        example: 'BTCUSDT',
      },
      side: {
        type: 'string',
        enum: ['BUY', 'SELL'],
        example: 'BUY',
      },
      qty: {
        type: 'number',
        example: 0.00012522,
      },
      price: {
        type: 'number',
        example: 79858,
      },
      reward: {
        type: 'number',
        example: 0,
        description: 'Reward amount returned for SELL trades.',
      },
    },
    example: {
      symbol: 'BTCUSDT',
      side: 'BUY',
      qty: 0.00012522,
      price: 79858,
    },
  },

  BuyTradeResponse: {
    type: 'object',
    required: ['symbol', 'side', 'qty', 'price'],
    properties: {
      symbol: { type: 'string', example: 'BTCUSDT' },
      side: { type: 'string', enum: ['BUY'], example: 'BUY' },
      qty: { type: 'number', example: 0.00012522 },
      price: { type: 'number', example: 79858 },
    },
    example: {
      symbol: 'BTCUSDT',
      side: 'BUY',
      qty: 0.00012522,
      price: 79858,
    },
  },

  SellTradeResponse: {
    type: 'object',
    required: ['symbol', 'side', 'qty', 'price', 'reward'],
    properties: {
      symbol: { type: 'string', example: 'BTCUSDT' },
      side: { type: 'string', enum: ['SELL'], example: 'SELL' },
      qty: { type: 'number', example: 63.89597353 },
      price: { type: 'number', example: 0.3528 },
      reward: {
        type: 'number',
        example: 0,
      },
    },
    example: {
      symbol: 'BTCUSDT',
      side: 'SELL',
      qty: 63.89597353,
      price: 0.3528,
      reward: 0,
    },
  },
}
