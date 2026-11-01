<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { Icon } from '@iconify/vue'
import { useAppNavigation } from '../../../shared/composables/useAppNavigation'
const { go, back } = useAppNavigation()
const lux = ref<number | null>(null)
const manualLux = ref(500)
const lightLabel = computed(() => { const n = lux.value ?? manualLux.value; return n < 300 ? 'Low light' : n < 1000 ? 'Indirect light' : n < 5000 ? 'Bright indirect light' : 'Direct sunlight' })
function onLight(event: Event) { const value = (event as Event & { value?: number }).value; if (typeof value === 'number') lux.value = Math.round(value) }
onMounted(() => window.addEventListener('devicelight', onLight))
onUnmounted(() => window.removeEventListener('devicelight', onLight))
</script>

<template>
<header class="page-header"><button @click="back"><Icon icon="solar:arrow-left-linear" width="24"/></button><h2>Light meter</h2><span></span></header><main class="content tool-page"><div class="tool-intro"><img src="/assets/ic_fhl3_light_meter.png" alt=""/><p class="eyebrow">FIND THE PERFECT SPOT</p><h1>Measure your light</h1><p>Point your device toward the light your plant receives.</p></div><div class="meter-card"><Icon icon="solar:sun-2-bold" width="38"/><strong>{{ lux ?? manualLux }} <small>lux</small></strong><span>{{ lightLabel }}</span></div><div class="field"><label>{{ lux === null ? 'Your device has not provided a light reading. Enter a lux value:' : 'Adjust reading manually' }}</label><input v-model.number="manualLux" type="range" min="0" max="10000" step="50"/><div class="range-label"><span>Shade</span><span>Direct sun</span></div></div><p class="help-text">Ambient light sensors are available only on supported devices and browsers. This estimate is most useful under natural light.</p></main>
</template>
