import { fin, clamp } from './guard.ts'

const DAY_MS = 86400000

function dayNum(iso: string): number | null {
  const t = Date.parse(iso)
  if (!Number.isFinite(t)) return null
  return Math.floor(t / DAY_MS)
}

function toIso(dayNum: number): string {
  return new Date(dayNum * DAY_MS).toISOString().slice(0, 10)
}

export function addDaysIso(iso: string, days: number): string | null {
  const d = dayNum(iso)
  if (d === null) return null
  return toIso(d + days)
}

export function cycleStats(c1: number, c2: number, c3: number): { average: number; shortest: number; longest: number } | null {
  const a = fin(c1)
  const b = fin(c2)
  const c = fin(c3)
  if (a === null || b === null || c === null || a < 15 || b < 15 || c < 15 || a > 60 || b > 60 || c > 60) return null
  return { average: Math.round(((a + b + c) / 3) * 10) / 10, shortest: Math.min(a, b, c), longest: Math.max(a, b, c) }
}

export function nextPeriodDate(lmpISO: string, cycleDays: number): { date: string; daysUntil: number } | null {
  const d = dayNum(lmpISO)
  const cy = fin(cycleDays)
  const today = dayNum(new Date().toISOString())
  if (d === null || cy === null || today === null || cy < 15 || cy > 60) return null
  const next = d + cy
  return { date: toIso(next), daysUntil: Math.max(0, next - today) }
}

export function bbtLutealDays(cycleDays: number, tempRiseDay: number): number | null {
  const c = fin(cycleDays)
  const r = fin(tempRiseDay)
  if (c === null || r === null || c < 15 || c > 60 || r < 1 || r > c) return null
  return c - r + 1
}

export function lutealPhaseLength(cycleDays: number, ovulationDay: number): number | null {
  const c = fin(cycleDays)
  const o = fin(ovulationDay)
  if (c === null || o === null || c < 15 || c > 60 || o < 1 || o >= c) return null
  return c - o
}

export function conceptionDate(mode: 'due' | 'lmp', iso: string): string | null {
  const d = dayNum(iso)
  if (d === null) return null
  return toIso(mode === 'due' ? d - 266 : d + 14)
}

export function ivfDueDate(transferISO: string, embryoDay: number): string | null {
  const d = dayNum(transferISO)
  const e = fin(embryoDay)
  if (d === null || e === null || (e !== 3 && e !== 5 && e !== 6)) return null
  const offset = e === 5 ? 261 : e === 6 ? 262 : 263
  return toIso(d + offset)
}

export function pregnancyMilestones(lmpISO: string): string[] | null {
  const d = dayNum(lmpISO)
  if (d === null) return null
  const mk = (wk: number, label: string) => `${label}: ${toIso(d + wk * 7)}`
  return [mk(12, 'First trimester ends'), mk(20, 'Halfway - anatomy scan window'), mk(28, 'Third trimester begins'), mk(36, 'Full-term preparation'), mk(40, 'Estimated due date')]
}

export function hcgDoublingHours(firstIU: number, secondIU: number, daysBetween: number): number | null {
  const f = fin(firstIU)
  const s = fin(secondIU)
  const d = fin(daysBetween)
  if (f === null || s === null || d === null || f <= 0 || s <= f || d <= 0) return null
  return Math.round((d * 24 * Math.LN2) / Math.log(s / f))
}

export function fundalHeightRange(weeksGa: number): { low: number; high: number } | null {
  const w = fin(weeksGa)
  if (w === null || w < 20 || w > 36) return null
  return { low: Math.round(w - 2), high: Math.round(w + 2) }
}

export function pcosSymptomScore(irregular: boolean, acne: boolean, hirsutism: boolean, overweight: boolean, hairLoss: boolean, darkPatches: boolean): number | null {
  let s = 0
  if (irregular) s += 3
  if (acne) s += 1
  if (hirsutism) s += 2
  if (overweight) s += 1
  if (hairLoss) s += 1
  if (darkPatches) s += 2
  if (s === 0) return null
  return clamp(s, 0, 10)
}

export function pcosCycleScore(avgCycleDays: number, cyclesPerYear: number, highVariation: boolean): number | null {
  const c = fin(avgCycleDays)
  const y = fin(cyclesPerYear)
  if (c === null || y === null || c < 15 || c > 90 || y < 1 || y > 13) return null
  let s = 10
  if (c < 21 || c > 35) s -= 3
  if (y < 8) s -= 2
  if (highVariation) s -= 2
  return clamp(s, 0, 10)
}

export function pcosCalorieTarget(bmrKcal: number, activityFactor: number, insulinResistant: boolean): number | null {
  const b = fin(bmrKcal)
  const a = fin(activityFactor)
  if (b === null || a === null || b <= 0 || a <= 0) return null
  return Math.round(b * a * (insulinResistant ? 0.9 : 0.95))
}

export function pcosLifestyleScore(dietScore: number, sleepScore: number, stressScore: number, activityScore: number, hydrationScore: number): number | null {
  const vals = [dietScore, sleepScore, stressScore, activityScore, hydrationScore].map(fin)
  if (vals.some((v) => v === null)) return null
  const nums = vals as number[]
  if (nums.some((v) => v < 0 || v > 20)) return null
  return clamp(Math.round(nums.reduce((a, b) => a + b, 0)), 0, 100)
}

export function postpartumWeightProgress(prePregnancyKg: number, currentKg: number, weeksPostpartum: number): { lostKg: number; pctBack: number; ratePerWeek: number } | null {
  const pre = fin(prePregnancyKg)
  const cur = fin(currentKg)
  const w = fin(weeksPostpartum)
  if (pre === null || cur === null || w === null || pre <= 0 || cur <= 0 || w < 0) return null
  const lostKg = Math.max(0, pre - cur)
  return { lostKg: Math.round(lostKg * 10) / 10, pctBack: Math.round((lostKg / pre) * 100), ratePerWeek: w > 0 ? Math.round((lostKg / w) * 100) / 100 : 0 }
}

export function breastfeedingFluidMl(weightKg: number, feedsPerDay: number, activeMinutes: number): number | null {
  const w = fin(weightKg)
  const f = fin(feedsPerDay)
  const a = fin(activeMinutes)
  if (w === null || f === null || a === null || w <= 0 || w > 300 || f < 0 || f > 20 || a < 0) return null
  return Math.round(35 * w + f * 250 + a * 10)
}

export function postpartumRecoveryScore(bleeding: number, pain: number, mood: number, energy: number, sleepDisturb: number): number | null {
  const vals = [bleeding, pain, mood, energy, sleepDisturb].map(fin)
  if (vals.some((v) => v === null)) return null
  const nums = vals as number[]
  if (nums.some((v) => v < 0 || v > 10)) return null
  const avg = nums.reduce((a, b) => a + b, 0) / nums.length
  return Math.round(100 - avg * 10)
}