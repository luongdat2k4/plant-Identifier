<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera'
import { Capacitor } from '@capacitor/core'
import { Icon } from '@iconify/vue'
import { addScan } from '../model'
import { scanDraft } from '../../../shared/state/scanDraft'
import { useAppNavigation } from '../../../shared/composables/useAppNavigation'
import { useToast } from '../../../shared/composables/useToast'
import { readImage } from '../../../shared/utils/readImage'
const route = useRoute()
const { go, back } = useAppNavigation()
const { notify } = useToast()
const scanMode = ref<'Plant' | 'Disease' | 'Mushroom'>('Plant')
const scanImage = ref('')
const scanName = ref('')
watch(() => route.query.mode, mode => { scanMode.value = mode === 'Disease' || mode === 'Mushroom' ? mode : 'Plant' }, { immediate: true })
async function loadFile(event: Event) {
  try { const image = await readImage(event); if (image) scanImage.value = image }
  catch { notify('Choose an image under 8 MB') }
}
async function takePhoto() {
  try {
    if (!Capacitor.isNativePlatform()) { document.getElementById('scan-file')?.click(); return }
    const photo = await Camera.getPhoto({ resultType: CameraResultType.DataUrl, source: CameraSource.Camera, quality: 75, width: 1280 })
    scanImage.value = photo.dataUrl || ''
  } catch { notify('Camera unavailable. Choose a photo instead.') }
}
function saveScan() {
  if (!scanImage.value) return notify('Add a photo first')
  addScan({ mode: scanMode.value, image: scanImage.value, plantName: scanName.value.trim() || undefined })
  notify('Scan saved to history')
  if (scanName.value.trim() && scanMode.value === 'Plant') { scanDraft.value = { name: scanName.value.trim(), image: scanImage.value }; go('editor') }
  else go('history')
}
</script>

<template>
<header class="page-header"><button @click="back"><Icon icon="solar:arrow-left-linear" width="24"/></button><h2>Scan a plant</h2><button @click="go('history')"><Icon icon="solar:history-linear" width="23"/></button></header><main class="content scan-content"><p class="eyebrow">WHAT WOULD YOU LIKE TO DO?</p><div class="mode-tabs"><button v-for="mode in (['Plant','Disease','Mushroom'] as const)" :key="mode" :class="{ active: scanMode === mode }" @click="scanMode = mode">{{ mode }}</button></div><div class="camera-frame"><img v-if="scanImage" :src="scanImage" alt="Selected scan"/><template v-else><div class="camera-corners"><Icon :icon="scanMode === 'Disease' ? 'solar:health-linear' : 'solar:leaf-linear'" width="55"/><b>{{ scanMode === 'Plant' ? 'Identify a plant' : scanMode === 'Disease' ? 'Check plant health' : 'Explore mushrooms' }}</b><span>Place your subject in the frame and take a clear photo.</span></div></template></div><div class="scan-actions"><button class="dark-button" @click="takePhoto"><Icon icon="solar:camera-bold" width="20"/> Take photo</button><label class="outline-button">Choose photo<input id="scan-file" type="file" accept="image/*" hidden @change="loadFile($event)"/></label></div><div v-if="scanImage" class="scan-result"><h3>Photo ready</h3><p>Automated identification requires the original PlantIn service. You can save this scan and enter a plant name yourself.</p><input v-if="scanMode === 'Plant'" v-model="scanName" placeholder="Plant name (optional)"/><button class="dark-button full" @click="saveScan">Save scan {{ scanName && scanMode === 'Plant' ? '& add plant' : '' }}</button></div><p class="scan-note">Tip: use a sharp photo with natural light. Do not use a photo alone to decide whether a mushroom is safe.</p></main>
</template>
