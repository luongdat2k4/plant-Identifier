<script setup lang="ts">
import { computed } from 'vue'
import type { Species } from '../../features/collection/model'
const props = defineProps<{ species: Species }>()
const facts = computed(() => [
  { label: 'Họ', value: props.species.family },
  { label: 'Chi', value: props.species.scientificName.split(' ')[0] },
  { label: 'Nguồn gốc', value: props.species.origin },
  { label: 'Ưa thích', value: props.species.preferredSpot === 'sun' ? 'Chỗ nắng' : 'Chỗ râm' },
].filter(fact => fact.value))
</script>

<template>
  <article class="article">
    <section>
      <h2>Thông tin loài</h2>
      <p v-if="species.description" class="lead">{{ species.description }}</p>
      <dl class="facts">
        <div v-for="fact in facts" :key="fact.label"><dt>{{ fact.label }}</dt><dd>{{ fact.value }}</dd></div>
      </dl>
    </section>

    <hr/>

    <section>
      <h2>Mẹo chăm sóc</h2>
      <figure><img src="/assets/ic_fhl3_watering_calculator.png" :alt="`Chăm sóc ${species.name}`"/></figure>
      <template v-if="species.careTips.length">
        <p class="cue">Hãy nhớ những điều sau:</p>
        <ol><li v-for="tip in species.careTips" :key="tip">{{ tip }}</li></ol>
      </template>
      <p v-else class="more">Loài này chưa có mẹo chăm sóc riêng.</p>
    </section>

    <hr/>

    <section>
      <h2>Bạn có biết?</h2>
      <ul v-if="species.funFacts.length"><li v-for="fact in species.funFacts" :key="fact">{{ fact }}</li></ul>
      <p v-else class="more">Loài này chưa có điều thú vị nào được ghi lại.</p>
      <figure><img src="/assets/ic_fhl3_light_meter.png" :alt="species.name"/></figure>
    </section>
  </article>
</template>
