<script setup lang="ts">
import { computed, ref } from 'vue'
import { Icon } from '@iconify/vue'
import { state } from '../../../shared/store'
import { allSpecies, discoveryOf, RARITY_META, type Rarity } from '../model'
import { useAppNavigation } from '../../../shared/composables/useAppNavigation'
import { useToast } from '../../../shared/composables/useToast'
const { go } = useAppNavigation()
const { notify } = useToast()
const filter = ref<Rarity | 'all'>('all')
const filters: { key: Rarity | 'all'; label: string }[] = [
  { key: 'all', label: 'Tất cả' },
  { key: 'common', label: RARITY_META.common.label },
  { key: 'uncommon', label: RARITY_META.uncommon.label },
  { key: 'rare', label: RARITY_META.rare.label },
]
const shown = computed(() => allSpecies.filter(s => filter.value === 'all' || s.rarity === filter.value))
const seenCount = computed(() => state.value.discoveries.length)
const masteredCount = computed(() => state.value.discoveries.filter(d => d.mastered).length)
function open(id: string) {
  if (discoveryOf(id)) go('species', id)
  else notify('Chưa gặp loài này. Hãy chụp thêm ảnh!')
}
</script>

<template>
  <header class="topbar">
    <div><p class="eyebrow">LOÀI CÂY BẠN ĐÃ GẶP</p><h1>Bộ sưu tập</h1></div>
  </header>
  <main class="content">
    <div class="collection-summary">
      <div><b>{{ seenCount }}<small>/{{ allSpecies.length }}</small></b><span>Đã gặp</span></div>
      <div><b>{{ masteredCount }}<small>/{{ allSpecies.length }}</small></b><span>Đã thuần</span></div>
    </div>
    <div class="pill-tabs">
      <button v-for="item in filters" :key="item.key" :class="{ active: filter === item.key }" @click="filter = item.key">{{ item.label }}</button>
    </div>
    <div class="species-grid">
      <button v-for="item in shown" :key="item.id" class="species-card" :class="{ unseen: !discoveryOf(item.id) }" @click="open(item.id)">
        <div class="species-image">
          <img :src="item.image" :alt="discoveryOf(item.id) ? item.name : 'Loài chưa gặp'"/>
          <span v-if="discoveryOf(item.id)?.mastered" class="mastered-badge"><Icon icon="solar:medal-ribbon-bold" width="14"/> Đã thuần</span>
          <Icon v-if="!discoveryOf(item.id)" class="lock-icon" icon="solar:lock-linear" width="26"/>
        </div>
        <b>{{ discoveryOf(item.id) ? item.name : '???' }}</b>
        <span class="rarity" :class="item.rarity">{{ RARITY_META[item.rarity].label }}</span>
      </button>
    </div>
  </main>
</template>
