<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Icon } from '@iconify/vue'
const route = useRoute()
const router = useRouter()
const active = computed(() => route.name)
</script>

<template>
  <nav class="bottom-nav" aria-label="Main navigation">
    <button :class="{ active: active === 'plants' }" @click="router.push({ name: 'plants' })"><Icon icon="solar:home-angle-linear" width="24"/><span>My plants</span></button>
    <button :class="{ active: active === 'search' }" @click="router.push({ name: 'search' })"><Icon icon="solar:magnifer-linear" width="24"/><span>Search</span></button>
    <button class="scan-nav" :class="{ active: active === 'scan' }" @click="router.push({ name: 'scan' })"><span><Icon icon="solar:camera-bold" width="25"/></span><em>Scan</em></button>
    <button :class="{ active: active === 'blog' }" @click="router.push({ name: 'blog' })"><Icon icon="solar:book-2-linear" width="24"/><span>Blog</span></button>
    <button :class="{ active: active === 'menu' }" @click="router.push({ name: 'menu' })"><Icon icon="solar:widget-linear" width="24"/><span>Menu</span></button>
  </nav>
</template>
