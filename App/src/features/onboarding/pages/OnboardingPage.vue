<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { Icon } from '@iconify/vue'
import { markOnboarded } from '../../../shared/utils/onboarding'
import { t } from '../../../shared/i18n'
import InFeedAd from '../../ads/components/InFeedAd.vue'
import { bannerInset, showInterstitial } from '../../ads/adRuntime'

const router = useRouter()
const track = ref<HTMLElement | null>(null)
const index = ref(0)
const slides = computed(() => [
  { image: '/assets/ic_scroll_card_6.png', title: t('ob.1.title'), text: t('ob.1.text'), icons: ['solar:camera-bold', 'solar:magic-stick-3-bold'] },
  { image: '/assets/ic_scroll_card_5.png', title: t('ob.2.title'), text: t('ob.2.text'), icons: ['solar:waterdrop-bold', 'solar:leaf-bold'] },
  { image: '/assets/ic_scroll_card_1.png', title: t('ob.3.title'), text: t('ob.3.text'), icons: ['solar:book-bookmark-bold', 'solar:medal-ribbon-bold'] },
])
// The ad sits above the fixed footer, so it needs a tall screen (minus the bottom banner) to leave the slide readable.
const roomForAd = computed(() => window.innerHeight - bannerInset.value >= 760)
const last = computed(() => index.value === slides.value.length - 1)

function onScroll() {
  const el = track.value
  if (el) index.value = Math.round(el.scrollLeft / el.clientWidth)
}
function goTo(i: number) { track.value?.scrollTo({ left: i * track.value.clientWidth, behavior: 'smooth' }) }
function next() { if (last.value) finish(); else goTo(index.value + 1) }
function finish() {
  markOnboarded()
  router.replace({ name: 'garden' })
  // End of the intro: one interstitial over the garden if an ad was preloaded while the intro was read.
  void showInterstitial('after_welcome')
}
onMounted(() => track.value?.focus({ preventScroll: true }))
</script>

<template>
  <main class="ob">
    <div ref="track" class="ob-track" tabindex="-1" @scroll.passive="onScroll">
      <section v-for="(slide, i) in slides" :key="i" class="ob-slide" :aria-hidden="i !== index">
        <div class="ob-art">
          <i class="ob-glow"></i>
          <span class="ob-chip c1"><Icon :icon="slide.icons[0]" width="22"/></span>
          <span class="ob-chip c2"><Icon :icon="slide.icons[1]" width="22"/></span>
          <i class="ob-spark s1"></i><i class="ob-spark s2"></i>
          <img :src="slide.image" alt=""/>
          <svg class="ob-hills" viewBox="0 0 375 130" preserveAspectRatio="none" aria-hidden="true">
            <g fill="#7ec37a"><circle cx="30" cy="62" r="34"/><circle cx="78" cy="48" r="28"/><circle cx="318" cy="52" r="32"/><circle cx="352" cy="66" r="26"/></g>
            <g fill="#5fae6a"><circle cx="8" cy="76" r="30"/><circle cx="58" cy="70" r="26"/><circle cx="296" cy="72" r="28"/><circle cx="366" cy="80" r="30"/></g>
            <g fill="#a3d99a"><circle cx="112" cy="74" r="24"/><circle cx="262" cy="70" r="22"/></g>
            <path d="M0 78 C 70 54, 130 112, 200 84 S 320 54, 375 78 L375 130 L0 130 Z" fill="#fff"/>
          </svg>
        </div>
        <div class="ob-copy">
          <h1>{{ slide.title }}</h1>
          <p>{{ slide.text }}</p>
        </div>
      </section>
    </div>

    <div v-if="roomForAd" class="ob-ad"><InFeedAd template="small"/></div>

    <footer class="ob-foot">
      <div class="ob-dots" role="tablist" :aria-label="t('ob.dots')">
        <button v-for="(slide, i) in slides" :key="i" :class="{ on: i === index }" :aria-label="t('ob.page', { n: String(i + 1) })" @click="goTo(i)"></button>
      </div>
      <button class="ob-next" @click="next">{{ last ? t('ob.start') : t('ob.next') }}</button>
    </footer>
  </main>
</template>
