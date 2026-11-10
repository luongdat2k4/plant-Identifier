<script setup lang="ts">
import { computed, ref } from 'vue'
import { Icon } from '@iconify/vue'
import { t } from '../../../shared/i18n'
import { useAppNavigation } from '../../../shared/composables/useAppNavigation'
import CoinPill from '../../../shared/components/CoinPill.vue'
import RewardModal from '../../../shared/components/RewardModal.vue'
import { claimMissionReward, MISSION_REWARD, MISSIONS, missionProgress, missionRewardClaimed, missionsDone, type MissionId } from '../model'
const { go, back } = useAppNavigation()

const titles = computed<Record<MissionId, string>>(() => ({
  water: t('missions.water', { n: String(MISSIONS[0].target) }),
  scan: t('missions.scan', { n: String(MISSIONS[1].target) }),
  feed: t('missions.feed', { n: String(MISSIONS[2].target) }),
}))
const done = computed(() => missionsDone())
const claimed = computed(() => missionRewardClaimed())
const celebrate = ref(false)
function claim() { if (claimMissionReward()) celebrate.value = true }
</script>

<template>
  <header class="home-head lang-page-head">
    <button class="round-btn" :aria-label="t('common.back')" @click="back"><Icon icon="solar:arrow-left-linear" width="22"/></button>
    <div class="home-greeting"><b>{{ t('missions.title') }}</b></div>
    <CoinPill/>
  </header>
  <main class="content">
    <section class="mission-hero">
      <Icon icon="fluent-emoji-flat:clipboard" width="64"/>
      <p>{{ t('missions.subtitle') }}</p>
      <div class="mission-steps" :aria-label="t('missions.progress', { done: String(done), total: String(MISSIONS.length) })">
        <template v-for="(m, i) in MISSIONS" :key="m.id">
          <i class="step" :class="{ on: i < done }"><Icon v-if="i < done" icon="solar:check-circle-bold" width="20"/></i>
          <span class="line" :class="{ on: i < done }"></span>
        </template>
        <i class="step gift" :class="{ on: claimed }"><Icon icon="fluent-emoji-flat:wrapped-gift" width="28"/></i>
      </div>
      <b>{{ t('missions.progress', { done: String(done), total: String(MISSIONS.length) }) }}</b>
    </section>

    <ul class="mission-list">
      <li v-for="m in MISSIONS" :key="m.id" :class="{ done: missionProgress(m.id) >= m.target }">
        <span class="mission-ic" :class="m.id"><Icon :icon="m.icon" width="22"/></span>
        <div class="mission-body">
          <b>{{ titles[m.id] }}</b>
          <div class="stat-bar-track"><div class="stat-bar-fill growth" :style="{ width: `${(missionProgress(m.id) / m.target) * 100}%` }"></div></div>
          <small>{{ missionProgress(m.id) }}/{{ m.target }}</small>
        </div>
        <Icon v-if="missionProgress(m.id) >= m.target" class="mission-check" icon="solar:check-circle-bold" width="28"/>
        <button v-else class="mission-go" :aria-label="t('missions.go')" @click="go(m.to)"><Icon icon="solar:alt-arrow-right-linear" width="20"/></button>
      </li>
    </ul>
    <p class="scan-note">{{ t('missions.careHint') }}</p>

    <section class="mission-reward" :class="{ ready: done === MISSIONS.length && !claimed }">
      <Icon icon="fluent-emoji-flat:wrapped-gift" width="48"/>
      <div>
        <b>{{ t('missions.reward') }}</b>
        <span class="reward-amount"><Icon icon="fluent-emoji-flat:chestnut" width="18"/> {{ t('coins.plus', { n: String(MISSION_REWARD) }) }}</span>
      </div>
      <button v-if="!claimed" class="dark-button" :disabled="done < MISSIONS.length" @click="claim">
        {{ done < MISSIONS.length ? t('missions.left', { n: String(MISSIONS.length - done) }) : t('missions.claim') }}
      </button>
      <small v-else>{{ t('missions.claimed') }}</small>
    </section>
  </main>

  <RewardModal v-if="celebrate" :title="t('missions.doneTitle')" :text="t('missions.doneText')" :coins="MISSION_REWARD" @ok="celebrate = false"/>
</template>
