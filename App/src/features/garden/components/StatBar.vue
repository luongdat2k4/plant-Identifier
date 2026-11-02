<script setup lang="ts">
import { Icon } from '@iconify/vue'
defineProps<{ label: string; value: number; kind: 'water' | 'nutrition'; compact?: boolean }>()
</script>

<template>
  <div class="stat-bar" :class="[kind, { compact }]">
    <div class="stat-bar-head">
      <span><Icon :icon="kind === 'water' ? 'solar:waterdrop-bold' : 'solar:leaf-bold'" width="14"/> {{ label }}</span>
      <b>{{ Math.round(value) }}%</b>
    </div>
    <div class="stat-bar-track"><div class="stat-bar-fill" :class="{ low: value < 40, critical: value < 15 }" :style="{ width: `${value}%` }"></div></div>
  </div>
</template>
