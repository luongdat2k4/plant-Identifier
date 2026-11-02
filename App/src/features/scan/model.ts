import { state } from '../../shared/store'
import { markSeen, rollSpecies, type Species } from '../collection/model'

export interface Seed { id: string; speciesId: string; photo: string; createdAt: string }

export const MAX_SEEDS = 20

/** Turns a photo into a seed of a random species and records the species as seen. */
export function sowPhoto(photo: string): { seed: Seed; species: Species; isNew: boolean } {
  const species = rollSpecies()
  const isNew = markSeen(species.id, photo)
  const seed: Seed = { id: crypto.randomUUID(), speciesId: species.id, photo, createdAt: new Date().toISOString() }
  state.value.seeds.unshift(seed)
  if (state.value.seeds.length > MAX_SEEDS) state.value.seeds.length = MAX_SEEDS
  return { seed, species, isNew }
}
export function discardSeed(id: string) { state.value.seeds = state.value.seeds.filter(s => s.id !== id) }
