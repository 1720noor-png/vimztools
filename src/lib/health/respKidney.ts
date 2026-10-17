import { fin } from './guard.ts'

export function pfRatio(paO2MmHg: number, fiO2Fraction: number): number | null {
  const o2 = fin(paO2MmHg)
  const f = fin(fiO2Fraction)
  if (o2 === null || f === null || o2 <= 0 || f <= 0 || f > 1) return null
  return Math.round(o2 / f)
}

export function pfRatioBand(pf: number | null): string {
  if (pf === null) return 'Unknown'
  return pf >= 300 ? 'Normal oxygenation (>=300)' : pf >= 200 ? 'Mild impairment (<300)' : pf >= 100 ? 'Moderate impairment (<200)' : 'Severe impairment (<100)'
}

export function aaGradient(paO2MmHg: number, paCO2MmHg: number, altitudeMeters: number): number | null {
  const o2 = fin(paO2MmHg)
  const co2 = fin(paCO2MmHg)
  const alt = fin(altitudeMeters)
  if (o2 === null || co2 === null || alt === null || o2 <= 0 || co2 <= 0 || alt < 0) return null
  const pb = 760 * Math.pow(1 - 2.25577e-5 * alt, 5.25588)
  const paiO2 = (pb - 47) * 0.21 - co2 / 0.8
  const grad = paiO2 - o2
  return Math.round(Math.max(0, grad) * 10) / 10
}

export function packYears(packsPerDay: number, yearsSmoking: number): number | null {
  const p = fin(packsPerDay)
  const y = fin(yearsSmoking)
  if (p === null || y === null || p < 0 || y < 0) return null
  return Math.round(p * y * 10) / 10
}

export function packYearsBand(packYrs: number | null): string {
  if (packYrs === null) return 'Unknown'
  return packYrs < 10 ? 'Lower pack-year load' : packYrs < 20 ? 'Moderate exposure (lung screening criteria may apply from 20)' : 'High exposure (>=20 pack-years meets screening criteria in at-risk groups)'
}

export function peakFlowZone(personalBestLmin: number, currentLmin: number): string {
  const pb = fin(personalBestLmin)
  const cur = fin(currentLmin)
  if (pb === null || cur === null || pb <= 0 || cur < 0) return 'Enter valid readings'
  const pct = (cur / pb) * 100
  return pct >= 80 ? 'Green zone (>=80% of best) - controlled' : pct >= 50 ? 'Yellow zone (50-79%) - caution, use action plan' : 'Red zone (<50%) - seek urgent care / follow asthma plan'
}

export function kidneyStage(egfrMlMin: number): string {
  const e = fin(egfrMlMin)
  if (e === null || e < 0) return 'Enter a valid eGFR'
  return e >= 90 ? 'G1 (normal/high - >=90)' : e >= 60 ? 'G2 (mildly reduced - 60-89)' : e >= 45 ? 'G3a (mild-moderate - 45-59)' : e >= 30 ? 'G3b (moderate-severe - 30-44)' : e >= 15 ? 'G4 (severe - 15-29)' : 'G5 (kidney failure - <15)'
}

export function fluidBalanceNetMl(intakeMl: number, outputMl: number): number | null {
  const i = fin(intakeMl)
  const o = fin(outputMl)
  if (i === null || o === null || i < 0 || o < 0) return null
  return Math.round(i - o)
}

export function kidneyStoneRiskScore(familyHistory: boolean, lowWaterIntake: boolean, highSodium: boolean, highAnimalProtein: boolean, highOxalate: boolean, lowCitrusFruit: boolean): number | null {
  let score = 0
  if (familyHistory) score += 1
  if (lowWaterIntake) score += 1
  if (highSodium) score += 1
  if (highAnimalProtein) score += 1
  if (highOxalate) score += 1
  if (lowCitrusFruit) score += 1
  if (score === 0 && !familyHistory) return null
  return score
}

export function kidneyStoneBand(score: number | null): string {
  if (score === null) return 'No risk factors selected'
  return score <= 2 ? 'Low estimated risk' : score <= 4 ? 'Moderate - hydration and diet help' : 'Higher estimated risk - hydration and dietary review advised'
}

export function wetBulbCelsius(tempC: number, humidityPct: number): number | null {
  const t = fin(tempC)
  const rh = fin(humidityPct)
  if (t === null || rh === null || t < -40 || t > 60 || rh < 0 || rh > 100) return null
  // Stull (2011) simplified wet-bulb temperature approximation
  const twb =
    t * Math.atan(0.151977 * Math.sqrt(rh + 8.313659)) +
    Math.atan(t + rh) -
    Math.atan(rh - 1.676331) +
    0.00391838 * Math.pow(rh, 1.5) * Math.atan(0.023101 * rh) -
    4.686035
  return Math.round(twb * 10) / 10
}

export function wetBulbAlert(tempC: number, humidityPct: number): string {
  const twb = wetBulbCelsius(tempC, humidityPct)
  if (twb === null) return 'Enter valid values'
  return twb >= 30.5 ? 'Very high heat stress - limit strenuous exertion' : twb >= 27.8 ? 'High heat stress - hydrate well and take breaks' : twb >= 24 ? 'Moderate heat stress - pace yourself outdoors' : 'Low heat stress - normal activity with fluids'
}