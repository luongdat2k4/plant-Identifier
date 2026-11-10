<script setup lang="ts">
import SpeciesArticle from '../../../shared/components/SpeciesArticle.vue'
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { Icon } from '@iconify/vue'
import { discoveryOf, getSpecies, RARITY_META, STAGE_META } from '../model'
import { useAppNavigation } from '../../../shared/composables/useAppNavigation'
import { useScrollFade } from '../../../shared/composables/useScrollFade'
import { t } from '../../../shared/i18n'
import InFeedAd from '../../ads/components/InFeedAd.vue'
import RewardedAd from '../../ads/components/RewardedAd.vue'
import { adsAvailable } from '../../ads/adRuntime'
import { countReward, rewardsLeft } from '../../ads/rewardQuota'
import { state } from '../../../shared/store'
import { addCoins, spendCoins, VIDEO_COINS } from '../../../shared/coins'
import { useToast } from '../../../shared/composables/useToast'
import { markSeen, unlockCost } from '../model'
const route = useRoute()
const { go, back } = useAppNavigation()
useScrollFade()
const species = computed(() => getSpecies(String(route.params.id)))
const discovery = computed(() => discoveryOf(String(route.params.id)))
const { notify } = useToast()
const cost = computed(() => (species.value ? unlockCost(species.value) : 0))
function unlock() {
  if (!species.value || !spendCoins(cost.value)) return
  markSeen(species.value.id)
  notify(t('unlock.done', { name: species.value.name }))
}
// A rewarded video on the locked screen gives a few coins towards the unlock.
function earn() { countReward('coins'); addCoins(VIDEO_COINS); notify(t('toast.coinsReward', { n: String(VIDEO_COINS) })) }
</script>

<template>
  <div v-if="species" class="page-scroll" data-ad-scroll-region>
    <section class="hero">
      <header class="hero-bar"><button class="round-btn" :aria-label="t('common.back')" @click="back"><Icon icon="solar:arrow-left-linear" width="22"/></button></header>
      <img class="hero-img contain" :src="species.image" :alt="species.name"/>
      <dl class="hero-meta">
        <div><dt>{{ t('species.rarity') }}</dt><dd>{{ RARITY_META[species.rarity].label }}</dd></div>
        <div><dt>{{ t('species.spot') }}</dt><dd>{{ species.preferredSpot === 'sun' ? t('spot.sun') : t('spot.shade') }}</dd></div>
        <div v-if="discovery"><dt>{{ t('species.bestStage') }}</dt><dd>{{ STAGE_META[discovery.bestStage].emoji }} {{ STAGE_META[discovery.bestStage].label }}</dd></div>
      </dl>
    </section>

    <main class="sheet">
      <p class="eyebrow">{{ species.scientificName }}<span v-if="discovery?.mastered" class="mastered-inline"> · {{ t('species.mastered') }}</span></p>
      <h1 class="sheet-title">{{ species.name }}</h1>

      <template v-if="discovery">
        <SpeciesArticle :species="species"/>
        <div class="ad-slot"><InFeedAd template="small"/></div>
      </template>
      <template v-else>
        <span class="locked-tag"><Icon icon="solar:lock-keyhole-minimalistic-bold" width="14"/> {{ t('unlock.locked') }}</span>
        <p v-if="species.description" class="locked-lead">{{ species.description }}</p>
        <section class="unlock-card">
          <h3><Icon icon="fluent-emoji-flat:chestnut" width="22"/> {{ t('unlock.title') }}</h3>
          <p>{{ t('unlock.cost', { n: String(cost) }) }} · {{ t('unlock.have', { n: String(state.coins) }) }}</p>
          <div class="stat-bar-track"><div class="stat-bar-fill growth" :style="{ width: `${Math.min(100, (state.coins / cost) * 100)}%` }"></div></div>
          <button class="dark-button full" :disabled="state.coins < cost" @click="unlock"><Icon icon="solar:lock-keyhole-minimalistic-bold" width="18"/> {{ t('unlock.button') }}</button>
        </section>
        <section class="unlock-more">
          <b>{{ t('unlock.more') }}</b>
          <RewardedAd v-if="adsAvailable && rewardsLeft('coins') > 0" placement="unlock_coins" @rewarded="earn" @skipped="notify(t('toast.rewardNone'))">
            <template #default="{ busy }"><button class="outline-button full seed-reward" :aria-busy="busy"><Icon icon="solar:play-circle-bold" width="18"/> {{ t('unlock.watch', { n: String(VIDEO_COINS) }) }}</button></template>
          </RewardedAd>
          <button class="shop-earn" @click="go('missions')"><Icon icon="fluent-emoji-flat:clipboard" width="26"/><span>{{ t('shop.earnHint') }}</span><Icon icon="solar:alt-arrow-right-linear" width="18"/></button>
        </section>
      </template>
    </main>
  </div>
</template>
