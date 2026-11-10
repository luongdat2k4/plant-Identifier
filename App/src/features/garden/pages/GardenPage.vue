<script setup lang="ts">
import { t } from '../../../shared/i18n'
import NotificationBell from '../../../shared/components/NotificationBell.vue'
import { computed, ref } from 'vue'
import { Icon } from '@iconify/vue'
import { state } from '../../../shared/store'
import { feedPot, hasFreeSlot, plantSeed, potName, statusOf, waterPot, type Pot } from '../model'
import { useAppNavigation } from '../../../shared/composables/useAppNavigation'
import { useToast } from '../../../shared/composables/useToast'
import PotCard from '../components/PotCard.vue'
import SeedRow from '../../../shared/components/SeedRow.vue'
import InFeedAd from '../../ads/components/InFeedAd.vue'
import { useDocScroll } from '../../../shared/composables/pageScroll'
import { useRouter } from 'vue-router'
import { allSpecies } from '../../collection/model'
import { MISSION_REWARD, MISSIONS, missionsDone, missionRewardClaimed, missionRewardReady, withMission } from '../../missions/model'
const { go } = useAppNavigation()
const router = useRouter()
useDocScroll()
const { notify } = useToast()
const filter = ref<'all' | 'care' | 'happy'>('all')
const filters = computed(() => [{ key: 'all', label: t('filter.all') }, { key: 'care', label: t('filter.care') }, { key: 'happy', label: t('filter.happy') }] as const)
const pots = computed(() => state.value.pots)
const shown = computed(() => pots.value.filter(p => filter.value === 'all' || (filter.value === 'happy') === (statusOf(p) === 'happy')))
const waitingSeeds = computed(() => state.value.seeds.slice(0, 3))
function care(pot: Pot, kind: 'water' | 'feed') {
  const counted = kind === 'water' ? waterPot(pot.id) : feedPot(pot.id)
  const message = kind === 'water' ? t('toast.watered', { name: potName(pot) }) : t('toast.fed', { name: potName(pot) })
  notify(withMission(message, counted ? kind : null))
}
const done = computed(() => missionsDone())
const collected = computed(() => state.value.discoveries.length)
function plant(id: string) {
  const pot = plantSeed(id)
  if (!pot) return notify(t('toast.noFreePot'))
  notify(t('toast.planted')); go('pot', pot.id)
}
</script>

<template>
  <header class="home-head">
    <div class="home-greeting"><b>{{ t('garden.hello') }}</b><span>{{ t('garden.sub', { n: String(pots.length), slots: String(state.potSlots) }) }}</span></div>
    <NotificationBell/>
  </header>
  <main class="content" data-ad-scroll-region>
    <nav class="quick-tiles">
      <button @click="go('seeds')">
        <Icon icon="fluent-emoji-flat:seedling" width="30"/><b>{{ t('home.seeds') }}</b>
        <small><Icon icon="fluent-emoji-flat:chestnut" width="14"/> {{ state.coins }}</small>
      </button>
      <button @click="go('missions')">
        <Icon icon="fluent-emoji-flat:clipboard" width="30"/><b>{{ t('home.missions') }}</b>
        <small>{{ done }}/{{ MISSIONS.length }}</small>
        <i v-if="missionRewardReady()" class="tile-dot"></i>
      </button>
      <button @click="go('collection')">
        <Icon icon="fluent-emoji-flat:herb" width="30"/><b>{{ t('home.collection') }}</b>
        <small>{{ collected }}/{{ allSpecies.length }}</small>
      </button>
    </nav>

    <button v-if="!missionRewardClaimed()" class="mission-card" :class="{ ready: missionRewardReady() }" @click="go('missions')">
      <Icon icon="fluent-emoji-flat:clipboard" width="34"/>
      <div>
        <b>{{ t('home.missionCard') }}</b>
        <span>{{ missionRewardReady() ? t('home.missionReady') : t('home.missionHint', { n: String(MISSION_REWARD) }) }}</span>
        <div class="stat-bar-track"><div class="stat-bar-fill growth" :style="{ width: `${(done / MISSIONS.length) * 100}%` }"></div></div>
      </div>
      <em>{{ done }}/{{ MISSIONS.length }}</em>
    </button>

    <div class="pill-tabs" role="tablist">
      <button v-for="item in filters" :key="item.key" :class="{ active: filter === item.key }" @click="filter = item.key">{{ item.label }}</button>
    </div>

    <div class="block-head"><h2>{{ t('garden.myPlants') }}</h2><span class="pill-tag">{{ t('garden.count', { n: String(shown.length) }) }}</span></div>
    <div v-if="shown.length" class="pot-grid">
      <PotCard v-for="pot in shown" :key="pot.id" :pot="pot"
        @open="go('pot', pot.id)" @water="care(pot, 'water')" @feed="care(pot, 'feed')"/>
    </div>
    <div v-if="!shown.length" class="soft-empty">
      <Icon icon="solar:leaf-linear" width="34"/>
      <b>{{ pots.length ? t('garden.emptyFilter') : t('garden.emptyNone') }}</b>
      <span>{{ pots.length ? t('garden.tryOther') : t('garden.firstSeed') }}</span>
    </div>

    <div class="block-head"><h2>{{ t('garden.waitingSeeds') }}</h2><button class="pill-tag" @click="router.push({ name: 'seeds', query: { tab: 'mine' } })">{{ t('garden.viewAll') }}</button></div>
    <div v-if="waitingSeeds.length" class="list-stack">
      <SeedRow v-for="seed in waitingSeeds" :key="seed.id" :seed="seed" :can-plant="hasFreeSlot()" @plant="plant(seed.id)"/>
    </div>
    <article v-else class="list-row">
      <div class="list-row-icon"><Icon icon="solar:camera-linear" width="24"/></div>
      <div class="list-row-text"><b>{{ t('garden.scanTitle') }}</b><span>{{ t('garden.scanText') }}</span></div>
      <button class="plus-btn" :aria-label="t('scan.snapAria')" @click="go('scan')"><Icon icon="solar:add-circle-linear" width="24"/></button>
    </article>

    <div class="ad-slot"><InFeedAd template="small"/></div>
  </main>
</template>
