import { STAGE_META, STAGES, type Stage } from '../../backend/catalog'

// Growth is measured in growth points (GP): every water or feed tap adds some, and so does every healthy day.
// Kept free of the store so the runtime loader can convert old pots without an import cycle.

/** GP a pot needs in total to reach each stage. */
export const STAGE_GP: Record<Stage, number> = { seed: 0, sprout: 8, young: 30, mature: 65, bloom: 120 }

export function stageForPoints(points: number): Stage {
  let result: Stage = 'seed'
  for (const stage of STAGES) if (points >= STAGE_GP[stage]) result = stage
  return result
}

/** Pots from before GP existed: start at the GP of the stage their old day count had reached. */
export function pointsFromDays(days: number): number {
  let result: Stage = 'seed'
  for (const stage of STAGES) if (days >= STAGE_META[stage].minDays) result = stage
  return STAGE_GP[result]
}
