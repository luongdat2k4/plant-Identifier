import { ref } from 'vue'
import vi from './language/vi.json'

export const LANGUAGES = [
  { code: 'vi', name: 'Vietnamese', native: 'Tiếng Việt' },
  { code: 'en', name: 'English', native: 'English' },
  { code: 'ar', name: 'Arabic', native: 'العربية' },
  { code: 'bn', name: 'Bengali', native: 'বাংলা' },
  { code: 'de', name: 'German', native: 'Deutsch' },
  { code: 'es', name: 'Spanish', native: 'Español' },
  { code: 'fr', name: 'French', native: 'Français' },
  { code: 'hi', name: 'Hindi', native: 'हिन्दी' },
  { code: 'id', name: 'Indonesian', native: 'Bahasa Indonesia' },
  { code: 'it', name: 'Italian', native: 'Italiano' },
  { code: 'ja', name: 'Japanese', native: '日本語' },
  { code: 'ko', name: 'Korean', native: '한국어' },
  { code: 'nl', name: 'Dutch', native: 'Nederlands' },
  { code: 'pl', name: 'Polish', native: 'Polski' },
  { code: 'pt', name: 'Portuguese', native: 'Português' },
  { code: 'ru', name: 'Russian', native: 'Русский' },
  { code: 'th', name: 'Thai', native: 'ไทย' },
  { code: 'tr', name: 'Turkish', native: 'Türkçe' },
  { code: 'ur', name: 'Urdu', native: 'اردو' },
  { code: 'zh', name: 'Chinese', native: '中文' },
] as const
export type Lang = (typeof LANGUAGES)[number]['code']

const langKey = 'plantin-lang'
const chosenKey = 'plantin-lang-chosen'

// UI text lives in ./language/<code>.json as nested objects (not the catalog text, which comes from the database i18n files).
// Add a language by dropping a new JSON file here and listing it in LANGUAGES.
type Tree = { [segment: string]: string | Tree }
type Paths<T> = { [K in keyof T & string]: T[K] extends string ? K : `${K}.${Paths<T[K]>}` }[keyof T & string]
export type MessageKey = Paths<typeof vi>

/** Flattens `{ nav: { garden: "..." } }` into `{ "nav.garden": "..." }` once, so lookups stay a single map read. */
function flatten(tree: Tree, prefix = '', out: Record<string, string> = {}): Record<string, string> {
  for (const [key, value] of Object.entries(tree)) {
    if (typeof value === 'string') out[prefix + key] = value
    else flatten(value, `${prefix}${key}.`, out)
  }
  return out
}
const files = import.meta.glob<Tree>('./language/*.json', { eager: true, import: 'default' })
const messages: Partial<Record<Lang, Record<string, string>>> = {}
for (const { code } of LANGUAGES) {
  const file = files[`./language/${code}.json`]
  if (file) messages[code] = flatten(file)
}

const isLang = (code: string | null | undefined): code is Lang => LANGUAGES.some(item => item.code === code)

function read(key: string): string | null {
  try { return localStorage.getItem(key) } catch { return null }
}
function write(key: string, value: string) {
  try { localStorage.setItem(key, value) } catch { /* storage unavailable */ }
}
function initialLang(): Lang {
  const saved = read(langKey)
  if (isLang(saved)) return saved
  const device = typeof navigator !== 'undefined' ? navigator.language?.toLowerCase().slice(0, 2) : undefined
  return isLang(device) ? device : 'en'
}
function applyDocument(code: Lang) {
  if (typeof document === 'undefined') return
  document.documentElement.lang = code
  // The layout stays left-to-right for every language (Arabic and Urdu text still run right-to-left inside their own lines).
  document.documentElement.dir = 'ltr'
}

export const lang = ref<Lang>(initialLang())
applyDocument(lang.value)

/** Looks up a UI string; `{name}`-style placeholders are filled from `params`. */
export function t(key: MessageKey, params?: Record<string, string>): string {
  const text: string = messages[lang.value]?.[key] ?? messages.en?.[key] ?? messages.vi?.[key] ?? key
  return params ? text.replace(/\{(\w+)\}/g, (_, name: string) => params[name] ?? '') : text
}
/** Switches the language right away (so the chooser can preview it) and remembers it. */
export function setLang(code: Lang) {
  lang.value = code
  write(langKey, code)
  applyDocument(code)
}
/** True once the user has confirmed a language on the first-run screen. Storage failures count as chosen so the app is never blocked. */
export function hasChosenLanguage(): boolean {
  try { return localStorage.getItem(chosenKey) === '1' } catch { return true }
}
export function markLanguageChosen() { write(chosenKey, '1') }

/** Locale for dates and numbers that matches the chosen language. */
export const dateLocale = () => (lang.value === 'vi' ? 'vi-VN' : lang.value === 'en' ? 'en-US' : lang.value)
