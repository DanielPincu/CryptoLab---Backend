import { TransactionModel } from '../../schemas/transaction.schema'

export async function getTradeLeaderboard() {
  const limit = 3
  const leaderboard = await TransactionModel.aggregate([
    {
      $match: {
        side: 'SELL',
        realizedPnl: { $exists: true }
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
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'user'
      }
    },
    {
      $unwind: '$user'
    },
    {
      $project: {
        _id: 0,
        username: '$user.username',
        totalPnl: 1,
        bestTrade: 1,
        worstTrade: 1
      }
    }
  ])

  const hallOfFame = leaderboard
    .filter((u: any) => u.totalPnl > 0)
    .sort((a: any, b: any) => b.totalPnl - a.totalPnl)
    .slice(0, limit)

  const wallOfShame = leaderboard
    .filter((u: any) => u.totalPnl < 0)
    .sort((a: any, b: any) => a.totalPnl - b.totalPnl)
    .slice(0, limit)

  return {
    hallOfFame,
    wallOfShame
  }
}