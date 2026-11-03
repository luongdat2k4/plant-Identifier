<script setup lang="ts">
import { t, dateLocale } from '../i18n'
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
      <b>{{ getSpecies(seed.speciesId)?.name ?? t('seed.unknown') }}</b>
      <span>{{ getSpecies(seed.speciesId) ? RARITY_META[getSpecies(seed.speciesId)!.rarity].label : '' }} · {{ new Date(seed.createdAt).toLocaleDateString(dateLocale()) }}</span>
    </div>
    <button v-if="removable" class="plain-icon danger" :aria-label="t('seed.discard')" @click="$emit('discard')"><Icon icon="solar:trash-bin-minimalistic-linear" width="20"/></button>
    <button class="plus-btn" :disabled="!canPlant" :aria-label="t('seed.plant')" @click="$emit('plant')"><Icon icon="solar:add-circle-linear" width="24"/></button>
  </article>
</template>
