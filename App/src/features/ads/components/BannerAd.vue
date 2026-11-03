<script lang="ts">
let owner: symbol | null = null
let operation = Promise.resolve()
function enqueue(action: () => Promise<void>) {
  operation = operation.then(action).catch(error => console.warn('[ads] banner failed', error))
}
</script>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { Capacitor } from '@capacitor/core'
import { ALF, type BannerInitOptions } from '@alf/app-sdk'
import { bannerInset } from '../adRuntime'

// AdMob draws the banner over the WebView, anchored to the screen edge, so this
// element only reserves that strip of the page: it must touch the same edge.
const props = withDefaults(defineProps<{ position?: BannerInitOptions['position']; size?: BannerInitOptions['size'] }>(), { position: 'BOTTOM_CENTER' })

const native = Capacitor.isNativePlatform()
const height = ref(0)
const id = Symbol('banner-host')

onMounted(async () => {
  if (!native) return
  owner = id
  height.value = props.size === 'BANNER' ? 50 : await ALF.Instance.Ads.GetAdHeight('banner')
  if (owner === id) bannerInset.value = height.value
  enqueue(async () => { if (owner === id) await ALF.Instance.Ads.InitBannerAd({ position: props.position, size: props.size }) })
})

onBeforeUnmount(() => {
  if (!native) return
  if (owner !== id) return
  owner = null
  bannerInset.value = 0
  enqueue(() => ALF.Instance.Ads.DestroyBannerAd())
})
</script>

<template>
  <div v-if="native" class="banner-slot" :style="{ height: `${height}px` }" aria-hidden="true"></div>
</template>

<style scoped>
.banner-slot { width: 100%; flex: none; }
</style>
