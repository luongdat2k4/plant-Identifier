<script setup lang="ts">
import { t } from '../../../shared/i18n'
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { Icon } from '@iconify/vue'
import { state } from '../../../shared/store'
import { getSpecies, stageIndex, STAGE_META, STAGES } from '../../collection/model'
import { daysUntilDeath, feedPot, nextStage, potName, setSpot, stageOf, statusOf, STATUS_META, uprootPot, waterPot, type Spot } from '../model'
import { useAppNavigation } from '../../../shared/composables/useAppNavigation'
import { useScrollFade } from '../../../shared/composables/useScrollFade'
import { useToast } from '../../../shared/composables/useToast'
import StatBar from '../components/StatBar.vue'
const route = useRoute()
const { go, back } = useAppNavigation()
useScrollFade()
const { notify } = useToast()
const pot = computed(() => state.value.pots.find(p => p.id === route.params.id))
const species = computed(() => pot.value && getSpecies(pot.value.speciesId))
const status = computed(() => (pot.value ? statusOf(pot.value) : 'happy'))
const stage = computed(() => (pot.value ? stageOf(pot.value) : 'seed'))
const upcoming = computed(() => (pot.value ? nextStage(pot.value) : null))
const deathIn = computed(() => (pot.value ? daysUntilDeath(pot.value) : null))
const progress = computed(() => {
  if (!pot.value || !upcoming.value) return 100
  const from = STAGE_META[stage.value].minDays
  const to = STAGE_META[upcoming.value.stage].minDays
  return Math.round(((pot.value.growthDays - from) / (to - from)) * 100)
})
const unlocked = computed(() => stageIndex(stage.value))
function water() { if (pot.value) { waterPot(pot.value.id); notify(t('toast.wateredPlain')) } }
function feed() { if (pot.value) { feedPot(pot.value.id); notify(t('toast.fedPlain')) } }
function changeSpot(spot: Spot) { if (pot.value) setSpot(pot.value.id, spot) }
function uproot() {
  if (!pot.value || !confirm(t('confirm.uproot', { name: potName(pot.value) }))) return
  uprootPot(pot.value.id); notify(t('toast.uprooted')); go('garden')
}
</script>

<template>
  <template v-if="pot && species">
    <section class="hero">
      <header class="hero-bar"><button class="round-btn" :aria-label="t('common.back')" @click="back"><Icon icon="solar:arrow-left-linear" width="22"/></button></header>
      <img class="hero-img" :src="species.image" :alt="species.name"/>
      <dl class="hero-meta">
        <div><dt>{{ t('pot.stage') }}</dt><dd>{{ STAGE_META[stage].emoji }} {{ STAGE_META[stage].label }}</dd></div>
        <div><dt>{{ t('pot.water') }}</dt><dd>{{ Math.round(pot.water) }}%</dd></div>
        <div><dt>{{ t('pot.nutrition') }}</dt><dd>{{ Math.round(pot.nutrition) }}%</dd></div>
      </dl>
    </section>

    <main class="sheet">
      <p class="eyebrow">{{ species.scientificName }}</p>
      <h1 class="sheet-title">{{ species.name }}</h1>

      <div class="status-banner" :class="status">
        <b>{{ STATUS_META[status].label }}</b>
        <span>{{ STATUS_META[status].hint }}</span>
        <small v-if="deathIn !== null">{{ t('pot.dieIn', { days: String(deathIn) }) }}</small>
      </div>

      <div class="care-card">
        <StatBar kind="water" :label="t('pot.water')" :value="pot.water"/>
        <StatBar kind="nutrition" :label="t('pot.nutrition')" :value="pot.nutrition"/>
      </div>

      <div class="field">
        <label>{{ t('pot.position') }}</label>
        <div class="segmented">
          <button :class="{ active: pot.spot === 'sun' }" @click="changeSpot('sun')"><Icon icon="solar:sun-2-bold"/> {{ t('spot.sun') }}</button>
          <button :class="{ active: pot.spot === 'shade' }" @click="changeSpot('shade')"><Icon icon="solar:cloud-bold"/> {{ t('spot.shade') }}</button>
        </div>
        <small class="spot-hint">{{ pot.spot === species.preferredSpot ? t('pot.spotPreferred') : t('pot.spotWrong', { spot: (species.preferredSpot === 'sun' ? t('spot.sun') : t('spot.shade')).toLowerCase() }) }}</small>
      </div>

      <div class="field nickname"><label>{{ t('pot.nickname') }}</label><input v-model="pot.nickname" :placeholder="species.name" maxlength="24"/></div>

      <div class="growth-card">
        <div class="growth-head"><b>{{ t('pot.growth') }}</b><span>{{ t('pot.growthDays', { days: String(pot.growthDays) }) }}</span></div>
        <div class="stat-bar-track"><div class="stat-bar-fill growth" :style="{ width: `${progress}%` }"></div></div>
        <p v-if="upcoming">{{ t('pot.untilNext', { days: String(upcoming.daysLeft), stage: STAGE_META[upcoming.stage].label }) }}</p>
        <p v-else>{{ t('pot.bloomed') }}</p>
        <div class="stage-steps">
          <span v-for="(s, i) in STAGES" :key="s" :class="{ done: i <= unlocked, current: i === unlocked }">{{ STAGE_META[s].emoji }}</span>
        </div>
      </div>


      <button class="delete-button" @click="uproot">{{ t('pot.uproot') }}</button>
      <div class="sheet-cta">
        <button class="dark-button" @click="water"><Icon icon="solar:waterdrop-bold"/> {{ t('care.water') }}</button>
        <button class="dark-button" @click="feed"><Icon icon="solar:leaf-bold"/> {{ t('care.feed') }}</button>
      </div>
    </main>
  </template>
  <main v-else class="content search-empty">
    <h3>{{ t('pot.notFoundTitle') }}</h3>
    <p>{{ t('pot.notFoundText') }}</p>
    <button class="dark-button" @click="go('garden')">{{ t('common.toGarden') }}</button>
  </main>
</template>
