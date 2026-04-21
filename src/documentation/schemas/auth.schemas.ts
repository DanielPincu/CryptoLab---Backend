import { OpenAPIV3 } from 'openapi-types'

export const authSchemas: Record<string, OpenAPIV3.SchemaObject> = {
  User: {
    type: 'object',
    properties: {
      _id: { type: 'string', example: '69bbb06679639a0cccfb6931' },
      email: { type: 'string', example: 'daniel@example.com' },
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
  },
}