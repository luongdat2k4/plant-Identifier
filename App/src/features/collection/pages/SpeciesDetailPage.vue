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
const route = useRoute()
const { go, back } = useAppNavigation()
useScrollFade()
const species = computed(() => getSpecies(String(route.params.id)))
const discovery = computed(() => discoveryOf(String(route.params.id)))
</script>

<template>
  <template v-if="species && discovery">
    <section class="hero">
      <header class="hero-bar"><button class="round-btn" :aria-label="t('common.back')" @click="back"><Icon icon="solar:arrow-left-linear" width="22"/></button></header>
      <img class="hero-img contain" :src="species.image" :alt="species.name"/>
      <dl class="hero-meta">
        <div><dt>{{ t('species.rarity') }}</dt><dd>{{ RARITY_META[species.rarity].label }}</dd></div>
        <div><dt>{{ t('species.spot') }}</dt><dd>{{ species.preferredSpot === 'sun' ? t('spot.sun') : t('spot.shade') }}</dd></div>
        <div><dt>{{ t('species.bestStage') }}</dt><dd>{{ STAGE_META[discovery.bestStage].emoji }} {{ STAGE_META[discovery.bestStage].label }}</dd></div>
      </dl>
    </section>

    <main class="sheet">
      <p class="eyebrow">{{ species.scientificName }}<span v-if="discovery.mastered" class="mastered-inline"> · {{ t('species.mastered') }}</span></p>
      <h1 class="sheet-title">{{ species.name }}</h1>

      <SpeciesArticle :species="species"/>
      <div class="ad-slot"><InFeedAd template="small"/></div>
    </main>
  </template>
  <main v-else class="content search-empty">
    <h3>{{ t('species.unseen.title') }}</h3>
    <p>{{ t('species.unseen.text') }}</p>
    <button class="dark-button" @click="go('collection')">{{ t('species.unseen.back') }}</button>
  </main>
</template>
