import { fin } from './guard.ts'

export function walkingPace(distanceKm: number, minutes: number): { minPerKm: number; kmh: number } | null {
  const d = fin(distanceKm)
  const m = fin(minutes)
  if (d === null || m === null || d <= 0 || m <= 0) return null
  return { minPerKm: Math.round((m / d) * 10) / 10, kmh: Math.round((d / (m / 60)) * 10) / 10 }
}

export function workoutDurationMinutes(distanceKm: number, speedKmh: number): number | null {
  const d = fin(distanceKm)
  const s = fin(speedKmh)
  if (d === null || s === null || d <= 0 || s <= 0) return null
  return Math.round((d / s) * 60)
}

export function kcalPerHourFromMet(met: number, weightKg: number): number | null {
  const m = fin(met)
  const w = fin(weightKg)
  if (m === null || w === null || m <= 0 || w <= 0) return null
  return Math.round(m * w)
}

export function trainingVolumeKg(sets: number, reps: number, weightKg: number): number | null {
  const s = fin(sets)
  const r = fin(reps)
  const w = fin(weightKg)
  if (s === null || r === null || w === null || s <= 0 || r <= 0 || w <= 0) return null
  return Math.round(s * r * w)
}