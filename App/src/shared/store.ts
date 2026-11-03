import { ref, watch } from 'vue'
import type { Pot } from '../features/garden/model'
import type { Discovery } from '../features/collection/model'
import type { Seed } from '../features/scan/model'
import { createDemoState, USE_DEMO_DATA } from '../mock-data/demo-state'

export interface State { pots: Pot[]; seeds: Seed[]; discoveries: Discovery[]; potSlots: number; notifications: boolean }
const key = 'plantin-recreated-v2'
function emptyState(): State { return { pots: [], seeds: [], discoveries: [], potSlots: 6, notifications: true } }
function read(): State {
  try {
    const saved = localStorage.getItem(key)
    // older saves kept the captured photo on each seed/pot; it is no longer used, so drop it
    if (saved) return { ...emptyState(), ...JSON.parse(saved, (name, value) => (name === 'photo' ? undefined : value)) }
  } catch { /* fall through to a fresh state */ }
  return USE_DEMO_DATA ? createDemoState() : emptyState()
}
export const state = ref<State>(read())
watch(state, value => {
  try { localStorage.setItem(key, JSON.stringify(value)) } catch { /* storage full or unavailable */ }
}, { deep: true })

export function resetState(withDemo: boolean) { state.value = withDemo ? createDemoState() : emptyState() }
