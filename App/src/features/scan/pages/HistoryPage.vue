<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { state } from '../../../shared/store'
import { useAppNavigation } from '../../../shared/composables/useAppNavigation'
const { go, back } = useAppNavigation()
</script>

<template>
<header class="page-header"><button @click="back"><Icon icon="solar:arrow-left-linear" width="24"/></button><h2>Scan history</h2><span></span></header><main class="content"><div v-if="state.scans.length" class="result-list history-list"><div v-for="item in state.scans" :key="item.id"><img :src="item.image" alt="Saved scan"/><span><b>{{ item.plantName || item.mode + ' scan' }}</b><small>{{ new Date(item.date).toLocaleDateString() }}</small></span><span class="history-type">{{ item.mode }}</span></div></div><div v-else class="search-empty"><img class="history-empty-image" src="/assets/ic_identification_history_empty_plants.png" alt=""/><h3>No scans yet</h3><p>Save a plant, disease or mushroom photo to see it here.</p><button class="dark-button" @click="go('scan')">Start a scan</button></div></main>
</template>
