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
                        bestTradeDetails: {
                          symbol: 'BTCUSDT',
                          side: 'SELL',
                          qty: 0.25,
                          price: 68420.55,
                          realizedPnl: 1042.232,
                          executedAt: '2026-05-04T10:30:00.000Z',
                        },
                        worstTradeDetails: {
                          symbol: 'ETHUSDT',
                          side: 'SELL',
                          qty: 1.2,
                          price: 3370.15,
                          realizedPnl: -2.16307671,
                          executedAt: '2026-05-04T11:45:00.000Z',
                        },
                        mostSuccessfulTransactions: [
                          {
                            symbol: 'BTCUSDT',
                            side: 'SELL',
                            qty: 0.25,
                            price: 68420.55,
                            realizedPnl: 1042.232,
                            executedAt: '2026-05-04T10:30:00.000Z',
                          },
                        ],
                        openPositions: [
                          {
                            symbol: 'SOLUSDT',
                            qty: 4.5,
                            avgEntryPrice: 145.34,
                            createdAt: '2026-05-04T09:15:00.000Z',
                            updatedAt: '2026-05-04T09:15:00.000Z',
                          },
                        ],
                        username: 'UFO',
                      },
                    ],
                    wallOfShame: [
                        {
                        totalPnl: -3000.7237446699999,
                        bestTrade: 500.232,
                        worstTrade: -2000.16307671,
                        bestTradeDetails: {
                          symbol: 'BNBUSDT',
                          side: 'SELL',
                          qty: 2,
                          price: 601.3,
                          realizedPnl: 500.232,
                          executedAt: '2026-05-04T12:10:00.000Z',
                        },
                        worstTradeDetails: {
                          symbol: 'BTCUSDT',
                          side: 'SELL',
                          qty: 0.5,
                          price: 64200.9,
                          realizedPnl: -2000.16307671,
                          executedAt: '2026-05-04T13:20:00.000Z',
                        },
                        mostSuccessfulTransactions: [
                          {
                            symbol: 'BNBUSDT',
                            side: 'SELL',
                            qty: 2,
                            price: 601.3,
                            realizedPnl: 500.232,
                            executedAt: '2026-05-04T12:10:00.000Z',
                          },
                        ],
                        openPositions: [],
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
