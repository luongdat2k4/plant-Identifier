<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Icon } from '@iconify/vue'
import { t } from '../i18n'
const route = useRoute()
const router = useRouter()
const active = computed(() => route.name)
const items = computed(() => [
  { name: 'garden', label: t('nav.garden'), icon: 'solar:home-angle-bold' },
  { name: 'collection', label: t('nav.collection'), icon: 'solar:leaf-bold' },
  { name: 'scan', label: t('nav.scan'), icon: 'solar:camera-bold' },
  { name: 'seeds', label: t('nav.seeds'), icon: 'solar:box-bold' },
  { name: 'menu', label: t('nav.menu'), icon: 'solar:widget-bold' },
])
</script>

<template>
  <nav class="bottom-nav" :aria-label="t('nav.label')">
    <button v-for="item in items" :key="item.name" :class="{ active: active === item.name, 'scan-btn': item.name === 'scan' }" :aria-label="item.label" :aria-current="active === item.name ? 'page' : undefined" @click="router.push({ name: item.name })">
      <Icon :icon="item.icon" width="23"/>
    </button>
  </nav>
</template>
