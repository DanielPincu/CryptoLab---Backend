import { OpenAPIV3 } from 'openapi-types'

export const portfolioSchemas: Record<string, OpenAPIV3.SchemaObject> = {
  LuckyStrikeSummary: {
    type: 'object',
    properties: {
      progressPercent: { type: 'number', example: 0.39 },
      remainingPercent: { type: 'number', example: 4.61 },
      targetPercent: { type: 'number', example: 5 },
      currentEquity: { type: 'number', example: 10038.96 },
      startEquity: { type: 'number', example: 10000 },
      reward: { type: 'number', example: 100 },
      achieved: { type: 'boolean', example: false },
    },
  },

  PortfolioSummaryResponse: {
    type: 'object',
    properties: {
      cashBalance: { type: 'number', example: 3032.94 },
      positionsValue: { type: 'number', example: 7006.02 },
      totalValue: { type: 'number', example: 10038.96 },
      unrealizedPnl: { type: 'number', example: -8.9 },
      realizedPnl: { type: 'number', example: 1096.72 },
      netPnl: { type: 'number', example: 1087.83 },
      totalReturnPct: { type: 'number', example: 0.020697 },
      totalInvested: { type: 'number', example: 52558.9 },
      totalSold: { type: 'number', example: 49351.47 },
      luckyStrike: { $ref: '#/components/schemas/LuckyStrikeSummary' },
      updatedAt: {
        type: 'string',
        format: 'date-time',
        example: '2026-03-19T11:38:10.155Z',
      },
    },
  },
}