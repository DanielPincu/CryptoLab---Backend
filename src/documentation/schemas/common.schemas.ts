import { OpenAPIV3 } from 'openapi-types'

export const commonSchemas: Record<string, OpenAPIV3.SchemaObject> = {
  ErrorResponse: {
    type: 'object',
    properties: {
      error: { type: 'string', example: 'Something went wrong' },
    },
  },

  HealthResponse: {
    type: 'object',
    properties: {
      ok: { type: 'boolean', example: true },
    },
  },

  MessageResponse: {
    type: 'object',
    properties: {
      message: { type: 'string', example: 'Logged out' },
    },
  },
}