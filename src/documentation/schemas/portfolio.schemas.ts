import { OpenAPIV3 } from 'openapi-types'

export const portfolioSchemas: Record<string, OpenAPIV3.SchemaObject> = {
  PortfolioSummaryResponse: {
    type: 'object',
    required: [
      'cashBalance',
      'positionsValue',
      'totalValue',
      'unrealizedPnl',
      'realizedPnl',
      'netPnl',
      'totalReturnPct',
      'totalInvested',
      'totalSold',
      'updatedAt',
    ],
    properties: {
      cashBalance: { type: 'number', example: 0 },
      positionsValue: { type: 'number', example: 9697.26 },
      totalValue: { type: 'number', example: 9697.26 },
      unrealizedPnl: { type: 'number', example: -355.1 },
      realizedPnl: { type: 'number', example: 1009.92 },
      netPnl: { type: 'number', example: 654.82 },
      totalReturnPct: { type: 'number', example: 0.001433 },
      totalInvested: { type: 'number', example: 456839.51 },
      totalSold: { type: 'number', example: 445266.71 },
      updatedAt: {
        type: 'string',
        format: 'date-time',
        example: '2026-05-14T09:30:21.427Z',
      },
    },
    example: {
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
}
