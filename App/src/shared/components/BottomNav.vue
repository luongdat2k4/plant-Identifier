<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Icon } from '@iconify/vue'
const route = useRoute()
const router = useRouter()
const active = computed(() => route.name)
const items = [
  { name: 'garden', label: 'Vườn', icon: 'solar:home-angle-bold' },
  { name: 'collection', label: 'Bộ sưu tập', icon: 'solar:leaf-bold' },
  { name: 'scan', label: 'Chụp ảnh', icon: 'solar:camera-bold' },
  { name: 'seeds', label: 'Túi hạt', icon: 'solar:box-bold' },
  { name: 'menu', label: 'Menu', icon: 'solar:widget-bold' },
]
</script>

<template>
  <nav class="bottom-nav" aria-label="Điều hướng chính">
    <button v-for="item in items" :key="item.name" :class="{ active: active === item.name }" :aria-label="item.label" :aria-current="active === item.name ? 'page' : undefined" @click="router.push({ name: item.name })">
      <Icon :icon="item.icon" width="23"/>
    </button>
  </nav>
</template>
