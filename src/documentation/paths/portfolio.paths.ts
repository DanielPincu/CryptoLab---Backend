import { OpenAPIV3 } from 'openapi-types'

export const portfolioPaths: OpenAPIV3.PathsObject = {
  '/portfolio/summary': {
    get: {
      tags: ['Portfolio'],
      summary: 'Get portfolio summary',
      security: [{ bearerAuth: [] }],
      responses: {
        200: {
          description: 'Portfolio summary fetched successfully',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/PortfolioSummaryResponse' },
              examples: {
                default: {
                  summary: 'Portfolio summary',
                  value: {
                    cashBalance: 3032.94,
                    positionsValue: 7006.02,
                    totalValue: 10038.96,
                    unrealizedPnl: -8.9,
                    realizedPnl: 1096.72,
                    netPnl: 1087.83,
                    totalReturnPct: 0.020697,
                    totalInvested: 52558.9,
                    totalSold: 49351.47,
                    luckyStrike: {
                      progressPercent: 0.39,
                      remainingPercent: 4.61,
                      targetPercent: 5,
                      currentEquity: 10038.96,
                      startEquity: 10000,
                      reward: 100,
                      achieved: false,
                    },
                    updatedAt: '2026-03-19T11:38:10.155Z',
                  },
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