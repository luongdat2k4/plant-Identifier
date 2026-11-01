<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { Icon } from '@iconify/vue'
import { state } from '../../../shared/store'
import { daysUntilWatering, deletePlant, waterPlant } from '../model'
import { useAppNavigation } from '../../../shared/composables/useAppNavigation'
import { useToast } from '../../../shared/composables/useToast'
const route = useRoute()
const { go, back } = useAppNavigation()
const { notify } = useToast()
const plant = computed(() => state.value.plants.find(p => p.id === route.params.id))
function openEdit() { if (plant.value) go('edit', plant.value.id) }
function removePlant() { if (!plant.value) return; if (confirm(`Remove ${plant.value.name} from My plants?`)) { deletePlant(plant.value.id); notify('Plant removed'); go('plants') } }
</script>

<template>
<template v-if="plant">
<header class="page-header"><button @click="back"><Icon icon="solar:arrow-left-linear" width="24"/></button><h2>Plant details</h2><button @click="openEdit"><Icon icon="solar:pen-linear" width="22"/></button></header><main class="content detail-page"><div class="detail-photo"><img :src="plant.image || '/assets/ic_no_plant_image.png'" :alt="plant.name"/></div><p class="eyebrow">MY PLANTS · {{ plant.room }}</p><h1>{{ plant.name }}</h1><p class="scientific">{{ plant.scientificName || 'Your plant' }}</p><div class="detail-summary"><div><Icon icon="solar:waterdrop-linear"/><span>Water</span><b>Every {{ plant.wateringDays }} days</b></div><div><Icon icon="solar:sun-2-linear"/><span>Light</span><b>{{ plant.light }}</b></div></div><div class="care-panel"><div><span class="eyebrow">NEXT CARE TASK</span><h3>{{ daysUntilWatering(plant) <= 0 ? 'Time to water' : `Water in ${daysUntilWatering(plant)} days` }}</h3><p>Last watered {{ plant.lastWatered }}</p></div><button class="dark-button" @click="waterPlant(plant.id); notify('Watering recorded')"><Icon icon="solar:waterdrop-bold"/> Mark watered</button></div><div v-if="plant.notes" class="notes-panel"><h3>Notes</h3><p>{{ plant.notes }}</p></div><button class="delete-button" @click="removePlant">Remove plant</button></main>
</template>
<main v-else class="content search-empty"><h3>Plant not found</h3><button class="dark-button" @click="go('plants')">My plants</button></main>
</template>
