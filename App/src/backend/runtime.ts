import { all, one, run, runtimeDb, transaction } from './database'
import type { Missions, State } from '../shared/store'
import type { Pot, Spot } from '../features/garden/model'
import type { Discovery } from '../features/collection/model'
import { STAGES, type Stage } from './catalog'

// Reads and writes runtime.db (settings, seed, pot, discovery, daily_mission). Rows reference catalog rows by `key` only.
// The tables are tiny (a handful of pots, at most 20 seeds, at most one discovery per species), so a save
// simply rewrites them inside one transaction.

const text = (value: unknown) => (value === null || value === undefined ? undefined : String(value))
const stage = (value: unknown) => (STAGES.includes(value as Stage) ? value as Stage : undefined)
const MISSION_IDS = ['water', 'feed', 'scan'] as const

export function loadState(): State {
  const db = runtimeDb()
  const settings = one(db, 'SELECT pot_slots, notifications, coins, mission_claimed_day FROM settings WHERE id = 1')
  const missions: Missions = { day: '', water: 0, feed: 0, scan: 0, claimedDay: text(settings?.mission_claimed_day) }
  for (const row of all(db, 'SELECT mission, day, progress FROM daily_mission')) {
    const id = String(row.mission) as (typeof MISSION_IDS)[number]
    if (!MISSION_IDS.includes(id)) continue
    missions.day = String(row.day)
    missions[id] = Number(row.progress)
  }
  return {
    potSlots: settings ? Number(settings.pot_slots) : 6,
    notifications: settings ? Number(settings.notifications) === 1 : true,
    coins: settings ? Number(settings.coins) || 0 : 0,
    missions,
    seeds: all(db, 'SELECT id, species_id, created_at FROM seed ORDER BY rowid').map(row => ({
      id: String(row.id), speciesId: String(row.species_id), createdAt: String(row.created_at),
    })),
    pots: all(db, 'SELECT * FROM pot ORDER BY rowid').map((row): Pot => ({
      id: String(row.id), speciesId: String(row.species_id), nickname: text(row.nickname), spot: row.spot === 'sun' ? 'sun' : 'shade' as Spot,
      water: Number(row.water), nutrition: Number(row.nutrition), growthDays: Number(row.growth_days),
      lastGrowthDay: String(row.last_growth_day), wiltingSince: text(row.wilting_since),
      lastUpdated: String(row.last_updated), createdAt: String(row.created_at),
      rewardedStage: stage(row.rewarded_stage),
    })),
    discoveries: all(db, 'SELECT * FROM discovery ORDER BY rowid').map((row): Discovery => ({
      speciesId: String(row.species_id), firstSeenAt: String(row.first_seen_at),
      bestStage: String(row.best_stage) as Stage, mastered: Number(row.mastered) === 1,
    })),
  }
}

export function saveState(state: State) {
  transaction(() => {
    run(`INSERT INTO settings (id, pot_slots, notifications, coins, mission_claimed_day) VALUES (1, ?, ?, ?, ?)
         ON CONFLICT(id) DO UPDATE SET pot_slots = excluded.pot_slots, notifications = excluded.notifications,
           coins = excluded.coins, mission_claimed_day = excluded.mission_claimed_day`,
    [state.potSlots, state.notifications ? 1 : 0, state.coins, state.missions.claimedDay ?? null])
    run('DELETE FROM seed')
    for (const seed of state.seeds) run('INSERT INTO seed (id, species_id, created_at) VALUES (?, ?, ?)', [seed.id, seed.speciesId, seed.createdAt])
    run('DELETE FROM pot')
    for (const pot of state.pots) {
      run(`INSERT INTO pot (id, species_id, nickname, spot, water, nutrition, growth_days, last_growth_day, wilting_since, last_updated, created_at, rewarded_stage)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [pot.id, pot.speciesId, pot.nickname ?? null, pot.spot, pot.water, pot.nutrition, pot.growthDays,
        pot.lastGrowthDay, pot.wiltingSince ?? null, pot.lastUpdated, pot.createdAt, pot.rewardedStage ?? null])
    }
    run('DELETE FROM discovery')
    for (const found of state.discoveries) {
      run('INSERT INTO discovery (species_id, first_seen_at, best_stage, mastered) VALUES (?, ?, ?, ?)',
        [found.speciesId, found.firstSeenAt, found.bestStage, found.mastered ? 1 : 0])
    }
    run('DELETE FROM daily_mission')
    if (state.missions.day) {
      for (const id of MISSION_IDS) run('INSERT INTO daily_mission (mission, day, progress) VALUES (?, ?, ?)', [id, state.missions.day, state.missions[id]])
    }
  })
}
