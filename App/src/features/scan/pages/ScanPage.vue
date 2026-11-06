<script setup lang="ts">
import { t } from '../../../shared/i18n'
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { Camera } from '@capacitor/camera'
import { CameraPreview } from '@capacitor-community/camera-preview'
import { Capacitor } from '@capacitor/core'
import { Icon } from '@iconify/vue'
import { state } from '../../../shared/store'
import { allSpecies, RARITY_META, type Species } from '../../collection/model'
import { hasFreeSlot, plantSeed } from '../../garden/model'
import { rollSeed, type Seed } from '../model'
import { useAppNavigation } from '../../../shared/composables/useAppNavigation'
import { useToast } from '../../../shared/composables/useToast'
import { showInterstitial } from '../../ads/adRuntime'
import { readImage } from '../../../shared/utils/readImage'
import { BAR, setStatusBar } from '../../../shared/utils/statusBar'
const { go } = useAppNavigation()
const { notify } = useToast()

// Native app: the phone's real camera streams into a surface *behind* the WebView (CameraPreview, toBack) and this
// page draws its own camera UI on top, so there is no system camera screen and the picture is sharp.
// Browser: the same screen uses a <video> element fed by getUserMedia.
type Phase = 'ask' | 'denied' | 'live' | 'scanning' | 'result'
const native = Capacitor.isNativePlatform()
const SCAN_MS = 3200
const phase = ref<Phase>('ask')
const video = ref<HTMLVideoElement | null>(null)
const photo = ref('')
const result = ref<{ seed: Seed; species: Species; isNew: boolean } | null>(null)
const torch = ref(false)
const step = ref(0)
const steps = computed(() => [
  t('scan.step1'),
  t('scan.step2', { n: String(allSpecies.length) }),
  t('scan.step3'),
  t('scan.step4'),
])
const hero = allSpecies.slice(0, 3)
const canPlant = computed(() => hasFreeSlot())
watch(phase, value => {
  if (value === 'ask' || value === 'denied') setStatusBar(BAR.scanAsk)
  else setStatusBar(BAR.camera, false)
})
let stream: MediaStream | null = null
let previewing = false
let finish: ReturnType<typeof setTimeout> | undefined
let stepTimers: ReturnType<typeof setTimeout>[] = []

// While the native preview runs, the page must be see-through so the camera behind it shows.
function setSeeThrough(on: boolean) { document.documentElement.classList.toggle('cam-live', on) }
function stopStream() {
  stream?.getTracks().forEach(track => track.stop())
  stream = null
  if (previewing) {
    previewing = false
    setSeeThrough(false)
    void CameraPreview.stop().catch(() => {})
  }
}
async function startNative() {
  try {
    const granted = await Camera.requestPermissions({ permissions: ['camera'] })
    if (granted.camera !== 'granted') return void (phase.value = 'denied')
    await CameraPreview.start({ position: 'rear', toBack: true, disableAudio: true, enableZoom: true })
    previewing = true
    setSeeThrough(true)
    phase.value = 'live'
  } catch { phase.value = 'denied' }
}
async function startCamera() {
  if (native) return startNative()
  // Live preview needs a secure context; the dev server over http://<LAN ip> is not one.
  if (!navigator.mediaDevices?.getUserMedia) return void (phase.value = 'denied')
  try {
    stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' }, width: { ideal: 1920 }, height: { ideal: 1080 } }, audio: false })
    phase.value = 'live'
    await new Promise(resolve => setTimeout(resolve, 0))
    if (video.value) { video.value.srcObject = stream; await video.value.play().catch(() => {}) }
  } catch { phase.value = 'denied' }
}
async function toggleTorch() {
  try {
    if (native) await CameraPreview.setFlashMode({ flashMode: torch.value ? 'off' : 'torch' })
    else await stream?.getVideoTracks()[0]?.applyConstraints({ advanced: [{ torch: !torch.value } as MediaTrackConstraintSet] })
    torch.value = !torch.value
  } catch { notify(t('toast.noFlash')) }
}
async function capture() {
  if (native) {
    try {
      const { value } = await CameraPreview.capture({ quality: 90 })
      scan(`data:image/jpeg;base64,${value}`)
    } catch { notify(t('toast.cameraNotReady')) }
    return
  }
  const el = video.value
  if (!el || !el.videoWidth) return notify(t('toast.cameraNotReady'))
  const ratio = Math.min(1, 1280 / Math.max(el.videoWidth, el.videoHeight))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(el.videoWidth * ratio)
  canvas.height = Math.round(el.videoHeight * ratio)
  canvas.getContext('2d')?.drawImage(el, 0, 0, canvas.width, canvas.height)
  scan(canvas.toDataURL('image/jpeg', .9))
}
async function pickFile(event: Event) {
  try { const image = await readImage(event); if (image) scan(image) }
  catch { notify(t('toast.imageTooBig')) }
}
function scan(image: string) {
  photo.value = image
  stopStream()
  phase.value = 'scanning'
  step.value = 1
  stepTimers = [.3, .6, .85].map((at, i) => setTimeout(() => { step.value = i + 2 }, SCAN_MS * at))
  finish = setTimeout(() => {
    try { result.value = rollSeed(); phase.value = 'result' }
    catch { notify(t('toast.seedError')); again() }
  }, SCAN_MS)
}
function plantNow() {
  if (!result.value) return
  const pot = plantSeed(result.value.seed.id)
  if (!pot) return notify(t('toast.noFreePot'))
  notify(t('toast.plantedSpecies', { name: result.value.species.name }))
  go('pot', pot.id)
  // The viewer has finished with the result: a natural break for the one allowed full-screen ad.
  void showInterstitial('scan_result')
}
function later() { notify(t('toast.seedSaved')); again(); void showInterstitial('scan_result') }
function again() {
  clearTimeout(finish); stepTimers.forEach(clearTimeout)
  photo.value = ''; result.value = null; torch.value = false
  phase.value = 'ask'
  startCamera()
}

onMounted(async () => {
  try {
    // Already allowed: the camera opens as soon as the screen does; otherwise the permission popup shows first.
    const allowed = native
      ? (await Camera.checkPermissions()).camera === 'granted'
      : (await navigator.permissions?.query({ name: 'camera' as PermissionName }))?.state === 'granted'
    if (allowed) startCamera()
  } catch { /* can't tell: wait for the user to tap Allow */ }
})
onUnmounted(() => { stopStream(); clearTimeout(finish); stepTimers.forEach(clearTimeout) })
</script>

<template>
  <main class="cam">
    <video v-show="phase === 'live'" ref="video" class="cam-media" autoplay playsinline muted></video>
    <img v-if="photo && (phase === 'scanning' || phase === 'result')" class="cam-media" :src="photo" :alt="t('scan.photoAlt')"/>

    <header class="cam-bar">
      <button class="round-btn" :aria-label="t('common.toGarden')" @click="go('garden')"><Icon icon="solar:arrow-left-linear" width="22"/></button>
      <button v-if="phase === 'live'" class="round-btn" :class="{ on: torch }" :aria-label="t('scan.flash')" @click="toggleTorch"><Icon icon="solar:flash-bold" width="22"/></button>
      <button v-else-if="phase !== 'scanning'" class="round-btn" :aria-label="t('scan.seedBag')" @click="go('seeds')"><Icon icon="solar:box-linear" width="22"/></button>
    </header>

    <p v-if="phase === 'live'" class="cam-hint">{{ t('scan.hint') }}</p>
    <template v-if="phase === 'live' || phase === 'scanning' || phase === 'result'">
      <div class="cam-frame">
        <i class="tl"></i><i class="tr"></i><i class="bl"></i><i class="br"></i>
        <div v-if="phase === 'scanning'" class="cam-fill" :style="{ animationDuration: `${SCAN_MS}ms` }"></div>
      </div>
    </template>

    <div v-if="phase === 'ask' || phase === 'denied'" class="cam-hero" aria-hidden="true">
      <i class="blob b1"></i><i class="blob b2"></i>
      <img v-for="(item, index) in hero" :key="item.id" :class="`leaf l${index + 1}`" :src="item.image" alt=""/>
      <i class="vf tl"></i><i class="vf tr"></i><i class="vf bl"></i><i class="vf br"></i>
    </div>

    <section v-if="phase === 'scanning'" class="cam-progress">
      <h2>{{ t('scan.identifying') }}</h2>
      <p>{{ t('scan.identifyingText') }}</p>
      <ul>
        <li v-for="(label, index) in steps" :key="label" :class="{ done: index < step }">
          <span>{{ label }}</span>
          <Icon v-if="index < step" icon="solar:check-circle-bold" width="24"/>
          <span v-else class="wait"><i></i><i></i><i></i></span>
        </li>
      </ul>
    </section>

    <section v-if="phase === 'ask' || phase === 'denied'" class="cam-ask">
      <span class="cam-ask-ic"><Icon :icon="phase === 'ask' ? 'solar:camera-bold' : 'solar:camera-minimalistic-linear'" width="40"/></span>
      <h2>{{ phase === 'ask' ? t('scan.askTitle') : t('scan.deniedTitle') }}</h2>
      <p>{{ phase === 'ask' ? t('scan.askText') : t('scan.deniedText') }}</p>
      <button class="dark-button full" @click="startCamera"><Icon icon="solar:camera-bold" width="20"/> {{ phase === 'ask' ? t('scan.allow') : t('scan.retry') }}</button>
      <label class="outline-button full">{{ t('scan.pickPhoto') }}<input type="file" accept="image/*" hidden @change="pickFile($event)"/></label>
    </section>

    <div v-if="phase === 'live'" class="cam-shutter">
      <label class="cam-side" :aria-label="t('scan.pickAria')"><Icon icon="solar:gallery-bold" width="24"/><input type="file" accept="image/*" hidden @change="pickFile($event)"/></label>
      <button class="cam-snap" :aria-label="t('scan.snapAria')" @click="capture"><i></i></button>
      <span class="cam-side ghost"></span>
    </div>

    <section v-if="phase === 'result' && result" class="cam-result">
      <div class="cam-card">
        <img :src="result.species.image" :alt="result.species.name"/>
        <div>
          <div class="result-head">
            <span class="rarity" :class="result.species.rarity">{{ RARITY_META[result.species.rarity].label }}</span>
            <span v-if="result.isNew" class="new-tag">{{ t('scan.newTag') }}</span>
          </div>
          <b>{{ result.species.name }}</b>
          <small>{{ result.species.scientificName }}</small>
        </div>
      </div>
      <dl class="cam-facts">
        <div><dt>{{ t('article.family') }}</dt><dd>{{ result.species.family }}</dd></div>
        <div><dt>{{ t('article.genus') }}</dt><dd>{{ result.species.scientificName.split(' ')[0] }}</dd></div>
        <div v-if="result.species.origin"><dt>{{ t('article.origin') }}</dt><dd>{{ result.species.origin }}</dd></div>
        <div><dt>{{ t('species.spot') }}</dt><dd>{{ result.species.preferredSpot === 'sun' ? t('spot.sun') : t('spot.shade') }}</dd></div>
      </dl>
      <p class="cam-desc">{{ result.species.description }}</p>
      <p class="cam-note">{{ result.isNew ? t('scan.newSpecies') : t('scan.knownSpecies') }}</p>
      <button class="dark-button full" :disabled="!canPlant" @click="plantNow"><Icon icon="solar:leaf-bold" width="20"/> {{ t('care.plantNow') }}</button>
      <p v-if="!canPlant" class="cam-note">{{ t('scan.gardenFull', { pots: String(state.pots.length), slots: String(state.potSlots) }) }}</p>
      <div class="scan-actions">
        <button class="outline-button" @click="later">{{ t('scan.later') }}</button>
        <button class="outline-button" @click="again">{{ t('scan.again') }}</button>
      </div>
    </section>
  </main>
</template>
