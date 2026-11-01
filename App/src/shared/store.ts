import { ref, watch } from 'vue'
import type { Plant } from '../features/plants/model'
import type { Scan } from '../features/scan/model'

interface State { plants: Plant[]; scans: Scan[]; notifications: boolean; onboardingSeen: boolean }
const key = 'plantin-recreated-v1'
const initial: State = { plants: [], scans: [], notifications: true, onboardingSeen: false }
function read(): State {
  try { return { ...initial, ...JSON.parse(localStorage.getItem(key) || '{}') } } catch { return initial }
}
export const state = ref<State>(read())
watch(state, value => localStorage.setItem(key, JSON.stringify(value)), { deep: true })
