import { OpenAPIV3 } from 'openapi-types'

export const authPaths: OpenAPIV3.PathsObject = {
  '/user/register': {
    post: {
      tags: ['Auth'],
      summary: 'Register a new user',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/RegisterRequest' },
            examples: {
              default: {
                summary: 'Register payload',
                value: {
                  username: 'UFO',
                  email: 'yo8ufo@gmail.com',
                  password: 'RunTimeError',
                },
              },
            },
          },
        },
      },
      responses: {
        201: {
          description: 'User created successfully',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/AuthResponse' },
              examples: {
                default: {
                  summary: 'Register response',
                  value: {
                    user: {
                      id: '69c28e794897f1f06595701a',
                      username: 'UFO',
                      email: 'yo8ufo@gmail.com',
                    },
                  },
                },
              },
            },
          },
        },
        400: {
          description: 'Validation error',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' },
            },
          },
        },
      },
    },
  },

  '/user/login': {
    post: {
      tags: ['Auth'],
      summary: 'Login user',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/LoginRequest' },
            examples: {
              default: {
                summary: 'Login payload',
                value: {
                  email: 'yo8ufo@gmail.com',
                  password: 'RunTimeError',
                },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: 'Login successful',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/AuthResponse' },
              examples: {
                default: {
                  summary: 'Login response',
                  value: {
                    user: {
                      id: '69c28e794897f1f06595701a',
                      username: 'UFO',
                      email: 'yo8ufo@gmail.com',
                    },
                  },
                },
              },
            },
          },
        },
        401: {
          description: 'Invalid credentials',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' },
            },
          },
        },
      },
    },
  },

  '/user/logout': {
    post: {
      tags: ['Auth'],
      summary: 'Logout user',
      responses: {
        200: {
          description: 'Logout successful',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/MessageResponse' },
            },
          },
        },
      },
    },
  },
}
