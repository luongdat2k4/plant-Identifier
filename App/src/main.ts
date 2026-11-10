import { createApp } from 'vue'
import { addCollection } from '@iconify/vue'
import solarIcons from './shared/solar-icons.json'
import App from './App.vue'
import { router } from './router'
import { Capacitor } from '@capacitor/core'
import { initBackend } from './backend'
import { initializeAds, preloadAppOpen } from './features/ads/adRuntime'
import { hasRuntimeData } from './shared/store'
import './features/ads/ads.css'
import './shared/styles/global.css'
import './shared/styles/theme.css'
import './shared/styles/bell.css'
import './shared/styles/article.css'
import './shared/styles/onboarding.css'
import './shared/styles/progress.css'
import './shared/styles/fonts.css'
// Solar icons (CC BY 4.0, https://github.com/480-Design/Solar-Icon-Set)
// are bundled so the interface also renders them without network access.
addCollection(solarIcons)
void initBackend().then(() => {
  createApp(App).use(router).mount('#app')
  // The ad SDK only runs in the native app; a failed init must not block anything.
  if (!Capacitor.isNativePlatform()) return
  // The App Open ad is shown by the /begin screen, which only returning users see: load it ahead for them.
  void initializeAds()
  if (hasRuntimeData()) preloadAppOpen()
})
