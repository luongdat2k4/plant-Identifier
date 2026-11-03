import { createApp } from 'vue'
import App from './App.vue'
import { router } from './router'
import { Capacitor } from '@capacitor/core'
import { initBackend } from './backend'
import { initializeAds, tryAppOpenOnLaunch } from './features/ads/adRuntime'
import { hasOnboarded } from './shared/utils/onboarding'
import './features/ads/ads.css'
import './shared/styles/global.css'
import './shared/styles/theme.css'
import './shared/styles/bell.css'
import './shared/styles/article.css'
import './shared/styles/onboarding.css'
import './shared/styles/fonts.css'
void initBackend().then(() => {
  createApp(App).use(router).mount('#app')
  // The ad SDK only runs in the native app; a failed init must not block anything.
  if (!Capacitor.isNativePlatform()) return
  // A first-time user gets no launch ad; later opens may show one App Open ad if it is ready within its short window.
  void initializeAds().then(() => { if (hasOnboarded()) void tryAppOpenOnLaunch(new AbortController().signal) })
})
