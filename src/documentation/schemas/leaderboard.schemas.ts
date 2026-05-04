import { OpenAPIV3 } from 'openapi-types'

export const leaderboardSchemas: Record<string, OpenAPIV3.SchemaObject> = {
  LeaderboardTrade: {
    type: 'object',
    required: ['symbol', 'side', 'qty', 'price', 'realizedPnl', 'executedAt'],
    properties: {
      symbol: {
        type: 'string',
        description: 'Trading pair that was sold.',
        example: 'BTCUSDT',
      },
      side: {
        type: 'string',
        enum: ['SELL'],
        description: 'Leaderboard trade details are based on closed sell transactions.',
        example: 'SELL',
      },
      qty: {
        type: 'number',
        description: 'Quantity sold in the transaction.',
        example: 0.25,
      },
      price: {
        type: 'number',
        description: 'Execution price for the sell transaction.',
        example: 68420.55,
      },
      realizedPnl: {
        type: 'number',
        description: 'Realized profit or loss for this transaction.',
        example: 1042.232,
      },
      executedAt: {
        type: 'string',
        format: 'date-time',
        description: 'Transaction execution timestamp.',
      },
    },
  },

  LeaderboardPosition: {
    type: 'object',
    required: ['symbol', 'qty', 'avgEntryPrice', 'createdAt', 'updatedAt'],
    properties: {
      symbol: {
        type: 'string',
        description: 'Trading pair currently held by the user.',
        example: 'ETHUSDT',
      },
      qty: {
        type: 'number',
        description: 'Open quantity for this position.',
        example: 1.5,
      },
      avgEntryPrice: {
        type: 'number',
        description: 'Average entry price for the open position.',
        example: 3412.22,
      },
      createdAt: {
        type: 'string',
        format: 'date-time',
        description: 'Position creation timestamp.',
      },
      updatedAt: {
        type: 'string',
        format: 'date-time',
        description: 'Position update timestamp.',
      },
    },
  },

  LeaderboardEntry: {
    type: 'object',
    required: [
      'username',
      'totalPnl',
      'bestTrade',
      'worstTrade',
      'bestTradeDetails',
      'worstTradeDetails',
      'mostSuccessfulTransactions',
      'openPositions',
    ],
    properties: {
      username: {
        type: 'string',
        description: 'Display name for the leaderboard user.',
        example: 'UFO',
      },
      totalPnl: {
        type: 'number',
        description: 'Sum of all realized PnL from sell transactions.',
        example: 1096.7237446699999,
      },
      bestTrade: {
        type: 'number',
        description: 'Highest realized PnL from a single sell transaction.',
        example: 1042.232,
      },
      worstTrade: {
        type: 'number',
        description: 'Lowest realized PnL from a single sell transaction.',
        example: -2.16307671,
      },
      bestTradeDetails: {
        allOf: [{ $ref: '#/components/schemas/LeaderboardTrade' }],
        description: 'Full transaction details for the best trade.',
      },
      worstTradeDetails: {
        allOf: [{ $ref: '#/components/schemas/LeaderboardTrade' }],
        description: 'Full transaction details for the worst trade.',
      },
      mostSuccessfulTransactions: {
        type: 'array',
        description: 'Up to 3 most profitable sell transactions for this user.',
        items: { $ref: '#/components/schemas/LeaderboardTrade' },
      },
      openPositions: {
        type: 'array',
        description: 'Current open positions for this user.',
        items: { $ref: '#/components/schemas/LeaderboardPosition' },
      },
    },
  },

  LeaderboardResponse: {
    type: 'object',
    required: ['hallOfFame', 'wallOfShame'],
    properties: {
      hallOfFame: {
        type: 'array',
        description: 'Top users with positive total realized PnL.',
        items: { $ref: '#/components/schemas/LeaderboardEntry' },
      },
      wallOfShame: {
        type: 'array',
        description: 'Bottom users with negative total realized PnL.',
        items: { $ref: '#/components/schemas/LeaderboardEntry' },
      },
    },
  },
}
