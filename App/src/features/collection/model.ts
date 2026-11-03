import { state } from '../../shared/store'
import { species } from '../../mock-data/species'

export type Rarity = 'common' | 'uncommon' | 'rare'
export type Stage = 'seed' | 'sprout' | 'young' | 'mature' | 'bloom'

export interface Species {
  id: string
  name: string
  scientificName: string
  family: string
  origin: string
  rarity: Rarity
  thirst: number
  hunger: number
  preferredSpot: 'sun' | 'shade'
  image: string
  description: string
  careTips: string[]
  funFacts: string[]
}

export interface Discovery {
  speciesId: string
  firstSeenAt: string
  mastered: boolean
  bestStage: Stage
}

export const STAGES: Stage[] = ['seed', 'sprout', 'young', 'mature', 'bloom']
export const STAGE_META: Record<Stage, { label: string; emoji: string; minDays: number }> = {
  seed: { label: 'Hạt', emoji: '🌰', minDays: 0 },
  sprout: { label: 'Mầm', emoji: '🌱', minDays: 1 },
  young: { label: 'Cây non', emoji: '🌿', minDays: 3 },
  mature: { label: 'Trưởng thành', emoji: '🪴', minDays: 7 },
  bloom: { label: 'Ra hoa', emoji: '🌸', minDays: 14 },
}
export const RARITY_META: Record<Rarity, { label: string; weight: number }> = {
  common: { label: 'Phổ biến', weight: 70 },
  uncommon: { label: 'Ít gặp', weight: 25 },
  rare: { label: 'Hiếm', weight: 5 },
}

export const allSpecies = species
export function getSpecies(id: string): Species | undefined { return species.find(s => s.id === id) }
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
  const weights = species.map(s => RARITY_META[s.rarity].weight * (discoveryOf(s.id) ? 1 : 2))
  let pick = Math.random() * weights.reduce((sum, w) => sum + w, 0)
  for (let i = 0; i < species.length; i++) { pick -= weights[i]; if (pick <= 0) return species[i] }
  return species[species.length - 1]
}
