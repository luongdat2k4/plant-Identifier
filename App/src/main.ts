import { createApp } from 'vue'
import App from './App.vue'
import { router } from './router'
import { Capacitor } from '@capacitor/core'
import { initBackend } from './backend'
import { initAds } from './features/ads/adsConfig'
import './shared/styles/global.css'
import './shared/styles/theme.css'
import './shared/styles/bell.css'
import './shared/styles/article.css'
import './shared/styles/onboarding.css'
import './shared/styles/fonts.css'
void initBackend().then(() => {
  createApp(App).use(router).mount('#app')
  // The ad SDK only runs in the native app; a failed init must not block anything.
  if (Capacitor.isNativePlatform()) void initAds().catch(error => console.warn('[ads] init failed', error))
})
