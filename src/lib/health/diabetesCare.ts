import { clamp } from './guard.ts'

export interface DawnRise {
  diffMg: number
  rising: boolean
}

export function a1cToEag(a1c: number): number | null {
  if (!Number.isFinite(a1c) || a1c < 2 || a1c > 20) return null
  return Math.round(28.7 * a1c - 46.7)
}

export function eagToA1c(eag: number): number | null {
  if (!Number.isFinite(eag) || eag < 30 || eag > 600) return null
  return Math.round(((eag + 46.7) / 28.7) * 10) / 10
}

export function dawnRise(bedtimeGlucose: number, wakeGlucose: number): DawnRise | null {
  if (!Number.isFinite(bedtimeGlucose) || !Number.isFinite(wakeGlucose)) return null
  const diffMg = Math.round(wakeGlucose - bedtimeGlucose)
  return { diffMg, rising: diffMg > 20 }
}

export function insulinSensitivityFactor(tdd: number): number | null {
  if (!Number.isFinite(tdd) || tdd < 5 || tdd > 300) return null
  return Math.round(1700 / tdd)
}

export function carbRatioPerUnit(tdd: number): number | null {
  if (!Number.isFinite(tdd) || tdd < 5 || tdd > 300) return null
  return Math.round((450 / tdd) * 2) / 2
}

export function correctionDose(glucose: number, target: number, isf: number): number | null {
  if (!Number.isFinite(glucose) || !Number.isFinite(target) || !Number.isFinite(isf) || isf <= 0) return null
  const dose = (glucose - target) / isf
  if (dose < 0) return 0
  return Math.round(dose * 2) / 2
}

export function hypoAwarenessScore(hyposPerWeek: number, lossOfAwareness: boolean, nocturnalEpisodes: boolean): number | null {
  if (!Number.isFinite(hyposPerWeek) || hyposPerWeek < 0 || hyposPerWeek > 50) return null
  let score = 100 - Math.min(60, hyposPerWeek * 12)
  if (lossOfAwareness) score -= 25
  if (nocturnalEpisodes) score -= 15
  return Math.max(0, Math.round(score))
}

export function glycemicLoad(gi: number, carbsG: number): { gl: number; band: string } | null {
  if (!Number.isFinite(gi) || !Number.isFinite(carbsG) || gi < 0 || gi > 150 || carbsG < 0 || carbsG > 200) return null
  const gl = Math.round((gi / 100) * carbsG * 10) / 10
  const band = gl <= 10 ? 'Low' : gl <= 19 ? 'Medium' : 'High'
  return { gl, band }
}

export { clamp }