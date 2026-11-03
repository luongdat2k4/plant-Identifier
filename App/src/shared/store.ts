import { ref, watch } from 'vue'
import type { Pot } from '../features/garden/model'
import type { Discovery } from '../features/collection/model'
import type { Seed } from '../features/scan/model'
import { saveState } from '../backend/runtime'

export interface State { pots: Pot[]; seeds: Seed[]; discoveries: Discovery[]; potSlots: number; notifications: boolean }
function emptyState(): State { return { pots: [], seeds: [], discoveries: [], potSlots: 6, notifications: true } }

// Filled from runtime.db by initBackend() before the app mounts; every change is written back to it.
export const state = ref<State>(emptyState())
let ready = false

export function hydrateState(initial: State) {
  state.value = initial
  ready = true
  saveState(state.value)
}
watch(state, value => { if (ready) saveState(value) }, { deep: true })

export function resetState() { state.value = emptyState() }
