import { fin, safeDiv } from './guard.ts'

export function naegeleDueDate(lmpISO: string): Date | null {
  const parts = /^(\d{4})-(\d{1,2})-(\d{1,2})/.exec(lmpISO)
  if (!parts) return null
  const d = new Date(Number(parts[1]), Number(parts[2]) - 1, Number(parts[3]))
  if (Number.isNaN(d.getTime())) return null
  const due = new Date(d)
  due.setDate(due.getDate() + 280)
  return due
}

export function gestationalAge(lmpISO: string): { weeks: number; days: number } | null {
  const parts = /^(\d{4})-(\d{1,2})-(\d{1,2})/.exec(lmpISO)
  if (!parts) return null
  const d = new Date(Number(parts[1]), Number(parts[2]) - 1, Number(parts[3]))
  if (Number.isNaN(d.getTime())) return null
  const now = new Date()
  const diffDays = Math.floor((now.getTime() - d.getTime()) / (24 * 3600 * 1000))
  if (diffDays < 0) return null
  return { weeks: Math.floor(diffDays / 7), days: diffDays % 7 }
}

export function lutealPhaseFertileWindow(cycleLengthDays: number): { ovulationDay: number; fertileStart: number; fertileEnd: number } | null {
  const c = fin(cycleLengthDays)
  if (c === null || c < 21 || c > 45) return null
  const ovulationDay = Math.max(1, c - 14)
  return { ovulationDay, fertileStart: Math.max(1, ovulationDay - 5), fertileEnd: ovulationDay + 1 }
}

export function acogPregnancyWeightGain(startBmi: number): { lowKg: number; highKg: number; label: string } | null {
  const b = fin(startBmi)
  if (b === null || b <= 0) return null
  if (b < 18.5) return { lowKg: 12.5, highKg: 18, label: 'Underweight (BMI < 18.5): gain 12.5-18 kg' }
  if (b < 25) return { lowKg: 11.5, highKg: 16, label: 'Normal weight (BMI 18.5-24.9): gain 11.5-16 kg' }
  if (b < 30) return { lowKg: 7, highKg: 11.5, label: 'Overweight (BMI 25-29.9): gain 7-11.5 kg' }
  return { lowKg: 5, highKg: 9, label: 'Obese (BMI 30+): gain 5-9 kg' }
}

export function breastfeedingCalorieBonus(monthsPostpartum: number): number | null {
  const m = fin(monthsPostpartum)
  if (m === null || m < 0) return null
  return m <= 6 ? 500 : m <= 12 ? 400 : 300
}

export function pediatricBSA(heightCm: number, weightKg: number): number | null {
  const h = fin(heightCm)
  const w = fin(weightKg)
  if (h === null || w === null || h <= 0 || w <= 0) return null
  return Math.sqrt((h * w) / 3600)
}

export function infantAge(dobISO: string): { weeks: number; days: number } | null {
  const parts = /^(\d{4})-(\d{1,2})-(\d{1,2})/.exec(dobISO)
  if (!parts) return null
  const d = new Date(Number(parts[1]), Number(parts[2]) - 1, Number(parts[3]))
  if (Number.isNaN(d.getTime())) return null
  const now = new Date()
  const diffDays = Math.floor((now.getTime() - d.getTime()) / (24 * 3600 * 1000))
  if (diffDays < 0) return null
  return { weeks: Math.floor(diffDays / 7), days: diffDays % 7 }
}

export function quicki(fastingInsulinUperMl: number, fastingGlucoseMgDl: number): number | null {
  const i = fin(fastingInsulinUperMl)
  const g = fin(fastingGlucoseMgDl)
  if (i === null || g === null || i <= 0 || g <= 0) return null
  return safeDiv(1, Math.log10(i) + Math.log10(g))
}

export function recommendedSleepHours(ageYears: number): { low: number; high: number } | null {
  const a = fin(ageYears)
  if (a === null || a < 0 || a > 120) return null
  if (a <= 0) return { low: 14, high: 17 }
  if (a <= 1) return { low: 12, high: 16 }
  if (a <= 2) return { low: 11, high: 14 }
  if (a <= 5) return { low: 10, high: 13 }
  if (a <= 13) return { low: 9, high: 11 }
  if (a <= 17) return { low: 8, high: 10 }
  if (a <= 64) return { low: 7, high: 9 }
  return { low: 7, high: 8 }
}

export function jetLagDays(timeZoneShiftHours: number, direction: 'east' | 'west'): number | null {
  const s = fin(timeZoneShiftHours)
  if (s === null || s <= 0 || s > 12) return null
  const eff = direction === 'east' ? s : Math.max(1, s - 1)
  return Math.round(eff * 0.6 * 2) / 2
}