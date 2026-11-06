<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { Capacitor } from '@capacitor/core'
import { ALF, type NativeAdTemplate } from '@alf/app-sdk'
import { adsAvailable, adsSuppressed } from '../adRuntime'

// The Google Mobile Ads SDK draws the ad in a native view above the WebView, so
// this element only reserves the space and reports its rect while it is on screen.
const props = withDefaults(defineProps<{ template?: NativeAdTemplate; overlay?: boolean }>(), { template: 'medium' })

const HEIGHTS: Record<NativeAdTemplate, number> = { small: 84, mrec: 250, medium: 320 }
const height = computed(() => HEIGHTS[props.template])
const box = ref<HTMLElement | null>(null)
const native = Capacitor.isNativePlatform()
let alive = false
let frame = 0
let observer: IntersectionObserver | undefined
let resizeObserver: ResizeObserver | undefined
const inView = ref(false)
const scrolling = ref(false)
let settle: ReturnType<typeof setTimeout> | undefined
const documentVisible = ref(!document.hidden)
const canShow = computed(() => adsAvailable.value && (props.overlay || !adsSuppressed.value) && inView.value && documentVisible.value && !scrolling.value)

function rect() {
  const r = box.value?.getBoundingClientRect()
  return r ? { x: r.x, y: r.y, width: r.width, height: r.height } : null
}

// The ad sits above the page and does not scroll with it — track the placeholder.
function track() {
  if (frame) return
  frame = requestAnimationFrame(() => {
    frame = 0
    refresh()
    const r = rect()
    if (r && canShow.value) void ALF.Instance.Ads.UpdateAdMobNativeAdRect(r)
  })
}

async function show() {
  const r = rect()
  if (!r) return
  const shown = await ALF.Instance.Ads.ShowAdMobNativeAd({
    template: props.template,
    rect: r,
    style: {
      background: '#FFFFFF',
      textColor: '#16221A',
      secondaryTextColor: '#7F9085',
      ctaBackground: '#6CC24A',
      ctaTextColor: '#FFFFFF',
      cornerRadius: 20,
    },
  })
  // Layout can move while the native request is loading (e.g. a banner appears).
  // Never leave the loaded view at the stale coordinates used for the request.
  if (!shown) return
  refresh()
  const currentRect = rect()
  if (!alive || !canShow.value || !currentRect) await ALF.Instance.Ads.HideAdMobNativeAd()
  else await ALF.Instance.Ads.UpdateAdMobNativeAdRect(currentRect)
}

// The native view floats above the WebView and would trail a scrolling page by a frame, so it hides while the page
// moves and comes back once scrolling has stopped. Scrolling of unrelated lists is ignored.
function onScroll(event: Event) {
  const target = event.target
  if (props.overlay || (target instanceof Node && target !== document && box.value && !target.contains(box.value))) return
  scrolling.value = true
  clearTimeout(settle)
  settle = setTimeout(() => { scrolling.value = false; track() }, 300)
}

function refresh() {
  documentVisible.value = !document.hidden
  const boxRect = box.value?.getBoundingClientRect()
  const scrollRect = box.value?.closest('[data-ad-scroll-region]')?.getBoundingClientRect()
  // A page that scrolls with the window has no scroll region, but the shell's sticky bar and bottom
  // navigation still sit over it. The native view is drawn above them, so it must stay clear of both.
  // A full-screen overlay covers the shell bars, so only the screen itself bounds the ad.
  const top = props.overlay ? 0 : scrollRect ? scrollRect.top : Math.max(0, edge('.home-head')?.bottom ?? 0)
  // The raised quick-start button and its ring stand about 28px above the navigation bar.
  const navTop = edge('.bottom-nav')?.top
  const bottom = props.overlay ? window.innerHeight : scrollRect ? scrollRect.bottom : (navTop === undefined ? window.innerHeight : navTop - 28)
  inView.value = !!boxRect && boxRect.top >= Math.max(0, top) &&
    boxRect.bottom <= Math.min(window.innerHeight, bottom)
}

// Rect of a shell edge element, or null while it is not laid out (e.g. hidden on desktop widths).
function edge(selector: string) {
  const r = document.querySelector(selector)?.getBoundingClientRect()
  return r && r.height > 0 ? r : null
}
watch(canShow, visible => {
  if (!native || !alive) return
  if (visible) void show()
  else void ALF.Instance.Ads.HideAdMobNativeAd()
})

onMounted(() => {
  if (!native) return
  alive = true
  document.addEventListener('scroll', onScroll, { capture: true, passive: true })
  window.addEventListener('resize', track)
  document.addEventListener('visibilitychange', track)
  observer = new IntersectionObserver(track, { threshold: [0, 1] })
  if (box.value) observer.observe(box.value)
  // IntersectionObserver alone does not report every layout shift when the
  // placeholder stays visible. Observe its containing viewport as well.
  resizeObserver = new ResizeObserver(track)
  if (box.value) {
    resizeObserver.observe(box.value)
    const scrollRegion = box.value.closest('[data-ad-scroll-region]')
    if (scrollRegion) resizeObserver.observe(scrollRegion)
  }
  refresh()
})

onBeforeUnmount(() => {
  if (!native) return
  alive = false
  document.removeEventListener('scroll', onScroll, { capture: true })
  clearTimeout(settle)
  window.removeEventListener('resize', track)
  document.removeEventListener('visibilitychange', track)
  observer?.disconnect()
  resizeObserver?.disconnect()
  if (frame) cancelAnimationFrame(frame)
  void ALF.Instance.Ads.DestroyAdMobNativeAd()
})
</script>

<template>
  <div
    v-if="native"
    ref="box"
    class="native-slot"
    :style="{ height: `${height}px` }"
    aria-hidden="true"
  />
</template>

<style scoped>
.native-slot { width: 100%; flex: none; overflow: hidden; border-radius: 24px; background: #e6f1e8; }
</style>
