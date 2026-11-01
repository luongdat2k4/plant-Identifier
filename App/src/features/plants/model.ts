import { state } from '../../shared/store'

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
