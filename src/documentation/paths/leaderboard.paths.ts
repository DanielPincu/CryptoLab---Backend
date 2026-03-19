import { OpenAPIV3 } from 'openapi-types'

export const leaderboardPaths: OpenAPIV3.PathsObject = {
  '/leaderboard': {
    get: {
      tags: ['Leaderboard'],
      summary: 'Get leaderboard standings',
      security: [],
      responses: {
        200: {
          description: 'Leaderboard fetched successfully',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/LeaderboardResponse' },
              examples: {
                default: {
                  summary: 'Leaderboard response',
                  value: {
                    hallOfFame: [
                      {
                        totalPnl: 1096.7237446699999,
                        bestTrade: 1042.232,
                        worstTrade: -2.16307671,
                        username: 'UFO',
                      },
                    ],
                    wallOfShame: [
                        {
                        totalPnl: -3000.7237446699999,
                        bestTrade: 500.232,
                        worstTrade: -2000.16307671,
                        username: 'Daniel',
                      },
                    ],
                  },
                },
              },
            },
          },
        },
      },
    },
  },
}