<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { lang, LANGUAGES, setLang, t } from '../../../shared/i18n'
import InFeedAd from '../../ads/components/InFeedAd.vue'
import { useAppNavigation } from '../../../shared/composables/useAppNavigation'
const { back } = useAppNavigation()
</script>

<template>
  <header class="home-head lang-page-head">
    <button class="round-btn" :aria-label="t('common.back')" @click="back"><Icon icon="solar:arrow-left-linear" width="22"/></button>
    <div class="home-greeting"><b>{{ t('menu.language') }}</b></div>
  </header>
  <main class="content" data-ad-scroll-region>
    <div class="lang-list" role="radiogroup" :aria-label="t('menu.language')">
      <button v-for="item in LANGUAGES" :key="item.code" class="lang-opt" :class="{ on: lang === item.code }" role="radio" :aria-checked="lang === item.code" @click="setLang(item.code)">
        <span class="lang-code"><img :src="`/assets/flag/${item.code}.svg`" alt=""/></span>
        <span class="lang-name"><b>{{ item.native }}</b><small>{{ item.name }}</small></span>
        <i class="lang-tick"><Icon icon="solar:check-circle-bold" width="26"/></i>
      </button>
    </div>
    <div class="ad-slot"><InFeedAd template="small"/></div>
  </main>
</template>
