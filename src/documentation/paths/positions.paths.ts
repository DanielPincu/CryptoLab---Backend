import { OpenAPIV3 } from 'openapi-types'

export const positionsPaths: OpenAPIV3.PathsObject = {
  '/positions': {
    get: {
      tags: ['Positions'],
      summary: 'Get open positions',
      security: [{ bearerAuth: [] }],
      responses: {
        200: {
          description: 'Positions fetched successfully',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/PositionsResponse' },
              examples: {
                default: {
                  summary: 'Open positions',
                  value: [
                    {
                      _id: '69bbdb66ca378bd444f40442',
                      userId: '69bbb06679639a0cccfb6931',
                      symbol: 'BTCUSDT',
                      qty: 0.1,
                      avgEntryPrice: 70149.16,
                      createdAt: '2026-03-19T11:17:58.894Z',
                      updatedAt: '2026-03-19T11:17:58.894Z',
                      __v: 0,
                      currentPrice: 70170.94,
                      positionCost: 7014.916000000001,
                      marketValue: 7017.094000000001,
                      unrealizedPnl: 2.1779999999998836,
                      unrealizedPnlPercent: 0.031048126591963234,
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