<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { Icon } from '@iconify/vue'
import { discoveryOf, getSpecies, RARITY_META, stageIndex, STAGE_META } from '../model'
import { useAppNavigation } from '../../../shared/composables/useAppNavigation'
const route = useRoute()
const { go, back } = useAppNavigation()
const species = computed(() => getSpecies(String(route.params.id)))
const discovery = computed(() => discoveryOf(String(route.params.id)))
const unlocked = computed(() => (discovery.value ? stageIndex(discovery.value.bestStage) : -1))
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

      <section class="info-section">
        <h3>Thông tin loài</h3>
        <div class="info-block" :class="{ locked: unlocked < 1 }">
          <p v-if="unlocked >= 1">{{ species.description }}</p>
          <template v-else><Icon icon="solar:lock-linear"/> Nuôi loài này tới giai đoạn Mầm để mở khóa mô tả.</template>
        </div>
        <div class="info-block" :class="{ locked: unlocked < 2 }">
          <template v-if="unlocked >= 2"><b>Mẹo chăm sóc</b><ul><li v-for="tip in (unlocked >= 3 ? species.careTips : species.careTips.slice(0, 1))" :key="tip">{{ tip }}</li></ul></template>
          <template v-else><Icon icon="solar:lock-linear"/> Nuôi tới giai đoạn Cây non để mở khóa mẹo chăm sóc.</template>
        </div>
        <div class="info-block" :class="{ locked: unlocked < 4 }">
          <template v-if="unlocked >= 4"><b>Bạn có biết?</b><ul><li v-for="fact in species.funFacts" :key="fact">{{ fact }}</li></ul></template>
          <template v-else><Icon icon="solar:lock-linear"/> Nuôi tới khi ra hoa để mở khóa sự thật thú vị.</template>
        </div>
      </section>
    </main>
  </template>
  <main v-else class="content search-empty">
    <h3>Chưa gặp loài này</h3>
    <p>Chụp thêm ảnh để có cơ hội gặp loài mới.</p>
    <button class="dark-button" @click="go('collection')">Về bộ sưu tập</button>
  </main>
</template>
