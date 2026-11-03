<script setup lang="ts">
import NotificationBell from '../../../shared/components/NotificationBell.vue'
import { computed } from 'vue'
import { Icon } from '@iconify/vue'
import { resetState, state } from '../../../shared/store'
import { allSpecies } from '../../collection/model'
import { useAppNavigation } from '../../../shared/composables/useAppNavigation'
import { useToast } from '../../../shared/composables/useToast'
const { go } = useAppNavigation()
const { notify } = useToast()
const mastered = computed(() => state.value.discoveries.filter(d => d.mastered).length)
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
      <button @click="go('language')"><Icon icon="solar:play-circle-linear"/> Xem lại giới thiệu <Icon icon="solar:alt-arrow-right-linear"/></button>
      <button @click="notify('PlantIn · bản thử giao diện v2')"><Icon icon="solar:info-circle-linear"/> Giới thiệu <Icon icon="solar:alt-arrow-right-linear"/></button>
    </div>

    <div class="section-heading"><div><p class="eyebrow">DỮ LIỆU</p><h2>Dữ liệu của bạn</h2></div></div>
    <div class="settings-list">
      <button class="danger-row" @click="reset"><Icon icon="solar:trash-bin-minimalistic-linear"/> Xóa toàn bộ dữ liệu <Icon icon="solar:alt-arrow-right-linear"/></button>
    </div>
  </main>
</template>
