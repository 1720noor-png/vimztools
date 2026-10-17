import { fin, safeDiv, clamp } from './guard.ts'

export function bmi(weightKg: number, heightCm: number): number | null {
  const w = fin(weightKg)
  const h = fin(heightCm)
  if (w === null || h === null || h <= 0 || w <= 0) return null
  const m = h / 100
  return w / (m * m)
}

export function absi(waistCm: number, heightCm: number, weightKg: number): number | null {
  const w = fin(waistCm)
  const h = fin(heightCm)
  const kg = fin(weightKg)
  if (w === null || h === null || kg === null || w <= 0 || h <= 0 || kg <= 0) return null
  // ABSI = WC(m) / (BMI^(2/3) * height(m)^(1/2))
  const wm = w / 100
  const hm = h / 100
  const bmiVal = kg / (hm * hm)
  return wm / (Math.pow(bmiVal, 2 / 3) * Math.pow(hm, 1 / 2))
}

export function absiBand(abs: number | null, ageYears: number | null, female: boolean): string {
  if (abs === null || ageYears === null || ageYears < 20) return 'Reference frame required (age 20+)'
  const menRef = [
    { d: 20, lo: 0.068, hi: 0.081 },
    { d: 30, lo: 0.073, hi: 0.087 },
    { d: 40, lo: 0.07, hi: 0.087 },
    { d: 50, lo: 0.072, hi: 0.089 },
    { d: 60, lo: 0.074, hi: 0.093 },
    { d: 70, lo: 0.077, hi: 0.096 },
  ]
  const womenRef = [
    { d: 20, lo: 0.068, hi: 0.081 },
    { d: 30, lo: 0.073, hi: 0.087 },
    { d: 40, lo: 0.07, hi: 0.087 },
    { d: 50, lo: 0.072, hi: 0.089 },
    { d: 60, lo: 0.074, hi: 0.093 },
    { d: 70, lo: 0.077, hi: 0.096 },
  ]
  const ref = female ? womenRef : menRef
  let band = ref[ref.length - 1]
  for (const r of ref) {
    if (ageYears <= r.d) {
      band = r
      break
    }
  }
  if (abs < band.lo) return 'Below average risk (favourable)'
  if (abs <= band.hi) return 'Average risk'
  return 'Above average risk - worth discussing'
}

export function adjustedBodyWeight(actualKg: number, ibwKg: number): number | null {
  const a = fin(actualKg)
  const i = fin(ibwKg)
  if (a === null || i === null || a <= 0 || i <= 0) return null
  if (a <= i) return a
  return i + 0.25 * (a - i)
}

export function ibw(sex: 'male' | 'female', heightCm: number, method: 'Devine' | 'Robinson' | 'Miller' | 'Hamwi'): number | null {
  const h = fin(heightCm)
  if (h === null || h <= 0) return null
  const inchesOver = h / 2.54 - 60
  const base = sex === 'male' ? 50 : 45.5
  const factor =
    method === 'Devine' ? 2.3
    : method === 'Robinson' ? 1.9
    : method === 'Miller' ? 1.82
    : 2.2
  return base + factor * inchesOver
}

export function healthyWeightRange(heightCm: number): { lowKg: number; highKg: number } | null {
  const h = fin(heightCm)
  if (h === null || h <= 0) return null
  const m = h / 100
  return { lowKg: 18.5 * m * m, highKg: 24.9 * m * m }
}

export function weightChangeKg(currentKg: number, targetKg: number): number | null {
  const c = fin(currentKg)
  const t = fin(targetKg)
  if (c === null || t === null || c <= 0) return null
  return t - c
}

export function weightLossPct(startKg: number, currentKg: number): number | null {
  const s = fin(startKg)
  const c = fin(currentKg)
  if (s === null || c === null || s <= 0 || c <= 0) return null
  return ((s - c) / s) * 100
}

export function weightGainPct(startKg: number, currentKg: number): number | null {
  const s = fin(startKg)
  const c = fin(currentKg)
  if (s === null || c === null || s <= 0 || c <= 0) return null
  return ((c - s) / s) * 100
}

export function weightLossTimelineWeeks(startKg: number, targetKg: number, deficitPerDayKcal: number): number | null {
  const s = fin(startKg)
  const t = fin(targetKg)
  const d = fin(deficitPerDayKcal)
  if (s === null || t === null || d === null || s <= 0 || t > s || d <= 0) return null
  const totalDeficitKcal = (s - t) * 7700
  return totalDeficitKcal / (d * 7)
}

export function weightLossRateKgPerWeek(kgLost: number, weeks: number): number | null {
  const k = fin(kgLost)
  const w = fin(weeks)
  if (k === null || w === null || w <= 0) return null
  return k / w
}

export function maintenanceWeightKcal(tdeeKcal: number): number | null {
  const t = fin(tdeeKcal)
  if (t === null || t <= 0) return null
  return t
}

export function midParentalHeight(childSex: 'male' | 'female', motherCm: number, fatherCm: number): number | null {
  const m = fin(motherCm)
  const f = fin(fatherCm)
  if (m === null || f === null || m <= 0 || f <= 0) return null
  // Tanner / mid-parental height formula (cm)
  return childSex === 'male' ? (f + m + 13) / 2 : (f + m - 13) / 2
}

export function bodyShape(waistCm: number, hipCm: number): string {
  const w = fin(waistCm)
  const h = fin(hipCm)
  if (w === null || h === null || h <= 0 || w <= 0) return 'Invalid - enter positive values'
  const whr = w / h
  if (whr < 0.8) return 'Hourglass / pear tendencies'
  if (whr <= 0.85) return 'Broadly balanced'
  if (whr <= 0.95) return 'Apple tendencies (higher waist focus)'
  return 'Strongly apple / central pattern'
}

export function idealBodyWeightVentilation(heightCm: number, sex: 'male' | 'female'): number | null {
  const h = fin(heightCm)
  if (h === null || h <= 0) return null
  if (sex === 'male') return 50 + 2.3 * (h / 2.54 - 60)
  return 45.5 + 2.3 * (h / 2.54 - 60)
}

export function saftest(v: unknown): number | null {
  const n = typeof v === 'string' ? Number.parseFloat(v) : typeof v === 'number' ? v : Number.NaN
  return Number.isFinite(n) && n >= 0 ? n : null
}

export { clamp, safeDiv }