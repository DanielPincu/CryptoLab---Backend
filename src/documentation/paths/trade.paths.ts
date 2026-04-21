import { OpenAPIV3 } from 'openapi-types'

export const tradePaths: OpenAPIV3.PathsObject = {
  '/trade': {
    post: {
      tags: ['Trade'],
      summary: 'Execute a trade',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/TradeRequest' },
            examples: {
              buyWithAmountUSD: {
                summary: 'Buy using USD amount',
                value: {
                  symbol: 'BTCUSDT',
                  side: 'BUY',
                  amountUSD: 1000,
                },
              },
              buyWithQty: {
                summary: 'Buy using quantity',
                value: {
                  symbol: 'BTCUSDT',
                  side: 'BUY',
                  qty: 0.01,
                },
              },
              buyWithAllCash: {
                summary: 'Buy using all available cash',
                value: {
                  symbol: 'BTCUSDT',
                  side: 'BUY',
                  useAllCash: true,
                },
              },
              sellWithQty: {
                summary: 'Sell using quantity',
                value: {
                  symbol: 'BTCUSDT',
                  side: 'SELL',
                  qty: 0.005,
                },
              },
              sellAll: {
                summary: 'Sell entire position',
                value: {
                  symbol: 'BTCUSDT',
                  side: 'SELL',
                  sellAll: true,
                },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: 'Trade executed successfully',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/TradeResponse' },
            },
          },
        },
        400: {
          description: 'Invalid trade request',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' },
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