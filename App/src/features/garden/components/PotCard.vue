<script setup lang="ts">
import { computed } from 'vue'
import { Icon } from '@iconify/vue'
import { STAGE_META } from '../../collection/model'
import { potName, stageOf, statusOf, STATUS_META, type Pot } from '../model'
const props = defineProps<{ pot: Pot }>()
defineEmits<{ open: []; water: []; feed: [] }>()
const status = computed(() => statusOf(props.pot))
const stage = computed(() => STAGE_META[stageOf(props.pot)])
</script>

<template>
  <article class="pot-card" :class="status">
    <button class="pot-card-main" @click="$emit('open')">
      <div class="pot-photo">
        <img :src="pot.photo" :alt="potName(pot)"/>
        <span class="stage-badge">{{ stage.emoji }} {{ stage.label }}</span>
      </div>
      <b class="pot-name">{{ potName(pot) }}</b>
      <div class="mini-stats">
        <div><i class="mini-ic water" :class="{ low: pot.water < 40 }"><Icon icon="solar:waterdrop-bold" width="17"/></i><span>{{ Math.round(pot.water) }}%</span></div>
        <div><i class="mini-ic nutrition" :class="{ low: pot.nutrition < 40 }"><Icon icon="solar:leaf-bold" width="17"/></i><span>{{ Math.round(pot.nutrition) }}%</span></div>
        <div><i class="mini-ic state" :class="status"><Icon :icon="status === 'happy' ? 'solar:heart-bold' : status === 'wilting' ? 'solar:danger-triangle-bold' : 'solar:bell-bold'" width="17"/></i><span>{{ STATUS_META[status].label }}</span></div>
      </div>
    </button>
    <div class="pot-actions">
      <button class="care-btn" aria-label="Tưới nước" @click="$emit('water')"><Icon icon="solar:waterdrop-bold" width="16"/> Tưới</button>
      <button class="care-btn" aria-label="Bón phân" @click="$emit('feed')"><Icon icon="solar:leaf-bold" width="16"/> Bón</button>
    </div>
  </article>
</template>
