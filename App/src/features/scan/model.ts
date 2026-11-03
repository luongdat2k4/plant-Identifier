import { state } from '../../shared/store'
import { newId } from '../../shared/utils/newId'
import { markSeen, rollSpecies, type Species } from '../collection/model'

export interface Seed { id: string; speciesId: string; createdAt: string }

export const MAX_SEEDS = 20

/** The captured photo is only a trigger: it is never stored. Rolls a random species and records it as seen. */
export function rollSeed(): { seed: Seed; species: Species; isNew: boolean } {
  const species = rollSpecies()
  const isNew = markSeen(species.id)
  const seed: Seed = { id: newId(), speciesId: species.id, createdAt: new Date().toISOString() }
  state.value.seeds.unshift(seed)
  if (state.value.seeds.length > MAX_SEEDS) state.value.seeds.length = MAX_SEEDS
  return { seed, species, isNew }
}
export function discardSeed(id: string) { state.value.seeds = state.value.seeds.filter(s => s.id !== id) }
