<script setup lang="ts">
import { computed } from 'vue'
import type { Species } from '../../features/collection/model'
import { t } from '../i18n'
const props = defineProps<{ species: Species }>()
const facts = computed(() => [
  { label: t('article.family'), value: props.species.family },
  { label: t('article.genus'), value: props.species.scientificName.split(' ')[0] },
  { label: t('article.origin'), value: props.species.origin },
  { label: t('species.spot'), value: props.species.preferredSpot === 'sun' ? t('spot.sun') : t('spot.shade') },
].filter(fact => fact.value))
</script>

<template>
  <article class="article">
    <section>
      <h2>{{ t('article.info') }}</h2>
      <p v-if="species.description" class="lead">{{ species.description }}</p>
      <dl class="facts">
        <div v-for="fact in facts" :key="fact.label"><dt>{{ fact.label }}</dt><dd>{{ fact.value }}</dd></div>
      </dl>
    </section>

    <hr/>

    <section>
      <h2>{{ t('article.tips') }}</h2>
      <figure><img src="/assets/ic_fhl3_watering_calculator.png" :alt="t('article.careAlt', { name: species.name })"/></figure>
      <template v-if="species.careTips.length">
        <p class="cue">{{ t('article.remember') }}</p>
        <ol><li v-for="tip in species.careTips" :key="tip">{{ tip }}</li></ol>
      </template>
      <p v-else class="more">{{ t('article.noTips') }}</p>
    </section>

    <hr/>

    <section>
      <h2>{{ t('article.facts') }}</h2>
      <ul v-if="species.funFacts.length"><li v-for="fact in species.funFacts" :key="fact">{{ fact }}</li></ul>
      <p v-else class="more">{{ t('article.noFacts') }}</p>
      <figure><img src="/assets/ic_fhl3_light_meter.png" :alt="species.name"/></figure>
    </section>
  </article>
</template>
