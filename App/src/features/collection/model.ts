import { state } from '../../shared/store'
import { allSpecies, getSpecies, RARITY_META, STAGE_META, STAGES } from '../../backend/catalog'
import type { Rarity, Species, Stage } from '../../backend/catalog'

export { allSpecies, getSpecies, RARITY_META, STAGE_META, STAGES }
export type { Rarity, Species, Stage }

export interface Discovery {
  speciesId: string
  firstSeenAt: string
  mastered: boolean
  bestStage: Stage
}

export function stageIndex(stage: Stage): number { return STAGES.indexOf(stage) }
export function discoveryOf(speciesId: string): Discovery | undefined {
  return state.value.discoveries.find(d => d.speciesId === speciesId)
}

/** Records a species as seen. Returns true when it was not in the collection yet. */
export function markSeen(speciesId: string): boolean {
  if (discoveryOf(speciesId)) return false
  state.value.discoveries.push({ speciesId, firstSeenAt: new Date().toISOString(), mastered: false, bestStage: 'seed' })
  return true
}
export function recordProgress(speciesId: string, stage: Stage) {
  markSeen(speciesId)
  const found = discoveryOf(speciesId)
  if (!found) return
  if (stageIndex(stage) > stageIndex(found.bestStage)) found.bestStage = stage
  if (stage === 'bloom') found.mastered = true
}

const RARITY_ORDER: readonly Rarity[] = ['common', 'uncommon', 'rare']

/** Weighted roll by rarity; species not yet seen are twice as likely. `atLeast` limits the roll to that rarity or rarer. */
export function rollSpecies(atLeast: Rarity = 'common'): Species {
  const pool = allSpecies.filter(s => RARITY_ORDER.indexOf(s.rarity) >= RARITY_ORDER.indexOf(atLeast))
  const from = pool.length ? pool : allSpecies
  const weights = from.map(s => RARITY_META[s.rarity].weight * (discoveryOf(s.id) ? 1 : 2))
  let pick = Math.random() * weights.reduce((sum, w) => sum + w, 0)
  for (let i = 0; i < from.length; i++) { pick -= weights[i]; if (pick <= 0) return from[i] }
  return from[from.length - 1]
}

// Unlocking a species in the collection with coins, as an alternative to meeting it through a scan.
export const UNLOCK_COST: Record<Rarity, number> = { common: 10, uncommon: 15, rare: 20 }
export const unlockCost = (species: Species) => UNLOCK_COST[species.rarity]
