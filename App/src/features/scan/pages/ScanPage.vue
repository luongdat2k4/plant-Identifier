<script setup lang="ts">
import { computed, onUnmounted, ref } from 'vue'
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera'
import { Capacitor } from '@capacitor/core'
import { Icon } from '@iconify/vue'
import { state } from '../../../shared/store'
import { allSpecies, RARITY_META, type Species } from '../../collection/model'
import { hasFreeSlot, plantSeed } from '../../garden/model'
import { sowPhoto, type Seed } from '../model'
import { useAppNavigation } from '../../../shared/composables/useAppNavigation'
import { useToast } from '../../../shared/composables/useToast'
import { readImage } from '../../../shared/utils/readImage'
const { go } = useAppNavigation()
const { notify } = useToast()
const phase = ref<'idle' | 'rolling' | 'result'>('idle')
const photo = ref('')
const reel = ref(allSpecies[0].image)
const result = ref<{ seed: Seed; species: Species; isNew: boolean } | null>(null)
const canPlant = computed(() => hasFreeSlot())
let spin: ReturnType<typeof setInterval> | undefined
let finish: ReturnType<typeof setTimeout> | undefined

async function loadFile(event: Event) {
  try { const image = await readImage(event); if (image) photo.value = image }
  catch { notify('Hãy chọn ảnh nhỏ hơn 8 MB') }
}
async function takePhoto() {
  try {
    if (!Capacitor.isNativePlatform()) { document.getElementById('scan-file')?.click(); return }
    const shot = await Camera.getPhoto({ resultType: CameraResultType.DataUrl, source: CameraSource.Camera, quality: 70, width: 640 })
    photo.value = shot.dataUrl || ''
  } catch { notify('Không mở được camera. Hãy chọn ảnh có sẵn.') }
}
function sow() {
  if (!photo.value) return notify('Hãy thêm ảnh trước')
  phase.value = 'rolling'
  let i = 0
  spin = setInterval(() => { i = (i + 1) % allSpecies.length; reel.value = allSpecies[i].image }, 110)
  finish = setTimeout(() => {
    clearInterval(spin)
    result.value = sowPhoto(photo.value)
    phase.value = 'result'
  }, 1800)
}
function plantNow() {
  if (!result.value) return
  const pot = plantSeed(result.value.seed.id)
  if (!pot) return notify('Vườn đã hết chậu trống')
  notify(`Đã trồng ${result.value.species.name}`)
  go('pot', pot.id)
}
function later() { notify('Đã cất hạt vào túi'); again() }
function again() { photo.value = ''; result.value = null; phase.value = 'idle' }
onUnmounted(() => { clearInterval(spin); clearTimeout(finish) })
</script>

<template>
  <main class="scan-screen">
    <header class="hero-bar scan-bar">
      <button class="round-btn" aria-label="Về vườn" @click="go('garden')"><Icon icon="solar:arrow-left-linear" width="22"/></button>
      <button class="round-btn" aria-label="Túi hạt giống" @click="go('seeds')"><Icon icon="solar:box-linear" width="22"/></button>
    </header>

    <div class="viewfinder" :class="{ filled: photo || phase === 'rolling' }">
      <img v-if="phase === 'rolling'" class="reel" :src="reel" alt=""/>
      <img v-else-if="photo" :src="photo" alt="Ảnh đã chọn"/>
      <div v-else-if="phase === 'idle'" class="vf-hint">
        <Icon icon="solar:camera-add-linear" width="46"/>
        <span>Đặt bất cứ thứ gì vào khung</span>
      </div>
      <img v-else-if="result" class="result-img" :src="result.species.image" :alt="result.species.name"/>
      <i class="vf-corner tl"></i><i class="vf-corner tr"></i><i class="vf-corner bl"></i><i class="vf-corner br"></i>
    </div>

    <section class="scan-sheet">
      <template v-if="phase !== 'result'">
        <h2 class="sheet-title">Chụp ảnh nhận hạt</h2>
        <p v-if="phase === 'rolling'" class="rolling-text">Đang gieo hạt…</p>
        <button class="option-card primary" :disabled="phase === 'rolling'" @click="takePhoto">
          <span class="option-ic"><Icon icon="solar:camera-bold" width="24"/></span>
          <span class="option-text"><b>Chụp ảnh</b><small>Mỗi ảnh là một hạt giống ngẫu nhiên.</small></span>
        </button>
        <label class="option-card" :class="{ disabled: phase === 'rolling' }">
          <span class="option-ic soft"><Icon icon="solar:gallery-bold" width="24"/></span>
          <span class="option-text"><b>Chọn ảnh</b><small>Dùng ảnh có sẵn trong máy.</small></span>
          <input id="scan-file" type="file" accept="image/*" hidden :disabled="phase === 'rolling'" @change="loadFile($event)"/>
        </label>
        <button v-if="photo && phase === 'idle'" class="dark-button full sow-button" @click="sow"><Icon icon="solar:magic-stick-3-bold" width="20"/> Gieo hạt từ ảnh này</button>
        <p class="scan-note">Chụp bao nhiêu lần cũng được. Loài mới gặp sẽ được thêm vào bộ sưu tập.</p>
      </template>

      <template v-else-if="result">
        <div class="result-head">
          <span class="rarity" :class="result.species.rarity">{{ RARITY_META[result.species.rarity].label }}</span>
          <span v-if="result.isNew" class="new-tag">MỚI!</span>
        </div>
        <h2 class="sheet-title">{{ result.species.name }}</h2>
        <p class="scientific">{{ result.species.scientificName }}</p>
        <p class="result-note">{{ result.isNew ? 'Loài mới đã được thêm vào bộ sưu tập.' : 'Bạn đã gặp loài này. Hạt giống được cất vào túi.' }}</p>
        <button class="dark-button full" :disabled="!canPlant" @click="plantNow"><Icon icon="solar:leaf-bold" width="20"/> Trồng ngay</button>
        <p v-if="!canPlant" class="scan-note">Vườn đã đầy ({{ state.pots.length }}/{{ state.potSlots }} chậu). Hãy cất hạt và trồng sau.</p>
        <div class="scan-actions">
          <button class="outline-button" @click="later">Để sau</button>
          <button class="outline-button" @click="again">Chụp tiếp</button>
        </div>
      </template>
    </section>
  </main>
</template>
