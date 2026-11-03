import { ref } from 'vue'
import vi from './language/vi.json'
import en from './language/en.json'

export type Lang = 'vi' | 'en'
export const LANGUAGES: { code: Lang; name: string; native: string }[] = [
  { code: 'vi', name: 'Vietnamese', native: 'Tiếng Việt' },
  { code: 'en', name: 'English', native: 'English' },
]

const langKey = 'plantin-lang'
const chosenKey = 'plantin-lang-chosen'

// UI text lives in ./language/<code>.json (not the catalog text, which comes from the database i18n files).
// Add a language by dropping a new JSON file here and listing it in LANGUAGES.
const messages = { vi, en } as const

export type MessageKey = keyof typeof vi

function read(key: string): string | null {
  try { return localStorage.getItem(key) } catch { return null }
}
function write(key: string, value: string) {
  try { localStorage.setItem(key, value) } catch { /* storage unavailable */ }
}
function initialLang(): Lang {
  const saved = read(langKey)
  if (saved === 'vi' || saved === 'en') return saved
  return (typeof navigator !== 'undefined' && navigator.language?.toLowerCase().startsWith('vi')) ? 'vi' : 'en'
}

export const lang = ref<Lang>(initialLang())
if (typeof document !== 'undefined') document.documentElement.lang = lang.value

/** Looks up a UI string; `{name}`-style placeholders are filled from `params`. */
export function t(key: MessageKey, params?: Record<string, string>): string {
  const text: string = (messages[lang.value] as Record<string, string>)[key] ?? (vi as Record<string, string>)[key] ?? key
  return params ? text.replace(/\{(\w+)\}/g, (_, name: string) => params[name] ?? '') : text
}
/** Switches the language right away (so the chooser can preview it) and remembers it. */
export function setLang(code: Lang) {
  lang.value = code
  write(langKey, code)
  if (typeof document !== 'undefined') document.documentElement.lang = code
}
/** True once the user has confirmed a language on the first-run screen. Storage failures count as chosen so the app is never blocked. */
export function hasChosenLanguage(): boolean {
  try { return localStorage.getItem(chosenKey) === '1' } catch { return true }
}
export function markLanguageChosen() { write(chosenKey, '1') }

/** Locale for dates and numbers that matches the chosen language. */
export const dateLocale = () => (lang.value === 'vi' ? 'vi-VN' : 'en-US')
