import { clamp, safeDiv } from './guard.ts'

export function fev1FvcRatio(fev1: number, fvc: number): { ratio: number; band: string } | null {
  if (fev1 < 0.1 || fvc < 0.1 || fev1 > fvc + 1) return null
  const ratio = Math.round((fev1 / fvc) * 100) / 100
  const band = ratio >= 0.7 ? 'Ratio typical (≥0.70)' : 'Low ratio - obstructive pattern flag'
  return { ratio, band }
}

export function fvcPredicted(heightCm: number, age: number, female: boolean): { predicted: number; band: string } | null {
  if (heightCm < 120 || heightCm > 220 || age < 15 || age > 90) return null
  const mH = heightCm / 100
  const predicted = female ? 3.31 * mH - 0.029 * age - 1.03 : 4.43 * mH - 0.029 * age - 2.89
  return { predicted: Math.round(predicted * 100) / 100, band: 'Simplified population formula - your lab report supersedes it' }
}

export function sfRatio(spo2Pct: number, fio2Pct: number): { sf: number; band: string } | null {
  if (spo2Pct < 50 || spo2Pct > 100 || fio2Pct < 21 || fio2Pct > 100) return null
  const sf = Math.round(spo2Pct / (fio2Pct / 100))
  const band = sf >= 315 ? 'Good oxygenation' : sf >= 235 ? 'Moderate desaturation signal' : sf >= 175 ? 'Low oxygenation event' : 'Severe desaturation - urgent assessment'
  return { sf, band }
}

export function borgBand(score: number): string | null {
  if (score < 0 || score > 10) return null
  return score <= 0 ? 'Nothing at all' : score <= 1 ? 'Very light' : score <= 2 ? 'Light' : score <= 3 ? 'Moderate' : score <= 4 ? 'Somewhat severe' : score <= 5 ? 'Severe' : score <= 7 ? 'Very severe' : 'Maximal'
}

export function mrcGrade(level: number): string | null {
  if (level < 1 || level > 5) return null
  return level === 1 ? 'No breathlessness except with strenuous exercise' : level === 2 ? 'Short of breath on hurried walking / slight hill' : level === 3 ? 'Walks slower than peers on level ground' : level === 4 ? 'Stops for breath after ~100 m on the level' : 'Too breathless to leave the house / dressing causes it'
}

export function pcrBand(proteinMgDl: number, creatMgDl: number): { pcr: number; band: string } | null {
  if (proteinMgDl < 0 || creatMgDl <= 0 || proteinMgDl > 5000 || creatMgDl > 1000) return null
  const mgG = Math.round((proteinMgDl / creatMgDl) * 1000)
  const band = mgG < 150 ? 'Typical 24h protein proxy' : mgG < 500 ? 'Moderately raised protein' : 'High protein load - kidney review'
  return { pcr: mgG, band }
}

export function uacrBand(albuminMgL: number, creatMgDl: number): { mgG: number; band: string } | null {
  if (albuminMgL < 0 || creatMgDl <= 0 || albuminMgL > 5000 || creatMgDl > 1000) return null
  const mgG = Math.round((albuminMgL / creatMgDl) * 100)
  const band = mgG < 30 ? 'Low urine albumin' : mgG < 300 ? 'Moderately increased albumin (A2)' : 'Severely increased albumin (A3)'
  return { mgG, band }
}

export function fenaPct(urineNa: number, serumNa: number, urineCr: number, serumCr: number): { fena: number; band: string } | null {
  if (urineNa < 0 || serumNa <= 0 || urineCr <= 0 || serumCr <= 0) return null
  const fena = Math.round(((urineNa * serumCr) / (serumNa * urineCr)) * 1000) / 10
  const band = fena < 1 ? 'Under 1% - pre-renal pattern (dehydration trend)' : fena <= 2 ? '1-2% - gray zone, interpret with context' : 'Over 2% - intrinsic kidney damage pattern'
  return { fena, band }
}

export { clamp, safeDiv }