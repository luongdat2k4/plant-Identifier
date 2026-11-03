import { computed, ref, watch } from 'vue'
import { state } from '../../shared/store'
import { getSpecies } from '../collection/model'
import { daysUntilDeath, hasFreeSlot, HAPPY_AT, potName, statusOf } from './model'

export type NoticeKind = 'wilting' | 'care' | 'seeds'
export interface Notice { id: string; kind: NoticeKind; title: string; meta: string; text: string; image?: string; potId?: string }

const ORDER: Record<NoticeKind, number> = { wilting: 0, care: 1, seeds: 2 }
const readKey = 'plantin-notices-read'

function loadRead(): string[] {
  try { return JSON.parse(localStorage.getItem(readKey) || '[]') } catch { return [] }
}
/** Ids of reminders the user has already opened. */
const readIds = ref<string[]>(loadRead())
watch(readIds, value => {
  try { localStorage.setItem(readKey, JSON.stringify(value)) } catch { /* storage unavailable */ }
}, { deep: true })

/** Care reminders derived from the current state; only the "read" marks are stored. */
export const notices = computed<Notice[]>(() => {
  const list: Notice[] = []
  for (const pot of state.value.pots) {
    const status = statusOf(pot)
    if (status === 'happy') continue
    const image = getSpecies(pot.speciesId)?.image
    if (status === 'wilting') {
      const days = daysUntilDeath(pot)
      list.push({
        id: `wilting-${pot.id}`, kind: 'wilting', potId: pot.id, image, title: `${potName(pot)} đang héo`,
        meta: days === null ? 'Khẩn cấp' : `Còn ${days} ngày`,
        text: 'Cây tạm ngừng lớn. Tưới nước hoặc bón phân là hồi phục ngay.',
      })
      continue
    }
    const needs = [pot.water < HAPPY_AT && 'nước', pot.nutrition < HAPPY_AT && 'dinh dưỡng'].filter(Boolean).join(' và ')
    list.push({
      id: `care-${pot.id}`, kind: 'care', potId: pot.id, image, title: `${potName(pot)} cần chăm`,
      meta: `Nước ${Math.round(pot.water)}% · Dinh dưỡng ${Math.round(pot.nutrition)}%`, text: `Cây đang cần ${needs}.`,
    })
  }
  if (state.value.seeds.length && hasFreeSlot()) {
    const first = state.value.seeds[0]
    list.push({
      id: 'seeds', kind: 'seeds', image: getSpecies(first.speciesId)?.image, title: `${state.value.seeds.length} hạt giống chờ trồng`,
      meta: `${state.value.pots.length}/${state.value.potSlots} chậu`, text: 'Vườn còn chậu trống, hãy gieo hạt mới.',
    })
  }
  return list.sort((a, b) => ORDER[a.kind] - ORDER[b.kind])
})

export function isUnread(id: string): boolean { return !readIds.value.includes(id) }
export const unreadCount = computed(() => notices.value.filter(item => isUnread(item.id)).length)
export function markRead(id: string) { if (isUnread(id)) readIds.value.push(id) }
export function markAllRead() { for (const item of notices.value) markRead(item.id) }
// Forget marks for reminders that no longer exist, so a plant that wilts again shows up as new.
watch(notices, list => {
  const alive = new Set(list.map(item => item.id))
  const kept = readIds.value.filter(id => alive.has(id))
  if (kept.length !== readIds.value.length) readIds.value = kept
})
