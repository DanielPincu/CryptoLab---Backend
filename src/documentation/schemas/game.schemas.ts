import { OpenAPIV3 } from 'openapi-types'

export const gameSchemas: Record<string, OpenAPIV3.SchemaObject> = {
  GameStartResponse: {
    type: 'object',
    properties: {
      sessionId: { type: 'string' },
      question: {
        type: 'object',
        properties: {
          prompt: { type: 'string' },
          options: {
            type: 'array',
            items: { type: 'number' }
          }
        },
        required: ['prompt', 'options']
      },
      score: { type: 'number', example: 0 },
      target: { type: 'number', example: 10 }
    },
    required: ['sessionId', 'question', 'score', 'target']
  },

  GameAnswerRequest: {
    type: 'object',
    properties: {
      sessionId: { type: 'string' },
      answer: { type: 'number' }
    },
    required: ['sessionId', 'answer']
  },

  GameAnswerResponse: {
    type: 'object',
    properties: {
      gameOver: { type: 'boolean' },
      score: { type: 'number', nullable: true },
      reward: { type: 'number', nullable: true },
      reason: {
        type: 'string',
        enum: ['timeout', 'wrong answer'],
        nullable: true
      },
      question: {
        type: 'object',
        nullable: true,
        properties: {
          prompt: { type: 'string' },
          options: {
            type: 'array',
            items: { type: 'number' }
          }
        }
      }
    },
    required: ['gameOver']
  }
}