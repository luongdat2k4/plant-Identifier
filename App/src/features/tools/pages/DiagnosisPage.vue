<script setup lang="ts">
import { computed, ref } from 'vue'
import { Icon } from '@iconify/vue'
import { useAppNavigation } from '../../../shared/composables/useAppNavigation'
const { go, back } = useAppNavigation()
const symptom = ref('Yellow leaves')
const diagnosis = computed(() => ({
  'Yellow leaves': { title: 'Possible overwatering or low light', text: 'Check the top 2–3 cm of soil. If still wet, pause watering and ensure the pot drains well.' },
  'Brown tips': { title: 'Possible dry air or irregular watering', text: 'Check soil moisture and humidity. Trim only the dry portion of leaves.' },
  'Wilting': { title: 'Check the roots and soil', text: 'Wilting can follow either dry or waterlogged soil. Feel the soil before changing your schedule.' },
  'Spots': { title: 'Possible leaf disease or damage', text: 'Isolate the plant, remove heavily affected leaves and avoid wetting foliage.' },
  'Pests': { title: 'Inspect for insects', text: 'Look under leaves and around stems. Isolate the plant and gently rinse visible pests.' },
}[symptom.value] || { title: 'Check the plant', text: 'Observe the leaves, soil and light level.' }))
</script>

<template>
<header class="page-header"><button @click="back"><Icon icon="solar:arrow-left-linear" width="24"/></button><h2>Plant diagnosis</h2><span></span></header><main class="content tool-page"><div class="tool-intro"><img src="/assets/ic_fhl3_diseases_treatment.png" alt=""/><p class="eyebrow">PLANT HEALTH</p><h1>What's happening<br/>to your plant?</h1><p>Choose the symptom you notice most.</p></div><div class="chip-list"><button v-for="item in ['Yellow leaves','Brown tips','Wilting','Spots','Pests']" :key="item" :class="{ active: symptom === item }" @click="symptom = item">{{ item }}</button></div><div class="advice-card"><span>CARE SUGGESTION</span><h3>{{ diagnosis.title }}</h3><p>{{ diagnosis.text }}</p><small>This is a general guide, not an image or expert diagnosis.</small></div><button class="outline-button full" @click="go('scan', 'Disease')">Add a photo to history</button></main>
</template>
