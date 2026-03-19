import { OpenAPIV3 } from 'openapi-types'

export const positionsSchemas: Record<string, OpenAPIV3.SchemaObject> = {
  Position: {
    type: 'object',
    properties: {
      _id: { type: 'string', example: '69bbdb66ca378bd444f40442' },
      userId: { type: 'string', example: '69bbb06679639a0cccfb6931' },
      symbol: { type: 'string', example: 'BTCUSDT' },
      qty: { type: 'number', example: 0.1 },
      avgEntryPrice: { type: 'number', example: 70149.16 },
      createdAt: {
        type: 'string',
        format: 'date-time',
        example: '2026-03-19T11:17:58.894Z',
      },
      updatedAt: {
        type: 'string',
        format: 'date-time',
        example: '2026-03-19T11:17:58.894Z',
      },
      __v: { type: 'number', example: 0 },
      currentPrice: { type: 'number', example: 70170.94 },
      positionCost: { type: 'number', example: 7014.916000000001 },
      marketValue: { type: 'number', example: 7017.094000000001 },
      unrealizedPnl: { type: 'number', example: 2.1779999999998836 },
      unrealizedPnlPercent: { type: 'number', example: 0.031048126591963234 },
    },
  },

  PositionsResponse: {
    type: 'array',
    items: {
      $ref: '#/components/schemas/Position',
    },
  },
}