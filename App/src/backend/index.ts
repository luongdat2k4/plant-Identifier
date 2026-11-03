import { loadCatalog } from './catalog'
import { loadCatalogText } from './catalogText'
import { openDatabases } from './database'
import { readLegacyState } from './legacy'
import { loadState } from './runtime'
import { lang } from '../shared/i18n'
import { hydrateState } from '../shared/store'

/** Opens catalog.db and runtime.db, loads the i18n files and fills the app state; call once before mounting the app. */
export async function initBackend() {
  const [{ freshRuntime }] = await Promise.all([openDatabases(), loadCatalogText(['vi', lang.value])])
  loadCatalog()
  hydrateState((freshRuntime ? readLegacyState() : null) ?? loadState())
}

export * from './catalog'
export { text, textOrUndefined, textList } from './catalogText'
