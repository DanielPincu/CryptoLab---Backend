import { randomUUID } from 'crypto'
import { AccountModel } from '../../schemas/account.schema'
import { TransactionModel } from '../../schemas/transaction.schema'
import type { GameSession } from '../../interfaces/game.interface'

const sessions = new Map<string, GameSession>()

function rand(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function shuffle<T>(arr: T[]) {
  return arr.sort(() => Math.random() - 0.5)
}

function generateQuestion(round: number) {
  const a = rand(5, 50)
  const b = rand(5, 50)
  const correct = a + b

  const options = shuffle([
    correct,
    correct + rand(1, 10),
    correct - rand(1, 10),
    correct + rand(2, 15)
  ])

  return {
    prompt: `${a} + ${b} = ?`,
    correct,
    options
  }
}

export function startGame(userId: string) {
  const sessionId = randomUUID()

  const q = generateQuestion(1)

  const timeLimit = 7000 

  sessions.set(sessionId, {
    userId,
    score: 0,
    round: 1,
    correctAnswer: q.correct,
    expiresAt: Date.now() + timeLimit
  })

  return {
    sessionId,
    question: {
      prompt: q.prompt,
      options: q.options
    },
    score: 0,
    target: 10
  }
}

export async function answerGame(
  sessionId: string,
  answer: number
) {
  const session = sessions.get(sessionId)
  if (!session) throw new Error('Session not found')

  if (Date.now() > session.expiresAt) {
    sessions.delete(sessionId)
    return {
      gameOver: true,
      reason: 'timeout'
    }
  }

  // picked wrong → game over
  if (answer !== session.correctAnswer) {
    sessions.delete(sessionId)
    return {
      gameOver: true,
      reason: 'wrong answer'
    }
  }

  // correct answer 
  session.score++
  session.round++

  // win condition (temporary for testing)
  if (session.score >= 10) {
    await rewardUser(session.userId, 50)
    sessions.delete(sessionId)

    return {
      gameOver: true,
      reward: 50
    }
  }

  // next question
  const q = generateQuestion(session.round)
  session.correctAnswer = q.correct

  const timeLimit = 7000
  session.expiresAt = Date.now() + timeLimit

  return {
    gameOver: false,
    score: session.score,
    question: {
      prompt: q.prompt,
      options: q.options
    }
  }
}

async function rewardUser(userId: string, amount: number) {
  const account = await AccountModel.findOne({ userId })
  if (!account) return

  account.cashBalance += amount
  await account.save()

  await TransactionModel.create({
    userId,
    symbol: 'GAME_REWARD',
    side: 'REWARD',
    qty: 1,
    price: amount
  })
}
