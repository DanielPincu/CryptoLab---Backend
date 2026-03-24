import mongoose from 'mongoose'
import { PositionModel } from '../../schemas/position.schema'
import { TransactionModel } from '../../schemas/transaction.schema'
import { AccountModel } from '../../schemas/account.schema'
import { latestPrices } from '../../websocket/finnhub.websocket'
import type { TradeSide } from '../../interfaces/transaction.interface'

function normalizeSymbol(s: string) {
  return String(s || '').replace(/^BINANCE:/i, '').toUpperCase().trim()
}

type TradeParams = {
  qty?: number
  amountUSD?: number
  useAllCash?: boolean
  sellAll?: boolean
}

function toNumOrUndef(v: any): number | undefined {
  if (v == null) return undefined
  const n = Number(v)
  return Number.isFinite(n) ? n : undefined
}


function roundQty(q: number) {
  // crypto precision
  return Number(q.toFixed(8))
}


export async function executeTrade(
  userId: string,
  symbolRaw: string,
  side: TradeSide,
  qtyOrParams: number | TradeParams
) {
  const symbol = normalizeSymbol(symbolRaw)

  // Backwards compatible input:
  // - executeTrade(..., qtyNumber)
  // - executeTrade(..., { qty })
  // - executeTrade(..., { amountUSD })
  // - executeTrade(..., { useAllCash: true })
  // - executeTrade(..., { sellAll: true })
  const params: TradeParams =
    typeof qtyOrParams === 'number' ? { qty: qtyOrParams } : (qtyOrParams || {})

  let price: number | null = null

  // Try websocket cache first
  const tick = latestPrices.get(symbol)
  if (typeof tick?.price === 'number') {
    price = tick.price
  }

  // If websocket cache missed it (possible on restart / reconnect),
  // fallback to Binance REST ticker
  if (price == null) {
    try {
      const res = await fetch(
        `https://api.binance.com/api/v3/ticker/price?symbol=${encodeURIComponent(symbol)}`
      )
      const json: any = await res.json()
      const restPrice = Number(json?.price)

      if (Number.isFinite(restPrice)) {
        price = restPrice
      }
    } catch {
      // ignore REST failure
    }
  }

  if (price == null) {
    throw new Error('No live price available')
  }

  const session = await mongoose.startSession()
  session.startTransaction()

  try {
    const account = await AccountModel.findOne({ userId }).session(session)
    if (!account) throw new Error('Account not found')

    let position = await PositionModel.findOne({ userId, symbol }).session(session)

    const useAllCash = Boolean(params.useAllCash)
    const sellAll = Boolean(params.sellAll)

    // Normalize numeric inputs
    const qtyInput = toNumOrUndef(params.qty)
    const amountUSDInput = toNumOrUndef(params.amountUSD)

    // Validate mutually exclusive intent
    const buyModeCount =
      (qtyInput != null ? 1 : 0) + (amountUSDInput != null ? 1 : 0) + (useAllCash ? 1 : 0)
    const sellModeCount =
      (qtyInput != null ? 1 : 0) + (amountUSDInput != null ? 1 : 0) + (sellAll ? 1 : 0)

    if (side === 'BUY') {
      if (buyModeCount !== 1) {
        throw new Error('Provide exactly one of qty, amountUSD, or useAllCash')
      }
    }

    if (side === 'SELL') {
      if (sellModeCount !== 1) {
        throw new Error('Provide exactly one of qty, amountUSD, or sellAll')
      }
    }

    // Resolve qty and cost inside the transaction
    let qty: number
    let cost: number

    if (side === 'BUY') {
      let targetUSD: number | undefined

      if (useAllCash) {
        targetUSD = account.cashBalance
      } else if (amountUSDInput != null) {
        targetUSD = amountUSDInput
      }

      if (targetUSD != null) {
        if (targetUSD <= 0) throw new Error('AmountUSD must be greater than 0')
        qty = roundQty(targetUSD / price)
      } else {
        qty = qtyInput as number
      }

      if (!Number.isFinite(qty) || qty <= 0) {
        throw new Error('Quantity must be greater than 0')
      }

      cost = price * qty

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

      if (!Array.isArray(account.favorites)) {
        account.favorites = []
      }
      if (!account.favorites.includes(symbol)) {
        account.favorites.push(symbol)
      }
    } else {
      // SELL
      if (!position || position.qty <= 0) {
        throw new Error('Not enough position to sell')
      }

      if (sellAll) {
        qty = position.qty
      } else if (amountUSDInput != null) {
        if (amountUSDInput <= 0) throw new Error('AmountUSD must be greater than 0')
        qty = roundQty(amountUSDInput / price)
      } else {
        qty = qtyInput as number
      }

      if (!Number.isFinite(qty) || qty <= 0) {
        throw new Error('Quantity must be greater than 0')
      }

      if (position.qty < qty) {
        throw new Error('Not enough position to sell')
      }

      cost = price * qty

      const realizedPnl = Number(((price - position.avgEntryPrice) * qty).toFixed(8))

      let reward = 0
      if (realizedPnl > 0) {
        reward = Math.min(realizedPnl * 0.1, 100)
        reward = Number(reward.toFixed(2))
      }

      account.cashBalance += cost + reward

      position.qty -= qty


      if (position.qty === 0) {
        await PositionModel.deleteOne({ _id: position._id }).session(session)
      } else {
        await position.save({ session })
      }

      await TransactionModel.create(
        [
          {
            userId,
            symbol,
            side,
            qty,
            price,
            realizedPnl
          }
        ],
        { session }
      )

      if (reward > 0) {
        await TransactionModel.create(
          [
            {
              userId,
              symbol: 'TRANSACTION_REWARD',
              side: 'REWARD',
              qty: 1,
              price: reward
            }
          ],
          { session }
        )
      }

      await account.save({ session })
      await session.commitTransaction()
      session.endSession()

      return { symbol, side, qty, price, reward }
    }

    // BUY transaction record
    await TransactionModel.create(
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

    await account.save({ session })
    await session.commitTransaction()
    session.endSession()

    return { symbol, side, qty, price }
  } catch (err) {
    await session.abortTransaction()
    session.endSession()
    throw err
  }
}