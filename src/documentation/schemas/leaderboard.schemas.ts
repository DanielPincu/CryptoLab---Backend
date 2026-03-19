import { OpenAPIV3 } from 'openapi-types'

export const leaderboardSchemas: Record<string, OpenAPIV3.SchemaObject> = {
  LeaderboardEntry: {
    type: 'object',
    properties: {
      totalPnl: { type: 'number', example: 1096.7237446699999 },
      bestTrade: { type: 'number', example: 1042.232 },
      worstTrade: { type: 'number', example: -2.16307671 },
      username: { type: 'string', example: 'UFO' },
    },
  },

  LeaderboardResponse: {
    type: 'object',
    properties: {
      hallOfFame: {
        type: 'array',
        items: { $ref: '#/components/schemas/LeaderboardEntry' },
      },
      wallOfShame: {
        type: 'array',
        items: { $ref: '#/components/schemas/LeaderboardEntry' },
      },
    },
  },
}