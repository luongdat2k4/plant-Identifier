<script setup lang="ts">
import { computed } from 'vue'
import { Icon } from '@iconify/vue'
import type { Species } from '../../features/collection/model'
const props = defineProps<{ species: Species; unlocked: number }>()
const tips = computed(() => (props.unlocked >= 3 ? props.species.careTips : props.species.careTips.slice(0, 1)))
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
      <template v-if="unlocked >= 1">
        <p class="lead">{{ species.description }}</p>
        <dl class="facts">
          <div v-for="fact in facts" :key="fact.label"><dt>{{ fact.label }}</dt><dd>{{ fact.value }}</dd></div>
        </dl>
      </template>
      <p v-else class="locked"><Icon icon="solar:lock-linear" width="18"/> Nuôi tới giai đoạn Mầm để mở khóa mô tả.</p>
    </section>

    <hr/>

    <section>
      <h2>Mẹo chăm sóc</h2>
      <template v-if="unlocked >= 2">
        <figure><img src="/assets/ic_fhl3_watering_calculator.png" :alt="`Chăm sóc ${species.name}`"/></figure>
        <template v-if="tips.length">
          <p class="cue">Hãy nhớ những điều sau:</p>
          <ol><li v-for="tip in tips" :key="tip">{{ tip }}</li></ol>
        </template>
        <p v-else class="more">Loài này chưa có mẹo chăm sóc riêng.</p>
        <p v-if="unlocked < 3 && tips.length" class="more">Các mẹo còn lại sẽ mở ở giai đoạn Trưởng thành.</p>
      </template>
      <p v-else class="locked"><Icon icon="solar:lock-linear" width="18"/> Nuôi tới giai đoạn Cây non để mở khóa mẹo chăm sóc.</p>
    </section>

    <hr/>

    <section>
      <h2>Bạn có biết?</h2>
      <template v-if="unlocked >= 4">
        <ul v-if="species.funFacts.length"><li v-for="fact in species.funFacts" :key="fact">{{ fact }}</li></ul>
        <p v-else class="more">Loài này chưa có điều thú vị nào được ghi lại.</p>
        <figure><img src="/assets/ic_fhl3_light_meter.png" :alt="species.name"/></figure>
      </template>
      <p v-else class="locked"><Icon icon="solar:lock-linear" width="18"/> Nuôi tới khi ra hoa để mở khóa sự thật thú vị.</p>
    </section>
  </article>
</template>
