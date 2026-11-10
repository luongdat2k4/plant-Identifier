import { ref } from 'vue'

// Rewarded videos are capped per day and per kind of reward. The counts are a per-device convenience, so a failing
// storage just means no cap.
export type RewardKind = 'seed' | 'coins'
const DAILY_LIMIT: Record<RewardKind, number> = { seed: 3, coins: 5 }
const key = (kind: RewardKind) => `plantin-reward-${kind}-${new Date().toISOString().slice(0, 10)}`

function read(kind: RewardKind): number {
  try { return Number(localStorage.getItem(key(kind))) || 0 } catch { return 0 }
}
// Bumped on every count so templates that read rewardsLeft() update.
const version = ref(0)

export function rewardsLeft(kind: RewardKind): number {
  void version.value
  return Math.max(0, DAILY_LIMIT[kind] - read(kind))
}
export function countReward(kind: RewardKind) {
  try { localStorage.setItem(key(kind), String(read(kind) + 1)) } catch { /* storage unavailable */ }
  version.value++
}
