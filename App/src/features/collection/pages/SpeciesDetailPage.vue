<script setup lang="ts">
import SpeciesArticle from '../../../shared/components/SpeciesArticle.vue'
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { Icon } from '@iconify/vue'
import { discoveryOf, getSpecies, RARITY_META, STAGE_META } from '../model'
import { useAppNavigation } from '../../../shared/composables/useAppNavigation'
import { useScrollFade } from '../../../shared/composables/useScrollFade'
const route = useRoute()
const { go, back } = useAppNavigation()
useScrollFade()
const species = computed(() => getSpecies(String(route.params.id)))
const discovery = computed(() => discoveryOf(String(route.params.id)))
</script>

<template>
  <template v-if="species && discovery">
    <section class="hero">
      <header class="hero-bar"><button class="round-btn" aria-label="Quay lại" @click="back"><Icon icon="solar:arrow-left-linear" width="22"/></button></header>
      <img class="hero-img contain" :src="species.image" :alt="species.name"/>
      <dl class="hero-meta">
        <div><dt>Độ hiếm</dt><dd>{{ RARITY_META[species.rarity].label }}</dd></div>
        <div><dt>Ưa thích</dt><dd>{{ species.preferredSpot === 'sun' ? 'Chỗ nắng' : 'Chỗ râm' }}</dd></div>
        <div><dt>Tiến độ cao nhất</dt><dd>{{ STAGE_META[discovery.bestStage].emoji }} {{ STAGE_META[discovery.bestStage].label }}</dd></div>
      </dl>
    </section>

    <main class="sheet">
      <p class="eyebrow">{{ species.scientificName }}<span v-if="discovery.mastered" class="mastered-inline"> · ĐÃ THUẦN</span></p>
      <h1 class="sheet-title">{{ species.name }}</h1>

      <SpeciesArticle :species="species"/>
    </main>
  </template>
  <main v-else class="content search-empty">
    <h3>Chưa gặp loài này</h3>
    <p>Chụp thêm ảnh để có cơ hội gặp loài mới.</p>
    <button class="dark-button" @click="go('collection')">Về bộ sưu tập</button>
  </main>
</template>
