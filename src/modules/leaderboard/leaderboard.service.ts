import { TransactionModel } from '../../schemas/transaction.schema'
import { PositionModel } from '../../schemas/position.schema'
import { UserModel } from '../../schemas/user.schema'
import type { LeaderboardUser } from '../../interfaces/leaderboard.interface'

export async function getTradeLeaderboard() {
  const limit = 3
  const transactionCollection = TransactionModel.collection.name
  const positionCollection = PositionModel.collection.name
  const userCollection = UserModel.collection.name

  const leaderboard = await TransactionModel.aggregate<LeaderboardUser>([
    {
      $match: {
        side: 'SELL',
        realizedPnl: { $type: 'number' }
      }
    },
    {
      $group: {
        _id: '$userId',
        totalPnl: { $sum: '$realizedPnl' },
        bestTrade: { $max: '$realizedPnl' },
        worstTrade: { $min: '$realizedPnl' }
      }
    },
    {
      $lookup: {
        from: userCollection,
        localField: '_id',
        foreignField: '_id',
        as: 'user'
      }
    },
    {
      $unwind: '$user'
    },
    {
      $lookup: {
        from: positionCollection,
        let: { userId: '$_id' },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ['$userId', '$$userId'] }
            }
          },
          {
            $project: {
              _id: 0,
              symbol: 1,
              qty: 1,
              avgEntryPrice: 1,
              createdAt: 1,
              updatedAt: 1
            }
          },
          { $sort: { symbol: 1 } }
        ],
        as: 'openPositions'
      }
    },
    {
      $lookup: {
        from: transactionCollection,
        let: { userId: '$_id' },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ['$userId', '$$userId'] },
                  { $eq: ['$side', 'SELL'] },
                  { $gt: ['$realizedPnl', 0] }
                ]
              }
            }
          },
          { $sort: { realizedPnl: -1, executedAt: -1 } },
          { $limit: 3 },
          {
            $project: {
              _id: 0,
              symbol: 1,
              side: 1,
              qty: 1,
              price: 1,
              realizedPnl: 1,
              executedAt: 1
            }
          }
        ],
        as: 'mostSuccessfulTransactions'
      }
    },
    {
      $lookup: {
        from: transactionCollection,
        let: { userId: '$_id', bestTrade: '$bestTrade' },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ['$userId', '$$userId'] },
                  { $eq: ['$side', 'SELL'] },
                  { $eq: ['$realizedPnl', '$$bestTrade'] }
                ]
              }
            }
          },
          { $sort: { executedAt: -1 } },
          { $limit: 1 },
          {
            $project: {
              _id: 0,
              symbol: 1,
              side: 1,
              qty: 1,
              price: 1,
              realizedPnl: 1,
              executedAt: 1
            }
          }
        ],
        as: 'bestTradeDetails'
      }
    },
    {
      $lookup: {
        from: transactionCollection,
        let: { userId: '$_id', worstTrade: '$worstTrade' },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ['$userId', '$$userId'] },
                  { $eq: ['$side', 'SELL'] },
                  { $eq: ['$realizedPnl', '$$worstTrade'] }
                ]
              }
            }
          },
          { $sort: { executedAt: -1 } },
          { $limit: 1 },
          {
            $project: {
              _id: 0,
              symbol: 1,
              side: 1,
              qty: 1,
              price: 1,
              realizedPnl: 1,
              executedAt: 1
            }
          }
        ],
        as: 'worstTradeDetails'
      }
    },
    {
      $project: {
        _id: 0,
        username: '$user.username',
        totalPnl: 1,
        bestTrade: 1,
        worstTrade: 1,
        bestTradeDetails: { $first: '$bestTradeDetails' },
        worstTradeDetails: { $first: '$worstTradeDetails' },
        mostSuccessfulTransactions: 1,
        openPositions: 1
      }
    }
  ])

  const hallOfFame = leaderboard
    .filter((u) => u.totalPnl > 0)
    .sort((a, b) => b.totalPnl - a.totalPnl)
    .slice(0, limit)

  const wallOfShame = leaderboard
    .filter((u) => u.totalPnl < 0)
    .sort((a, b) => a.totalPnl - b.totalPnl)
    .slice(0, limit)

  return {
    hallOfFame,
    wallOfShame
  }
}
