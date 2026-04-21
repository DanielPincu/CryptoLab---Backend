import { OpenAPIV3 } from 'openapi-types'

export const accountPaths: OpenAPIV3.PathsObject = {
  '/account/me': {
    get: {
      tags: ['Account'],
      summary: 'Get current user account',
      responses: {
        200: {
          description: 'Account fetched successfully',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/AccountResponse' },
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

  '/account/favorites': {
    get: {
      tags: ['Account'],
      summary: 'Get favorite symbols',
      responses: {
        200: {
          description: 'Favorites fetched successfully',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/FavoritesResponse' },
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
    patch: {
      tags: ['Account'],
      summary: 'Update favorite symbols',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/UpdateFavoritesRequest' },
            examples: {
              replaceAll: {
                summary: 'Replace full favorites list',
                value: {
                  favorites: ['BTCUSDT', 'ETHUSDT', 'SOLUSDT'],
                },
              },
              addSingle: {
                summary: 'Add one symbol',
                value: {
                  add: 'BTCUSDT',
                },
              },
              removeSingle: {
                summary: 'Remove one symbol',
                value: {
                  remove: 'BTCUSDT',
                },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: 'Favorites updated successfully',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/FavoritesResponse' },
            },
          },
        },
        400: {
          description: 'Invalid request',
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