import { OpenAPIV3 } from 'openapi-types'

export const transactionsPaths: OpenAPIV3.PathsObject = {
  '/transactions': {
    get: {
      tags: ['Transactions'],
      summary: 'Get user transactions',
      security: [{ bearerAuth: [] }],
      responses: {
        200: {
          description: 'Transactions fetched successfully',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/TransactionsResponse' },
              examples: {
                default: {
                  summary: 'Transaction history',
                  value: [
                    {
                      _id: '69bbc9a479639a0cccfb6a11',
                      userId: '69bbb06679639a0cccfb6931',
                      symbol: 'BTCUSDT',
                      side: 'BUY',
                      qty: 0.015,
                      price: 67250.55,
                      amountUSD: 1008.75825,
                      createdAt: '2026-03-19T10:11:42.123Z',
                      updatedAt: '2026-03-19T10:11:42.123Z',
                    },
                    {
                      _id: '69bbca2079639a0cccfb6a12',
                      userId: '69bbb06679639a0cccfb6931',
                      symbol: 'ETHUSDT',
                      side: 'SELL',
                      qty: 0.25,
                      price: 3550.1,
                      amountUSD: 887.525,
                      createdAt: '2026-03-19T10:15:12.456Z',
                      updatedAt: '2026-03-19T10:15:12.456Z',
                    },
                  ],
                },
              },
            },
          },
        },
        401: {
          description: 'Unauthorized',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' },
            },
          },
        },
      },
    },
  },
}