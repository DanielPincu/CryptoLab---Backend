import { OpenAPIV3 } from 'openapi-types'

import { healthPaths } from './paths/health.paths'
import { authPaths } from './paths/auth.paths'
import { accountPaths } from './paths/account.paths'
import { transactionsPaths } from './paths/transactions.paths'
import { tradePaths } from './paths/trade.paths'
import { positionsPaths } from './paths/positions.paths'
import { portfolioPaths } from './paths/portfolio.paths'
import { leaderboardPaths } from './paths/leaderboard.paths'
import { gamePaths } from './paths/game.paths'


import { commonSchemas } from './schemas/common.schemas'
import { authSchemas } from './schemas/auth.schemas'
import { accountSchemas } from './schemas/account.schemas'
import { transactionsSchemas } from './schemas/transactions.schemas'
import { tradeSchemas } from './schemas/trade.schemas'
import { positionsSchemas } from './schemas/positions.schemas'
import { portfolioSchemas } from './schemas/portfolio.schemas'
import { leaderboardSchemas } from './schemas/leaderboard.schemas'
import { gameSchemas } from './schemas/game.schemas'


export const swaggerSpec: OpenAPIV3.Document = {
  openapi: '3.0.3',
  info: {
    title: 'CryptoLab API',
    description: 'API documentation for CryptoLab backend',
    version: '1.0.0',
  },

  servers: [
    {
      url: `http://localhost:3000`,
      description: 'Local development',
    },
    {
      url: 'https://cryptolab-backend-oyfx.onrender.com',
      description: 'Production',
    },
  ],

  components: {
    schemas: {
      ...commonSchemas,
      ...authSchemas,
      ...accountSchemas,
      ...transactionsSchemas,
      ...tradeSchemas,
      ...positionsSchemas,
      ...portfolioSchemas,
      ...leaderboardSchemas,
      ...gameSchemas,
    },
  },

  paths: {
    ...healthPaths,
    ...authPaths,
    ...accountPaths,
    ...transactionsPaths,
    ...tradePaths,
    ...positionsPaths,
    ...portfolioPaths,
    ...leaderboardPaths,
    ...gamePaths,
  },

  tags: [
    { name: 'Health', description: 'Health endpoints' },
    { name: 'Auth', description: 'Authentication endpoints' },
    { name: 'Account', description: 'Account endpoints' },
    { name: 'Transactions', description: 'Transactions endpoints' },
    { name: 'Trade', description: 'Trade execution endpoints' },
    { name: 'Positions', description: 'Open positions endpoints' },
    { name: 'Portfolio', description: 'Portfolio summary endpoints' },
    { name: 'Leaderboard', description: 'Leaderboard endpoints' },
    { name: 'Game', description: 'Game endpoints' },
  ],
}