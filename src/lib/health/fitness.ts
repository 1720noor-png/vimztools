import { fin, clamp } from './guard.ts'

export function oneRepMaxEpley(weightKg: number, reps: number): number | null {
  const w = fin(weightKg)
  const r = fin(reps)
  if (w === null || r === null || w <= 0 || r < 1) return null
  if (r === 1) return w
  return w * (1 + r / 30)
}

export function oneRepMaxBrzycki(weightKg: number, reps: number): number | null {
  const w = fin(weightKg)
  const r = fin(reps)
  if (w === null || r === null || w <= 0 || r < 1 || r > 10) return null
  return (w * 36) / (37 - r)
}

export function vo2MaxCooper(distanceMeters12min: number): number | null {
  const d = fin(distanceMeters12min)
  if (d === null || d <= 0) return null
  return (d - 504.9) / 44.73
}

export function stepsToKm(steps: number, strideCm: number): number | null {
  const s = fin(steps)
  const sc = fin(strideCm)
  if (s === null || sc === null || s < 0 || sc <= 0) return null
  return (s * sc) / 100000
}

export function paceMinPerKm(speedKmh: number): number | null {
  const s = fin(speedKmh)
  if (s === null || s <= 0) return null
  return 60 / s
}

export function metCaloriesBurned(met: number, weightKg: number, minutes: number): number | null {
  const m = fin(met)
  const w = fin(weightKg)
  const t = fin(minutes)
  if (m === null || w === null || t === null || m <= 0 || w <= 0 || t <= 0) return null
  return Math.round((m * 3.5 * w) / 200 * t)
}

export function karvonenHeartRate(maxHr: number, restHr: number, intensityPct: number): number | null {
  const max = fin(maxHr)
  const rest = fin(restHr)
  const pct = fin(intensityPct)
  if (max === null || rest === null || pct === null || max <= 0 || rest >= max || pct <= 0 || pct > 100) return null
  return Math.round((max - rest) * (pct / 100) + rest)
}

export function runningTimeHours(distanceKm: number, paceMinPerKm: number): number | null {
  const d = fin(distanceKm)
  const p = fin(paceMinPerKm)
  if (d === null || p === null || d <= 0 || p <= 0) return null
  return (d * p) / 60
}

export function stepsToCalories(steps: number, weightKg: number): number | null {
  const s = fin(steps)
  const w = fin(weightKg)
  if (s === null || w === null || s < 0 || w <= 0) return null
  return Math.round(s * 0.0005 * w)
}

export function strengthMet(weightKg: number, minutes: number): number | null {
  return metCaloriesBurned(3.5, weightKg, minutes)
}

export function cyclingMet(weightKg: number, minutes: number): number | null {
  return metCaloriesBurned(6.8, weightKg, minutes)
}

export function swimmingMet(weightKg: number, minutes: number): number | null {
  return metCaloriesBurned(5.8, weightKg, minutes)
}

export function runningMet(weightKg: number, minutes: number): number | null {
  return metCaloriesBurned(8.0, weightKg, minutes)
}

export function maxHeartRateAge(ageYears: number): number | null {
  const a = fin(ageYears)
  if (a === null || a <= 0) return null
  return clamp(Math.round(220 - a), 100, 220)
}