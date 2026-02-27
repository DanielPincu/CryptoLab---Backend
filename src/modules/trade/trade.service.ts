import mongoose from 'mongoose'
import { PositionModel } from '../../schemas/position.schema'
import { TransactionModel } from '../../schemas/transaction.schema'
import { AccountModel } from '../../schemas/account.schema'
import { latestPrices } from '../../websocket/finnhub.websocket'
import { MarketBackupSchema } from '../../schemas/marketBackup.schema'
import type { TradeSide } from '../../interfaces/transaction.interface'

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

  let price: number | null = null

  const tick = latestPrices.get(symbol)
  if (tick?.price) {
    price = tick.price
  } else {
    // fallback to DB backup if WS is down
    const backup = await MarketBackupSchema.findOne({ symbol }).lean()
    if (backup?.price) {
      price = backup.price
    }
  }

  if (!price) {
    throw new Error('No price available (live or backup)')
  }
  const cost = price * qty

  const session = await mongoose.startSession()
  session.startTransaction()

  try {
    const account = await AccountModel.findOne({ userId }).session(session)
    if (!account) throw new Error('Account not found')

    let position = await PositionModel.findOne({ userId, symbol }).session(session)
    let realizedPnl = 0

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

      realizedPnl = Number(((price - position.avgEntryPrice) * qty).toFixed(8))

      account.cashBalance += cost

      position.qty -= qty

      if (position.qty === 0) {
        await PositionModel.deleteOne({ _id: position._id }).session(session)
      } else {
        await position.save({ session })
      }
    }

    await account.save({ session })

    await TransactionModel.create(
      [
        {
          userId,
          symbol,
          side,
          qty,
          price,
          ...(side === 'SELL' ? { realizedPnl } : {})
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