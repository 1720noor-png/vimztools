import { fin } from './guard.ts'

export function dailyFluidIntakeMl(bodyWeightKg: number, activeMinutes: number, climate: 'cool' | 'moderate' | 'hot'): number | null {
  const w = fin(bodyWeightKg)
  const m = fin(activeMinutes)
  if (w === null || m === null || w <= 0 || m < 0) return null
  const basePerKg = climate === 'cool' ? 30 : climate === 'moderate' ? 35 : 40
  return Math.round(w * basePerKg + m * 12)
}

export function exerciseFluidMl(weightKg: number, exerciseMinutes: number, intensity: 'light' | 'moderate' | 'vigorous'): number | null {
  const w = fin(weightKg)
  const m = fin(exerciseMinutes)
  if (w === null || m === null || w <= 0 || m <= 0) return null
  const mlPerMin = intensity === 'light' ? 7 : intensity === 'moderate' ? 12 : 18
  return Math.round(m * mlPerMin)
}

export function sweatRateMlPerHour(preBodyKg: number, postBodyKg: number, fluidsConsumedMl: number, durationMinutes: number): number | null {
  const pre = fin(preBodyKg)
  const post = fin(postBodyKg)
  const fluids = fin(fluidsConsumedMl)
  const dur = fin(durationMinutes)
  if (pre === null || post === null || fluids === null || dur === null || pre <= 0 || post <= 0 || dur <= 0) return null
  const weightLostKg = pre - post
  const totalLostMl = weightLostKg * 1000 + fluids
  return Math.round((totalLostMl / dur) * 60)
}

export function waterBalanceMl(intakeMl: number, outputMl: number): number | null {
  const i = fin(intakeMl)
  const o = fin(outputMl)
  if (i === null || o === null || i < 0 || o < 0) return null
  return i - o
}

export function hydrationStatus(pctBaseline: number | null): string {
  if (pctBaseline === null) return 'Unknown'
  if (pctBaseline >= 2) return 'Severe dehydration risk - rehydrate now'
  if (pctBaseline >= 1) return 'Moderate dehydration - drink fluids'
  return 'Within normal range'
}