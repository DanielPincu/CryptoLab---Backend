import { OpenAPIV3 } from 'openapi-types'

export const authSchemas: Record<string, OpenAPIV3.SchemaObject> = {
  User: {
    type: 'object',
    required: ['id', 'username', 'email'],
    properties: {
      id: { type: 'string', example: '69c28e794897f1f06595701a' },
      username: { type: 'string', example: 'UFO' },
      email: { type: 'string', example: 'yo8ufo@gmail.com' },
    },
  },

  RegisterRequest: {
    type: 'object',
    required: ['username', 'email', 'password'],
    properties: {
      username: { type: 'string', example: 'UFO' },
      email: { type: 'string', example: 'yo8ufo@gmail.com' },
      password: { type: 'string', example: 'RunTimeError' },
    },
  },

  LoginRequest: {
    type: 'object',
    required: ['email', 'password'],
    properties: {
      email: { type: 'string', example: 'daniel@example.com' },
      password: { type: 'string', example: 'RunTimeError123' },
    },
  },

  AuthResponse: {
    type: 'object',
    properties: {
      user: { $ref: '#/components/schemas/User' },
    },
    example: {
      user: {
        id: '69c28e794897f1f06595701a',
        username: 'UFO',
        email: 'yo8ufo@gmail.com',
      },
    },
  },
}
