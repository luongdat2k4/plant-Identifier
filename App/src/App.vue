<script setup lang="ts">
import { t } from './shared/i18n'
import { computed, onMounted, onUnmounted, watch } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import BottomNav from './shared/components/BottomNav.vue'
import { useToast } from './shared/composables/useToast'
import { claimLevelUp, levelUpCoins, levelUpOf, pendingLevelUp, potName, tickAll } from './features/garden/model'
import { getSpecies, STAGE_META } from './features/collection/model'
import RewardModal from './shared/components/RewardModal.vue'
import { setStatusBar } from './shared/utils/statusBar'
import BannerAd from './features/ads/components/BannerAd.vue'
import { hasRuntimeData } from './shared/store'
import { adsPossible, adsSuppressed, bannerHeight, countAction, fullScreenShowing, showInterstitial } from './features/ads/adRuntime'
const route = useRoute()
const { toast, notify } = useToast()
const isCamera = computed(() => ['scan', 'welcome', 'language', 'begin'].includes(String(route.name)))
const showNav = computed(() => ['garden', 'collection', 'seeds', 'menu'].includes(String(route.name)))
// One banner for the tab screens and the first-run screens (language, welcome) and the launch screen of a returning user; never on camera or pot detail.
const showBanner = computed(() => adsPossible && !adsSuppressed.value && !fullScreenShowing.value &&
  (['garden', 'collection', 'seeds', 'menu', 'menu-language', 'language', 'welcome', 'pot', 'species', 'missions'].includes(String(route.name)) ||
    (route.name === 'begin' && hasRuntimeData())))

// A pot that reached a new stage: shown on the garden and pot screens, rewarded once per stage.
const levelPot = computed(() => (['garden', 'pot'].includes(String(route.name)) && !fullScreenShowing.value ? pendingLevelUp() : undefined))
const levelInfo = computed(() => {
  const pot = levelPot.value
  const stage = pot && levelUpOf(pot)
  const species = pot && getSpecies(pot.speciesId)
  if (!pot || !stage || !species) return null
  return { name: potName(pot), stage: STAGE_META[stage].label, image: species.image, coins: levelUpCoins(pot) }
})
function claimLevel() {
  if (!levelPot.value) return
  claimLevelUp(levelPot.value)
  void showInterstitial('level_up')
}

watch(() => route.fullPath, () => { if (route.meta.bar) setStatusBar(String(route.meta.bar)) }, { immediate: true })

function refreshPots() {
  const died = tickAll()
  if (died.length) notify(t('toast.hibernated', { names: died.join(', ') }))
}
// Every 2-3 taps on a control an interstitial may show. Never on the camera, the first-run screens, the language page,
// the scan button, the rewarded-video buttons or the water/feed buttons (those are meant to be tapped fast), and never while another ad is up.
const NO_TAP_ADS = ['scan', 'begin', 'welcome', 'language', 'menu-language']
function onTap(event: MouseEvent) {
  if (NO_TAP_ADS.includes(String(route.name)) || fullScreenShowing.value || adsSuppressed.value) return
  const control = (event.target as Element | null)?.closest('button, a[href], [role="button"]')
  if (!control || control.closest('.scan-btn, .seed-reward, .banner-dock, .care-tap')) return
  countAction()
}
function onVisible() { if (!document.hidden) refreshPots() }
let timer: ReturnType<typeof setInterval> | undefined
onMounted(() => {
  refreshPots()
  timer = setInterval(refreshPots, 60000)
  document.addEventListener('visibilitychange', onVisible)
  document.addEventListener('click', onTap, true)
})
onUnmounted(() => { clearInterval(timer); document.removeEventListener('visibilitychange', onVisible); document.removeEventListener('click', onTap, true) })
</script>

<template>
  <div class="app-shell" :class="{ 'has-nav': showNav, 'has-banner': showBanner }" :style="{ '--ad-inset': `${showBanner ? bannerHeight : 0}px` }">
    <div v-if="!isCamera" class="status-space"></div>
    <RouterView />
    <BottomNav v-if="showNav" />
    <div v-if="adsPossible" v-show="showBanner" class="banner-dock" :style="{ height: `${bannerHeight}px` }"><BannerAd :visible="showBanner"/></div>
    <div v-if="toast" class="toast" role="status">{{ toast }}</div>
    <RewardModal v-if="levelInfo" :title="t('levelUp.title')" :text="levelInfo.coins ? t('levelUp.text', { name: levelInfo.name, stage: levelInfo.stage }) : `${t('levelUp.text', { name: levelInfo.name, stage: levelInfo.stage })}. ${t('levelUp.noCoins')}`" :images="[levelInfo.image]" :coins="levelInfo.coins" @ok="claimLevel"/>
  </div>
</template>
