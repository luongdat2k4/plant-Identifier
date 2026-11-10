import { state } from '../../shared/store'
import { spendCoins } from '../../shared/coins'
import { rollSpecies, type Rarity, type Species } from '../collection/model'
import { addSeed, freeSeedSlots } from './model'

// Seed Center: packs of seeds bought with coins, or the basic pack for a rewarded video.
export type PackId = 'basic' | 'plus' | 'special'
export interface Pack {
  id: PackId
  seeds: number
  /** Coins it costs; 0 for the pack that is paid with a rewarded video. */
  cost: number
  /** One seed of the pack is at least this rare. */
  guaranteed?: Rarity
  icon: string
}
export const PACKS: readonly Pack[] = [
  { id: 'basic', seeds: 1, cost: 0, icon: 'fluent-emoji-flat:seedling' },
  { id: 'plus', seeds: 3, cost: 30, guaranteed: 'uncommon', icon: 'fluent-emoji-flat:potted-plant' },
  { id: 'special', seeds: 5, cost: 50, guaranteed: 'rare', icon: 'fluent-emoji-flat:wrapped-gift' },
]

export type OpenResult = { ok: true; species: Species[] } | { ok: false; reason: 'room' | 'coins' }

/** Opens a pack: checks the bag has room, takes the coins, then adds the seeds. Nothing changes when it fails. */
export function openPack(pack: Pack): OpenResult {
  if (freeSeedSlots() < pack.seeds) return { ok: false, reason: 'room' }
  if (pack.cost > 0 && !spendCoins(pack.cost)) return { ok: false, reason: 'coins' }
  const species: Species[] = []
  for (let i = 0; i < pack.seeds; i++) {
    const roll = i === 0 && pack.guaranteed ? rollSpecies(pack.guaranteed) : rollSpecies()
    species.push(addSeed(roll).species)
  }
  return { ok: true, species }
}

export const canAfford = (pack: Pack) => state.value.coins >= pack.cost
