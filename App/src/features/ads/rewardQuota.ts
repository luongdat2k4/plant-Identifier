import { ref } from 'vue'

// Rewarded seeds are capped per day. The count is a per-device convenience, so a failing storage just means no cap.
const DAILY_LIMIT = 3
const key = () => `plantin-reward-${new Date().toISOString().slice(0, 10)}`

function read(): number {
  try { return Number(localStorage.getItem(key())) || 0 } catch { return 0 }
}
const used = ref(read())

export const rewardsLeft = () => Math.max(0, DAILY_LIMIT - (used.value = read()))
export function countReward() {
  used.value = read() + 1
  try { localStorage.setItem(key(), String(used.value)) } catch { /* storage unavailable */ }
}
