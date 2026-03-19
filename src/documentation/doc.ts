import { OpenAPIV3 } from 'openapi-types'

import { healthPaths } from './paths/health.paths'
import { authPaths } from './paths/auth.paths'
import { accountPaths } from './paths/account.paths'
import { transactionsPaths } from './paths/transactions.paths'
import { tradePaths } from './paths/trade.paths'
import { positionsPaths } from './paths/positions.paths'
import { portfolioPaths } from './paths/portfolio.paths'


import { commonSchemas } from './schemas/common.schemas'
import { authSchemas } from './schemas/auth.schemas'
import { accountSchemas } from './schemas/account.schemas'
import { transactionsSchemas } from './schemas/transactions.schemas'
import { tradeSchemas } from './schemas/trade.schemas'
import { positionsSchemas } from './schemas/positions.schemas'
import { portfolioSchemas } from './schemas/portfolio.schemas'


export const swaggerSpec: OpenAPIV3.Document = {
  openapi: '3.0.3',
  info: {
    title: 'CryptoLab API',
    description: 'API documentation for CryptoLab backend',
    version: '1.0.0',
  },

  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Local development',
    },
  ],

  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: {
      ...commonSchemas,
      ...authSchemas,
      ...accountSchemas,
      ...transactionsSchemas,
      ...tradeSchemas,
      ...positionsSchemas,
      ...portfolioSchemas,
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
  },

  tags: [
    { name: 'Health', description: 'Health endpoints' },
    { name: 'Auth', description: 'Authentication endpoints' },
    { name: 'Account', description: 'Account endpoints' },
    { name: 'Transactions', description: 'Transactions endpoints' },
    { name: 'Trade', description: 'Trade execution endpoints' },
    { name: 'Positions', description: 'Open positions endpoints' },
    { name: 'Portfolio', description: 'Portfolio summary endpoints' },
  ],
}