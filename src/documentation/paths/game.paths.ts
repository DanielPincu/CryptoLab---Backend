import { OpenAPIV3 } from 'openapi-types'

export const gamePaths: OpenAPIV3.PathsObject = {
  '/game/start': {
    post: {
      tags: ['Game'],
      summary: 'Start a new game session',
      security: [{ bearerAuth: [] }],
      responses: {
        200: {
          description: 'Game session started',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/GameStartResponse'
              }
            }
          }
        }
      }
    }
  },

  '/game/answer': {
    post: {
      tags: ['Game'],
      summary: 'Submit an answer for the current question',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/GameAnswerRequest'
            }
          }
        }
      },
      responses: {
        200: {
          description: 'Answer processed',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/GameAnswerResponse'
              }
            }
          }
        }
      }
    }
  }
}