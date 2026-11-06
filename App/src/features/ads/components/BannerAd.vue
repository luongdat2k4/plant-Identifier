<script lang="ts">
// Banner commands run one at a time so a show can never overtake its load.
let operation = Promise.resolve()
function enqueue(action: () => Promise<void>) {
  operation = operation.then(action).catch(error => console.warn('[ads] banner failed', error))
}
</script>

<script setup lang="ts">
import { onBeforeUnmount, watch } from 'vue'
import { Capacitor } from '@capacitor/core'
import { ALF, type BannerInitOptions } from '@alf/app-sdk'
import { adsAvailable, bannerHeight } from '../adRuntime'

// AdMob draws the banner over the WebView, anchored to the screen edge. The strip it will cover is reserved by the shell
// from the first frame (bannerHeight), so this component only loads, shows and hides: the banner is created once and
// never destroyed on a screen change, because recreating it restarts the (slow) load each time.
const props = withDefaults(defineProps<{ visible?: boolean; position?: BannerInitOptions['position']; size?: BannerInitOptions['size'] }>(), { visible: true, position: 'BOTTOM_CENTER' })

const native = Capacitor.isNativePlatform()
let started = false
let loaded = false

// The load starts as soon as the SDK is ready, not when the banner is first wanted.
watch(adsAvailable, ready => {
  if (!native || !ready || started) return
  started = true
  enqueue(async () => {
    await ALF.Instance.Ads.LoadBannerAd({ position: props.position, size: props.size })
    loaded = true
    if (props.visible) await ALF.Instance.Ads.ShowBannerAd()
  })
}, { immediate: true })

watch(() => props.visible, visible => {
  if (!native) return
  enqueue(async () => {
    if (!loaded) return // the load above reads `visible` when it finishes
    if (visible) await ALF.Instance.Ads.ShowBannerAd()
    else await ALF.Instance.Ads.HideBannerAd()
  })
})

onBeforeUnmount(() => {
  if (!native || !started) return
  enqueue(async () => { loaded = false; await ALF.Instance.Ads.DestroyBannerAd() })
})
</script>

<template>
  <div v-if="native" class="banner-slot" :style="{ height: `${bannerHeight}px` }" aria-hidden="true"></div>
</template>

<style scoped>
.banner-slot { width: 100%; flex: none; }
</style>
