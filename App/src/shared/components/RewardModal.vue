<script setup lang="ts">
import { onBeforeUnmount, onMounted } from 'vue'
import { Icon } from '@iconify/vue'
import { t } from '../i18n'
import { adsSuppressed } from '../../features/ads/adRuntime'

// A celebration popup: a ribbon title, one picture or a row of plant thumbnails, an optional coin reward, and OK.
// Native ads are drawn above the page and would cover it, so they step aside while it is open.
const props = defineProps<{ title: string; text?: string; images?: string[]; coins?: number }>()
const emit = defineEmits<{ ok: [] }>()
onMounted(() => { adsSuppressed.value = true })
onBeforeUnmount(() => { adsSuppressed.value = false })
</script>

<template>
  <div class="reward-scrim" role="dialog" aria-modal="true" :aria-label="props.title">
    <section class="reward-card">
      <div class="reward-ribbon">{{ props.title }}</div>
      <div v-if="props.images?.length" class="reward-images" :class="{ single: props.images.length === 1 }">
        <img v-for="(src, i) in props.images" :key="i" :src="src" alt=""/>
      </div>
      <p v-if="props.text" class="reward-text">{{ props.text }}</p>
      <div v-if="props.coins" class="reward-coins"><Icon icon="fluent-emoji-flat:chestnut" width="22"/> {{ t('coins.plus', { n: String(props.coins) }) }}</div>
      <button class="dark-button full" @click="emit('ok')">{{ t('common.ok') }}</button>
    </section>
  </div>
</template>
