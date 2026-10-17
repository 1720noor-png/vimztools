import { fin, safeDiv } from './guard.ts'

export function phq9Severity(items: number[]): { total: number; band: string } | null {
  if (!Array.isArray(items) || items.length !== 9) return null
  const vals = items.map(fin)
  if (vals.some((v) => v === null || v < 0 || v > 3)) return null
  const total = vals.reduce((a, b) => (a ?? 0) + (b ?? 0), 0) ?? 0
  const band =
    total <= 4 ? 'Minimal depression'
    : total <= 9 ? 'Mild depression'
    : total <= 14 ? 'Moderate depression'
    : total <= 19 ? 'Moderately severe depression'
    : 'Severe depression'
  return { total, band }
}

export function gad7Severity(items: number[]): { total: number; band: string } | null {
  if (!Array.isArray(items) || items.length !== 7) return null
  const vals = items.map(fin)
  if (vals.some((v) => v === null || v < 0 || v > 3)) return null
  const total = vals.reduce((a, b) => (a ?? 0) + (b ?? 0), 0) ?? 0
  const band = total <= 4 ? 'Minimal anxiety' : total <= 9 ? 'Mild anxiety' : total <= 14 ? 'Moderate anxiety' : 'Severe anxiety'
  return { total, band }
}

export function rosenbergSelfEsteem(items: number[]): { total: number; band: string } | null {
  if (!Array.isArray(items) || items.length !== 10) return null
  const vals = items.map(fin)
  if (vals.some((v) => v === null || v < 0 || v > 3)) return null
  const total = vals.reduce((a, b) => (a ?? 0) + (b ?? 0), 0) ?? 0
  const band = total < 15 ? 'Low self-esteem - support could help' : total < 25 ? 'Normal range' : 'Healthy self-esteem'
  return { total, band }
}

export function diabetesRiskScore(
  ageYears: number,
  female: boolean,
  htn: boolean,
  physicalActivitySedentary: boolean,
  familyHistory: boolean,
): number | null {
  const a = fin(ageYears)
  if (a === null || a < 0) return null
  let score = 0
  if (a >= 45) score += 3
  else if (a >= 35) score += 2
  if (female) score += 1
  if (htn) score += 1
  if (physicalActivitySedentary) score += 2
  if (familyHistory) score += 3
  return score
}

export function diabetesRiskBand(score: number | null): string {
  if (score === null) return 'Unknown'
  return score <= 2 ? 'Low risk' : score <= 5 ? 'Moderate risk' : 'Higher risk - worth a screening visit'
}

export function carbGramPerKgTarget(bodyWeightKg: number, style: 'keto' | 'moderate' | 'liberal'): number | null {
  const w = fin(bodyWeightKg)
  if (w === null || w <= 0) return null
  const factor = style === 'keto' ? 0.5 : style === 'moderate' ? 2.2 : 3.5
  return Math.round(w * factor)
}

export function burnoutScore(fatigue: number, cynicism: number, efficacy: number): { total: number; band: string } | null {
  const f = fin(fatigue)
  const c = fin(cynicism)
  const e = fin(efficacy)
  if (f === null || c === null || e === null || f < 0 || c < 0 || e < 0 || f > 10 || c > 10 || e > 10) return null
  const total = f + c + (10 - e)
  const band = total <= 10 ? 'Low burnout signal' : total <= 16 ? 'Moderate - rest and boundaries help' : 'Strong burnout signal - consider support'
  return { total, band }
}

export { safeDiv }