<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { markBegun } from '../../../router'
import { hasRuntimeData } from '../../../shared/store'
import { t } from '../../../shared/i18n'
import { initializeAds, tryAppOpenOnLaunch } from '../../ads/adRuntime'

// Entry screen of every launch. A returning user (runtime data exists) sees a short 3s load and then taps Continue;
// a first-time user skips it and goes straight into the language / intro flow.
const WAIT_MS = 3000
const router = useRouter()
const ready = ref(false)
const abort = new AbortController()
let timer: ReturnType<typeof setTimeout> | undefined

function enter() {
  markBegun()
  void router.replace({ name: 'garden' })
}

onMounted(() => {
  if (!hasRuntimeData()) {
    markBegun()
    void router.replace({ name: 'language' })
    return
  }
  timer = setTimeout(() => { ready.value = true }, WAIT_MS)
  // One App Open ad may show over this screen for a returning user, if it is ready within its short window.
  void initializeAds().then(() => tryAppOpenOnLaunch(abort.signal))
})
onBeforeUnmount(() => { clearTimeout(timer); abort.abort() })
</script>

<template>
  <main class="ob begin">
    <div class="ob-art">
      <i class="ob-glow"></i>
      <img src="/assets/ic_scroll_card_6.png" alt=""/>
      <svg class="ob-hills" viewBox="0 0 375 130" preserveAspectRatio="none" aria-hidden="true">
        <g fill="#7ec37a"><circle cx="30" cy="62" r="34"/><circle cx="78" cy="48" r="28"/><circle cx="318" cy="52" r="32"/><circle cx="352" cy="66" r="26"/></g>
        <g fill="#5fae6a"><circle cx="8" cy="76" r="30"/><circle cx="58" cy="70" r="26"/><circle cx="296" cy="72" r="28"/><circle cx="366" cy="80" r="30"/></g>
        <g fill="#a3d99a"><circle cx="112" cy="74" r="24"/><circle cx="262" cy="70" r="22"/></g>
        <path d="M0 78 C 70 54, 130 112, 200 84 S 320 54, 375 78 L375 130 L0 130 Z" fill="#fff"/>
      </svg>
    </div>
    <div class="ob-copy begin-copy">
      <h1>PlantIn</h1>
      <div class="begin-bar" :class="{ done: ready }" role="progressbar" :aria-busy="!ready"><i :style="{ animationDuration: `${WAIT_MS}ms` }"></i></div>
      <p>{{ t('begin.loading') }}</p>
    </div>
    <footer class="ob-foot">
      <button class="ob-next" :disabled="!ready" @click="enter">{{ t('lang.continue') }}</button>
    </footer>
  </main>
</template>
