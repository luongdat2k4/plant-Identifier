<script setup lang="ts">
import { onBeforeUnmount, ref, watch } from 'vue'
import { Icon } from '@iconify/vue'
import { t } from '../../../shared/i18n'
import { closeNativeOverlay, nativeOverlay } from '../adRuntime'
import NativeAd from './NativeAd.vue'

// A full-screen ad moment: the large native ad (with video) is centered on its own screen.
// The close button unlocks after a short countdown so the ad is seen before it can be dismissed.
const WAIT_SECONDS = 3
const secondsLeft = ref(WAIT_SECONDS)
let timer: ReturnType<typeof setInterval> | undefined

watch(nativeOverlay, open => {
  clearInterval(timer)
  if (!open) return
  secondsLeft.value = WAIT_SECONDS
  timer = setInterval(() => {
    secondsLeft.value--
    if (secondsLeft.value <= 0) clearInterval(timer)
  }, 1000)
})
onBeforeUnmount(() => clearInterval(timer))
</script>

<template>
  <div v-if="nativeOverlay" class="ad-overlay" role="dialog" aria-modal="true" :aria-label="t('ads.label')">
    <div class="ad-overlay-bar">
      <span class="ad-tag">{{ t('ads.label') }}</span>
      <button class="ad-close" :disabled="secondsLeft > 0" :aria-label="t('ads.close')" @click="closeNativeOverlay">
        <template v-if="secondsLeft > 0">{{ secondsLeft }}</template>
        <Icon v-else icon="solar:close-circle-linear" width="22" />
      </button>
    </div>
    <div class="ad-overlay-body">
      <div class="ad-overlay-card"><NativeAd template="medium" overlay /></div>
    </div>
  </div>
</template>

<style scoped>
.ad-overlay { position: fixed; inset: 0; z-index: 80; display: flex; flex-direction: column; padding-top: env(safe-area-inset-top); background: #f0f9f2; }
.ad-overlay-bar { display: flex; height: 68px; flex: none; align-items: center; justify-content: space-between; padding: 0 20px; }
.ad-tag { border-radius: 5px; background: #1c2a20; padding: 2px 8px; color: #fff; font-size: 10px; font-weight: 800; letter-spacing: .08em; text-transform: uppercase; }
.ad-close { display: flex; height: 40px; min-width: 40px; align-items: center; justify-content: center; border: 0; border-radius: 999px; background: #fff; padding: 0 12px; font-size: 14px; font-weight: 800; font-variant-numeric: tabular-nums; color: #16221a; }
.ad-close:disabled { opacity: .6; }
.ad-overlay-body { display: flex; min-height: 0; flex: 1; align-items: center; justify-content: center; padding: 0 20px env(safe-area-inset-bottom); }
.ad-overlay-card { width: 100%; max-width: 520px; }
</style>
