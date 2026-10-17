import { clamp } from './guard.ts'

const WT_MED = [3.5, 4.6, 5.7, 6.6, 7.3, 7.9, 8.4, 8.8, 9.1, 9.4, 9.7, 10.0, 10.2, 10.5, 10.8, 11.0, 11.3, 11.6, 11.9, 12.2, 12.5, 12.8, 13.1, 13.4, 13.7]
const WT_SD = [0.6, 0.7, 0.8, 0.8, 0.9, 0.9, 1.0, 1.0, 1.1, 1.1, 1.1, 1.2, 1.2, 1.3, 1.3, 1.4, 1.4, 1.5, 1.5, 1.6, 1.6, 1.7, 1.7, 1.8, 1.8]
const LN_MED = [49, 54, 58, 61, 64, 66, 68, 69, 71, 72, 73, 75, 76, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89]
const LN_SD = [2, 2, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 4]

const SPURTS: [number, string][] = [
  [3, '3-week fussy growth spurt'],
  [6, '6-week growth spurt (big startle)'],
  [16, '4-month growth spurt'],
  [26, '6-month growth spurt'],
  [39, '9-month growth spurt'],
  [52, '12-month growth spurt'],
  [78, '18-month growth spurt'],
]

export function feedingInterval(ageDays: number): { minHrs: number; maxHrs: number; perDay: string } | null {
  if (!Number.isFinite(ageDays) || ageDays < 0 || ageDays > 365) return null
  if (ageDays <= 28) return { minHrs: 2, maxHrs: 3, perDay: '8-12 feeds' }
  if (ageDays <= 150) return { minHrs: 3, maxHrs: 4, perDay: '6-8 feeds' }
  return { minHrs: 4, maxHrs: 5, perDay: '4-6 feeds' }
}

export function milkVolumePerFeed(weightKg: number, ageMonths: number): number | null {
  if (!Number.isFinite(weightKg) || weightKg < 1 || weightKg > 40 || !Number.isFinite(ageMonths) || ageMonths < 0 || ageMonths > 24) return null
  const feeds = ageMonths <= 1 ? 8 : ageMonths <= 5 ? 7 : 5
  return Math.round((weightKg * 150) / feeds)
}

export function diaperCountByAge(ageMonths: number): { min: number; max: number } | null {
  if (!Number.isFinite(ageMonths) || ageMonths < 0 || ageMonths > 48) return null
  if (ageMonths <= 1) return { min: 6, max: 10 }
  if (ageMonths <= 5) return { min: 5, max: 9 }
  if (ageMonths <= 11) return { min: 4, max: 7 }
  return { min: 3, max: 6 }
}

export function percentileBand(measure: number, ageMonths: number, table: 'weight' | 'length'): { z: number; band: string; expected: number } | null {
  const i = Math.round(ageMonths)
  if (!Number.isFinite(measure) || !Number.isFinite(ageMonths) || i < 0 || i > 24) return null
  const med = table === 'weight' ? WT_MED[i] : LN_MED[i]
  const sd = table === 'weight' ? WT_SD[i] : LN_SD[i]
  const z = (measure - med) / sd
  const band = z < -2 ? 'Well below typical' : z < -1 ? 'Below typical band' : z <= 1 ? 'Around the typical band' : z <= 2 ? 'Above typical band' : 'Well above typical'
  return { z: Math.round(z * 10) / 10, band, expected: med }
}

export function milestoneForAge(ageMonths: number): string | null {
  if (!Number.isFinite(ageMonths) || ageMonths < 0 || ageMonths > 36) return null
  if (ageMonths <= 1) return 'By ~1-2 months: lifts head briefly, follows faces, startles at sounds.'
  if (ageMonths <= 3) return 'By ~2-3 months: social smiles, head control on tummy, cooing.'
  if (ageMonths <= 5) return 'By ~4-5 months: laughs, rolls over, reaches and grabs objects.'
  if (ageMonths <= 8) return 'By ~6-8 months: sits with help, babbles, transfers toys between hands.'
  if (ageMonths <= 11) return 'By ~9-11 months: sits alone, crawls, says mama/dada, pulls to stand.'
  if (ageMonths <= 17) return 'By ~12-17 months: stands, first steps, points, one-word speech.'
  return 'By ~18-24 months: walks well, climbs, 30+ words, simple pretend play.'
}

export function feverDoseMg(weightKg: number): { perDose: number; maxPerDay: number } | null {
  if (!Number.isFinite(weightKg) || weightKg < 1 || weightKg > 120) return null
  const perDose = 15 * weightKg
  const maxPerDay = perDose * 4
  return { perDose: Math.round(perDose), maxPerDay: Math.round(maxPerDay) }
}

export function nextGrowthSpurt(ageWeeks: number): string | null {
  if (!Number.isFinite(ageWeeks) || ageWeeks < 0 || ageWeeks > 110) return null
  const next = SPURTS.find(([wk]) => wk > ageWeeks)
  return next ? next[1] : 'The big toddler growth phase - steady, less sudden.'
}

export function teethingStage(ageMonths: number): { present: string[]; next: string | null } | null {
  if (!Number.isFinite(ageMonths) || ageMonths < 0 || ageMonths > 40) return null
  const stages: [number[], string][] = [
    [[6, 10], 'lower central incisors'],
    [[8, 12], 'upper central incisors'],
    [[9, 13], 'upper lateral incisors'],
    [[10, 16], 'lower lateral incisors'],
    [[13, 19], 'first molars'],
    [[16, 23], 'canines'],
    [[23, 33], 'second molars'],
  ]
  const present = stages.filter(([win]) => ageMonths >= win[0] && ageMonths <= win[1]).map(([, n]) => n)
  const next = stages.find(([win]) => ageMonths < win[0])
  return { present, next: next ? next[1] : null }
}

export { clamp }