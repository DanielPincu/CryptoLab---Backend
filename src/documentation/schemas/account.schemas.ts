import { OpenAPIV3 } from 'openapi-types'

export const accountSchemas: Record<string, OpenAPIV3.SchemaObject> = {
  AccountResponse: {
    type: 'object',
    properties: {
      _id: { type: 'string', example: '69bbb06679639a0cccfb6933' },
      userId: { type: 'string', example: '69bbb06679639a0cccfb6931' },
      cashBalance: { type: 'number', example: 10050.004121381882 },
      baseCurrency: { type: 'string', example: 'USD' },
      favorites: {
        type: 'array',
        items: { type: 'string' },
        example: [
          'BTCUSDT',
          'ETHUSDT',
          'BNBUSDT',
          'SOLUSDT',
          'ADAUSDT',
          'XRPUSDT',
        ],
      },
      createdAt: {
        type: 'string',
        format: 'date-time',
        example: '2026-03-19T08:14:30.401Z',
      },
      updatedAt: {
        type: 'string',
        format: 'date-time',
        example: '2026-03-19T09:44:12.878Z',
      },
    },
  },

  FavoritesResponse: {
    type: 'object',
    properties: {
      favorites: {
        type: 'array',
        items: { type: 'string' },
        example: ['BTCUSDT', 'ETHUSDT', 'SOLUSDT'],
      },
    },
  },

  UpdateFavoritesRequest: {
    type: 'object',
    description: 'Valid request bodies: { favorites: string[] } to replace the full favorites list, { add: string } to add one symbol, or { remove: string } to remove one symbol.',
    properties: {
      favorites: {
        type: 'array',
        items: { type: 'string' },
        example: ['BTCUSDT', 'ETHUSDT', 'SOLUSDT'],
        description: 'Replace the full favorites list or provide multiple symbols at once.',
      },
      add: {
        type: 'string',
        example: 'BTCUSDT',
        description: 'Add one symbol to favorites.',
      },
      remove: {
        type: 'string',
        example: 'BTCUSDT',
        description: 'Remove one symbol from favorites.',
      },
    },
    example: {
      favorites: ['BTCUSDT', 'ETHUSDT', 'SOLUSDT'],
    },
  },
}