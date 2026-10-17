import { fin } from './guard.ts'

export function netCarbs(totalCarbsG: number, fiberG: number): number | null {
  const t = fin(totalCarbsG)
  const f = fin(fiberG)
  if (t === null || f === null || t < 0 || f < 0) return null
  return Math.max(0, t - f)
}

export function calorieSurplusKcal(goalDailyKcal: number, maintDailyKcal: number): number | null {
  const g = fin(goalDailyKcal)
  const m = fin(maintDailyKcal)
  if (g === null || m === null || g <= 0 || m <= 0) return null
  return g - m
}

export function dailyProteinTargetKgPerDay(bodyWeightKg: number, activityLevel: 'sedentary' | 'active' | 'athlete' | 'strength'): number | null {
  const w = fin(bodyWeightKg)
  if (w === null || w <= 0) return null
  const factor =
    activityLevel === 'sedentary' ? 0.8 : activityLevel === 'active' ? 1.2 : activityLevel === 'athlete' ? 1.6 : 1.8
  return w * factor
}

export function dailyFiberTargetKcal(caloriesKcal: number): number | null {
  const c = fin(caloriesKcal)
  if (c === null || c <= 0) return null
  return c / 1000 * 14
}

export function macroSplitFromKcal(totalKcal: number, carbsPct: number, proteinPct: number, fatPct: number):
  | { carbsG: number; proteinG: number; fatG: number } | null {
  const t = fin(totalKcal)
  const c = fin(carbsPct)
  const p = fin(proteinPct)
  const f = fin(fatPct)
  if (t === null || c === null || p === null || f === null || t <= 0) return null
  if (Math.abs(c + p + f - 100) > 1) return null
  return { carbsG: (t * c / 100) / 4, proteinG: (t * p / 100) / 4, fatG: (t * f / 100) / 9 }
}

export function calorieIntakeTarget(
  weightKg: number,
  heightCm: number,
  ageYears: number,
  sex: 'male' | 'female',
  activity: 1.2 | 1.375 | 1.55 | 1.725,
): number | null {
  const w = fin(weightKg)
  const h = fin(heightCm)
  const a = fin(ageYears)
  if (w === null || h === null || a === null || w <= 0 || h <= 0 || a <= 0) return null
  // Mifflin-St Jeor BMR + activity
  const bmr = 10 * w + 6.25 * h - 5 * a + (sex === 'male' ? 5 : -161)
  return Math.round(bmr * activity)
}

export function netCarbsToGlucoseEffectKcal(netCarbsG: number): number | null {
  const n = fin(netCarbsG)
  if (n === null || n < 0) return null
  return n * 4
}

export function roastedPortionCalories(servingsPortions: number, perPortionKcal: number): number | null {
  const s = fin(servingsPortions)
  const k = fin(perPortionKcal)
  if (s === null || k === null || s <= 0 || k <= 0) return null
  return s * k
}