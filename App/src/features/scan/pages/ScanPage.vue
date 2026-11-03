<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera'
import { Capacitor } from '@capacitor/core'
import { Icon } from '@iconify/vue'
import { state } from '../../../shared/store'
import { RARITY_META, type Species } from '../../collection/model'
import { hasFreeSlot, plantSeed } from '../../garden/model'
import { rollSeed, type Seed } from '../model'
import { useAppNavigation } from '../../../shared/composables/useAppNavigation'
import { useToast } from '../../../shared/composables/useToast'
import { readImage } from '../../../shared/utils/readImage'
const { go } = useAppNavigation()
const { notify } = useToast()

type Phase = 'ask' | 'denied' | 'live' | 'scanning' | 'result'
const SCAN_MS = 2200
const phase = ref<Phase>('ask')
const video = ref<HTMLVideoElement | null>(null)
const photo = ref('')
const result = ref<{ seed: Seed; species: Species; isNew: boolean } | null>(null)
const torch = ref(false)
const canPlant = computed(() => hasFreeSlot())
let stream: MediaStream | null = null
let finish: ReturnType<typeof setTimeout> | undefined

function stopStream() {
  stream?.getTracks().forEach(track => track.stop())
  stream = null
}
async function startCamera() {
  const native = Capacitor.isNativePlatform()
  if (native) {
    try {
      const granted = await Camera.requestPermissions({ permissions: ['camera'] })
      if (granted.camera === 'denied') return void (phase.value = 'denied')
    } catch { /* manifest may be outdated: still try the camera below */ }
  }
  // Live preview needs a secure context; the dev server over http://<LAN ip> is not one.
  if (!navigator.mediaDevices?.getUserMedia) {
    if (native) return openSystemCamera()
    return void (phase.value = 'denied')
  }
  try {
    stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' } }, audio: false })
    phase.value = 'live'
    await new Promise(resolve => setTimeout(resolve, 0))
    if (video.value) { video.value.srcObject = stream; await video.value.play().catch(() => {}) }
  } catch { native ? openSystemCamera() : (phase.value = 'denied') }
}
async function openSystemCamera() {
  try {
    const shot = await Camera.getPhoto({ resultType: CameraResultType.DataUrl, source: CameraSource.Camera, quality: 70, width: 640 })
    if (shot.dataUrl) scan(shot.dataUrl)
    else phase.value = 'ask'
  } catch (error) { phase.value = /cancel/i.test(String((error as Error)?.message)) ? 'ask' : 'denied' }
}
async function toggleTorch() {
  const track = stream?.getVideoTracks()[0]
  try {
    await track?.applyConstraints({ advanced: [{ torch: !torch.value } as MediaTrackConstraintSet] })
    torch.value = !torch.value
  } catch { notify('Thiết bị không hỗ trợ đèn flash') }
}
function capture() {
  const el = video.value
  if (!el || !el.videoWidth) return notify('Camera chưa sẵn sàng')
  const ratio = Math.min(1, 640 / Math.max(el.videoWidth, el.videoHeight))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(el.videoWidth * ratio)
  canvas.height = Math.round(el.videoHeight * ratio)
  canvas.getContext('2d')?.drawImage(el, 0, 0, canvas.width, canvas.height)
  scan(canvas.toDataURL('image/jpeg', .76))
}
async function pickFile(event: Event) {
  try { const image = await readImage(event); if (image) scan(image) }
  catch { notify('Hãy chọn ảnh nhỏ hơn 8 MB') }
}
function scan(image: string) {
  photo.value = image
  stopStream()
  phase.value = 'scanning'
  finish = setTimeout(() => {
    try { result.value = rollSeed(); phase.value = 'result' }
    catch { notify('Có lỗi khi gieo hạt, hãy thử lại'); again() }
  }, SCAN_MS)
}
function plantNow() {
  if (!result.value) return
  const pot = plantSeed(result.value.seed.id)
  if (!pot) return notify('Vườn đã hết chậu trống')
  notify(`Đã trồng ${result.value.species.name}`)
  go('pot', pot.id)
}
function later() { notify('Đã cất hạt vào túi'); again() }
function again() {
  clearTimeout(finish)
  photo.value = ''; result.value = null; torch.value = false
  phase.value = 'ask'
  startCamera()
}

onMounted(async () => {
  try {
    const status = await navigator.permissions?.query({ name: 'camera' as PermissionName })
    if (status?.state === 'granted') startCamera()
  } catch { /* browser can't tell: wait for the user to tap Allow */ }
})
onUnmounted(() => { stopStream(); clearTimeout(finish) })
</script>

<template>
  <main class="cam">
    <video v-show="phase === 'live'" ref="video" class="cam-media" autoplay playsinline muted></video>
    <img v-if="photo && (phase === 'scanning' || phase === 'result')" class="cam-media" :src="photo" alt="Ảnh vừa chụp"/>
    <div v-if="phase === 'scanning'" class="cam-sweep" :style="{ animationDuration: `${SCAN_MS}ms` }"></div>

    <header class="cam-bar">
      <button class="round-btn" aria-label="Về vườn" @click="go('garden')"><Icon icon="solar:arrow-left-linear" width="22"/></button>
      <button v-if="phase === 'live'" class="round-btn" :class="{ on: torch }" aria-label="Đèn flash" @click="toggleTorch"><Icon icon="solar:flash-bold" width="22"/></button>
      <button v-else-if="phase !== 'scanning'" class="round-btn" aria-label="Túi hạt giống" @click="go('seeds')"><Icon icon="solar:box-linear" width="22"/></button>
    </header>

    <p v-if="phase === 'scanning'" class="cam-status">ĐANG QUÉT<span class="dots"></span></p>
    <template v-if="phase === 'live' || phase === 'scanning' || phase === 'result'">
      <div class="cam-frame"><i class="tl"></i><i class="tr"></i><i class="bl"></i><i class="br"></i></div>
    </template>

    <section v-if="phase === 'ask' || phase === 'denied'" class="cam-ask">
      <span class="cam-ask-ic"><Icon :icon="phase === 'ask' ? 'solar:camera-bold' : 'solar:camera-minimalistic-linear'" width="40"/></span>
      <h2>{{ phase === 'ask' ? 'Cho phép dùng camera' : 'Chưa truy cập được camera' }}</h2>
      <p>{{ phase === 'ask' ? 'PlantIn cần camera để chụp ảnh và gieo hạt giống ngẫu nhiên cho bạn. Ảnh chỉ lưu trong máy.' : 'Hãy cấp quyền camera trong cài đặt của máy, hoặc chọn một ảnh có sẵn.' }}</p>
      <button class="dark-button full" @click="startCamera"><Icon icon="solar:camera-bold" width="20"/> {{ phase === 'ask' ? 'Cho phép' : 'Thử lại' }}</button>
      <label class="outline-button full">Chọn ảnh từ thư viện<input type="file" accept="image/*" hidden @change="pickFile($event)"/></label>
    </section>

    <div v-if="phase === 'live'" class="cam-shutter">
      <label class="cam-side" aria-label="Chọn ảnh"><Icon icon="solar:gallery-bold" width="24"/><input type="file" accept="image/*" hidden @change="pickFile($event)"/></label>
      <button class="cam-snap" aria-label="Chụp ảnh" @click="capture"><i></i></button>
      <span class="cam-side ghost"></span>
    </div>

    <section v-if="phase === 'result' && result" class="cam-result">
      <div class="cam-card">
        <img :src="result.species.image" :alt="result.species.name"/>
        <div>
          <div class="result-head">
            <span class="rarity" :class="result.species.rarity">{{ RARITY_META[result.species.rarity].label }}</span>
            <span v-if="result.isNew" class="new-tag">MỚI!</span>
          </div>
          <b>{{ result.species.name }}</b>
          <small>{{ result.species.scientificName }}</small>
        </div>
      </div>
      <p class="cam-note">{{ result.isNew ? 'Loài mới đã được thêm vào bộ sưu tập.' : 'Bạn đã gặp loài này. Hạt giống được cất vào túi.' }}</p>
      <button class="dark-button full" :disabled="!canPlant" @click="plantNow"><Icon icon="solar:leaf-bold" width="20"/> Trồng ngay</button>
      <p v-if="!canPlant" class="cam-note">Vườn đã đầy ({{ state.pots.length }}/{{ state.potSlots }} chậu). Hãy cất hạt và trồng sau.</p>
      <div class="scan-actions">
        <button class="outline-button" @click="later">Để sau</button>
        <button class="outline-button" @click="again">Chụp tiếp</button>
      </div>
    </section>
  </main>
</template>
