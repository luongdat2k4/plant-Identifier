<script setup lang="ts">
import { useRouter } from 'vue-router'
import { Icon } from '@iconify/vue'
import InFeedAd from '../../ads/components/InFeedAd.vue'
import { hasChosenLanguage, LANGUAGES, lang, markLanguageChosen, setLang, t } from '../../../shared/i18n'

const router = useRouter()
// Make sure a first-run visit has a stored choice even if the user just taps Continue.
if (!hasChosenLanguage()) setLang(lang.value)

function confirm() {
  markLanguageChosen()
  router.replace({ name: 'welcome' })
}
</script>

<template>
  <main class="ob lang">
    <section class="lang-body">
      <div class="ob-art">
        <i class="ob-glow"></i>
        <span class="lang-globe"><Icon icon="solar:global-bold" width="64"/></span>
        <span class="lang-bubble b1">Xin chào</span>
        <span class="lang-bubble b2">Hello</span>
        <i class="ob-spark s1"></i><i class="ob-spark s2"></i>
        <svg class="ob-hills" viewBox="0 0 375 130" preserveAspectRatio="none" aria-hidden="true">
          <g fill="#7ec37a"><circle cx="30" cy="62" r="34"/><circle cx="78" cy="48" r="28"/><circle cx="318" cy="52" r="32"/><circle cx="352" cy="66" r="26"/></g>
          <g fill="#5fae6a"><circle cx="8" cy="76" r="30"/><circle cx="58" cy="70" r="26"/><circle cx="296" cy="72" r="28"/><circle cx="366" cy="80" r="30"/></g>
          <g fill="#a3d99a"><circle cx="112" cy="74" r="24"/><circle cx="262" cy="70" r="22"/></g>
          <path d="M0 78 C 70 54, 130 112, 200 84 S 320 54, 375 78 L375 130 L0 130 Z" fill="#fff"/>
        </svg>
      </div>

      <div class="ob-copy lang-copy">
        <h1>{{ t('lang.title') }}</h1>
        <div class="lang-list" role="radiogroup" :aria-label="t('lang.title')">
          <button v-for="item in LANGUAGES" :key="item.code" class="lang-opt" :class="{ on: lang === item.code }" role="radio" :aria-checked="lang === item.code" @click="setLang(item.code)">
            <span class="lang-code"><img :src="`/assets/flag/${item.code}.svg`" alt=""/></span>
            <span class="lang-name"><b>{{ item.native }}</b><small>{{ item.name }}</small></span>
            <i class="lang-tick"><Icon icon="solar:check-circle-bold" width="26"/></i>
          </button>
        </div>
      </div>
      <div class="lang-ads"><InFeedAd template="small"/></div>
    </section>

    <footer class="ob-foot">
      <button class="ob-next" @click="confirm">{{ t('lang.continue') }}</button>
    </footer>
  </main>
</template>
