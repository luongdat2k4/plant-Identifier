import { state } from '../../shared/store'
import { newId } from '../../shared/utils/newId'
import { getSpecies, recordProgress, stageForDays, STAGES, STAGE_META, type Stage } from '../collection/model'

export type Spot = 'sun' | 'shade'
export type Status = 'happy' | 'needs-care' | 'wilting'

export interface Pot {
  id: string
  speciesId: string
  nickname?: string
  spot: Spot
  water: number
  nutrition: number
  growthDays: number
  lastGrowthDay: string
  wiltingSince?: string
  lastUpdated: string
  createdAt: string
}

const WATER_PER_HOUR = 100 / 96
const NUTRITION_PER_HOUR = 100 / 336
const WRONG_SPOT_PENALTY = 1.25
const HAPPY_AT = 40
const WILT_BELOW = 15
const DEATH_AFTER_DAYS = 7
const MAX_GROWTH_CATCHUP = 3
const DAY = 86400000

const clamp = (value: number) => Math.max(0, Math.min(100, value))
export function dayKey(date: Date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}
function daysBetween(from: string, to: string): number {
  return Math.round((new Date(`${to}T00:00:00`).getTime() - new Date(`${from}T00:00:00`).getTime()) / DAY)
}

export function statusOf(pot: Pot): Status {
  const lowest = Math.min(pot.water, pot.nutrition)
  if (lowest < WILT_BELOW) return 'wilting'
  return lowest < HAPPY_AT ? 'needs-care' : 'happy'
}
export const STATUS_META: Record<Status, { label: string; hint: string }> = {
  happy: { label: 'Khỏe', hint: 'Cây đang phát triển tốt.' },
  'needs-care': { label: 'Cần chăm', hint: 'Cây đang cần được chăm sóc.' },
  wilting: { label: 'Đang héo', hint: 'Cây héo và tạm ngừng lớn. Chăm lại là hồi phục ngay.' },
}
export function neededCare(pot: Pot): 'water' | 'nutrition' { return pot.water <= pot.nutrition ? 'water' : 'nutrition' }
export function stageOf(pot: Pot): Stage { return stageForDays(pot.growthDays) }
export function nextStage(pot: Pot): { stage: Stage; daysLeft: number } | null {
  const next = STAGES[STAGES.indexOf(stageOf(pot)) + 1]
  return next ? { stage: next, daysLeft: STAGE_META[next].minDays - pot.growthDays } : null
}
export function daysUntilDeath(pot: Pot, now: Date = new Date()): number | null {
  if (!pot.wiltingSince) return null
  return Math.max(0, Math.ceil((new Date(pot.wiltingSince).getTime() + DEATH_AFTER_DAYS * DAY - now.getTime()) / DAY))
}
export function potName(pot: Pot): string { return pot.nickname?.trim() || getSpecies(pot.speciesId)?.name || 'Cây lạ' }

/** Applies elapsed real time to one pot. Returns false when the pot has died. */
export function tickPot(pot: Pot, now: Date = new Date()): boolean {
  const species = getSpecies(pot.speciesId)
  const hours = Math.max(0, (now.getTime() - new Date(pot.lastUpdated).getTime()) / 3600000)
  if (species) {
    const penalty = pot.spot === species.preferredSpot ? 1 : WRONG_SPOT_PENALTY
    pot.water = clamp(pot.water - hours * WATER_PER_HOUR * species.thirst * penalty)
    pot.nutrition = clamp(pot.nutrition - hours * NUTRITION_PER_HOUR * species.hunger)
  }
  pot.lastUpdated = now.toISOString()
  const today = dayKey(now)
  if (statusOf(pot) === 'wilting') {
    pot.wiltingSince ??= now.toISOString()
    pot.lastGrowthDay = today
    return now.getTime() - new Date(pot.wiltingSince).getTime() < DEATH_AFTER_DAYS * DAY
  }
  delete pot.wiltingSince
  const elapsed = daysBetween(pot.lastGrowthDay, today)
  if (elapsed > 0) { pot.growthDays += Math.min(elapsed, MAX_GROWTH_CATCHUP); pot.lastGrowthDay = today }
  recordProgress(pot.speciesId, stageOf(pot))
  return true
}

/** Ticks every pot. Pots that die go back to the seed bag; returns their names. */
export function tickAll(now: Date = new Date()): string[] {
  const died: string[] = []
  for (const pot of [...state.value.pots]) {
    if (tickPot(pot, now)) continue
    died.push(potName(pot))
    state.value.pots = state.value.pots.filter(p => p.id !== pot.id)
    state.value.seeds.unshift({ id: newId(), speciesId: pot.speciesId, createdAt: now.toISOString() })
  }
  return died
}

function findPot(id: string): Pot | undefined { return state.value.pots.find(p => p.id === id) }
function afterCare(pot: Pot) { if (statusOf(pot) !== 'wilting') delete pot.wiltingSince }
export function waterPot(id: string) {
  const pot = findPot(id); if (!pot) return
  tickPot(pot); pot.water = 100; afterCare(pot)
}
export function feedPot(id: string) {
  const pot = findPot(id); if (!pot) return
  tickPot(pot); pot.nutrition = 100; afterCare(pot)
}
export function setSpot(id: string, spot: Spot) {
  const pot = findPot(id); if (!pot) return
  tickPot(pot); pot.spot = spot
}
/** Removes a pot and returns it to the seed bag. */
export function uprootPot(id: string) {
  const pot = findPot(id); if (!pot) return
  state.value.pots = state.value.pots.filter(p => p.id !== id)
  state.value.seeds.unshift({ id: newId(), speciesId: pot.speciesId, createdAt: new Date().toISOString() })
}
export function hasFreeSlot(): boolean { return state.value.pots.length < state.value.potSlots }

/** Plants a seed in a free pot. Returns the new pot, or null when there is no room. */
export function plantSeed(seedId: string): Pot | null {
  const seed = state.value.seeds.find(s => s.id === seedId)
  const species = seed && getSpecies(seed.speciesId)
  if (!seed || !species || !hasFreeSlot()) return null
  const now = new Date()
  const pot: Pot = {
    id: newId(), speciesId: species.id, spot: species.preferredSpot,
    water: 100, nutrition: 100, growthDays: 0, lastGrowthDay: dayKey(now), lastUpdated: now.toISOString(), createdAt: now.toISOString(),
  }
  state.value.seeds = state.value.seeds.filter(s => s.id !== seedId)
  state.value.pots.push(pot)
  recordProgress(species.id, 'seed')
  return state.value.pots[state.value.pots.length - 1]
}
