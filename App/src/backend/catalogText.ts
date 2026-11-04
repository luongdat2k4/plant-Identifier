import { shallowRef, watch } from 'vue'
import { lang, type Lang } from '../shared/i18n'

// Catalog text lives in public/i18n/<lang>.json (staged by the Toolkit from the `language` table) as nested objects, e.g.
// { "species": { "snake_plant": { "title": "...", "tip": { "1": "..." } } } }.
// Lookup order: chosen language -> en -> vi -> (required text only) the key itself. Languages without catalog text yet fall back to English.
const base = import.meta.env.BASE_URL
type CatalogStrings = { [segment: string]: string | CatalogStrings }
const strings = shallowRef<Partial<Record<Lang, CatalogStrings>>>({})
const pending = new Map<Lang, Promise<void>>()

export async function loadCatalogText(languages: Lang[]) {
  await Promise.all([...new Set(languages)].map(id => {
    if (strings.value[id]) return Promise.resolve()
    const existing = pending.get(id)
    if (existing) return existing
    const task = loadOne(id).finally(() => pending.delete(id))
    pending.set(id, task)
    return task
  }))
}

async function loadOne(id: Lang) {
  let catalog: CatalogStrings = {}
  try {
    const response = await fetch(`${base}i18n/${id}.json`, { cache: 'no-cache' })
    if (response.ok) catalog = await response.json() as CatalogStrings
  } catch { /* Keep the fallback catalog. */ }
  strings.value = { ...strings.value, [id]: catalog }
}

watch(lang, id => { void loadCatalogText([id]) })

function lookup(source: CatalogStrings | undefined, key: string): string | undefined {
  let node: string | CatalogStrings | undefined = source
  for (const segment of key.split('.')) {
    if (!node || typeof node === 'string') return undefined
    node = node[segment]
  }
  return typeof node === 'string' ? node : undefined
}

/** Text that may legitimately be missing (origin, tips, notes): undefined when no language has it. Reading `lang` keeps templates reactive. */
export function textOrUndefined(key: string): string | undefined {
  return lookup(strings.value[lang.value], key) ?? lookup(strings.value.en, key) ?? lookup(strings.value.vi, key)
}

/** Text every entity must have (title): falls back to the key so a gap is visible instead of blank. */
export function text(key: string): string { return textOrUndefined(key) ?? key }

/** `prefix.1`, `prefix.2`, ... until the first gap. */
export function textList(prefix: string): string[] {
  const items: string[] = []
  for (let n = 1; ; n++) {
    const value = textOrUndefined(`${prefix}.${n}`)
    if (value === undefined) return items
    items.push(value)
  }
}
