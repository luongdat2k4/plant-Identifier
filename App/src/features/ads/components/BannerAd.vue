<script lang="ts">
// Banner commands run one at a time so a show can never overtake its load.
let operation = Promise.resolve()
function enqueue(action: () => Promise<void>) {
  operation = operation.then(action).catch(error => console.warn('[ads] banner failed', error))
}
</script>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { Capacitor } from '@capacitor/core'
import { ALF, type BannerInitOptions } from '@alf/app-sdk'
import { bannerInset } from '../adRuntime'

// AdMob draws the banner over the WebView, anchored to the screen edge, so this element only reserves that strip of
// the page: it must touch the same edge. The banner is created once and then only hidden/shown: destroying and
// recreating it on every screen change restarts the (slow) load each time.
const props = withDefaults(defineProps<{ visible?: boolean; position?: BannerInitOptions['position']; size?: BannerInitOptions['size'] }>(), { visible: true, position: 'BOTTOM_CENTER' })

const native = Capacitor.isNativePlatform()
const height = ref(0)
let loaded = false

onMounted(() => {
  if (!native) return
  enqueue(async () => {
    height.value = props.size === 'BANNER' ? 50 : await ALF.Instance.Ads.GetAdHeight('banner')
    await ALF.Instance.Ads.LoadBannerAd({ position: props.position, size: props.size })
    loaded = true
    if (props.visible) { await ALF.Instance.Ads.ShowBannerAd(); bannerInset.value = height.value }
  })
})

watch(() => props.visible, visible => {
  if (!native) return
  enqueue(async () => {
    if (!loaded) return // the load above reads `visible` when it finishes
    if (visible) { await ALF.Instance.Ads.ShowBannerAd(); bannerInset.value = height.value }
    else { await ALF.Instance.Ads.HideBannerAd(); bannerInset.value = 0 }
  })
})

onBeforeUnmount(() => {
  if (!native) return
  bannerInset.value = 0
  enqueue(async () => { loaded = false; await ALF.Instance.Ads.DestroyBannerAd() })
})
</script>

<template>
  <div v-if="native" class="banner-slot" :style="{ height: `${height}px` }" aria-hidden="true"></div>
</template>

<style scoped>
.banner-slot { width: 100%; flex: none; }
</style>
