import { OpenAPIV3 } from 'openapi-types'

export const marketPaths: OpenAPIV3.PathsObject = {
  '/market/latest': {
    get: {
      tags: ['Market'],
      summary: 'Get latest prices for favorite symbols',
      description: 'Returns the latest in-memory prices received from the Finnhub WebSocket for the authenticated user favorite symbols.',
      responses: {
        200: {
          description: 'Latest prices fetched successfully',
          content: {
            'application/json': {
              schema: {
                type: 'array',
                items: { $ref: '#/components/schemas/MarketTick' },
              },
              examples: {
                default: {
                  summary: 'Favorite latest prices',
                  value: [
                    { symbol: 'BTCUSDT', price: 67342.15, ts: 1778582400000, source: 'finnhub' },
                    { symbol: 'ETHUSDT', price: null, ts: null, source: null },
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
        404: {
          description: 'Account not found',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' },
            },
          },
        },
      },
    },
  },

  '/market/latest/{symbol}': {
    get: {
      tags: ['Market'],
      summary: 'Get latest price for one favorite symbol',
      description: 'Returns the latest in-memory price received from the Finnhub WebSocket for one authenticated user favorite symbol.',
      parameters: [
        {
          name: 'symbol',
          in: 'path',
          required: true,
          description: 'Crypto symbol. USDT is appended automatically when omitted.',
          schema: { type: 'string', example: 'BTC' },
        },
      ],
      responses: {
        200: {
          description: 'Latest price fetched successfully',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/MarketTick' },
              examples: {
                default: {
                  summary: 'Single latest price',
                  value: {
                    symbol: 'BTCUSDT',
                    price: 67342.15,
                    ts: 1778582400000,
                    source: 'finnhub',
                  },
                },
              },
            },
          },
        },
        400: {
          description: 'Symbol is required',
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
        403: {
          description: 'Symbol is not in favorites',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' },
            },
          },
        },
        404: {
          description: 'Account not found or symbol not streamed yet',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' },
            },
          },
        },
      },
    },
  },

  '/market/quote': {
    get: {
      tags: ['Market'],
      summary: 'Get live quote for a symbol',
      description: 'Returns a live quote from the Binance REST API with source set to binance.',
      parameters: [
        {
          name: 'symbol',
          in: 'query',
          required: true,
          description: 'Crypto symbol. BINANCE: prefix is accepted and USDT is appended automatically when omitted.',
          schema: { type: 'string', example: 'BTC' },
        },
      ],
      responses: {
        200: {
          description: 'Quote fetched successfully',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/MarketQuoteResponse' },
              examples: {
                default: {
                  summary: 'Live quote',
                  value: {
                    symbol: 'BINANCE:BTCUSDT',
                    price: 67342.15,
                    ts: 1778582400000,
                    source: 'binance',
                  },
                },
              },
            },
          },
        },
        400: {
          description: 'Symbol is required',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' },
            },
          },
        },
        404: {
          description: 'No live price available for symbol',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' },
            },
          },
        },
      },
    },
  },

  '/market/history': {
    get: {
      tags: ['Market'],
      summary: 'Get historical candles for a symbol',
      description: 'Returns historical candle data from the Binance REST API.',
      parameters: [
        {
          name: 'symbol',
          in: 'query',
          required: true,
          description: 'Crypto symbol. BINANCE: prefix is accepted and USDT is appended automatically when omitted.',
          schema: { type: 'string', example: 'BTC' },
        },
        {
          name: 'interval',
          in: 'query',
          required: false,
          description: 'Binance kline interval.',
          schema: { type: 'string', default: '5m', example: '5m' },
        },
        {
          name: 'limit',
          in: 'query',
          required: false,
          description: 'Maximum number of candles to return.',
          schema: { type: 'string', default: '120', example: '120' },
        },
      ],
      responses: {
        200: {
          description: 'History fetched successfully',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/MarketHistoryResponse' },
            },
          },
        },
        400: {
          description: 'Symbol is required',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' },
            },
          },
        },
        502: {
          description: 'Failed to fetch history from Binance',
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
