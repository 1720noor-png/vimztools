import { clamp, fin } from './guard.ts'

export function hrReserveValue(maxHr: number, restHr: number): number | null {
  const m = fin(maxHr)
  const r = fin(restHr)
  if (m === null || r === null || m <= 0 || r <= 0 || m <= r) return null
  return m - r
}

export function karvonenTargetFromReserve(restHr: number, reserve: number, intensityPct: number): number | null {
  const r = fin(restHr)
  const res = fin(reserve)
  const p = fin(intensityPct)
  if (r === null || res === null || p === null || r < 0 || res < 0 || p <= 0 || p >= 100) return null
  return Math.round(r + (p / 100) * res)
}

export function ldlHdlRatio(ldlMgDl: number, hdlMgDl: number): number | null {
  const l = fin(ldlMgDl)
  const h = fin(hdlMgDl)
  if (l === null || h === null || l < 0 || h <= 0) return null
  return Math.round((l / h) * 100) / 100
}

export function ldlHdlBand(ratio: number | null): string {
  if (ratio === null) return 'Unknown'
  return ratio < 2 ? 'Optimal - low LDL boost relative to HDL' : ratio < 3.5 ? 'Acceptable - keep monitoring' : 'Raised - worth a clinician review'
}

export function hrRecoveryDrop(peakHr: number, oneMinuteHr: number): number | null {
  const p = fin(peakHr)
  const o = fin(oneMinuteHr)
  if (p === null || o === null || p <= 0 || o <= 0 || p < o) return null
  return p - o
}

export function hrRecoveryBand(drop: number | null): string {
  if (drop === null) return 'Unknown'
  return drop >= 22 ? 'Strong recovery - good fitness signal' : drop >= 12 ? 'Average recovery' : 'Sluggish recovery - worth reviewing conditioning'
}

export function cvRiskScore(ageYears: number, male: boolean, smoker: boolean, diabetes: boolean, treatedHtn: boolean, familyHistory: boolean, bmiOver30: boolean, lowActivity: boolean): number | null {
  const age = fin(ageYears)
  if (age === null || age < 18 || age > 110) return null
  let s = 0
  if (age >= 55) s += 2
  else if (age >= 45) s += 1
  if (male) s += 1
  if (smoker) s += 1
  if (diabetes) s += 1
  if (treatedHtn) s += 1
  if (familyHistory) s += 1
  if (bmiOver30) s += 1
  if (lowActivity) s += 1
  return clamp(s, 0, 9)
}

export function cvRiskBand(score: number | null): string {
  if (score === null) return 'Unknown'
  return score <= 2 ? 'Low - a solid starting point' : score <= 4 ? 'Moderate - target the changeable factors' : score <= 6 ? 'Elevated - a doctor visit is wise' : 'High - please arrange a clinical review'
}

function agePoints(age: number, male: boolean): number {
  if (male) return age >= 65 ? 8 : age >= 55 ? 6 : age >= 45 ? 4 : age >= 35 ? 2 : 0
  return age >= 65 ? 7 : age >= 55 ? 5 : age >= 45 ? 3 : age >= 35 ? 1 : 0
}

function cholPoints(mgDl: number): number {
  return mgDl >= 240 ? 3 : mgDl >= 200 ? 2 : mgDl >= 160 ? 1 : 0
}

function hdlPoints(mgDl: number): number {
  return mgDl < 40 ? 2 : mgDl <= 59 ? 1 : 0
}

function sbpPoints(mmHg: number): number {
  return mmHg >= 160 ? 4 : mmHg >= 140 ? 3 : mmHg >= 130 ? 2 : mmHg >= 120 ? 1 : 0
}

export function framinghamPoints(ageYears: number, male: boolean, totalCholMgDl: number, hdlMgDl: number, systolicMmHg: number, smoker: boolean, diabetes: boolean): number | null {
  const age = fin(ageYears)
  const c = fin(totalCholMgDl)
  const h = fin(hdlMgDl)
  const s = fin(systolicMmHg)
  if (age === null || c === null || h === null || s === null || age < 20 || age > 110 || c < 0 || h < 0 || s < 0) return null
  return agePoints(age, male) + cholPoints(c) + hdlPoints(h) + sbpPoints(s) + (smoker ? 2 : 0) + (diabetes ? 2 : 0)
}

export function framinghamBand(points: number | null, male: boolean): { risk: string; band: string } | null {
  if (points === null) return null
  let risk = ''
  if (male ? points <= 6 : points <= 7) risk = '10-year risk under 10%'
  else if (male ? points <= 11 : points <= 13) risk = '10-year risk roughly 10-20%'
  else risk = '10-year risk exceeding 20%'
  const band = points <= 4 ? 'Low' : points <= 8 ? 'Moderate' : 'High'
  return { risk, band }
}

export function ascvdPoints(ageYears: number, male: boolean, totalCholMgDl: number, hdlMgDl: number, systolicMmHg: number, smoker: boolean, diabetes: boolean): number | null {
  const age = fin(ageYears)
  const c = fin(totalCholMgDl)
  const h = fin(hdlMgDl)
  const s = fin(systolicMmHg)
  if (age === null || c === null || h === null || s === null || age < 20 || age > 110 || c < 0 || h < 0 || s < 0) return null
  let pts = agePoints(age, male) + 1
  if (male) pts += 1
  pts += cholPoints(c) + hdlPoints(h) + sbpPoints(s) + (smoker ? 2 : 0) + (diabetes ? 2 : 0)
  return pts
}

export function ascvdBand(points: number | null): string {
  if (points === null) return 'Unknown'
  return points <= 9 ? 'Low estimated ASCVD risk' : points <= 14 ? 'Borderline - review risk factors' : 'Elevated estimated risk - a clinician visit is recommended'
}