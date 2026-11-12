import type { State } from '../shared/store'
import { getSpecies } from './catalog'
import { pointsFromDays } from '../features/garden/growth'

// One-time import of the old localStorage save (key `plantin-recreated-v2`, from before the SQLite backend).
// The old build used Vietnamese ids; the catalog now uses English keys, so every species id is translated.

const OLD_KEY = 'plantin-recreated-v2'
const DONE_FLAG = 'plantin-legacy-imported'

const RENAMED: Record<string, string> = {
  'monstera': 'monstera', 'trau-ba': 'golden_pothos', 'luoi-ho': 'snake_plant', 'kim-tien': 'zz_plant', 'lan-y': 'peace_lily',
  'nha-dam': 'aloe_vera', 'duong-xi-boston': 'boston_fern', 'lan-ho-diep': 'moth_orchid', 'sen-da': 'echeveria', 'hoa-hong': 'rose',
  'bat-ruoi': 'venus_flytrap', 'xuong-rong-cau': 'golden_barrel_cactus', 'sung-la-dan': 'fiddle_leaf_fig', 'co-nhen': 'spider_plant',
  'huyet-du': 'dragon_tree', 'da-bup-do': 'rubber_plant', 'ngoc-bich': 'jade_plant', 'xg-giang-sinh': 'christmas_cactus',
  'hong-mon': 'anthurium', 'thuong-xuan': 'english_ivy', 'tu-la-lan': 'african_violet', 'cau-vang': 'areca_palm',
  'van-nien-thanh': 'dieffenbachia', 'duoi-cong': 'calathea', 'cau-nguyen': 'prayer_plant', 'thai-lai-van': 'inch_plant',
  'dong-xu': 'chinese_money_plant', 'cam-cu': 'wax_plant', 'truc-phat-tai': 'lucky_bamboo', 'trau-ba-la-tim': 'heartleaf_philodendron',
  'aglaonema': 'chinese_evergreen',
}
const rename = (id: string) => RENAMED[id] ?? id

/** The old save with species ids translated, or null when there is nothing worth importing. Demo rows are skipped. */
export function readLegacyState(): State | null {
  try {
    if (localStorage.getItem(DONE_FLAG)) return null
    localStorage.setItem(DONE_FLAG, '1')
    const saved = JSON.parse(localStorage.getItem(OLD_KEY) || 'null') as Partial<State> | null
    if (!saved) return null
    const known = <T extends { speciesId: string }>(item: T): T | null => {
      const speciesId = rename(item.speciesId)
      return getSpecies(speciesId) ? { ...item, speciesId } : null
    }
    const keep = <T extends { id?: string; speciesId: string }>(items: T[] | undefined) =>
      (items ?? []).filter(item => !item.id?.startsWith('demo-')).map(known).filter((item): item is T => item !== null)
    const state: State = {
      potSlots: Number(saved.potSlots) || 6,
      notifications: saved.notifications !== false,
      coins: 0,
      missions: { day: '', water: 0, feed: 0, scan: 0 },
      levelUps: { day: '', count: 0 },
      pots: keep(saved.pots).map(pot => ({ ...pot, growthPoints: pointsFromDays(Number(pot.growthDays) || 0), tapPoints: 0, tapBonus: 0 })),
      seeds: keep(saved.seeds),
      discoveries: (saved.discoveries ?? []).map(known).filter((item): item is NonNullable<typeof item> => item !== null),
    }
    return state.pots.length || state.seeds.length || state.discoveries.length ? state : null
  } catch { return null }
}
