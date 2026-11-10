import { ref, watch } from 'vue'
import type { Pot } from '../features/garden/model'
import type { Discovery } from '../features/collection/model'
import type { Seed } from '../features/scan/model'
import { saveState } from '../backend/runtime'
import { hasOnboarded } from './utils/onboarding'

/** Today's daily missions (counts reset when `day` is not today) and the last day their reward was claimed. */
export interface Missions { day: string; water: number; feed: number; scan: number; claimedDay?: string }

export interface State {
  pots: Pot[]
  seeds: Seed[]
  discoveries: Discovery[]
  potSlots: number
  notifications: boolean
  /** "Seeds" as the in-app currency: buys seed packs and unlocks species. */
  coins: number
  missions: Missions
}
function emptyState(): State {
  return { pots: [], seeds: [], discoveries: [], potSlots: 6, notifications: true, coins: 0, missions: { day: '', water: 0, feed: 0, scan: 0 } }
}

// Filled from runtime.db by initBackend() before the app mounts; every change is written back to it.
export const state = ref<State>(emptyState())
let ready = false

export function hydrateState(initial: State) {
  state.value = initial
  ready = true
  saveState(state.value)
}
watch(state, value => { if (ready) saveState(value) }, { deep: true })

/** True when this device has been used before: the intro was finished or runtime.db holds seeds, pots or discoveries. */
export function hasRuntimeData(): boolean {
  const s = state.value
  return hasOnboarded() || s.pots.length > 0 || s.seeds.length > 0 || s.discoveries.length > 0
}

export function resetState() { state.value = emptyState() }
