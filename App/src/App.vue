<script setup lang="ts">
import { computed, onMounted, onUnmounted, watch } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import BottomNav from './shared/components/BottomNav.vue'
import { useToast } from './shared/composables/useToast'
import { tickAll } from './features/garden/model'
import { setStatusBar } from './shared/utils/statusBar'
const route = useRoute()
const { toast, notify } = useToast()
const isCamera = computed(() => route.name === 'scan')
const showNav = computed(() => ['garden', 'collection', 'seeds', 'menu'].includes(String(route.name)))

watch(() => route.fullPath, () => { if (route.meta.bar) setStatusBar(String(route.meta.bar)) }, { immediate: true })

function refreshPots() {
  const died = tickAll()
  if (died.length) notify(`${died.join(', ')} đã ngủ đông. Hạt giống đã quay về túi hạt.`)
}
function onVisible() { if (!document.hidden) refreshPots() }
let timer: ReturnType<typeof setInterval> | undefined
onMounted(() => {
  refreshPots()
  timer = setInterval(refreshPots, 60000)
  document.addEventListener('visibilitychange', onVisible)
})
onUnmounted(() => { clearInterval(timer); document.removeEventListener('visibilitychange', onVisible) })
</script>

<template>
  <div class="app-shell" :class="{ 'has-nav': showNav }">
    <div v-if="!isCamera" class="status-space"></div>
    <RouterView />
    <BottomNav v-if="showNav" />
    <div v-if="toast" class="toast" role="status">{{ toast }}</div>
  </div>
</template>
