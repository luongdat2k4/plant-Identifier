import { all, catalogDb, type Row } from './database'
import { text, textList, textOrUndefined } from './catalogText'

// Read-only view of catalog.db. Rows are read once at start-up. Every piece of text is a getter that
// looks the key up in the i18n files, so a language switch updates whatever reads it.
// Translation keys are generated from the row key: `<table>.<key>.<field>` (see design-note/data-schema.md).

export type Rarity = 'common' | 'uncommon' | 'rare'
export type Stage = 'seed' | 'sprout' | 'young' | 'mature' | 'bloom'
export type Spot = 'sun' | 'shade'
export type ReminderTask = 'water' | 'fertilize' | 'check' | 'repot' | 'prune' | 'mist'

export interface Species {
  id: string
  readonly name: string
  scientificName: string
  /** Latin family plus the translated label when there is one, e.g. "Araceae (họ Ráy)". */
  readonly family: string
  /** Empty when the catalog has no origin text for this species. */
  readonly origin: string
  rarity: Rarity
  thirst: number
  hunger: number
  preferredSpot: Spot
  image: string
  thumb: string
  readonly description: string
  readonly careTips: string[]
  readonly funFacts: string[]
}

export interface ImageCredit { pageUrl: string; license: string | null; author: string | null }
export interface Care {
  waterDays: number | null
  fertilizeWeeks: number | null
  tempMin: number | null
  tempMax: number | null
  petSafe: boolean
  readonly light: string | undefined
  readonly waterNote: string | undefined
  readonly fertilizer: string | undefined
  readonly soil: string | undefined
  readonly humidity: string | undefined
}
export interface Disease { key: string; readonly title: string; readonly note: string | undefined; image: string; thumb: string; credit: ImageCredit | null }
export interface Symptom { key: string; readonly title: string; readonly cause: string | undefined; readonly fix: string | undefined }
export interface Reminder { key: string; task: ReminderTask; everyDays: number; readonly note: string | undefined }

export interface StageInfo { readonly label: string; emoji: string; minDays: number }
export interface RarityInfo { readonly label: string; weight: number }

// These are filled in place by loadCatalog(), so modules that imported them before start-up see the data.
export const STAGES: Stage[] = []
export const STAGE_META = {} as Record<Stage, StageInfo>
export const RARITY_META = {} as Record<Rarity, RarityInfo>
export const allSpecies: Species[] = []

const bySpecies = new Map<string, Species>()
const careOf = new Map<string, Care>()
const diseaseOf = new Map<string, Disease>()
const symptomsOf = new Map<string, Symptom[]>()
const remindersOf = new Map<string, Reminder[]>()
const general: Symptom[] = []
const credits = new Map<string, ImageCredit>()

const str = (value: unknown) => (value === null || value === undefined ? null : String(value))
const num = (value: unknown) => (value === null || value === undefined ? null : Number(value))
const rows = (sql: string): Row[] => all(catalogDb(), sql)
const base = import.meta.env.BASE_URL
/** Catalog paths are stored as `/imgs/...`; this keeps them working under a non-root base URL. */
export const assetUrl = (path: string | null) => (path ? (path.startsWith('/') ? base + path.slice(1) : path) : '')

function symptom(key: string, prefix: string): Symptom {
  return {
    key,
    get title() { return text(`${prefix}.${key}.title`) },
    get cause() { return textOrUndefined(`${prefix}.${key}.cause`) },
    get fix() { return textOrUndefined(`${prefix}.${key}.fix`) },
  }
}

export function loadCatalog() {
  for (const row of rows('SELECT key, sort_order, emoji, min_days FROM stage ORDER BY sort_order')) {
    const key = String(row.key) as Stage
    STAGES.push(key)
    STAGE_META[key] = { get label() { return text(`stage.${key}.title`) }, emoji: str(row.emoji) ?? '', minDays: Number(row.min_days) }
  }
  for (const row of rows('SELECT key, weight FROM rarity ORDER BY weight DESC')) {
    const key = String(row.key) as Rarity
    RARITY_META[key] = { get label() { return text(`rarity.${key}.title`) }, weight: Number(row.weight) }
  }
  for (const row of rows('SELECT key, page_url, license, author FROM image_credit')) {
    credits.set(String(row.key), { pageUrl: String(row.page_url), license: str(row.license), author: str(row.author) })
  }

  for (const row of rows('SELECT key, scientific_name, family, rarity_id, thirst, hunger, preferred_spot, image, thumb FROM species ORDER BY sort_order')) {
    const key = String(row.key)
    const latinFamily = str(row.family)
    const item: Species = {
      id: key,
      get name() { return text(`species.${key}.title`) },
      scientificName: String(row.scientific_name),
      get family() {
        const label = textOrUndefined(`species.${key}.family`)
        return latinFamily ? (label ? `${latinFamily} (${label})` : latinFamily) : (label ?? '')
      },
      get origin() { return textOrUndefined(`species.${key}.origin`) ?? '' },
      rarity: String(row.rarity_id) as Rarity,
      thirst: Number(row.thirst),
      hunger: Number(row.hunger),
      preferredSpot: row.preferred_spot === 'sun' ? 'sun' : 'shade',
      image: assetUrl(str(row.image)),
      thumb: assetUrl(str(row.thumb)),
      get description() { return textOrUndefined(`species.${key}.description`) ?? '' },
      get careTips() { return textList(`species.${key}.tip`) },
      get funFacts() { return textList(`species.${key}.fact`) },
    }
    allSpecies.push(item)
    bySpecies.set(key, item)
  }

  for (const row of rows('SELECT key, water_days, fertilize_weeks, temp_min, temp_max, pet_safe FROM species_care')) {
    const key = String(row.key)
    careOf.set(key, {
      waterDays: num(row.water_days), fertilizeWeeks: num(row.fertilize_weeks), tempMin: num(row.temp_min), tempMax: num(row.temp_max),
      petSafe: Number(row.pet_safe) === 1,
      get light() { return textOrUndefined(`species_care.${key}.light`) },
      get waterNote() { return textOrUndefined(`species_care.${key}.water_note`) },
      get fertilizer() { return textOrUndefined(`species_care.${key}.fertilizer`) },
      get soil() { return textOrUndefined(`species_care.${key}.soil`) },
      get humidity() { return textOrUndefined(`species_care.${key}.humidity`) },
    })
  }

  for (const row of rows('SELECT key, disease_id, image, thumb, image_credit_id FROM species_disease')) {
    const key = String(row.key)
    const diseaseKey = String(row.disease_id)
    diseaseOf.set(key, {
      key: diseaseKey,
      get title() { return text(`disease.${diseaseKey}.title`) },
      get note() { return textOrUndefined(`species_disease.${key}.description`) },
      image: assetUrl(str(row.image)), thumb: assetUrl(str(row.thumb)),
      credit: credits.get(String(row.image_credit_id)) ?? null,
    })
  }

  for (const row of rows('SELECT key, species_id FROM species_symptom ORDER BY species_id, sort_order')) {
    const owner = String(row.species_id)
    const list = symptomsOf.get(owner) ?? []
    list.push(symptom(String(row.key), 'species_symptom'))
    symptomsOf.set(owner, list)
  }
  for (const row of rows('SELECT key FROM general_symptom ORDER BY sort_order')) general.push(symptom(String(row.key), 'general_symptom'))

  for (const row of rows('SELECT key, species_id, task, every_days FROM species_reminder ORDER BY species_id, rowid')) {
    const owner = String(row.species_id)
    const key = String(row.key)
    const list = remindersOf.get(owner) ?? []
    list.push({ key, task: String(row.task) as ReminderTask, everyDays: Number(row.every_days), get note() { return textOrUndefined(`species_reminder.${key}.description`) } })
    remindersOf.set(owner, list)
  }
}

export const getSpecies = (id: string): Species | undefined => bySpecies.get(id)
export const getCare = (speciesId: string): Care | undefined => careOf.get(speciesId)
export const getDisease = (speciesId: string): Disease | undefined => diseaseOf.get(speciesId)
export const getSymptoms = (speciesId: string): Symptom[] => symptomsOf.get(speciesId) ?? []
export const getGeneralSymptoms = (): Symptom[] => general
export const getReminders = (speciesId: string): Reminder[] => remindersOf.get(speciesId) ?? []
