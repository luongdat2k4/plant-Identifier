<script setup lang="ts">
import NotificationBell from '../../../shared/components/NotificationBell.vue'
import { computed, ref } from 'vue'
import { Icon } from '@iconify/vue'
import { state } from '../../../shared/store'
import { feedPot, hasFreeSlot, plantSeed, potName, statusOf, waterPot, type Pot } from '../model'
import { useAppNavigation } from '../../../shared/composables/useAppNavigation'
import { useToast } from '../../../shared/composables/useToast'
import PotCard from '../components/PotCard.vue'
import SeedRow from '../../../shared/components/SeedRow.vue'
const { go } = useAppNavigation()
const { notify } = useToast()
const filter = ref<'all' | 'care' | 'happy'>('all')
const filters = [{ key: 'all', label: 'Tất cả' }, { key: 'care', label: 'Cần chăm' }, { key: 'happy', label: 'Khỏe' }] as const
const pots = computed(() => state.value.pots)
const shown = computed(() => pots.value.filter(p => filter.value === 'all' || (filter.value === 'happy') === (statusOf(p) === 'happy')))
const waitingSeeds = computed(() => state.value.seeds.slice(0, 3))
function care(pot: Pot, kind: 'water' | 'feed') {
  if (kind === 'water') waterPot(pot.id); else feedPot(pot.id)
  notify(kind === 'water' ? `Đã tưới ${potName(pot)}` : `Đã bón phân cho ${potName(pot)}`)
}
function plant(id: string) {
  const pot = plantSeed(id)
  if (!pot) return notify('Vườn đã hết chậu trống')
  notify('Đã trồng hạt giống'); go('pot', pot.id)
}
</script>

<template>
  <header class="home-head">
    <div class="home-greeting"><b>Xin chào!</b><span>Khu vườn của bạn · {{ pots.length }}/{{ state.potSlots }} chậu</span></div>
    <NotificationBell/>
  </header>
  <main class="content">
    <div class="pill-tabs" role="tablist">
      <button v-for="item in filters" :key="item.key" :class="{ active: filter === item.key }" @click="filter = item.key">{{ item.label }}</button>
    </div>

    <div class="block-head"><h2>Cây của tôi</h2><span class="pill-tag">{{ shown.length }} cây</span></div>
    <div v-if="shown.length" class="pot-grid">
      <PotCard v-for="pot in shown" :key="pot.id" :pot="pot"
        @open="go('pot', pot.id)" @water="care(pot, 'water')" @feed="care(pot, 'feed')"/>
    </div>
    <div v-else class="soft-empty">
      <Icon icon="solar:leaf-linear" width="34"/>
      <b>{{ pots.length ? 'Không có cây nào ở mục này' : 'Chưa có cây nào' }}</b>
      <span>{{ pots.length ? 'Thử chọn mục khác.' : 'Chụp ảnh để nhận hạt giống đầu tiên.' }}</span>
    </div>

    <div class="block-head"><h2>Hạt chờ trồng</h2><button class="pill-tag" @click="go('seeds')">Xem tất cả</button></div>
    <div v-if="waitingSeeds.length" class="list-stack">
      <SeedRow v-for="seed in waitingSeeds" :key="seed.id" :seed="seed" :can-plant="hasFreeSlot()" @plant="plant(seed.id)"/>
    </div>
    <article v-else class="list-row">
      <div class="list-row-icon"><Icon icon="solar:camera-linear" width="24"/></div>
      <div class="list-row-text"><b>Chụp ảnh để có hạt</b><span>Mỗi ảnh là một hạt giống ngẫu nhiên.</span></div>
      <button class="plus-btn" aria-label="Chụp ảnh" @click="go('scan')"><Icon icon="solar:add-circle-linear" width="24"/></button>
    </article>
  </main>
</template>
