import { OpenAPIV3 } from 'openapi-types'

export const portfolioPaths: OpenAPIV3.PathsObject = {
  '/portfolio/summary': {
    get: {
      tags: ['Portfolio'],
      summary: 'Get portfolio summary',
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
                    cashBalance: 0,
                    positionsValue: 9697.26,
                    totalValue: 9697.26,
                    unrealizedPnl: -355.1,
                    realizedPnl: 1009.92,
                    netPnl: 654.82,
                    totalReturnPct: 0.001433,
                    totalInvested: 456839.51,
                    totalSold: 445266.71,
                    updatedAt: '2026-05-14T09:30:21.427Z',
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
