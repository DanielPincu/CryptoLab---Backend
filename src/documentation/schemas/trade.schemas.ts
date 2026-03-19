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
        description: 'USD amount to trade instead of qty.',
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
    properties: {
      message: {
        type: 'string',
        example: 'Trade executed successfully',
      },
      transaction: {
        $ref: '#/components/schemas/Transaction',
      },
    },
  },
}