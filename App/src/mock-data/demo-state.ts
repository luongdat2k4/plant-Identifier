import type { State } from '../shared/store'
import type { Pot } from '../features/garden/model'
import { dayKey } from '../features/garden/model'

// Set to false to start with an empty garden instead of fake data.
export const USE_DEMO_DATA = true

const HOUR = 3600000

export function createDemoState(): State {
  const now = new Date()
  const iso = (offsetHours = 0) => new Date(now.getTime() - offsetHours * HOUR).toISOString()
  const pot = (input: Omit<Pot, 'lastGrowthDay' | 'lastUpdated' | 'createdAt'>): Pot => ({
    ...input, lastGrowthDay: dayKey(now), lastUpdated: iso(), createdAt: iso(24 * input.growthDays),
  })
  return {
    potSlots: 6,
    notifications: true,
    pots: [
      pot({ id: 'demo-pot-1', speciesId: 'trau-ba', spot: 'shade', water: 82, nutrition: 70, growthDays: 15 }),
      pot({ id: 'demo-pot-2', speciesId: 'lan-y', spot: 'shade', water: 28, nutrition: 55, growthDays: 5 }),
      pot({ id: 'demo-pot-3', speciesId: 'sen-da', spot: 'sun', water: 6, nutrition: 40, growthDays: 2, wiltingSince: iso(48) }),
      pot({ id: 'demo-pot-4', speciesId: 'monstera', spot: 'shade', water: 60, nutrition: 90, growthDays: 1 }),
    ],
    seeds: [
      { id: 'demo-seed-1', speciesId: 'luoi-ho', createdAt: iso(5) },
      { id: 'demo-seed-2', speciesId: 'bat-ruoi', createdAt: iso(30) },
    ],
    discoveries: [
      { speciesId: 'trau-ba', firstSeenAt: iso(24 * 15), mastered: true, bestStage: 'bloom' },
      { speciesId: 'lan-y', firstSeenAt: iso(24 * 5), mastered: false, bestStage: 'young' },
      { speciesId: 'sen-da', firstSeenAt: iso(24 * 2), mastered: false, bestStage: 'sprout' },
      { speciesId: 'monstera', firstSeenAt: iso(24), mastered: false, bestStage: 'sprout' },
      { speciesId: 'luoi-ho', firstSeenAt: iso(5), mastered: false, bestStage: 'seed' },
      { speciesId: 'bat-ruoi', firstSeenAt: iso(30), mastered: false, bestStage: 'seed' },
      { speciesId: 'nha-dam', firstSeenAt: iso(24 * 9), mastered: false, bestStage: 'seed' },
    ],
  }
}
