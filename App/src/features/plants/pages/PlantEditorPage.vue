<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { Icon } from '@iconify/vue'
import { state } from '../../../shared/store'
import { addPlant, today, type Plant } from '../model'
import { scanDraft } from '../../../shared/state/scanDraft'
import { useAppNavigation } from '../../../shared/composables/useAppNavigation'
import { useToast } from '../../../shared/composables/useToast'
import { readImage } from '../../../shared/utils/readImage'
const route = useRoute()
const { go, back } = useAppNavigation()
const { notify } = useToast()
const editing = ref(false)
const form = ref(emptyForm())
function emptyForm() { return { name: '', scientificName: '', room: 'Living room', image: '', wateringDays: 7, lastWatered: today(), light: 'Medium' as Plant['light'], notes: '' } }
function reset() {
  const id = String(route.params.id || '')
  const plant = state.value.plants.find(p => p.id === id)
  editing.value = !!plant
  form.value = plant ? { ...plant, image: plant.image || '' } : emptyForm()
  if (!plant && scanDraft.value) { form.value.name = scanDraft.value.name; form.value.image = scanDraft.value.image; scanDraft.value = null }
}
watch(() => route.fullPath, reset, { immediate: true })
function savePlant() {
  if (!form.value.name.trim()) return notify('Enter a plant name')
  const id = String(route.params.id || '')
  const plant = state.value.plants.find(p => p.id === id)
  let savedId: string
  if (plant) { Object.assign(plant, { ...form.value, name: form.value.name.trim(), wateringDays: Math.max(1, Number(form.value.wateringDays) || 7) }); savedId = plant.id }
  else savedId = addPlant({ ...form.value, name: form.value.name.trim(), wateringDays: Math.max(1, Number(form.value.wateringDays) || 7) }).id
  notify('Plant saved'); go('detail', savedId)
}
async function loadFile(event: Event) {
  try { const image = await readImage(event); if (image) form.value.image = image }
  catch { notify('Choose an image under 8 MB') }
}
</script>

<template>
<header class="page-header"><button @click="editing ? go('detail', String(route.params.id)) : back()"><Icon icon="solar:arrow-left-linear" width="24"/></button><h2>{{ editing ? 'Edit plant' : 'Add a plant' }}</h2><span></span></header><main class="content form-page"><label class="image-picker"><img v-if="form.image" :src="form.image" alt="Plant"/><div v-else><Icon icon="solar:camera-add-linear" width="32"/><span>Add a photo</span></div><input type="file" accept="image/*" hidden @change="loadFile($event)"/></label><div class="field"><label>Plant name <strong>*</strong></label><input v-model="form.name" placeholder="e.g. Monstera"/></div><div class="field"><label>Scientific name</label><input v-model="form.scientificName" placeholder="Optional"/></div><div class="field"><label>Space</label><input v-model="form.room" placeholder="Living room"/></div><div class="field"><label>Water every (days)</label><input v-model.number="form.wateringDays" type="number" min="1" max="365"/></div><div class="field"><label>Last watered</label><input v-model="form.lastWatered" type="date"/></div><div class="field"><label>Preferred light</label><select v-model="form.light"><option>Low</option><option>Medium</option><option>Bright</option></select></div><div class="field"><label>Notes</label><textarea v-model="form.notes" placeholder="Anything you want to remember"></textarea></div><button class="dark-button full save-button" @click="savePlant">Save plant</button></main>
</template>
