<script setup lang="ts">
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
  if (!pot) return notify('Vườn đã hết chậu trống')
  notify('Đã trồng hạt giống'); go('pot', pot.id)
}
function discard(id: string) { if (confirm('Bỏ hạt giống này?')) { discardSeed(id); notify('Đã bỏ hạt giống') } }
</script>

<template>
  <header class="home-head">
    <div class="home-greeting"><b>Túi hạt</b><span>Hạt giống chờ trồng</span></div>
    <span class="pill-tag">{{ state.seeds.length }}/{{ MAX_SEEDS }} hạt</span>
  </header>
  <main class="content">
    <p v-if="state.seeds.length && !hasFreeSlot()" class="slot-warning">Vườn đã đầy ({{ state.pots.length }}/{{ state.potSlots }} chậu). Hãy nhổ bớt một cây để trồng hạt mới.</p>
    <div v-if="state.seeds.length" class="list-stack">
      <SeedRow v-for="seed in state.seeds" :key="seed.id" :seed="seed" :can-plant="hasFreeSlot()" removable @plant="plant(seed.id)" @discard="discard(seed.id)"/>
    </div>
    <div v-else class="search-empty">
      <img class="history-empty-image" src="/assets/ic_identification_history_empty_plants.png" alt=""/>
      <h3>Túi hạt đang trống</h3>
      <p>Chụp một bức ảnh để nhận hạt giống mới.</p>
      <button class="dark-button" @click="go('scan')">Đi chụp ảnh</button>
    </div>
    <p v-if="state.seeds.length >= MAX_SEEDS" class="scan-note">Túi đã đầy. Hạt cũ nhất sẽ bị thay khi bạn nhận hạt mới.</p>
  </main>
</template>
