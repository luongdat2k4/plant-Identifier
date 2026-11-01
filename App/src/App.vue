<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { Icon } from '@iconify/vue'
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera'
import { Capacitor } from '@capacitor/core'
import { addPlant, addScan, daysUntilWatering, deletePlant, state, today, waterPlant, type Plant } from './store'

type Tab = 'plants' | 'search' | 'scan' | 'blog' | 'menu'
type Screen = 'root' | 'editor' | 'detail' | 'scan' | 'diagnosis' | 'light' | 'water' | 'history' | 'article' | 'botanist'
const tab = ref<Tab>('plants')
const screen = ref<Screen>('root')
const selected = ref<string | null>(null)
const article = ref<string>('')
const toast = ref('')
const search = ref('')
const scanMode = ref<'Plant' | 'Disease' | 'Mushroom'>('Plant')
const scanImage = ref('')
const scanName = ref('')
const symptom = ref('Yellow leaves')
const lux = ref<number | null>(null)
const manualLux = ref(500)
const potSize = ref(15)
const temperature = ref(23)
const location = ref<'Indoor' | 'Outdoor'>('Indoor')
const editing = ref(false)
const form = ref({ name: '', scientificName: '', room: 'Living room', image: '', wateringDays: 7, lastWatered: today(), light: 'Medium' as Plant['light'], notes: '' })
const plant = computed(() => state.value.plants.find(p => p.id === selected.value))
const due = computed(() => state.value.plants.filter(p => daysUntilWatering(p) <= 0))
const soon = computed(() => state.value.plants.filter(p => daysUntilWatering(p) > 0).sort((a, b) => daysUntilWatering(a) - daysUntilWatering(b)))
const matches = computed(() => state.value.plants.filter(p => `${p.name} ${p.scientificName} ${p.room}`.toLowerCase().includes(search.value.toLowerCase())))
const waterEstimate = computed(() => {
  const base = Math.round(potSize.value * potSize.value * 0.45)
  const amount = Math.max(50, Math.round(base * (temperature.value > 28 ? 1.2 : 1) * (location.value === 'Outdoor' ? 1.2 : 1) / 10) * 10)
  return { amount, interval: Math.max(2, Math.round(7 * (potSize.value / 15) * (temperature.value > 28 ? .8 : 1) * (location.value === 'Outdoor' ? .8 : 1))) }
})
const lightLabel = computed(() => { const n = lux.value ?? manualLux.value; return n < 300 ? 'Low light' : n < 1000 ? 'Indirect light' : n < 5000 ? 'Bright indirect light' : 'Direct sunlight' })
const diagnosis = computed(() => ({
  'Yellow leaves': { title: 'Possible overwatering or low light', text: 'Check the top 2–3 cm of soil. If still wet, pause watering and ensure the pot drains well.' },
  'Brown tips': { title: 'Possible dry air or irregular watering', text: 'Check soil moisture and humidity. Trim only the dry portion of leaves.' },
  'Wilting': { title: 'Check the roots and soil', text: 'Wilting can follow either dry or waterlogged soil. Feel the soil before changing your schedule.' },
  'Spots': { title: 'Possible leaf disease or damage', text: 'Isolate the plant, remove heavily affected leaves and avoid wetting foliage.' },
  'Pests': { title: 'Inspect for insects', text: 'Look under leaves and around stems. Isolate the plant and gently rinse visible pests.' },
}[symptom.value] || { title: 'Check the plant', text: 'Observe the leaves, soil and light level.' }))
const articles = [
  { title: 'A simple guide to watering', tag: 'Plant care', image: '/assets/ic_scroll_card_1.png', text: 'Water when the soil needs it, not only by the calendar. Test the top layer and empty any water left in the saucer.' },
  { title: 'Finding the right light', tag: 'Light', image: '/assets/ic_fhl3_light_meter.png', text: 'Bright indirect light works well for many houseplants. Move a plant gradually and watch how its leaves respond.' },
  { title: 'Spotting early plant problems', tag: 'Plant health', image: '/assets/ic_plant_health_item_image.jpg', text: 'Changes in color, texture and growth can help you decide what to inspect next: soil moisture, light, roots and pests.' },
]
let toastTimer: ReturnType<typeof setTimeout> | undefined
function notify(message: string) { toast.value = message; clearTimeout(toastTimer); toastTimer = setTimeout(() => toast.value = '', 3200) }
function go(next: Screen) { screen.value = next; window.scrollTo(0, 0) }
function back() { screen.value = 'root'; scanImage.value = ''; window.scrollTo(0, 0) }
function chooseTab(next: Tab) { tab.value = next; screen.value = next === 'scan' ? 'scan' : 'root'; window.scrollTo(0, 0) }
function openAdd() { editing.value = false; form.value = { name: '', scientificName: '', room: 'Living room', image: '', wateringDays: 7, lastWatered: today(), light: 'Medium', notes: '' }; go('editor') }
function openEdit() { if (!plant.value) return; editing.value = true; form.value = { ...plant.value, image: plant.value.image || '' }; go('editor') }
function openPlant(id: string) { selected.value = id; go('detail') }
function savePlant() {
  if (!form.value.name.trim()) return notify('Enter a plant name')
  if (editing.value && plant.value) Object.assign(plant.value, { ...form.value, name: form.value.name.trim() })
  else selected.value = addPlant({ ...form.value, name: form.value.name.trim(), wateringDays: Math.max(1, Number(form.value.wateringDays) || 7) }).id
  notify('Plant saved'); go('detail')
}
function removePlant() { if (!plant.value) return; if (confirm(`Remove ${plant.value.name} from My plants?`)) { deletePlant(plant.value.id); notify('Plant removed'); back() } }
async function loadFile(event: Event, target: 'plant' | 'scan') {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return
  if (file.size > 8_000_000) return notify('Choose an image under 8 MB')
  const reader = new FileReader()
  reader.onload = () => {
    const picture = new Image()
    picture.onload = () => {
      const ratio = Math.min(1, 1280 / Math.max(picture.width, picture.height))
      const canvas = document.createElement('canvas')
      canvas.width = Math.round(picture.width * ratio); canvas.height = Math.round(picture.height * ratio)
      canvas.getContext('2d')?.drawImage(picture, 0, 0, canvas.width, canvas.height)
      const data = canvas.toDataURL('image/jpeg', .76)
      if (target === 'plant') form.value.image = data; else scanImage.value = data
    }
    picture.src = String(reader.result)
  }
  reader.readAsDataURL(file)
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
  if (scanName.value.trim() && scanMode.value === 'Plant') { form.value.name = scanName.value.trim(); form.value.image = scanImage.value; go('editor') }
  else go('history')
}
function onLight(event: Event) { const value = (event as Event & { value?: number }).value; if (typeof value === 'number') lux.value = Math.round(value) }
onMounted(() => window.addEventListener('devicelight', onLight))
onUnmounted(() => window.removeEventListener('devicelight', onLight))
</script>

<template>
  <div class="app-shell">
    <div class="status-space"></div>
    <template v-if="screen === 'root' && tab === 'plants'">
      <header class="topbar"><div><p class="eyebrow">YOUR GREEN SPACE</p><h1>My plants<span class="leaf-dot">✦</span></h1></div><button class="round-btn" aria-label="Open reminders" @click="go('history')"><Icon icon="solar:bell-linear" width="23"/></button></header>
      <main class="content">
        <div class="welcome-card"><div><span class="pill-light">PLANTIN CARE</span><h2>Let your plants<br/>thrive every day.</h2><p>Keep care easy, one plant at a time.</p><button class="dark-button" @click="openAdd">Add a plant <Icon icon="solar:arrow-right-linear"/></button></div><img src="/assets/ic_scroll_card_1.png" alt="Illustrated houseplant"/></div>
        <div class="section-heading"><div><p class="eyebrow">STAY ON TRACK</p><h2>Care today</h2></div><span class="count-badge">{{ due.length }} tasks</span></div>
        <div v-if="due.length" class="task-list"><div v-for="item in due" :key="item.id" class="task-row"><div class="task-icon"><Icon icon="solar:waterdrop-linear" width="22"/></div><div class="task-copy"><b>Water {{ item.name }}</b><span>{{ daysUntilWatering(item) < 0 ? `${Math.abs(daysUntilWatering(item))} days overdue` : 'Due today' }}</span></div><button class="small-action" @click="waterPlant(item.id); notify('Watering recorded')">Done</button></div></div>
        <div v-else class="empty-task"><Icon icon="solar:check-circle-bold" width="25"/><div><b>All caught up!</b><span>{{ state.plants.length ? 'Your plants are happy today.' : 'Add your first plant to start a care plan.' }}</span></div></div>
        <div class="section-heading"><div><p class="eyebrow">YOUR COLLECTION</p><h2>My plants <span class="subtle">{{ state.plants.length }}</span></h2></div><button class="text-action" @click="openAdd">+ Add new</button></div>
        <div v-if="state.plants.length" class="plant-grid"><button v-for="item in state.plants" :key="item.id" class="plant-card" @click="openPlant(item.id)"><img :src="item.image || '/assets/ic_no_plant_image.png'" :alt="item.name"/><div><b>{{ item.name }}</b><span>{{ item.room }}</span><small><Icon icon="solar:waterdrop-bold"/> {{ daysUntilWatering(item) <= 0 ? 'Water today' : `Water in ${daysUntilWatering(item)} days` }}</small></div></button></div>
        <button v-else class="empty-plants" @click="openAdd"><img src="/assets/ic_identification_history_empty_plants.png" alt=""/><strong>Your plant journey starts here</strong><span>Add a plant to track watering and care.</span><em>Add your first plant <Icon icon="solar:arrow-right-linear"/></em></button>
        <div v-if="soon.length" class="up-next"><h3>Coming up</h3><div v-for="item in soon.slice(0,3)" :key="item.id"><span>{{ item.name }}</span><b>{{ daysUntilWatering(item) }} days</b></div></div>
      </main>
    </template>

    <template v-else-if="screen === 'root' && tab === 'search'"><header class="topbar"><div><p class="eyebrow">EXPLORE</p><h1>Search plants</h1></div><button class="round-btn" @click="go('history')"><Icon icon="solar:history-linear" width="23"/></button></header><main class="content"><div class="searchbox"><Icon icon="solar:magnifer-linear" width="22"/><input v-model="search" placeholder="Search your plants by name or room"/></div><button class="photo-search" @click="scanMode = 'Plant'; go('scan')"><div><Icon icon="solar:camera-linear" width="23"/></div><span><b>Search by photo</b><small>Take or choose a plant picture</small></span><Icon icon="solar:alt-arrow-right-linear"/></button><div class="section-heading"><div><p class="eyebrow">YOUR LIBRARY</p><h2>{{ search ? 'Results' : 'Recent plants' }}</h2></div></div><div v-if="matches.length" class="result-list"><button v-for="item in matches" :key="item.id" @click="openPlant(item.id)"><img :src="item.image || '/assets/ic_no_plant_image.png'" alt=""/><span><b>{{ item.name }}</b><small>{{ item.scientificName || item.room }}</small></span><Icon icon="solar:alt-arrow-right-linear"/></button></div><div v-else class="search-empty"><Icon icon="solar:leaf-linear" width="36"/><h3>No plants found</h3><p>{{ state.plants.length ? 'Try another name, or add a new plant.' : 'Your library is empty. Start by adding a plant.' }}</p><button class="dark-button" @click="openAdd">Add a plant</button></div></main></template>

    <template v-else-if="screen === 'root' && tab === 'blog'"><header class="topbar"><div><p class="eyebrow">GROW YOUR KNOWLEDGE</p><h1>Plant care blog</h1></div></header><main class="content"><div class="blog-hero"><img src="/assets/ic_scroll_card_2.png" alt="Plant care illustration"/><span>PLANT CARE NOTES</span><h2>Small habits,<br/>healthier plants.</h2></div><div class="section-heading"><div><p class="eyebrow">LEARN</p><h2>Featured reads</h2></div></div><button v-for="item in articles" :key="item.title" class="article-row" @click="article = item.title; go('article')"><img :src="item.image" alt=""/><span><small>{{ item.tag }}</small><b>{{ item.title }}</b><em>Read article →</em></span></button></main></template>

    <template v-else-if="screen === 'root' && tab === 'menu'"><header class="topbar"><div><p class="eyebrow">EVERYTHING FOR YOUR PLANTS</p><h1>Explore</h1></div></header><main class="content"><div class="menu-banner"><div><span>PLANTIN TOOLS</span><h2>Care for every leaf.</h2><p>Helpful tools for your daily routine.</p></div><img src="/assets/ic_scroll_card_3.png" alt=""/></div><div class="section-heading"><div><p class="eyebrow">TOOLS</p><h2>Plant care</h2></div></div><div class="tool-grid"><button @click="go('diagnosis')"><img src="/assets/ic_fhl3_diseases_treatment.png" alt=""/><b>Diagnosis</b><span>Check symptoms</span></button><button @click="go('light')"><img src="/assets/ic_fhl3_light_meter.png" alt=""/><b>Light meter</b><span>Find the right spot</span></button><button @click="go('water')"><img src="/assets/ic_fhl3_watering_calculator.png" alt=""/><b>Watering calculator</b><span>Plan your routine</span></button><button @click="go('botanist')"><img src="/assets/ic_fhl3_ai_botanist.png" alt=""/><b>Botanist help</b><span>Care suggestions</span></button></div><div class="section-heading"><div><p class="eyebrow">ACCOUNT</p><h2>Settings</h2></div></div><div class="settings-list"><button @click="go('history')"><Icon icon="solar:history-linear"/> Scan history <Icon icon="solar:alt-arrow-right-linear"/></button><button @click="state.notifications = !state.notifications"><Icon icon="solar:bell-linear"/> Care reminders <span>{{ state.notifications ? 'On' : 'Off' }}</span></button><button @click="notify('PlantIn recreation • v1.0')"><Icon icon="solar:info-circle-linear"/> About <Icon icon="solar:alt-arrow-right-linear"/></button></div></main></template>

    <template v-else-if="screen === 'scan'"><header class="page-header"><button @click="back"><Icon icon="solar:arrow-left-linear" width="24"/></button><h2>Scan a plant</h2><button @click="go('history')"><Icon icon="solar:history-linear" width="23"/></button></header><main class="content scan-content"><p class="eyebrow">WHAT WOULD YOU LIKE TO DO?</p><div class="mode-tabs"><button v-for="mode in (['Plant','Disease','Mushroom'] as const)" :key="mode" :class="{ active: scanMode === mode }" @click="scanMode = mode">{{ mode }}</button></div><div class="camera-frame"><img v-if="scanImage" :src="scanImage" alt="Selected scan"/><template v-else><div class="camera-corners"><Icon :icon="scanMode === 'Disease' ? 'solar:health-linear' : 'solar:leaf-linear'" width="55"/><b>{{ scanMode === 'Plant' ? 'Identify a plant' : scanMode === 'Disease' ? 'Check plant health' : 'Explore mushrooms' }}</b><span>Place your subject in the frame and take a clear photo.</span></div></template></div><div class="scan-actions"><button class="dark-button" @click="takePhoto"><Icon icon="solar:camera-bold" width="20"/> Take photo</button><label class="outline-button">Choose photo<input id="scan-file" type="file" accept="image/*" hidden @change="loadFile($event, 'scan')"/></label></div><div v-if="scanImage" class="scan-result"><h3>Photo ready</h3><p>Automated identification requires the original PlantIn service. You can save this scan and enter a plant name yourself.</p><input v-if="scanMode === 'Plant'" v-model="scanName" placeholder="Plant name (optional)"/><button class="dark-button full" @click="saveScan">Save scan {{ scanName && scanMode === 'Plant' ? '& add plant' : '' }}</button></div><p class="scan-note">Tip: use a sharp photo with natural light. Do not use a photo alone to decide whether a mushroom is safe.</p></main></template>

    <template v-else-if="screen === 'editor'"><header class="page-header"><button @click="editing ? go('detail') : back()"><Icon icon="solar:arrow-left-linear" width="24"/></button><h2>{{ editing ? 'Edit plant' : 'Add a plant' }}</h2><span></span></header><main class="content form-page"><label class="image-picker"><img v-if="form.image" :src="form.image" alt="Plant"/><div v-else><Icon icon="solar:camera-add-linear" width="32"/><span>Add a photo</span></div><input type="file" accept="image/*" hidden @change="loadFile($event, 'plant')"/></label><div class="field"><label>Plant name <strong>*</strong></label><input v-model="form.name" placeholder="e.g. Monstera"/></div><div class="field"><label>Scientific name</label><input v-model="form.scientificName" placeholder="Optional"/></div><div class="field"><label>Space</label><input v-model="form.room" placeholder="Living room"/></div><div class="field"><label>Water every (days)</label><input v-model.number="form.wateringDays" type="number" min="1" max="365"/></div><div class="field"><label>Last watered</label><input v-model="form.lastWatered" type="date"/></div><div class="field"><label>Preferred light</label><select v-model="form.light"><option>Low</option><option>Medium</option><option>Bright</option></select></div><div class="field"><label>Notes</label><textarea v-model="form.notes" placeholder="Anything you want to remember"></textarea></div><button class="dark-button full save-button" @click="savePlant">Save plant</button></main></template>

    <template v-else-if="screen === 'detail' && plant"><header class="page-header"><button @click="back"><Icon icon="solar:arrow-left-linear" width="24"/></button><h2>Plant details</h2><button @click="openEdit"><Icon icon="solar:pen-linear" width="22"/></button></header><main class="content detail-page"><div class="detail-photo"><img :src="plant.image || '/assets/ic_no_plant_image.png'" :alt="plant.name"/></div><p class="eyebrow">MY PLANTS · {{ plant.room }}</p><h1>{{ plant.name }}</h1><p class="scientific">{{ plant.scientificName || 'Your plant' }}</p><div class="detail-summary"><div><Icon icon="solar:waterdrop-linear"/><span>Water</span><b>Every {{ plant.wateringDays }} days</b></div><div><Icon icon="solar:sun-2-linear"/><span>Light</span><b>{{ plant.light }}</b></div></div><div class="care-panel"><div><span class="eyebrow">NEXT CARE TASK</span><h3>{{ daysUntilWatering(plant) <= 0 ? 'Time to water' : `Water in ${daysUntilWatering(plant)} days` }}</h3><p>Last watered {{ plant.lastWatered }}</p></div><button class="dark-button" @click="waterPlant(plant.id); notify('Watering recorded')"><Icon icon="solar:waterdrop-bold"/> Mark watered</button></div><div v-if="plant.notes" class="notes-panel"><h3>Notes</h3><p>{{ plant.notes }}</p></div><button class="delete-button" @click="removePlant">Remove plant</button></main></template>

    <template v-else-if="screen === 'diagnosis'"><header class="page-header"><button @click="back"><Icon icon="solar:arrow-left-linear" width="24"/></button><h2>Plant diagnosis</h2><span></span></header><main class="content tool-page"><div class="tool-intro"><img src="/assets/ic_fhl3_diseases_treatment.png" alt=""/><p class="eyebrow">PLANT HEALTH</p><h1>What's happening<br/>to your plant?</h1><p>Choose the symptom you notice most.</p></div><div class="chip-list"><button v-for="item in ['Yellow leaves','Brown tips','Wilting','Spots','Pests']" :key="item" :class="{ active: symptom === item }" @click="symptom = item">{{ item }}</button></div><div class="advice-card"><span>CARE SUGGESTION</span><h3>{{ diagnosis.title }}</h3><p>{{ diagnosis.text }}</p><small>This is a general guide, not an image or expert diagnosis.</small></div><button class="outline-button full" @click="scanMode = 'Disease'; go('scan')">Add a photo to history</button></main></template>

    <template v-else-if="screen === 'light'"><header class="page-header"><button @click="back"><Icon icon="solar:arrow-left-linear" width="24"/></button><h2>Light meter</h2><span></span></header><main class="content tool-page"><div class="tool-intro"><img src="/assets/ic_fhl3_light_meter.png" alt=""/><p class="eyebrow">FIND THE PERFECT SPOT</p><h1>Measure your light</h1><p>Point your device toward the light your plant receives.</p></div><div class="meter-card"><Icon icon="solar:sun-2-bold" width="38"/><strong>{{ lux ?? manualLux }} <small>lux</small></strong><span>{{ lightLabel }}</span></div><div class="field"><label>{{ lux === null ? 'Your device has not provided a light reading. Enter a lux value:' : 'Adjust reading manually' }}</label><input v-model.number="manualLux" type="range" min="0" max="10000" step="50"/><div class="range-label"><span>Shade</span><span>Direct sun</span></div></div><p class="help-text">Ambient light sensors are available only on supported devices and browsers. This estimate is most useful under natural light.</p></main></template>

    <template v-else-if="screen === 'water'"><header class="page-header"><button @click="back"><Icon icon="solar:arrow-left-linear" width="24"/></button><h2>Watering calculator</h2><span></span></header><main class="content tool-page"><div class="tool-intro"><img src="/assets/ic_fhl3_watering_calculator.png" alt=""/><p class="eyebrow">SMARTER WATERING</p><h1>Build a starting plan</h1><p>Adjust this estimate to your plant and soil.</p></div><div class="field"><label>Pot diameter · {{ potSize }} cm</label><input v-model.number="potSize" type="range" min="6" max="40"/></div><div class="field"><label>Room temperature · {{ temperature }}°C</label><input v-model.number="temperature" type="range" min="10" max="38"/></div><div class="field"><label>Location</label><div class="segmented"><button :class="{ active: location === 'Indoor' }" @click="location = 'Indoor'">Indoor</button><button :class="{ active: location === 'Outdoor' }" @click="location = 'Outdoor'">Outdoor</button></div></div><div class="water-answer"><Icon icon="solar:waterdrop-bold" width="30"/><span>STARTING ESTIMATE</span><strong>{{ waterEstimate.amount }} ml</strong><p>Check soil about every {{ waterEstimate.interval }} days. Water thoroughly and let excess drain.</p></div><p class="help-text">The APK's live calculator rules and plant data are not available offline. This local estimate does not replace checking soil moisture.</p></main></template>

    <template v-else-if="screen === 'history'"><header class="page-header"><button @click="back"><Icon icon="solar:arrow-left-linear" width="24"/></button><h2>Scan history</h2><span></span></header><main class="content"><div v-if="state.scans.length" class="result-list history-list"><div v-for="item in state.scans" :key="item.id"><img :src="item.image" alt="Saved scan"/><span><b>{{ item.plantName || item.mode + ' scan' }}</b><small>{{ new Date(item.date).toLocaleDateString() }}</small></span><span class="history-type">{{ item.mode }}</span></div></div><div v-else class="search-empty"><img class="history-empty-image" src="/assets/ic_identification_history_empty_plants.png" alt=""/><h3>No scans yet</h3><p>Save a plant, disease or mushroom photo to see it here.</p><button class="dark-button" @click="go('scan')">Start a scan</button></div></main></template>

    <template v-else-if="screen === 'article'"><header class="page-header"><button @click="back"><Icon icon="solar:arrow-left-linear" width="24"/></button><h2>Plant care</h2><span></span></header><main class="content article-page" v-if="articles.find(a => a.title === article)"><img :src="articles.find(a => a.title === article)?.image" alt=""/><p class="eyebrow">{{ articles.find(a => a.title === article)?.tag }}</p><h1>{{ article }}</h1><p>{{ articles.find(a => a.title === article)?.text }}</p><div class="advice-card"><span>QUICK TIP</span><h3>Observe before you change your routine.</h3><p>A little time with your plant each week helps you notice what it needs.</p></div></main></template>

    <template v-else-if="screen === 'botanist'"><header class="page-header"><button @click="back"><Icon icon="solar:arrow-left-linear" width="24"/></button><h2>Botanist help</h2><span></span></header><main class="content tool-page"><div class="tool-intro"><img src="/assets/ic_fhl3_ai_botanist.png" alt=""/><p class="eyebrow">ASK ABOUT YOUR PLANT</p><h1>Find a next step</h1><p>Start with a symptom check or save a photo for your own records.</p></div><button class="menu-link" @click="go('diagnosis')"><Icon icon="solar:health-linear"/> Check symptoms <Icon icon="solar:alt-arrow-right-linear"/></button><button class="menu-link" @click="scanMode = 'Plant'; go('scan')"><Icon icon="solar:camera-linear"/> Add a plant photo <Icon icon="solar:alt-arrow-right-linear"/></button><p class="help-text">Live botanist and AI answers depend on PlantIn services and are not part of this offline build.</p></main></template>

    <nav v-if="screen === 'root' || screen === 'scan'" class="bottom-nav" aria-label="Main navigation"><button :class="{ active: tab === 'plants' && screen === 'root' }" @click="chooseTab('plants')"><Icon icon="solar:home-angle-linear" width="24"/><span>My plants</span></button><button :class="{ active: tab === 'search' && screen === 'root' }" @click="chooseTab('search')"><Icon icon="solar:magnifer-linear" width="24"/><span>Search</span></button><button class="scan-nav" :class="{ active: screen === 'scan' }" @click="chooseTab('scan')"><span><Icon icon="solar:camera-bold" width="25"/></span><em>Scan</em></button><button :class="{ active: tab === 'blog' && screen === 'root' }" @click="chooseTab('blog')"><Icon icon="solar:book-2-linear" width="24"/><span>Blog</span></button><button :class="{ active: tab === 'menu' && screen === 'root' }" @click="chooseTab('menu')"><Icon icon="solar:widget-linear" width="24"/><span>Menu</span></button></nav>
    <div v-if="toast" class="toast" role="status">{{ toast }}</div>
  </div>
</template>
