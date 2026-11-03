<script setup lang="ts">
import NotificationBell from '../../../shared/components/NotificationBell.vue'
import { computed, ref } from 'vue'
import { Icon } from '@iconify/vue'
import { resetState, state } from '../../../shared/store'
import { allSpecies } from '../../collection/model'
import { useAppNavigation } from '../../../shared/composables/useAppNavigation'
import { useToast } from '../../../shared/composables/useToast'
import { lang, LANGUAGES, setLang, type Lang } from '../../../shared/i18n'
const { go } = useAppNavigation()
const { notify } = useToast()
const mastered = computed(() => state.value.discoveries.filter(d => d.mastered).length)
const pickingLang = ref(false)
const currentLang = computed(() => LANGUAGES.find(item => item.code === lang.value) ?? LANGUAGES[0])
function chooseLang(code: Lang) { setLang(code); pickingLang.value = false }
function reset() {
  if (!confirm('Xóa toàn bộ vườn và bộ sưu tập?')) return
  resetState(); notify('Đã xóa dữ liệu'); go('garden')
}
</script>

<template>
  <header class="home-head">
    <div class="home-greeting"><b>Menu</b><span>Tài khoản của bạn</span></div>
    <NotificationBell/>
  </header>
  <main class="content">
    <div class="collection-summary">
      <div><b>{{ state.pots.length }}</b><span>Cây đang nuôi</span></div>
      <div><b>{{ state.discoveries.length }}<small>/{{ allSpecies.length }}</small></b><span>Đã gặp</span></div>
      <div><b>{{ mastered }}</b><span>Đã thuần</span></div>
    </div>

    <div class="section-heading"><div><p class="eyebrow">CÀI ĐẶT</p><h2>Tùy chọn</h2></div></div>
    <div class="settings-list">
      <button @click="go('seeds')"><Icon icon="solar:box-linear"/> Túi hạt giống <span>{{ state.seeds.length }}</span></button>
      <button @click="state.notifications = !state.notifications"><Icon icon="solar:bell-linear"/> Nhắc chăm cây <span>{{ state.notifications ? 'Bật' : 'Tắt' }}</span></button>
      <button class="lang-row" :class="{ open: pickingLang }" @click="pickingLang = !pickingLang">
        <Icon icon="solar:global-linear"/> Ngôn ngữ
        <span class="lang-now"><img :src="`/assets/flag/${currentLang.code}.svg`" alt=""/>{{ currentLang.native }}</span>
        <Icon icon="solar:alt-arrow-down-linear" class="lang-caret"/>
      </button>
      <div v-if="pickingLang" class="lang-pick" role="radiogroup" aria-label="Ngôn ngữ">
        <button v-for="item in LANGUAGES" :key="item.code" role="radio" :aria-checked="lang === item.code" :class="{ on: lang === item.code }" @click="chooseLang(item.code)">
          <img :src="`/assets/flag/${item.code}.svg`" alt=""/>
          <span class="lang-pick-name"><b>{{ item.native }}</b><small>{{ item.name }}</small></span>
          <Icon v-if="lang === item.code" icon="solar:check-circle-bold" width="22"/>
        </button>
      </div>
      <button @click="go('language')"><Icon icon="solar:play-circle-linear"/> Xem lại giới thiệu <Icon icon="solar:alt-arrow-right-linear"/></button>
      <button @click="notify('PlantIn · bản thử giao diện v2')"><Icon icon="solar:info-circle-linear"/> Giới thiệu <Icon icon="solar:alt-arrow-right-linear"/></button>
    </div>

    <div class="section-heading"><div><p class="eyebrow">DỮ LIỆU</p><h2>Dữ liệu của bạn</h2></div></div>
    <div class="settings-list">
      <button class="danger-row" @click="reset"><Icon icon="solar:trash-bin-minimalistic-linear"/> Xóa toàn bộ dữ liệu <Icon icon="solar:alt-arrow-right-linear"/></button>
    </div>
  </main>
</template>
