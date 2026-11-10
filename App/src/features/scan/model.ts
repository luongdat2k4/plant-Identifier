import { state } from '../../shared/store'
import { newId } from '../../shared/utils/newId'
import { markSeen, rollSpecies, type Species } from '../collection/model'

export interface Seed { id: string; speciesId: string; createdAt: string }

export const MAX_SEEDS = 20

export const freeSeedSlots = () => Math.max(0, MAX_SEEDS - state.value.seeds.length)

/** Puts a seed of `species` in the bag and records the species as seen. A full bag drops its oldest seed. */
export function addSeed(species: Species): { seed: Seed; species: Species; isNew: boolean } {
  const isNew = markSeen(species.id)
  const seed: Seed = { id: newId(), speciesId: species.id, createdAt: new Date().toISOString() }
  state.value.seeds.unshift(seed)
  if (state.value.seeds.length > MAX_SEEDS) state.value.seeds.length = MAX_SEEDS
  return { seed, species, isNew }
}

/** The captured photo is only a trigger: it is never stored. Rolls a random species and records it as seen. */
export function rollSeed(): { seed: Seed; species: Species; isNew: boolean } {
  return addSeed(rollSpecies())
}
export function discardSeed(id: string) { state.value.seeds = state.value.seeds.filter(s => s.id !== id) }
