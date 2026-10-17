import { fin } from './guard.ts'

export function bpCategory(systolicMmHg: number, diastolicMmHg: number): string {
  const s = fin(systolicMmHg)
  const d = fin(diastolicMmHg)
  if (s === null || d === null || s <= 0 || d <= 0) return 'Enter valid readings'
  if (s >= 180 || d >= 120) return 'Hypertensive crisis - seek emergency care'
  if (s >= 140 || d >= 90) return 'Hypertension stage 2 - consult your doctor'
  if (s >= 130 || d >= 80) return 'Hypertension stage 1 - discuss with your doctor'
  if (s >= 120) return 'Elevated blood pressure'
  return 'Normal blood pressure'
}

export function mapValue(systolicMmHg: number, diastolicMmHg: number): number | null {
  const s = fin(systolicMmHg)
  const d = fin(diastolicMmHg)
  if (s === null || d === null || s <= 0 || d <= 0) return null
  return Math.round((s + 2 * d) / 3)
}

export function pulsePressure(systolicMmHg: number, diastolicMmHg: number): number | null {
  const s = fin(systolicMmHg)
  const d = fin(diastolicMmHg)
  if (s === null || d === null || s <= 0 || d <= 0 || d > s) return null
  return s - d
}

export function friedewaldLdl(totalCholMgDl: number, hdlMgDl: number, triglyceridesMgDl: number): number | null {
  const t = fin(totalCholMgDl)
  const h = fin(hdlMgDl)
  const tg = fin(triglyceridesMgDl)
  if (t === null || h === null || tg === null || t <= 0 || h <= 0 || tg < 0) return null
  return Math.round((t - h - tg / 5) * 10) / 10
}

export function tcHdlRatio(totalCholMgDl: number, hdlMgDl: number): number | null {
  const t = fin(totalCholMgDl)
  const h = fin(hdlMgDl)
  if (t === null || h === null || t <= 0 || h <= 0) return null
  return Math.round((t / h) * 10) / 10
}

export function ldlBand(ldlMgDl: number | null): string {
  if (ldlMgDl === null) return 'Unknown'
  return ldlMgDl < 100 ? 'Optimal LDL' : ldlMgDl < 130 ? 'Near optimal' : ldlMgDl < 160 ? 'Borderline high' : ldlMgDl < 190 ? 'High' : 'Very high - discuss with a clinician'
}

export function restingHrBand(hr: number): string {
  const h = fin(hr)
  if (h === null || h <= 0) return 'Unknown'
  return h < 60 ? 'Below typical (bradycardia range - context dependent)' : h <= 100 ? 'Normal resting range' : 'Above typical - worth checking with a clinician'
}