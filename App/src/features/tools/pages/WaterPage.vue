<script setup lang="ts">
import { computed, ref } from 'vue'
import { Icon } from '@iconify/vue'
import { useAppNavigation } from '../../../shared/composables/useAppNavigation'
const { go, back } = useAppNavigation()
const potSize = ref(15)
const temperature = ref(23)
const location = ref<'Indoor' | 'Outdoor'>('Indoor')
const waterEstimate = computed(() => {
  const base = Math.round(potSize.value * potSize.value * 0.45)
  const amount = Math.max(50, Math.round(base * (temperature.value > 28 ? 1.2 : 1) * (location.value === 'Outdoor' ? 1.2 : 1) / 10) * 10)
  return { amount, interval: Math.max(2, Math.round(7 * (potSize.value / 15) * (temperature.value > 28 ? .8 : 1) * (location.value === 'Outdoor' ? .8 : 1))) }
})
</script>

<template>
<header class="page-header"><button @click="back"><Icon icon="solar:arrow-left-linear" width="24"/></button><h2>Watering calculator</h2><span></span></header><main class="content tool-page"><div class="tool-intro"><img src="/assets/ic_fhl3_watering_calculator.png" alt=""/><p class="eyebrow">SMARTER WATERING</p><h1>Build a starting plan</h1><p>Adjust this estimate to your plant and soil.</p></div><div class="field"><label>Pot diameter · {{ potSize }} cm</label><input v-model.number="potSize" type="range" min="6" max="40"/></div><div class="field"><label>Room temperature · {{ temperature }}°C</label><input v-model.number="temperature" type="range" min="10" max="38"/></div><div class="field"><label>Location</label><div class="segmented"><button :class="{ active: location === 'Indoor' }" @click="location = 'Indoor'">Indoor</button><button :class="{ active: location === 'Outdoor' }" @click="location = 'Outdoor'">Outdoor</button></div></div><div class="water-answer"><Icon icon="solar:waterdrop-bold" width="30"/><span>STARTING ESTIMATE</span><strong>{{ waterEstimate.amount }} ml</strong><p>Check soil about every {{ waterEstimate.interval }} days. Water thoroughly and let excess drain.</p></div><p class="help-text">The APK's live calculator rules and plant data are not available offline. This local estimate does not replace checking soil moisture.</p></main>
</template>
