import mongoose from 'mongoose'
import { PositionModel } from '../../models/position.model'
import { TradeModel } from '../../models/trade.model'
import { AccountModel } from '../../models/account.model'
import { latestPrices } from '../../websocket/finnhub.websocket'
import type { TradeSide } from '../../interfaces/trade.interface'

function normalizeSymbol(s: string) {
  return String(s || '').replace(/^BINANCE:/i, '').toUpperCase().trim()
}

export async function executeTrade(
  userId: string,
  symbolRaw: string,
  side: TradeSide,
  qty: number
) {
  const symbol = normalizeSymbol(symbolRaw)

  if (qty <= 0) {
    throw new Error('Quantity must be greater than 0')
  }

  const tick = latestPrices.get(symbol)
  if (!tick) {
    throw new Error('No live price available')
  }

  const price = tick.price
  const cost = price * qty

  const session = await mongoose.startSession()
  session.startTransaction()

  try {
    const account = await AccountModel.findOne({ userId }).session(session)
    if (!account) throw new Error('Account not found')

    let position = await PositionModel.findOne({ userId, symbol }).session(session)

    if (side === 'BUY') {
      if (account.cashBalance < cost) {
        throw new Error('Insufficient balance')
      }

      account.cashBalance -= cost

      if (!position) {
        position = await PositionModel.create(
          [{ userId, symbol, qty, avgEntryPrice: price }],
          { session }
        ).then(res => res[0])
      } else {
        const newQty = position.qty + qty
        const newAvg =
          (position.qty * position.avgEntryPrice + qty * price) / newQty

        position.qty = newQty
        position.avgEntryPrice = newAvg
        await position.save({ session })
      }
    }

    if (side === 'SELL') {
      if (!position || position.qty < qty) {
        throw new Error('Not enough position to sell')
      }

      account.cashBalance += cost

      position.qty -= qty

      if (position.qty === 0) {
        await PositionModel.deleteOne({ _id: position._id }).session(session)
      } else {
        await position.save({ session })
      }
    }

    await account.save({ session })

    await TradeModel.create(
      [
        {
          userId,
          symbol,
          side,
          qty,
          price
        }
      ],
      { session }
    )

    await session.commitTransaction()
    session.endSession()

    return { symbol, side, qty, price }
  } catch (err) {
    await session.abortTransaction()
    session.endSession()
    throw err
  }
}