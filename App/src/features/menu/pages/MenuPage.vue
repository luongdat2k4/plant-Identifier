<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { state } from '../../../shared/store'
import { useAppNavigation } from '../../../shared/composables/useAppNavigation'
import { useToast } from '../../../shared/composables/useToast'
const { go } = useAppNavigation()
const { notify } = useToast()
</script>

<template>
<header class="topbar"><div><p class="eyebrow">EVERYTHING FOR YOUR PLANTS</p><h1>Explore</h1></div></header><main class="content"><div class="menu-banner"><div><span>PLANTIN TOOLS</span><h2>Care for every leaf.</h2><p>Helpful tools for your daily routine.</p></div><img src="/assets/ic_scroll_card_3.png" alt=""/></div><div class="section-heading"><div><p class="eyebrow">TOOLS</p><h2>Plant care</h2></div></div><div class="tool-grid"><button @click="go('diagnosis')"><img src="/assets/ic_fhl3_diseases_treatment.png" alt=""/><b>Diagnosis</b><span>Check symptoms</span></button><button @click="go('light')"><img src="/assets/ic_fhl3_light_meter.png" alt=""/><b>Light meter</b><span>Find the right spot</span></button><button @click="go('water')"><img src="/assets/ic_fhl3_watering_calculator.png" alt=""/><b>Watering calculator</b><span>Plan your routine</span></button><button @click="go('botanist')"><img src="/assets/ic_fhl3_ai_botanist.png" alt=""/><b>Botanist help</b><span>Care suggestions</span></button></div><div class="section-heading"><div><p class="eyebrow">ACCOUNT</p><h2>Settings</h2></div></div><div class="settings-list"><button @click="go('history')"><Icon icon="solar:history-linear"/> Scan history <Icon icon="solar:alt-arrow-right-linear"/></button><button @click="state.notifications = !state.notifications"><Icon icon="solar:bell-linear"/> Care reminders <span>{{ state.notifications ? 'On' : 'Off' }}</span></button><button @click="notify('PlantIn recreation • v1.0')"><Icon icon="solar:info-circle-linear"/> About <Icon icon="solar:alt-arrow-right-linear"/></button></div></main>
</template>
