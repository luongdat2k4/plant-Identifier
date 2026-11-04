<script setup lang="ts">
import { t } from './shared/i18n'
import { computed, onMounted, onUnmounted, watch } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import BottomNav from './shared/components/BottomNav.vue'
import { useToast } from './shared/composables/useToast'
import { tickAll } from './features/garden/model'
import { setStatusBar } from './shared/utils/statusBar'
import BannerAd from './features/ads/components/BannerAd.vue'
import { adsAvailable, adsSuppressed, bannerInset, fullScreenShowing } from './features/ads/adRuntime'
const route = useRoute()
const { toast, notify } = useToast()
const isCamera = computed(() => ['scan', 'welcome', 'language'].includes(String(route.name)))
const showNav = computed(() => ['garden', 'collection', 'seeds', 'menu'].includes(String(route.name)))
// One banner for the tab screens and the language page; never on camera, pot detail or onboarding.
const showBanner = computed(() => adsAvailable.value && !adsSuppressed.value && !fullScreenShowing.value &&
  ['garden', 'collection', 'seeds', 'menu', 'menu-language', 'language'].includes(String(route.name)))

watch(() => route.fullPath, () => { if (route.meta.bar) setStatusBar(String(route.meta.bar)) }, { immediate: true })

function refreshPots() {
  const died = tickAll()
  if (died.length) notify(t('toast.hibernated', { names: died.join(', ') }))
}
function onVisible() { if (!document.hidden) refreshPots() }
let timer: ReturnType<typeof setInterval> | undefined
onMounted(() => {
  refreshPots()
  timer = setInterval(refreshPots, 60000)
  document.addEventListener('visibilitychange', onVisible)
})
onUnmounted(() => { clearInterval(timer); document.removeEventListener('visibilitychange', onVisible) })
</script>

<template>
  <div class="app-shell" :class="{ 'has-nav': showNav, 'has-banner': showBanner }" :style="{ '--ad-inset': `${showBanner ? bannerInset : 0}px` }">
    <div v-if="!isCamera" class="status-space"></div>
    <RouterView />
    <BottomNav v-if="showNav" />
    <div v-if="showBanner" class="banner-dock"><BannerAd/></div>
    <div v-if="toast" class="toast" role="status">{{ toast }}</div>
  </div>
</template>
