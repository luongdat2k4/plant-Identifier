<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { Capacitor } from '@capacitor/core'
import { ALF, type NativeAdTemplate } from '@alf/app-sdk'
import { adsAvailable, adsSuppressed } from '../adRuntime'
import { docScrolls } from '../../../shared/composables/pageScroll'

// The Google Mobile Ads SDK draws the ad in a native view above the WebView, so this element only reserves the space
// and reports where it is. The space exists from the first frame (it does not wait for the SDK or the ad) and keeps
// its size whatever happens to the ad: loading shows a shimmer, a slow or failed load a still background, and the
// ad covers the same box when it arrives (design-note/note/ad-layout-stability.md).
const props = withDefaults(defineProps<{ template?: NativeAdTemplate; overlay?: boolean }>(), { template: 'medium' })

const HEIGHTS: Record<NativeAdTemplate, number> = { small: 84, mrec: 250, medium: 320 }
const LOADING_MS = 10_000
const height = computed(() => HEIGHTS[props.template])
const box = ref<HTMLElement | null>(null)
const native = Capacitor.isNativePlatform()
let alive = false
let frame = 0
let observer: IntersectionObserver | undefined
let resizeObserver: ResizeObserver | undefined
let slowTimer: ReturnType<typeof setTimeout> | undefined
let settle: ReturnType<typeof setTimeout> | undefined
let lastKey = ''
const inView = ref(false)
const documentVisible = ref(!document.hidden)
const scrolling = ref(false)
// loading: shimmer; slow: still background after LOADING_MS (the ad may still arrive); ready: the ad is on screen.
const state = ref<'loading' | 'slow' | 'ready'>('loading')
const canShow = computed(() => adsAvailable.value && (props.overlay || !adsSuppressed.value) && inView.value && documentVisible.value && !scrolling.value)

type Rect = Parameters<typeof ALF.Instance.Ads.UpdateAdMobNativeAdRect>[0]
const px = (n: number) => Math.round(n)

function rect() {
  const r = box.value?.getBoundingClientRect()
  return r ? { x: px(r.x), y: px(r.y), width: px(r.width), height: px(r.height) } : null
}

// Rect of a shell edge element, or null while it is not laid out (e.g. hidden on desktop widths).
function edge(selector: string) {
  const r = document.querySelector(selector)?.getBoundingClientRect()
  return r && r.height > 0 ? r : null
}

// The part of the screen an ad may be drawn in: below the sticky header, above the bottom bar, the banner and the raised
// scan button (about 28px above the bar). A page inside its own scroll box is also limited to that box.
function band() {
  if (props.overlay) return { top: 0, bottom: window.innerHeight }
  let top = Math.max(0, edge('.home-head')?.bottom ?? 0)
  let bottom = window.innerHeight
  const nav = edge('.bottom-nav')
  if (nav) bottom = Math.min(bottom, nav.top - 28)
  const dock = edge('.banner-dock')
  if (dock) bottom = Math.min(bottom, dock.top)
  const region = !docScrolls() ? box.value?.closest('[data-ad-scroll-region]')?.getBoundingClientRect() : undefined
  if (region) { top = Math.max(top, region.top); bottom = Math.min(bottom, region.bottom) }
  return { top, bottom }
}

// On a page that scrolls on the document the native side moves the ad with the scroll itself, so what is sent is the
// ad's place *in the page* (y + scrollY never changes while scrolling) and the band it is cut to.
function place(r: { x: number; y: number; width: number; height: number }, b: { top: number; bottom: number }): Rect {
  if (props.overlay || !docScrolls()) return r as Rect
  return { ...r, clipTop: px(b.top), clipBottom: px(b.bottom), scrollY: px(window.scrollY) } as Rect
}
function placeKey(p: Record<string, number>) {
  return [p.x, p.scrollY === undefined ? p.y : p.y + p.scrollY, p.width, p.height, p.clipTop, p.clipBottom].join()
}

function refresh() {
  documentVisible.value = !document.hidden
  const r = box.value?.getBoundingClientRect()
  const b = band()
  if (!r) { inView.value = false; return }
  // On a document-scrolled page the ad may show partly: the native side cuts it at the band. Elsewhere it must fit.
  inView.value = !props.overlay && docScrolls()
    ? r.bottom > b.top && r.top < b.bottom
    : r.top >= b.top && r.bottom <= b.bottom
}

function track() {
  if (frame) return
  frame = requestAnimationFrame(() => {
    frame = 0
    refresh()
    const r = rect()
    if (!r || !canShow.value) return
    const p = place(r, band())
    const key = placeKey(p as unknown as Record<string, number>)
    if (key === lastKey) return
    lastKey = key
    void ALF.Instance.Ads.UpdateAdMobNativeAdRect(p)
  })
}

async function show() {
  const r = rect()
  if (!r) return
  const shown = await ALF.Instance.Ads.ShowAdMobNativeAd({
    template: props.template,
    rect: place(r, band()),
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
  state.value = 'ready'
  lastKey = ''
  refresh()
  const current = rect()
  if (!alive || !canShow.value || !current) await ALF.Instance.Ads.HideAdMobNativeAd()
  else { const p = place(current, band()); lastKey = placeKey(p as unknown as Record<string, number>); await ALF.Instance.Ads.UpdateAdMobNativeAdRect(p) }
}

// A page that does not scroll on the document hides the ad while it moves (the native view would trail the page by a
// frame) and shows it again once scrolling has stopped. Scrolling of unrelated lists is ignored.
function onScroll(event: Event) {
  if (props.overlay) return
  if (docScrolls()) return track()
  const target = event.target
  if (target instanceof Node && target !== document && box.value && !target.contains(box.value)) return
  scrolling.value = true
  clearTimeout(settle)
  settle = setTimeout(() => { scrolling.value = false; track() }, 300)
}

watch(canShow, visible => {
  if (!native || !alive) return
  if (visible) void show()
  else void ALF.Instance.Ads.HideAdMobNativeAd()
})

onMounted(() => {
  if (!native) return
  alive = true
  slowTimer = setTimeout(() => { if (state.value === 'loading') state.value = 'slow' }, LOADING_MS)
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
  clearTimeout(slowTimer)
  clearTimeout(settle)
  document.removeEventListener('scroll', onScroll, { capture: true })
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
    :class="state"
    :style="{ height: `${height}px` }"
    aria-hidden="true"
  />
</template>

<style scoped>
.native-slot { width: 100%; flex: none; overflow: hidden; border-radius: 24px; background: #e6f1e8; }
.native-slot.loading { background: linear-gradient(100deg, #e6f1e8 30%, #f4faf5 50%, #e6f1e8 70%) 0 0 / 200% 100%; animation: native-shimmer 1.4s linear infinite; }
@keyframes native-shimmer { to { background-position: -200% 0; } }
@media (prefers-reduced-motion: reduce) { .native-slot.loading { animation: none; } }
</style>
