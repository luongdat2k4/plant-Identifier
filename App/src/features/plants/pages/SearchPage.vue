<script setup lang="ts">
import { computed, ref } from 'vue'
import { Icon } from '@iconify/vue'
import { state } from '../../../shared/store'
import { useAppNavigation } from '../../../shared/composables/useAppNavigation'
const { go } = useAppNavigation()
const search = ref('')
const matches = computed(() => state.value.plants.filter(p => `${p.name} ${p.scientificName} ${p.room}`.toLowerCase().includes(search.value.toLowerCase())))
function openAdd() { go('editor') }
function openPlant(id: string) { go('detail', id) }
</script>

<template>
<header class="topbar"><div><p class="eyebrow">EXPLORE</p><h1>Search plants</h1></div><button class="round-btn" @click="go('history')"><Icon icon="solar:history-linear" width="23"/></button></header><main class="content"><div class="searchbox"><Icon icon="solar:magnifer-linear" width="22"/><input v-model="search" placeholder="Search your plants by name or room"/></div><button class="photo-search" @click="go('scan', 'Plant')"><div><Icon icon="solar:camera-linear" width="23"/></div><span><b>Search by photo</b><small>Take or choose a plant picture</small></span><Icon icon="solar:alt-arrow-right-linear"/></button><div class="section-heading"><div><p class="eyebrow">YOUR LIBRARY</p><h2>{{ search ? 'Results' : 'Recent plants' }}</h2></div></div><div v-if="matches.length" class="result-list"><button v-for="item in matches" :key="item.id" @click="openPlant(item.id)"><img :src="item.image || '/assets/ic_no_plant_image.png'" alt=""/><span><b>{{ item.name }}</b><small>{{ item.scientificName || item.room }}</small></span><Icon icon="solar:alt-arrow-right-linear"/></button></div><div v-else class="search-empty"><Icon icon="solar:leaf-linear" width="36"/><h3>No plants found</h3><p>{{ state.plants.length ? 'Try another name, or add a new plant.' : 'Your library is empty. Start by adding a plant.' }}</p><button class="dark-button" @click="openAdd">Add a plant</button></div></main>
</template>
