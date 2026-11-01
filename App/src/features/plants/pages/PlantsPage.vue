<script setup lang="ts">
import { computed } from 'vue'
import { Icon } from '@iconify/vue'
import { state } from '../../../shared/store'
import { daysUntilWatering, waterPlant } from '../model'
import { useAppNavigation } from '../../../shared/composables/useAppNavigation'
import { useToast } from '../../../shared/composables/useToast'
const { go } = useAppNavigation()
const { notify } = useToast()
const due = computed(() => state.value.plants.filter(p => daysUntilWatering(p) <= 0))
const soon = computed(() => state.value.plants.filter(p => daysUntilWatering(p) > 0).sort((a, b) => daysUntilWatering(a) - daysUntilWatering(b)))
function openAdd() { go('editor') }
function openPlant(id: string) { go('detail', id) }
</script>

<template>
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
