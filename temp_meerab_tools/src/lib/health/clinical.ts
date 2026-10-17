import { fin, clamp } from './guard.ts'

export function cockcroftGault(ageYears: number, weightKg: number, serumCreatinineMgDl: number, female: boolean): number | null {
  const a = fin(ageYears)
  const w = fin(weightKg)
  const cr = fin(serumCreatinineMgDl)
  if (a === null || w === null || cr === null || a <= 0 || w <= 0 || cr <= 0) return null
  const raw = ((140 - a) * w) / (72 * cr)
  return Math.round((female ? raw * 0.85 : raw) * 10) / 10
}

export function egfrCkdEpi2021(serumCreatinineMgDl: number, ageYears: number, female: boolean): number | null {
  const cr = fin(serumCreatinineMgDl)
  const a = fin(ageYears)
  if (cr === null || a === null || cr <= 0 || a <= 0) return null
  const kappa = female ? 0.7 : 0.9
  const alpha = female ? -0.241 : -0.302
  const sexFactor = female ? 1.012 : 1
  const minTerm = Math.pow(Math.min(cr / kappa, 1), alpha)
  const maxTerm = Math.pow(Math.max(cr / kappa, 1), -1.2)
  return Math.round(142 * minTerm * maxTerm * Math.pow(0.9938, a) * sexFactor)
}

export function meldScore(bilirubinMgDl: number, inr: number, creatinineMgDl: number, dialysisOrRenalFailure: boolean): number | null {
  const b = fin(bilirubinMgDl)
  const inrV = fin(inr)
  let cr = fin(creatinineMgDl)
  if (b === null || inrV === null || cr === null || b <= 0 || inrV <= 0 || cr <= 0) return null
  if (dialysisOrRenalFailure) cr = 4
  const scr = Math.min(4, Math.max(1, cr))
  const score = 3.78 * Math.log(b) + 11.2 * Math.log(inrV) + 9.57 * Math.log(scr) + 6.43
  return Math.max(6, Math.min(40, Math.round(score)))
}

export function meldNaScore(meld: number, sodiumMgEqL: number): number | null {
  const m = fin(meld)
  const na = fin(sodiumMgEqL)
  if (m === null || na === null || m < 6 || m > 40) return null
  const naClamped = clamp(na, 120, 137)
  const score = m + 1.32 * (137 - naClamped) - 0.033 * m * (137 - naClamped)
  return Math.max(6, Math.min(40, Math.round(score)))
}

export function qsofaScore(respRateMin: number, systolicMmHg: number, gcsLess15: boolean): number | null {
  const rr = fin(respRateMin)
  const sbp = fin(systolicMmHg)
  if (rr === null || sbp === null || rr <= 0 || sbp <= 0) return null
  let score = 0
  if (rr >= 22) score += 1
  if (sbp <= 100) score += 1
  if (gcsLess15) score += 1
  return score
}

export function qsofaBand(score: number | null): string {
  if (score === null) return 'Unknown'
  return score < 2 ? 'Low qSOFA (>=2 is a clinical alert)' : 'qSOFA >=2 - urgent clinical review indicated'
}

export function cha2ds2Vasc(ageYears: number, female: boolean, chf: boolean, hypertension: boolean, strokeTia: boolean, vascularDisease: boolean, diabetes: boolean): number | null {
  const a = fin(ageYears)
  if (a === null || a < 0) return null
  let score = 0
  if (chf) score += 1
  if (hypertension) score += 1
  if (a >= 75) score += 2
  else if (a >= 65) score += 1
  if (diabetes) score += 1
  if (strokeTia) score += 2
  if (vascularDisease) score += 1
  if (female) score += 1
  return score
}

export function cha2ds2VascBand(score: number | null): string {
  if (score === null) return 'Unknown'
  return score === 0 ? 'Low stroke risk - anticoagulation usually not needed in AF' : score === 1 ? 'Low-moderate - discuss with clinician' : 'Oral anticoagulation typically recommended in AF - discuss with clinician'
}

export function hasBled(
  hypertension: boolean,
  renalDisease: boolean,
  liverDisease: boolean,
  strokeHx: boolean,
  majorBleedingHx: boolean,
  labileInr: boolean,
  ageOver65: boolean,
  antiplateletOrNsaid: boolean,
  alcohol: boolean,
): number {
  let score = 0
  if (hypertension) score += 1
  if (renalDisease) score += 1
  if (liverDisease) score += 1
  if (strokeHx) score += 1
  if (majorBleedingHx) score += 1
  if (labileInr) score += 1
  if (ageOver65) score += 1
  if (antiplateletOrNsaid) score += 1
  if (alcohol) score += 1
  return score
}

export function hasBledBand(score: number | null): string {
  if (score === null) return 'Unknown'
  return score >= 3 ? 'High bleeding risk (>=3) - careful monitoring advised' : 'Low to moderate bleeding risk'
}

export function wellsDvt(cancer: boolean, paralysisOrPlaster: boolean, bedriddenOrSurgery: boolean, localizedTenderness: boolean, entireLegSwollen: boolean, calfDiff3cm: boolean, pittingEdema: boolean, collateralVeins: boolean, alternativeDx: boolean): number {
  let score = 0
  if (cancer) score += 1
  if (paralysisOrPlaster) score += 1
  if (bedriddenOrSurgery) score += 1
  if (localizedTenderness) score += 1
  if (entireLegSwollen) score += 1
  if (calfDiff3cm) score += 1
  if (pittingEdema) score += 1
  if (collateralVeins) score += 1
  if (alternativeDx) score -= 2
  return score
}

export function wellsDvtBand(score: number | null): string {
  if (score === null) return 'Unknown'
  return score <= 0 ? 'Low probability of DVT' : score <= 2 ? 'Moderate probability' : 'High probability - urgent imaging advised'
}

export function wellsPe(clinicalPeMostLikely: boolean, dvtSigns: boolean, hrOver100: boolean, priorDvt: boolean, recentSurgery: boolean, hemoptysis: boolean, cancer: boolean): number {
  let score = 0
  if (clinicalPeMostLikely) score += 3
  if (dvtSigns) score += 3
  if (hrOver100) score += 1.5
  if (priorDvt) score += 1.5
  if (recentSurgery) score += 1.5
  if (hemoptysis) score += 1
  if (cancer) score += 1
  return score
}

export function wellsPeBand(score: number | null): string {
  if (score === null) return 'Unknown'
  return score < 2 ? 'Low probability of PE' : score <= 6 ? 'Moderate probability' : 'High probability - urgent work-up advised'
}

export function childPugh(bilirubinMgDl: number, albuminGdl: number, inr: number, ascitesPoints: number, encephalopathyPoints: number): number | null {
  const b = fin(bilirubinMgDl)
  const alb = fin(albuminGdl)
  const inrV = fin(inr)
  if (b === null || alb === null || inrV === null || b < 0 || alb <= 0 || inrV <= 0) return null
  const bPts = b < 2 ? 1 : b <= 3 ? 2 : 3
  const albPts = alb > 3.5 ? 1 : alb >= 2.8 ? 2 : 3
  const inrPts = inrV < 1.7 ? 1 : inrV <= 2.2 ? 2 : 3
  const total = bPts + albPts + inrPts + (ascitesPoints || 0) + (encephalopathyPoints || 0)
  return total
}

export function childPughBand(total: number | null): string {
  if (total === null) return 'Unknown'
  return total <= 6 ? 'Class A (well-compensated)' : total <= 9 ? 'Class B (moderate impairment)' : 'Class C (decompensated)'
}

export function gcsTotal(eye: number, verbal: number, motor: number): number | null {
  const e = fin(eye)
  const v = fin(verbal)
  const m = fin(motor)
  if (e === null || v === null || m === null || e < 1 || e > 4 || v < 1 || v > 5 || m < 1 || m > 6) return null
  return e + v + m
}

export function gcsBand(total: number | null): string {
  if (total === null) return 'Unknown'
  return total <= 8 ? 'Severe (coma range)' : total <= 12 ? 'Moderate impairment' : 'Mild impairment'
}