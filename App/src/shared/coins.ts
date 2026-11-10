import { state } from './store'

// "Seeds" as the in-app currency. Earned from daily missions, a plant reaching a new stage and rewarded videos;
// spent on seed packs and on unlocking species in the collection.

export function addCoins(amount: number) { state.value.coins += Math.max(0, Math.round(amount)) }

/** Takes `amount` coins when there are enough. Returns false (and takes nothing) otherwise. */
export function spendCoins(amount: number): boolean {
  if (state.value.coins < amount) return false
  state.value.coins -= amount
  return true
}

/** Coins a rewarded video gives on the locked species screen. */
export const VIDEO_COINS = 3
