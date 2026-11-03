<script setup lang="ts">
import { ref } from 'vue'
import { adsAvailable, showRewarded } from '../adRuntime'

// Wraps any button-like content: clicking plays a rewarded video and emits `rewarded` only
// when the viewer earned the reward. The slot is hidden when ads are unavailable (web, ads removed).
const props = defineProps<{ placement: string }>()
const emit = defineEmits<{ rewarded: []; skipped: [] }>()
const busy = ref(false)

async function play() {
  if (busy.value) return
  busy.value = true
  try {
    if (await showRewarded(props.placement)) emit('rewarded')
    else emit('skipped')
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <div v-if="adsAvailable" class="rewarded-ad" :aria-busy="busy" @click="play">
    <slot :busy="busy" />
  </div>
</template>

<style scoped>
.rewarded-ad { display: contents; }
</style>
