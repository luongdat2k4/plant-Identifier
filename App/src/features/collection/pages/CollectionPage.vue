<script setup lang="ts">
import { t } from '../../../shared/i18n'
import NotificationBell from '../../../shared/components/NotificationBell.vue'
import { computed, ref } from 'vue'
import { Icon } from '@iconify/vue'
import { state } from '../../../shared/store'
import { allSpecies, discoveryOf, RARITY_META, type Rarity } from '../model'
import { useAppNavigation } from '../../../shared/composables/useAppNavigation'
import InFeedAd from '../../ads/components/InFeedAd.vue'
import { useDocScroll } from '../../../shared/composables/pageScroll'
const { go } = useAppNavigation()
useDocScroll()
const filter = ref<Rarity | 'all'>('all')
const filters = computed<{ key: Rarity | 'all'; label: string }[]>(() => [
  { key: 'all', label: t('filter.all') },
  { key: 'common', label: RARITY_META.common.label },
  { key: 'uncommon', label: RARITY_META.uncommon.label },
  { key: 'rare', label: RARITY_META.rare.label },
])
// Species the user has already met come first; each group keeps the catalog order.
const shown = computed(() => allSpecies
  .filter(s => filter.value === 'all' || s.rarity === filter.value)
  .sort((a, b) => Number(!!discoveryOf(b.id)) - Number(!!discoveryOf(a.id))))
// One ad row after the eighth species splits the grid in two.
const AD_AFTER = 8
const rows = computed(() => [shown.value.slice(0, AD_AFTER), shown.value.slice(AD_AFTER)])
const seenCount = computed(() => state.value.discoveries.length)
const percent = computed(() => Math.round((seenCount.value / Math.max(1, allSpecies.length)) * 100))
const masteredCount = computed(() => state.value.discoveries.filter(d => d.mastered).length)
// A locked species opens its page too, where it can be unlocked with seeds.
function open(id: string) { go('species', id) }
</script>

<template>
  <header class="home-head">
    <div class="home-greeting"><b>{{ t('collection.title') }}</b><span>{{ t('collection.subtitle') }}</span></div>
    <NotificationBell/>
  </header>
  <main class="content" data-ad-scroll-region>
    <section class="collect-progress">
      <div class="collect-head"><b>{{ t('collection.progress') }}</b><span>{{ t('collection.progressCount', { n: String(seenCount), total: String(allSpecies.length), p: String(percent) }) }}</span></div>
      <div class="stat-bar-track"><div class="stat-bar-fill growth" :style="{ width: `${percent}%` }"></div></div>
      <small><Icon icon="solar:medal-ribbon-bold" width="14"/> {{ t('stats.mastered') }}: {{ masteredCount }}/{{ allSpecies.length }}</small>
    </section>
    <div class="pill-tabs">
      <button v-for="item in filters" :key="item.key" :class="{ active: filter === item.key }" @click="filter = item.key">{{ item.label }}</button>
    </div>
    <template v-for="(chunk, c) in rows" :key="c">
    <div v-if="c === 1 && chunk.length" class="ad-slot"><InFeedAd template="small"/></div>
    <div v-if="chunk.length" class="species-grid">
      <button v-for="item in chunk" :key="item.id" class="species-card" :class="{ unseen: !discoveryOf(item.id) }" @click="open(item.id)">
        <div class="species-image">
          <img :src="item.thumb" :alt="discoveryOf(item.id) ? item.name : t('collection.unseenAlt')"/>
          <span v-if="discoveryOf(item.id)?.mastered" class="mastered-badge"><Icon icon="solar:medal-ribbon-bold" width="14"/> {{ t('stats.mastered') }}</span>
          <Icon v-if="!discoveryOf(item.id)" class="lock-icon" icon="solar:lock-linear" width="26"/>
          <Icon v-else class="seen-badge" icon="solar:check-circle-bold" width="22"/>
        </div>
        <b>{{ discoveryOf(item.id) ? item.name : '???' }}</b>
        <span class="rarity" :class="item.rarity">{{ RARITY_META[item.rarity].label }}</span>
      </button>
    </div>
    </template>
  </main>
</template>
