<script setup lang="ts">
import { t } from '../i18n'
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { Icon } from '@iconify/vue'
import { state } from '../store'
import { feedPot, plantSeed, potName, waterPot, findPot } from '../../features/garden/model'
import { isUnread, markAllRead, markRead, notices, unreadCount, type Notice, type NoticeKind } from '../../features/garden/notifications'
import { useAppNavigation } from '../composables/useAppNavigation'
import { useToast } from '../composables/useToast'
import { adsSuppressed } from '../../features/ads/adRuntime'
const { go } = useAppNavigation()
const { notify } = useToast()
const open = ref(false)
// The panel is part of the page; the native ad view would be drawn over it, so ads step aside while it is open.
watch(open, value => { adsSuppressed.value = value })
onUnmounted(() => { adsSuppressed.value = false })
const tab = ref<'all' | 'unread'>('all')
const bell = ref<HTMLButtonElement | null>(null)
const place = ref({ top: 0, right: 0 })
const BADGES: Record<NoticeKind, string> = { wilting: 'solar:danger-triangle-bold', care: 'solar:waterdrop-bold', seeds: 'solar:leaf-bold' }
const shown = computed(() => notices.value.filter(item => tab.value === 'all' || isUnread(item.id)))

function toggle() {
  if (!open.value && bell.value) {
    const rect = bell.value.getBoundingClientRect()
    place.value = { top: rect.bottom + 10, right: Math.max(12, window.innerWidth - rect.right) }
  }
  open.value = !open.value
}
function pick(item: Notice) {
  markRead(item.id)
  open.value = false
  if (item.potId) go('pot', item.potId); else go('seeds')
}
function care(item: Notice, kind: 'water' | 'feed') {
  if (!item.potId) return
  const pot = findPot(item.potId)
  if (!pot) return
  if (kind === 'water') waterPot(pot.id); else feedPot(pot.id)
  notify(kind === 'water' ? t('toast.watered', { name: potName(pot) }) : t('toast.fed', { name: potName(pot) }))
}
function plantFirst() {
  const seed = state.value.seeds[0]
  const pot = seed && plantSeed(seed.id)
  if (!pot) return notify(t('toast.noFreePot'))
  notify(t('toast.planted'))
  open.value = false
  go('pot', pot.id)
}
function openSeeds() { open.value = false; go('seeds') }
function onKey(event: KeyboardEvent) { if (event.key === 'Escape') open.value = false }
onMounted(() => document.addEventListener('keydown', onKey))
onUnmounted(() => document.removeEventListener('keydown', onKey))
</script>

<template>
  <button ref="bell" class="bell-btn" :class="{ on: open }" :aria-label="t('bell.label')" :aria-expanded="open" @click="toggle">
    <Icon icon="solar:bell-bold" width="24"/>
    <span v-if="unreadCount" class="bell-badge">{{ unreadCount > 9 ? '9+' : unreadCount }}</span>
  </button>
  <Teleport to="body">
    <div v-if="open" class="notice-backdrop" @click="open = false"></div>
    <section v-if="open" class="notice-pop" role="dialog" :aria-label="t('bell.list')" :style="{ top: `${place.top}px`, right: `${place.right}px` }">
      <header>
        <b>{{ t('bell.label') }}</b>
        <div class="notice-tabs" role="tablist">
          <button :class="{ active: tab === 'all' }" @click="tab = 'all'">{{ t('bell.all') }}</button>
          <button :class="{ active: tab === 'unread' }" @click="tab = 'unread'">{{ t('bell.unread') }}</button>
        </div>
      </header>
      <ul v-if="shown.length">
        <li v-for="item in shown" :key="item.id" :class="{ unread: isUnread(item.id) }">
          <button class="notice-main" @click="pick(item)">
            <span class="notice-avatar">
              <img v-if="item.image" :src="item.image" alt=""/>
              <i class="notice-kind" :class="item.kind"><Icon :icon="BADGES[item.kind]" width="12"/></i>
            </span>
            <span class="notice-text">
              <span class="notice-top"><b>{{ item.title }}</b><em>{{ item.meta }}</em></span>
              <small>{{ item.text }}</small>
            </span>
            <i v-if="isUnread(item.id)" class="notice-dot" :aria-label="t('bell.unread')"></i>
          </button>
          <div v-if="item.kind !== 'seeds'" class="notice-actions">
            <button @click="care(item, 'water')"><Icon icon="solar:waterdrop-bold" width="15"/> {{ t('care.water') }}</button>
            <button class="primary" @click="care(item, 'feed')"><Icon icon="solar:leaf-bold" width="15"/> {{ t('care.feed') }}</button>
          </div>
          <div v-else class="notice-actions">
            <button @click="openSeeds">{{ t('bell.viewSeeds') }}</button>
            <button class="primary" @click="plantFirst">{{ t('care.plantNow') }}</button>
          </div>
        </li>
      </ul>
      <div v-else class="notice-empty">
        <Icon icon="solar:check-circle-bold" width="38"/>
        <b>{{ notices.length ? t('bell.allRead') : t('bell.gardenOk') }}</b>
        <span>{{ notices.length ? t('bell.noUnread') : t('bell.nothing') }}</span>
      </div>
      <footer v-if="unreadCount"><button @click="markAllRead">{{ t('bell.markAll') }}</button></footer>
    </section>
  </Teleport>
</template>
