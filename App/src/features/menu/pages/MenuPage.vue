<script setup lang="ts">
import NotificationBell from '../../../shared/components/NotificationBell.vue'
import { computed } from 'vue'
import { Icon } from '@iconify/vue'
import { resetState, state } from '../../../shared/store'
import { allSpecies } from '../../collection/model'
import { useAppNavigation } from '../../../shared/composables/useAppNavigation'
import { useToast } from '../../../shared/composables/useToast'
import { lang, LANGUAGES, t } from '../../../shared/i18n'
const { go } = useAppNavigation()
const { notify } = useToast()
const mastered = computed(() => state.value.discoveries.filter(d => d.mastered).length)
const currentLang = computed(() => LANGUAGES.find(item => item.code === lang.value) ?? LANGUAGES[0])
function reset() {
  if (!confirm(t('confirm.clearData'))) return
  resetState(); notify(t('toast.dataCleared')); go('garden')
}
</script>

<template>
  <header class="home-head">
    <div class="home-greeting"><b>{{ t('menu.title') }}</b><span>{{ t('menu.subtitle') }}</span></div>
    <NotificationBell/>
  </header>
  <main class="content">
    <div class="collection-summary">
      <div><b>{{ state.pots.length }}</b><span>{{ t('menu.pots') }}</span></div>
      <div><b>{{ state.discoveries.length }}<small>/{{ allSpecies.length }}</small></b><span>{{ t('stats.seen') }}</span></div>
      <div><b>{{ mastered }}</b><span>{{ t('stats.mastered') }}</span></div>
    </div>

    <div class="section-heading"><div><p class="eyebrow">{{ t('menu.settingsEyebrow') }}</p><h2>{{ t('menu.options') }}</h2></div></div>
    <div class="settings-list">
      <button @click="go('seeds')"><Icon icon="solar:box-linear"/> {{ t('menu.seedBag') }} <span>{{ state.seeds.length }}</span></button>
      <button @click="state.notifications = !state.notifications"><Icon icon="solar:bell-linear"/> {{ t('menu.reminders') }} <span>{{ state.notifications ? t('menu.on') : t('menu.off') }}</span></button>
      <button class="lang-row" @click="go('menu-language')">
        <Icon icon="solar:global-linear"/> {{ t('menu.language') }}
        <span class="lang-now"><img :src="`/assets/flag/${currentLang.code}.svg`" alt=""/>{{ currentLang.native }}</span>
        <Icon icon="solar:alt-arrow-right-linear"/>
      </button>
      <button @click="go('language')"><Icon icon="solar:play-circle-linear"/> {{ t('menu.replayIntro') }} <Icon icon="solar:alt-arrow-right-linear"/></button>
      <button @click="notify(t('toast.about'))"><Icon icon="solar:info-circle-linear"/> {{ t('menu.about') }} <Icon icon="solar:alt-arrow-right-linear"/></button>
    </div>

    <div class="section-heading"><div><p class="eyebrow">{{ t('menu.dataEyebrow') }}</p><h2>{{ t('menu.yourData') }}</h2></div></div>
    <div class="settings-list">
      <button class="danger-row" @click="reset"><Icon icon="solar:trash-bin-minimalistic-linear"/> {{ t('menu.clear') }} <Icon icon="solar:alt-arrow-right-linear"/></button>
    </div>
  </main>
</template>
