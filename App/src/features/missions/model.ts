import { state } from '../../shared/store'
import { t } from '../../shared/i18n'
import { addCoins } from '../../shared/coins'
import { dayKey } from '../garden/model'

// Daily missions: three small goals that reset every day. Finishing all of them unlocks one reward per day.
export type MissionId = 'water' | 'scan' | 'feed'
export const MISSIONS: readonly { id: MissionId; target: number; art: string; to: 'garden' | 'scan' }[] = [
  { id: 'water', target: 2, art: '/assets/icons/mission-water.svg', to: 'garden' },
  { id: 'scan', target: 1, art: '/assets/icons/mission-camera.svg', to: 'scan' },
  { id: 'feed', target: 1, art: '/assets/icons/mission-feed.svg', to: 'garden' },
]
export const MISSION_ART = { board: '/assets/icons/mission-board.svg', gift: '/assets/icons/mission-gift.svg' }
export const MISSION_REWARD = 3

const isToday = () => state.value.missions.day === dayKey()
const targetOf = (id: MissionId) => MISSIONS.find(m => m.id === id)!.target

/** Today's count for a mission, capped at its target (yesterday's counts read as 0). */
export function missionProgress(id: MissionId): number {
  return isToday() ? Math.min(state.value.missions[id], targetOf(id)) : 0
}
export const missionsDone = () => MISSIONS.filter(m => missionProgress(m.id) >= m.target).length
export const allMissionsDone = () => missionsDone() === MISSIONS.length
export const missionRewardClaimed = () => state.value.missions.claimedDay === dayKey()
/** The reward is waiting: every mission is done and today's reward has not been taken yet. */
export const missionRewardReady = () => allMissionsDone() && !missionRewardClaimed()

/** Counts one action towards today's mission. Returns true when it moved the mission forward. */
export function bumpMission(id: MissionId): boolean {
  const missions = state.value.missions
  if (!isToday()) { missions.day = dayKey(); missions.water = 0; missions.feed = 0; missions.scan = 0 }
  if (missions[id] >= targetOf(id)) return false
  missions[id] += 1
  return true
}

/** Gives today's reward once, when every mission is done. Returns false when there is nothing to claim. */
export function claimMissionReward(): boolean {
  if (!missionRewardReady()) return false
  state.value.missions.claimedDay = dayKey()
  addCoins(MISSION_REWARD)
  return true
}

/** A care or scan message, with today's mission count appended when the action moved a mission forward. */
export function withMission(message: string, id: MissionId | null): string {
  if (!id) return message
  return `${message} · ${t('missions.note', { done: String(missionProgress(id)), target: String(targetOf(id)) })}`
}
