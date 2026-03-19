import { OpenAPIV3 } from 'openapi-types'

export const healthPaths: OpenAPIV3.PathsObject = {
  '/ok': {
    get: {
      tags: ['Health'],
      summary: 'Health check',
      security: [],
      responses: {
        200: {
          description: 'API is healthy',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/HealthResponse' },
            },
          },
        },
      },
    },
  },
}