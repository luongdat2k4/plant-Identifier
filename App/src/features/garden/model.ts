import { state } from '../../shared/store'
import { newId } from '../../shared/utils/newId'
import { t } from '../../shared/i18n'
import { getSpecies, recordProgress, stageIndex, STAGES, type Stage } from '../collection/model'
import { STAGE_GP, stageForPoints } from './growth'
import { addCoins } from '../../shared/coins'
import { bumpMission } from '../missions/model'

export type Spot = 'sun' | 'shade'
export type Status = 'happy' | 'needs-care' | 'wilting'

export interface Pot {
  id: string
  speciesId: string
  nickname?: string
  spot: Spot
  water: number
  nutrition: number
  /** Healthy days so far (kept for history; growth itself is measured in growthPoints). */
  growthDays: number
  lastGrowthDay: string
  /** Growth points (GP) so far; the stage follows from them. */
  growthPoints: number
  /** Day of tapPoints; another day starts again from 0. */
  tapDay?: string
  /** GP earned from water and feed taps on tapDay (a record only: taps have no daily cap). */
  tapPoints: number
  /** Unused since the daily tap cap was removed; kept so the runtime row round-trips. */
  tapBonus: number
  wiltingSince?: string
  lastUpdated: string
  createdAt: string
  /** Highest stage already rewarded (+coins). Pots from before rewards existed start at the stage they had then. */
  rewardedStage?: Stage
}

const WATER_PER_HOUR = 100 / 96
const NUTRITION_PER_HOUR = 100 / 336
const WRONG_SPOT_PENALTY = 1.25
export const HAPPY_AT = 40
const WILT_BELOW = 15
const DEATH_AFTER_DAYS = 7
const MAX_GROWTH_CATCHUP = 3
/** GP a healthy day adds on its own. */
export const DAILY_GP = 10
/** What one tap pours in and the GP it gives: full while the stat is below 100%, half once it is full. */
const CARE = {
  water: { amount: 25, gp: 1 },
  nutrition: { amount: 35, gp: 2 },
} as const
const FULL_TANK_SHARE = 0.5
const FULL_AT = 99.5
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
export const STATUS_META: Record<Status, { readonly label: string; readonly hint: string }> = {
  happy: { get label() { return t('status.happy.label') }, get hint() { return t('status.happy.hint') } },
  'needs-care': { get label() { return t('status.needsCare.label') }, get hint() { return t('status.needsCare.hint') } },
  wilting: { get label() { return t('status.wilting.label') }, get hint() { return t('status.wilting.hint') } },
}
export function neededCare(pot: Pot): 'water' | 'nutrition' { return pot.water <= pot.nutrition ? 'water' : 'nutrition' }
export function stageOf(pot: Pot): Stage { return stageForPoints(pot.growthPoints) }
export function nextStage(pot: Pot): { stage: Stage; pointsLeft: number } | null {
  const next = STAGES[STAGES.indexOf(stageOf(pot)) + 1]
  return next ? { stage: next, pointsLeft: Math.ceil(STAGE_GP[next] - pot.growthPoints) } : null
}
/** GP inside the current stage: how far along it the pot is and how many it needs in total (0 once in bloom). */
export function stageProgress(pot: Pot): { done: number; total: number; share: number } {
  const stage = stageOf(pot)
  const next = STAGES[STAGES.indexOf(stage) + 1]
  if (!next) return { done: 0, total: 0, share: 1 }
  const total = STAGE_GP[next] - STAGE_GP[stage]
  const done = Math.max(0, pot.growthPoints - STAGE_GP[stage])
  return { done, total, share: Math.min(1, done / total) }
}
function resetTapDay(pot: Pot, today: string = dayKey()) {
  if (pot.tapDay === today) return
  pot.tapDay = today; pot.tapPoints = 0; pot.tapBonus = 0
}

export function daysUntilDeath(pot: Pot, now: Date = new Date()): number | null {
  if (!pot.wiltingSince) return null
  return Math.max(0, Math.ceil((new Date(pot.wiltingSince).getTime() + DEATH_AFTER_DAYS * DAY - now.getTime()) / DAY))
}
export function potName(pot: Pot): string { return pot.nickname?.trim() || getSpecies(pot.speciesId)?.name || t('pot.unknown') }

/** Applies elapsed real time to one pot. Returns false when the pot has died. */
export function tickPot(pot: Pot, now: Date = new Date()): boolean {
  pot.rewardedStage ??= stageOf(pot) // growth from here on is rewarded, growth before rewards existed is not
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
  if (elapsed > 0) {
    const days = Math.min(elapsed, MAX_GROWTH_CATCHUP)
    pot.growthDays += days; pot.growthPoints += days * DAILY_GP; pot.lastGrowthDay = today
  }
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

export function findPot(id: string): Pot | undefined { return state.value.pots.find(p => p.id === id) }
/** What one care tap did: the GP it gave (0 while wilting) and whether it moved a mission. */
export interface CareResult { gp: number; mission: boolean }

function care(id: string, stat: 'water' | 'nutrition'): CareResult | null {
  const pot = findPot(id); if (!pot) return null
  tickPot(pot)
  const rule = CARE[stat]
  // Full as the player sees it (the bar rounds to 100%); a few minutes of drain must not make a spam tap count as full value.
  const wasFull = pot[stat] >= FULL_AT
  pot[stat] = clamp(pot[stat] + rule.amount)
  if (statusOf(pot) !== 'wilting') delete pot.wiltingSince
  const mission = bumpMission(stat === 'water' ? 'water' : 'feed')
  // A pot that is still wilting after the tap does not grow.
  if (statusOf(pot) === 'wilting') return { gp: 0, mission }
  resetTapDay(pot)
  const gp = rule.gp * (wasFull ? FULL_TANK_SHARE : 1)
  pot.tapPoints += gp
  pot.growthPoints += gp
  recordProgress(pot.speciesId, stageOf(pot))
  return { gp, mission }
}
/** Waters a pot: +25% water and some GP. Every tap counts towards today's mission (the mission itself stops at its target). */
export function waterPot(id: string): CareResult | null { return care(id, 'water') }
/** Feeds a pot: +35% nutrition and some GP. Every tap counts towards today's mission. */
export function feedPot(id: string): CareResult | null { return care(id, 'nutrition') }

// A pot reaching a new stage earns coins once per stage, at most LEVEL_UP_DAILY times a day across all pots;
// the popup that hands them out is in the app shell.
export const LEVEL_UP_REWARD = 2
export const LEVEL_UP_DAILY = 3
function levelUpsLeft(): number {
  const ups = state.value.levelUps
  return ups.day === dayKey() ? Math.max(0, LEVEL_UP_DAILY - ups.count) : LEVEL_UP_DAILY
}
/** Coins the pending level-up of this pot would give now (0 once today's limit is used up). */
export function levelUpCoins(pot: Pot): number {
  const now = stageOf(pot)
  const steps = Math.max(0, stageIndex(now) - stageIndex(pot.rewardedStage ?? now))
  return Math.min(steps, levelUpsLeft()) * LEVEL_UP_REWARD
}
/** The stage the pot reached but has not been rewarded for yet, or null. */
export function levelUpOf(pot: Pot): Stage | null {
  const now = stageOf(pot)
  return stageIndex(now) > stageIndex(pot.rewardedStage ?? now) ? now : null
}
export function pendingLevelUp(): Pot | undefined { return state.value.pots.find(pot => levelUpOf(pot)) }
/** Marks the pot's current stage as rewarded and adds the coins. Returns how many coins were given. */
export function claimLevelUp(pot: Pot): number {
  const now = stageOf(pot)
  const coins = levelUpCoins(pot)
  pot.rewardedStage = now
  if (coins > 0) {
    const ups = state.value.levelUps
    if (ups.day !== dayKey()) { ups.day = dayKey(); ups.count = 0 }
    ups.count += coins / LEVEL_UP_REWARD
    addCoins(coins)
  }
  return coins
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
    water: 100, nutrition: 100, growthDays: 0, lastGrowthDay: dayKey(now), growthPoints: 0, tapPoints: 0, tapBonus: 0, lastUpdated: now.toISOString(), createdAt: now.toISOString(),
    rewardedStage: 'seed',
  }
  state.value.seeds = state.value.seeds.filter(s => s.id !== seedId)
  state.value.pots.push(pot)
  recordProgress(species.id, 'seed')
  return state.value.pots[state.value.pots.length - 1]
}
