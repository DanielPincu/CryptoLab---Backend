import { AccountModel } from '../../schemas/account.schema'
import { PositionModel } from '../../schemas/position.schema'
import { notifyUserFavoritesChange, notifyUpstreamFavoritesChange } from '../../websocket/finnhub.websocket'

export async function updateFavorites(userId: string, payload: {
  favorites?: string[]
  add?: string
  remove?: string
}) {

  const { favorites, add, remove } = payload

  const account = await AccountModel.findOne({ userId })
  if (!account) {
    throw new Error('Account not found')
  }

  const prevFavorites = new Set((account.favorites ?? []).map((s) => String(s).toUpperCase()))

  const normalize = (s: string) => {
    let v = String(s || '').toUpperCase().trim()
    if (!v.endsWith('USDT')) v = `${v}USDT`
    return v
  }

  if (Array.isArray(favorites)) {
    account.favorites = Array.from(
      new Set(favorites.map(normalize).filter(Boolean))
    )
  }

  else if (typeof add === 'string') {
    const sym = normalize(add)
    if (!account.favorites.includes(sym)) {
      account.favorites.push(sym)
    }
  }

  else if (typeof remove === 'string') {
    const sym = normalize(remove)

    const position = await PositionModel.findOne({ userId, symbol: sym }).lean()
    if (position && Number(position.qty) > 0) {
      throw new Error('Cannot unsubscribe while position is open')
    }

    account.favorites = account.favorites.filter((s) => s !== sym)
  }

  const nextFavorites = new Set(account.favorites)

  const subscribe = [...nextFavorites].filter((s) => !prevFavorites.has(s))
  const unsubscribe = [...prevFavorites].filter((s) => !nextFavorites.has(s))

  await account.save()

  notifyUserFavoritesChange(userId, { subscribe, unsubscribe })
  notifyUpstreamFavoritesChange({ subscribe, unsubscribe })

  return {
    favorites: account.favorites,
    ws: { subscribe, unsubscribe }
  }
}