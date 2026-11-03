<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { getSpecies, RARITY_META } from '../../features/collection/model'
import type { Seed } from '../../features/scan/model'
defineProps<{ seed: Seed; canPlant: boolean; removable?: boolean }>()
defineEmits<{ plant: []; discard: [] }>()
</script>

<template>
  <article class="list-row">
    <img :src="getSpecies(seed.speciesId)?.thumb" :alt="getSpecies(seed.speciesId)?.name"/>
    <div class="list-row-text">
      <b>{{ getSpecies(seed.speciesId)?.name ?? 'Hạt lạ' }}</b>
      <span>{{ getSpecies(seed.speciesId) ? RARITY_META[getSpecies(seed.speciesId)!.rarity].label : '' }} · {{ new Date(seed.createdAt).toLocaleDateString('vi-VN') }}</span>
    </div>
    <button v-if="removable" class="plain-icon danger" aria-label="Bỏ hạt" @click="$emit('discard')"><Icon icon="solar:trash-bin-minimalistic-linear" width="20"/></button>
    <button class="plus-btn" :disabled="!canPlant" aria-label="Trồng hạt giống" @click="$emit('plant')"><Icon icon="solar:add-circle-linear" width="24"/></button>
  </article>
</template>
