import { fin, clamp } from './guard.ts'

export function minToClock(minutes: number): string {
  const m = ((Math.round(minutes) % 1440) + 1440) % 1440
  const h = Math.floor(m / 60)
  const mm = m % 60
  const hour12 = h % 12 === 0 ? 12 : h % 12
  const ampm = h < 12 ? 'AM' : 'PM'
  return `${hour12}:${String(mm).padStart(2, '0')} ${ampm}`
}

export function wakeTimesFromBedtime(bedMinutes: number, cycles: number): number[] | null {
  const b = fin(bedMinutes)
  const c = fin(cycles)
  if (b === null || c === null || b < 0 || b >= 1440 || c < 1 || c > 7) return null
  const out: number[] = []
  for (let i = c; i >= 1; i--) out.push((b + 90 * i) % 1440)
  return out
}

export function bedtimesFromWake(wakeMinutes: number, cycles: number): number[] | null {
  const w = fin(wakeMinutes)
  const c = fin(cycles)
  if (w === null || c === null || w < 0 || w >= 1440 || c < 1 || c > 7) return null
  const out: number[] = []
  for (let i = c; i >= 1; i--) out.push(((w - 90 * i - 15) % 1440 + 1440) % 1440)
  return out
}

export function sleepDurationMinutes(bedMinutes: number, wakeMinutes: number): number | null {
  const b = fin(bedMinutes)
  const w = fin(wakeMinutes)
  if (b === null || w === null || b < 0 || w < 0 || b >= 1440 || w >= 1440) return null
  const raw = w - b
  return raw <= 0 ? raw + 1440 : raw
}

export function sleepCyclesBetween(bedMinutes: number, wakeMinutes: number): { cycles: number; remainderMin: number; totalMin: number } | null {
  const t = sleepDurationMinutes(bedMinutes, wakeMinutes)
  if (t === null) return null
  const cycles = Math.floor(t / 90)
  return { cycles, remainderMin: t - cycles * 90, totalMin: t }
}

export function napAdvice(minutes: number): string | null {
  const m = fin(minutes)
  if (m === null || m < 0) return null
  if (m < 20) return 'A short break (<20 min) refreshes alertness without deep sleep'
  if (m <= 30) return 'A classic power nap - wake before deep sleep begins'
  if (m < 90) return 'Careful - you risk waking mid-deep-sleep and feeling groggy'
  return 'A full 90-minute cycle leaves you refreshed like a mini night'
}

export function sleepConsistency(bedtimeVarianceMin: number, wakeVarianceMin: number): number | null {
  const b = fin(bedtimeVarianceMin)
  const w = fin(wakeVarianceMin)
  if (b === null || w === null || b < 0 || w < 0 || b > 600 || w > 600) return null
  return clamp(Math.round(100 - b * 0.7 - w * 0.7), 0, 100)
}

export function sleepEfficiency(asleepMinutes: number, inBedMinutes: number): number | null {
  const a = fin(asleepMinutes)
  const i = fin(inBedMinutes)
  if (a === null || i === null || a < 0 || i <= 0 || a > i) return null
  return clamp(Math.round((a / i) * 100), 0, 100)
}

export function shiftPlan(currentWakeMinutes: number, targetWakeMinutes: number): number | null {
  const c = fin(currentWakeMinutes)
  const t = fin(targetWakeMinutes)
  if (c === null || t === null || c < 0 || t < 0 || c >= 1440 || t >= 1440) return null
  let delta = t - c
  if (delta > 720) delta -= 1440
  if (delta < -720) delta += 1440
  const daily = Math.min(120, Math.max(15, Math.round(delta / 7)))
  return delta === 0 ? 0 : daily * (delta < 0 ? -1 : 1)
}