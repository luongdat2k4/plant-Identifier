<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { state } from '../store'
import { t } from '../i18n'
</script>

<template>
  <span class="coin-pill" :aria-label="t('coins.plus', { n: String(state.coins) }).replace('+', '')"><Icon icon="fluent-emoji-flat:chestnut" width="18"/>{{ state.coins }}</span>
</template>
