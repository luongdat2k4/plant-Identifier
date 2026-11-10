<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { Icon } from '@iconify/vue'
import { t } from '../../../shared/i18n'
import NotificationBell from '../../../shared/components/NotificationBell.vue'
import CoinPill from '../../../shared/components/CoinPill.vue'
import RewardModal from '../../../shared/components/RewardModal.vue'
import { state } from '../../../shared/store'
import { hasFreeSlot, plantSeed } from '../../garden/model'
import { discardSeed, freeSeedSlots, MAX_SEEDS } from '../model'
import { canAfford, openPack, PACKS, type Pack } from '../shop'
import type { Species } from '../../collection/model'
import { useAppNavigation } from '../../../shared/composables/useAppNavigation'
import { useToast } from '../../../shared/composables/useToast'
import SeedRow from '../../../shared/components/SeedRow.vue'
import RewardedAd from '../../ads/components/RewardedAd.vue'
import { countReward, rewardsLeft } from '../../ads/rewardQuota'
import { adsAvailable, showInterstitial } from '../../ads/adRuntime'
const { go } = useAppNavigation()
const { notify } = useToast()
const route = useRoute()

// Seed Center: the shop of seed packs and the bag of seeds waiting to be planted.
const tab = ref<'store' | 'mine'>(route.query.tab === 'mine' ? 'mine' : 'store')
const packText = computed<Record<Pack['id'], { title: string; text: string }>>(() => ({
  basic: { title: t('shop.basic.title'), text: t('shop.basic.text') },
  plus: { title: t('shop.plus.title'), text: t('shop.plus.text') },
  special: { title: t('shop.special.title'), text: t('shop.special.text') },
}))
const got = ref<Species[] | null>(null)

function open(pack: Pack) {
  const result = openPack(pack)
  if (result.ok) return void (got.value = result.species)
  notify(result.reason === 'room' ? t('shop.noRoom', { n: String(freeSeedSlots()) }) : t('shop.notEnough'))
}
// The basic pack is paid with a rewarded video: the seed is given only when the viewer finishes it.
function openBasic() { countReward('seed'); open(PACKS[0]) }
// After the "you got seeds" popup, a natural break for one interstitial.
function closeGot() { got.value = null; void showInterstitial('seed_pack') }

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
    <div class="head-end"><CoinPill/><NotificationBell/></div>
  </header>
  <main class="content" data-ad-scroll-region>
    <div class="pill-tabs" role="tablist">
      <button role="tab" :aria-selected="tab === 'store'" :class="{ active: tab === 'store' }" @click="tab = 'store'">{{ t('shop.tabStore') }}</button>
      <button role="tab" :aria-selected="tab === 'mine'" :class="{ active: tab === 'mine' }" @click="tab = 'mine'">{{ t('shop.tabMine') }} ({{ state.seeds.length }}/{{ MAX_SEEDS }})</button>
    </div>

    <template v-if="tab === 'store'">
      <section class="shop-hero">
        <Icon icon="fluent-emoji-flat:package" width="72"/>
        <div><b>{{ t('shop.heroTitle') }}</b><span>{{ t('shop.heroText') }}</span></div>
      </section>
      <ul class="pack-list">
        <li v-for="pack in PACKS" :key="pack.id" class="pack-row" :class="pack.id">
          <span class="pack-ic"><Icon :icon="pack.icon" width="38"/></span>
          <div class="pack-body"><b>{{ packText[pack.id].title }}</b><span>{{ packText[pack.id].text }}</span></div>
          <template v-if="pack.cost === 0">
            <RewardedAd v-if="adsAvailable && rewardsLeft('seed') > 0" placement="seed_pack_basic" @rewarded="openBasic" @skipped="notify(t('toast.rewardNone'))">
              <template #default="{ busy }"><button class="pack-buy video seed-reward" :aria-busy="busy"><Icon icon="solar:play-circle-bold" width="18"/> {{ t('shop.watch') }}</button></template>
            </RewardedAd>
            <button v-else class="pack-buy video" disabled>{{ rewardsLeft('seed') > 0 ? t('shop.noVideo') : t('shop.quotaDone') }}</button>
          </template>
          <button v-else class="pack-buy" :disabled="!canAfford(pack)" @click="open(pack)"><Icon icon="fluent-emoji-flat:chestnut" width="18"/> {{ pack.cost }}</button>
        </li>
      </ul>
      <p class="scan-note">{{ t('shop.videosLeft', { n: String(rewardsLeft('seed')) }) }}</p>
      <button class="shop-earn" @click="go('missions')"><Icon icon="fluent-emoji-flat:clipboard" width="26"/><span>{{ t('shop.earnHint') }}</span><Icon icon="solar:alt-arrow-right-linear" width="18"/></button>
    </template>

    <template v-else>
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
    </template>
  </main>

  <RewardModal v-if="got" :title="t('shop.gotTitle')" :text="t('shop.gotText', { n: String(got.length) })" :images="got.map(s => s.thumb)" @ok="closeGot"/>
</template>
