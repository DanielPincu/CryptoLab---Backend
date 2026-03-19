import { OpenAPIV3 } from 'openapi-types'

export const transactionsSchemas: Record<string, OpenAPIV3.SchemaObject> = {
  Transaction: {
    type: 'object',
    properties: {
      _id: { type: 'string', example: '69bbc9a479639a0cccfb6a11' },
      userId: { type: 'string', example: '69bbb06679639a0cccfb6931' },
      symbol: { type: 'string', example: 'BTCUSDT' },
      side: {
        type: 'string',
        enum: ['BUY', 'SELL'],
        example: 'BUY',
      },
      qty: { type: 'number', example: 0.015 },
      price: { type: 'number', example: 67250.55 },
      amountUSD: { type: 'number', example: 1008.75825 },
      createdAt: {
        type: 'string',
        format: 'date-time',
        example: '2026-03-19T10:11:42.123Z',
      },
      updatedAt: {
        type: 'string',
        format: 'date-time',
        example: '2026-03-19T10:11:42.123Z',
      },
    },
  },

  TransactionsResponse: {
    type: 'array',
    items: {
      $ref: '#/components/schemas/Transaction',
    },
  },
}