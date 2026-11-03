<script setup lang="ts">
import { t } from '../../../shared/i18n'
import NotificationBell from '../../../shared/components/NotificationBell.vue'
import { state } from '../../../shared/store'
import { hasFreeSlot, plantSeed } from '../../garden/model'
import { discardSeed, MAX_SEEDS } from '../model'
import { useAppNavigation } from '../../../shared/composables/useAppNavigation'
import { useToast } from '../../../shared/composables/useToast'
import SeedRow from '../../../shared/components/SeedRow.vue'
const { go } = useAppNavigation()
const { notify } = useToast()
function plant(id: string) {
  const pot = plantSeed(id)
  if (!pot) return notify(t('toast.noFreePot'))
  notify(t('toast.planted')); go('pot', pot.id)
}
function discard(id: string) { if (confirm(t('confirm.discardSeed'))) { discardSeed(id); notify(t('toast.seedDiscarded')) } }
</script>

<template>
  <header class="home-head">
    <div class="home-greeting"><b>{{ t('seeds.title') }}</b><span>{{ t('seeds.subtitle') }}</span></div>
    <div class="head-end"><span class="pill-tag">{{ t('seeds.count', { n: String(state.seeds.length), max: String(MAX_SEEDS) }) }}</span><NotificationBell/></div>
  </header>
  <main class="content">
    <p v-if="state.seeds.length && !hasFreeSlot()" class="slot-warning">{{ t('seeds.gardenFull', { pots: String(state.pots.length), slots: String(state.potSlots) }) }}</p>
    <div v-if="state.seeds.length" class="list-stack">
      <SeedRow v-for="seed in state.seeds" :key="seed.id" :seed="seed" :can-plant="hasFreeSlot()" removable @plant="plant(seed.id)" @discard="discard(seed.id)"/>
    </div>
    <div v-else class="search-empty">
      <img class="history-empty-image" src="/assets/ic_identification_history_empty_plants.png" alt=""/>
      <h3>{{ t('seeds.emptyTitle') }}</h3>
      <p>{{ t('seeds.emptyText') }}</p>
      <button class="dark-button" @click="go('scan')">{{ t('seeds.goScan') }}</button>
    </div>
    <p v-if="state.seeds.length >= MAX_SEEDS" class="scan-note">{{ t('seeds.bagFull') }}</p>
  </main>
</template>
