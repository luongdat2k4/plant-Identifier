import { computed, ref } from 'vue'
import { Capacitor } from '@capacitor/core'
import { ALF, ALFAdMob } from '@alf/app-sdk'
import { adsConfig, initAds } from './adsConfig'

const initialized = ref(false)
const consentReady = ref(false)
export const adsSuppressed = ref(false)
export const fullScreenShowing = ref(false)
// The full-screen native ad: the overlay is visible while `nativeOverlay` is set; page ads stay hidden for
// a moment longer (`nativeOverlayHold`) because the SDK has a single native ad view to hand over.
export const nativeOverlay = ref(false)
export const nativeOverlayHold = ref(false)
export const adsAvailable = computed(() => Capacitor.isNativePlatform() && initialized.value && (adsConfig.settings?.testAds === true || consentReady.value))

// Production callers must set this only after their consent flow says ads may be requested.
export function setAdConsentReady(ready: boolean) { consentReady.value = ready }
export function setAdsInitialized(ready: boolean) { initialized.value = ready }
export const launchFinished = ref(false)

let initialization: Promise<void> | undefined
export function initializeAds(): Promise<void> {
  return initialization ??= initAds()
    // Consent has no real flow yet (no UMP form): this is only a placeholder so adsAvailable cannot block silently
    // once testAds is off. Replace it with the consent result before shipping in the EU/UK.
    .then(() => { setAdsInitialized(true); setAdConsentReady(true); void preloadInterstitial() })
    .catch(error => console.warn('[ads] init failed', error))
}

let appOpenAttempted = false
let lastFullScreenAt = 0
let interstitialLoaded = false
let showing = false

export async function tryAppOpenOnLaunch(signal: AbortSignal): Promise<void> {
  if (appOpenAttempted || !Capacitor.isNativePlatform() || document.hidden || signal.aborted) return
  appOpenAttempted = true
  // One deadline covers SDK initialization, loading, readiness and listener setup.
  // A late load may finish in the cache, but must never show over the next screen.
  const deadline = Date.now() + 3000
  const withinDeadline = <T>(operation: Promise<T>) => waitFor(operation, Math.max(0, deadline - Date.now()), signal)
  let listener: Awaited<ReturnType<typeof ALFAdMob.addListener>> | undefined
  let ownsFullScreen = false
  try {
    await withinDeadline(initializeAds())
    if (!adsAvailable.value || await withinDeadline(ALF.Instance.Ads.IsAdsRemoved())) return
    const platform = Capacitor.getPlatform() === 'ios' ? 'ios' : 'android'
    const adUnitId = adsConfig.settings?.testAds === true
      ? (platform === 'ios' ? 'ca-app-pub-3940256099942544/5575463023' : 'ca-app-pub-3940256099942544/9257395921')
      : adsConfig.keys?.admob?.[platform]?.openApp
    if (!adUnitId) return
    await withinDeadline(ALFAdMob.loadOpenAppAd({ adUnitId }))
    const { ready } = await withinDeadline(ALFAdMob.isOpenAppAdReady({ adUnitId }))
    if (!ready) return
    let closed!: () => void
    const dismissed = new Promise<void>(resolve => { closed = resolve })
    // SDK 1.9.0's ShowAdMobAppOpenAd does not forward dismissal to its
    // controller close handlers. Subscribe to the native event directly.
    const pendingListener = ALFAdMob.addListener('OnOpenAppAdDismissedEvent', event => {
      if (event.adUnitId === adUnitId) closed()
    })
    void pendingListener.then(handle => {
      if (signal.aborted || Date.now() >= deadline) handle.remove()
    }, () => {})
    listener = await withinDeadline(pendingListener)
    if (signal.aborted || document.hidden || !adsAvailable.value || showing || Date.now() >= deadline) return
    showing = true
    ownsFullScreen = true
    fullScreenShowing.value = true
    lastFullScreenAt = Date.now()
    await withinDeadline(ALFAdMob.showOpenAppAd({ adUnitId }))
    // Showing resolves when the ad opens. Navigation must wait for dismissal.
    // The watchdog also releases the launch if the native callback is lost.
    await waitFor(dismissed, 120_000, signal)
  } catch (error) {
    if (!signal.aborted) console.warn('[ads] launch ad skipped', error)
  } finally {
    listener?.remove()
    if (ownsFullScreen) {
      lastFullScreenAt = Date.now()
      showing = false
      fullScreenShowing.value = false
    }
  }
}

async function waitFor<T>(operation: Promise<T>, timeout: number, signal: AbortSignal): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined
  let abort = () => {}
  try {
    return await Promise.race([operation, new Promise<never>((_, reject) => {
      abort = () => reject(new Error('Launch ad cancelled'))
      timer = setTimeout(() => reject(new Error('Launch ad timed out')), timeout)
      signal.addEventListener('abort', abort, { once: true })
      if (signal.aborted) abort()
    })])
  } finally {
    clearTimeout(timer)
    signal.removeEventListener('abort', abort)
  }
}

// Full-screen ads are spaced out so they can never stack into back-to-back ads: at least 10 seconds between any two.
const FULL_SCREEN_GAP_MS = 10_000

// Height the bottom banner takes, so the shell can lift the navigation bar above it. 0 while no banner is up.
export const bannerInset = ref(0)

export async function preloadInterstitial(): Promise<void> {
  if (!adsAvailable.value || interstitialLoaded || showing) return
  // This SDK exposes MAX interstitials and an AdMob test fallback only.
  if (adsConfig.settings?.testAds !== true) return
  try { await ALF.Instance.Ads.LoadInterstitial(); interstitialLoaded = true } catch { /* no fill */ }
}

// Shows a loaded interstitial for the placement, or silently does nothing; the next one is preloaded either way.
// A milestone ignores the spacing and waits for the ad to load instead of skipping it.
export async function showInterstitial(placement: string, milestone = false): Promise<boolean> {
  const now = Date.now()
  if (!adsAvailable.value || showing || document.hidden || (!milestone && now - lastFullScreenAt < FULL_SCREEN_GAP_MS)) return false
  if (!interstitialLoaded && milestone) await preloadInterstitial()
  if (!interstitialLoaded) { void preloadInterstitial(); return false }
  interstitialLoaded = false
  showing = true
  fullScreenShowing.value = true
  try {
    await ALF.Instance.Ads.ShowInterstitial(() => { showing = false; fullScreenShowing.value = false; lastFullScreenAt = Date.now(); void preloadInterstitial() }, placement)
    lastFullScreenAt = now
    return true
  } catch { showing = false; fullScreenShowing.value = false; return false }
}

const nextActionTarget = () => 2 + Math.floor(Math.random() * 2)
let actionsLeft = nextActionTarget()
// Called for each counted tap. Every 2-3 taps an interstitial is tried; when it cannot show yet (spacing, no ad loaded)
// the next tap tries again, and the counter restarts only once an ad was shown.
export function countAction(): void {
  if (--actionsLeft > 0) return
  // Let the tap's own handler finish first so the ad never lands on the control being pressed.
  setTimeout(() => { void showInterstitial('action_cycle').then(shown => { if (shown) actionsLeft = nextActionTarget() }) }, 350)
}

function openNativeOverlay(): boolean {
  if (!adsAvailable.value || !Capacitor.isNativePlatform() || showing || document.hidden || nativeOverlay.value ||
      Date.now() - lastFullScreenAt < FULL_SCREEN_GAP_MS) return false
  nativeOverlayHold.value = true
  nativeOverlay.value = true
  return true
}
export function closeNativeOverlay(): void {
  nativeOverlay.value = false
  lastFullScreenAt = Date.now()
  setTimeout(() => { nativeOverlayHold.value = false }, 400)
}

// Rewarded video: resolves true only when the viewer earned the reward. Resolves false when there is no ad,
// ads are off, another full-screen ad is showing, or the viewer skipped.
export async function showRewarded(placement: string): Promise<boolean> {
  if (!adsAvailable.value || showing || document.hidden) return false
  showing = true
  fullScreenShowing.value = true
  try {
    await ALF.Instance.Ads.LoadRewardedVideo()
    return await new Promise<boolean>(resolve => {
      void ALF.Instance.Ads.ShowRewardedVideo(result => resolve(result === 'rewarded'), placement).catch(() => resolve(false))
    })
  } catch {
    return false
  } finally {
    showing = false
    fullScreenShowing.value = false
    lastFullScreenAt = Date.now()
  }
}
