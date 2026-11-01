<script setup lang="ts">
import { computed } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import BottomNav from './shared/components/BottomNav.vue'
import { useToast } from './shared/composables/useToast'
const route = useRoute()
const { toast } = useToast()
const showNav = computed(() => ['plants', 'search', 'scan', 'blog', 'menu'].includes(String(route.name)))
</script>

<template>
  <div class="app-shell">
    <div class="status-space"></div>
    <RouterView />
    <BottomNav v-if="showNav" />
    <div v-if="toast" class="toast" role="status">{{ toast }}</div>
  </div>
</template>
