<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { Icon } from '@iconify/vue'
import { state } from '../../../shared/store'
import { getSpecies, stageIndex, STAGE_META, STAGES } from '../../collection/model'
import { daysUntilDeath, feedPot, nextStage, potName, setSpot, stageOf, statusOf, STATUS_META, uprootPot, waterPot, type Spot } from '../model'
import { useAppNavigation } from '../../../shared/composables/useAppNavigation'
import { useToast } from '../../../shared/composables/useToast'
import StatBar from '../components/StatBar.vue'
const route = useRoute()
const { go, back } = useAppNavigation()
const { notify } = useToast()
const pot = computed(() => state.value.pots.find(p => p.id === route.params.id))
const species = computed(() => pot.value && getSpecies(pot.value.speciesId))
const status = computed(() => (pot.value ? statusOf(pot.value) : 'happy'))
const stage = computed(() => (pot.value ? stageOf(pot.value) : 'seed'))
const upcoming = computed(() => (pot.value ? nextStage(pot.value) : null))
const deathIn = computed(() => (pot.value ? daysUntilDeath(pot.value) : null))
const progress = computed(() => {
  if (!pot.value || !upcoming.value) return 100
  const from = STAGE_META[stage.value].minDays
  const to = STAGE_META[upcoming.value.stage].minDays
  return Math.round(((pot.value.growthDays - from) / (to - from)) * 100)
})
const unlocked = computed(() => stageIndex(stage.value))
function water() { if (pot.value) { waterPot(pot.value.id); notify('Đã tưới nước') } }
function feed() { if (pot.value) { feedPot(pot.value.id); notify('Đã bón phân') } }
function changeSpot(spot: Spot) { if (pot.value) setSpot(pot.value.id, spot) }
function uproot() {
  if (!pot.value || !confirm(`Nhổ ${potName(pot.value)} khỏi chậu? Cây sẽ quay về túi hạt giống.`)) return
  uprootPot(pot.value.id); notify('Đã cất cây về túi hạt'); go('garden')
}
</script>

<template>
  <template v-if="pot && species">
    <section class="hero">
      <header class="hero-bar"><button class="round-btn" aria-label="Quay lại" @click="back"><Icon icon="solar:arrow-left-linear" width="22"/></button></header>
      <img class="hero-img" :src="pot.photo" :alt="species.name"/>
      <dl class="hero-meta">
        <div><dt>Giai đoạn</dt><dd>{{ STAGE_META[stage].emoji }} {{ STAGE_META[stage].label }}</dd></div>
        <div><dt>Nước</dt><dd>{{ Math.round(pot.water) }}%</dd></div>
        <div><dt>Dinh dưỡng</dt><dd>{{ Math.round(pot.nutrition) }}%</dd></div>
      </dl>
    </section>

    <main class="sheet">
      <p class="eyebrow">{{ species.scientificName }}</p>
      <h1 class="sheet-title">{{ species.name }}</h1>

      <div class="status-banner" :class="status">
        <b>{{ STATUS_META[status].label }}</b>
        <span>{{ STATUS_META[status].hint }}</span>
        <small v-if="deathIn !== null">Còn khoảng {{ deathIn }} ngày trước khi cây ngủ đông.</small>
      </div>

      <div class="care-card">
        <StatBar kind="water" label="Nước" :value="pot.water"/>
        <StatBar kind="nutrition" label="Dinh dưỡng" :value="pot.nutrition"/>
      </div>

      <div class="field">
        <label>Vị trí đặt</label>
        <div class="segmented">
          <button :class="{ active: pot.spot === 'sun' }" @click="changeSpot('sun')"><Icon icon="solar:sun-2-bold"/> Chỗ nắng</button>
          <button :class="{ active: pot.spot === 'shade' }" @click="changeSpot('shade')"><Icon icon="solar:cloud-bold"/> Chỗ râm</button>
        </div>
        <small class="spot-hint">{{ pot.spot === species.preferredSpot ? 'Đây là chỗ cây thích.' : `Cây thích ${species.preferredSpot === 'sun' ? 'chỗ nắng' : 'chỗ râm'} hơn, đặt sai chỗ cây sẽ khát nhanh hơn một chút.` }}</small>
      </div>

      <div class="field nickname"><label>Tên riêng</label><input v-model="pot.nickname" :placeholder="species.name" maxlength="24"/></div>

      <div class="growth-card">
        <div class="growth-head"><b>Tăng trưởng</b><span>{{ pot.growthDays }} ngày chăm tốt</span></div>
        <div class="stat-bar-track"><div class="stat-bar-fill growth" :style="{ width: `${progress}%` }"></div></div>
        <p v-if="upcoming">Còn {{ upcoming.daysLeft }} ngày nữa để lên {{ STAGE_META[upcoming.stage].label }}. Cây héo sẽ tạm dừng lớn, nhưng không bị mất tiến độ.</p>
        <p v-else>Cây đã ra hoa, loài này đã được thuần trong bộ sưu tập.</p>
        <div class="stage-steps">
          <span v-for="(s, i) in STAGES" :key="s" :class="{ done: i <= unlocked, current: i === unlocked }">{{ STAGE_META[s].emoji }}</span>
        </div>
      </div>

      <section class="info-section">
        <h3>Thông tin loài</h3>
        <div class="info-block" :class="{ locked: unlocked < 1 }">
          <template v-if="unlocked >= 1"><p>{{ species.description }}</p></template>
          <template v-else><Icon icon="solar:lock-linear"/> Nuôi tới giai đoạn Mầm để mở khóa.</template>
        </div>
        <div class="info-block" :class="{ locked: unlocked < 2 }">
          <template v-if="unlocked >= 2"><b>Mẹo chăm sóc</b><ul><li v-for="tip in (unlocked >= 3 ? species.careTips : species.careTips.slice(0, 1))" :key="tip">{{ tip }}</li></ul><small v-if="unlocked < 3">Đủ các mẹo ở giai đoạn Trưởng thành.</small></template>
          <template v-else><Icon icon="solar:lock-linear"/> Nuôi tới giai đoạn Cây non để mở khóa mẹo chăm sóc.</template>
        </div>
        <div class="info-block" :class="{ locked: unlocked < 4 }">
          <template v-if="unlocked >= 4"><b>Bạn có biết?</b><ul><li v-for="fact in species.funFacts" :key="fact">{{ fact }}</li></ul></template>
          <template v-else><Icon icon="solar:lock-linear"/> Nuôi tới khi ra hoa để mở khóa sự thật thú vị.</template>
        </div>
      </section>

      <button class="delete-button" @click="uproot">Nhổ cây, cất về túi hạt</button>
      <div class="sheet-cta">
        <button class="dark-button" @click="water"><Icon icon="solar:waterdrop-bold"/> Tưới nước</button>
        <button class="dark-button" @click="feed"><Icon icon="solar:leaf-bold"/> Bón phân</button>
      </div>
    </main>
  </template>
  <main v-else class="content search-empty">
    <h3>Không tìm thấy cây</h3>
    <p>Cây này có thể đã ngủ đông và quay về túi hạt giống.</p>
    <button class="dark-button" @click="go('garden')">Về vườn</button>
  </main>
</template>
