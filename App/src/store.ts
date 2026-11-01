import { ref, watch } from 'vue'

export interface Plant {
  id: string
  name: string
  scientificName: string
  room: string
  image?: string
  wateringDays: number
  lastWatered: string
  light: 'Low' | 'Medium' | 'Bright'
  notes: string
  createdAt: string
}
export interface Scan { id: string; mode: 'Plant' | 'Disease' | 'Mushroom'; image: string; date: string; plantName?: string }
interface State { plants: Plant[]; scans: Scan[]; notifications: boolean; onboardingSeen: boolean }
const key = 'plantin-recreated-v1'
const initial: State = { plants: [], scans: [], notifications: true, onboardingSeen: false }
function read(): State {
  try { return { ...initial, ...JSON.parse(localStorage.getItem(key) || '{}') } } catch { return initial }
}
export const state = ref<State>(read())
watch(state, value => localStorage.setItem(key, JSON.stringify(value)), { deep: true })
export function today(): string {
  const date = new Date()
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}
export function daysUntilWatering(plant: Plant): number {
  const last = new Date(`${plant.lastWatered}T00:00:00`).getTime()
  if (!Number.isFinite(last)) return 0
  const current = new Date(); current.setHours(0, 0, 0, 0)
  return plant.wateringDays - Math.floor((current.getTime() - last) / 86400000)
}
export function addPlant(input: Omit<Plant, 'id' | 'createdAt'>) {
  const plant: Plant = { ...input, id: crypto.randomUUID(), createdAt: new Date().toISOString() }
  state.value.plants.unshift(plant)
  return plant
}
export function waterPlant(id: string) {
  const plant = state.value.plants.find(p => p.id === id)
  if (plant) plant.lastWatered = today()
}
export function deletePlant(id: string) { state.value.plants = state.value.plants.filter(p => p.id !== id) }
export function addScan(scan: Omit<Scan, 'id' | 'date'>) {
  state.value.scans.unshift({ ...scan, id: crypto.randomUUID(), date: new Date().toISOString() })
}
