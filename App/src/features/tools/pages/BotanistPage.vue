<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { useAppNavigation } from '../../../shared/composables/useAppNavigation'
const { go, back } = useAppNavigation()
</script>

<template>
<header class="page-header"><button @click="back"><Icon icon="solar:arrow-left-linear" width="24"/></button><h2>Botanist help</h2><span></span></header><main class="content tool-page"><div class="tool-intro"><img src="/assets/ic_fhl3_ai_botanist.png" alt=""/><p class="eyebrow">ASK ABOUT YOUR PLANT</p><h1>Find a next step</h1><p>Start with a symptom check or save a photo for your own records.</p></div><button class="menu-link" @click="go('diagnosis')"><Icon icon="solar:health-linear"/> Check symptoms <Icon icon="solar:alt-arrow-right-linear"/></button><button class="menu-link" @click="go('scan', 'Plant')"><Icon icon="solar:camera-linear"/> Add a plant photo <Icon icon="solar:alt-arrow-right-linear"/></button><p class="help-text">Live botanist and AI answers depend on PlantIn services and are not part of this offline build.</p></main>
</template>
