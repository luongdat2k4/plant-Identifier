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
export function stageForDays(days: number): Stage {
  let result: Stage = 'seed'
  for (const stage of STAGES) if (days >= STAGE_META[stage].minDays) result = stage
  return result
}
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

/** Weighted roll by rarity; species not yet seen are twice as likely. */
export function rollSpecies(): Species {
  const weights = allSpecies.map(s => RARITY_META[s.rarity].weight * (discoveryOf(s.id) ? 1 : 2))
  let pick = Math.random() * weights.reduce((sum, w) => sum + w, 0)
  for (let i = 0; i < allSpecies.length; i++) { pick -= weights[i]; if (pick <= 0) return allSpecies[i] }
  return allSpecies[allSpecies.length - 1]
}
