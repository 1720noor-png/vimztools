import { fin } from './guard.ts'

export function weightAtBmi(targetBmi: number, heightCm: number): number | null {
  const b = fin(targetBmi)
  const h = fin(heightCm)
  if (b === null || h === null || b <= 0 || b > 60 || h < 90 || h > 250) return null
  return Math.round(b * (h / 100) * (h / 100))
}

export function weightGoalPlan(startKg: number, targetKg: number, weeks: number): { lossKg: number; rateKgPerWeek: number; dailyDeficitKcal: number } | null {
  const s = fin(startKg)
  const t = fin(targetKg)
  const w = fin(weeks)
  if (s === null || t === null || w === null || s <= 0 || t <= 0 || w <= 0 || t >= s) return null
  const lossKg = s - t
  const rate = lossKg / w
  return { lossKg, rateKgPerWeek: rate, dailyDeficitKcal: Math.round((rate * 7700) / 7) }
}

export function weightGainPlan(startKg: number, targetKg: number, weeks: number): { gainKg: number; rateKgPerWeek: number; dailySurplusKcal: number } | null {
  const s = fin(startKg)
  const t = fin(targetKg)
  const w = fin(weeks)
  if (s === null || t === null || w === null || s <= 0 || t <= 0 || w <= 0 || t <= s) return null
  const gainKg = t - s
  const rate = gainKg / w
  return { gainKg, rateKgPerWeek: rate, dailySurplusKcal: Math.round((rate * 7700) / 7) }
}

export function maintenanceWeightKg(dailyIntakeKcal: number, activityKcalPerKg: number): number | null {
  const kcal = fin(dailyIntakeKcal)
  const perKg = fin(activityKcalPerKg)
  if (kcal === null || perKg === null || kcal <= 0 || perKg <= 0) return null
  return Math.max(0, Math.round(kcal / perKg))
}

export function fatGramsFromKcal(totalKcal: number, fatPct: number): number | null {
  const kcal = fin(totalKcal)
  const pct = fin(fatPct)
  if (kcal === null || pct === null || kcal <= 0 || pct < 0 || pct > 100) return null
  return Math.round((kcal * pct) / 100 / 9)
}

export interface ServingNutrition {
  kcal: number
  proteinG: number
  carbsG: number
  fatG: number
  fiberG: number
}

export function servingNutrition(kcalPer100g: number, proteinG: number, carbsG: number, fatG: number, fiberG: number, servingGrams: number): ServingNutrition | null {
  const vals = [kcalPer100g, proteinG, carbsG, fatG, fiberG, servingGrams].map(fin)
  const w = fin(servingGrams)
  if (vals.some((v) => v === null)) return null
  const [k, p, c, f2, fb] = vals as number[]
  if (w === null || w <= 0 || k < 0 || p < 0 || c < 0 || f2 < 0 || fb < 0) return null
  const factor = w / 100
  return {
    kcal: Math.round(k * factor),
    proteinG: Math.round(p * factor * 10) / 10,
    carbsG: Math.round(c * factor * 10) / 10,
    fatG: Math.round(f2 * factor * 10) / 10,
    fiberG: Math.round(fb * factor * 10) / 10,
  }
}

export function hydrationNeedsMl(weightKg: number, ageYears: number, exerciseMinutes: number, tempC: number): number | null {
  const w = fin(weightKg)
  const age = fin(ageYears)
  const ex = fin(exerciseMinutes)
  const t = fin(tempC)
  if (w === null || age === null || ex === null || t === null || w <= 0 || w > 300 || age < 0 || age > 120 || ex < 0 || t < -20 || t > 60) return null
  let base = age < 50 ? 35 : 30
  base = base * w
  if (t >= 30) base += 500
  else if (t >= 25) base += 250
  base += Math.min(ex, 240) * 12
  return Math.round(base)
}

export function hotWeatherFluidMl(weightKg: number, tempC: number, humidityPct: number, activityMinutes: number): number | null {
  const w = fin(weightKg)
  const t = fin(tempC)
  const h = fin(humidityPct)
  const a = fin(activityMinutes)
  if (w === null || t === null || h === null || a === null || w <= 0 || w > 300 || t < -20 || t > 60 || h < 0 || h > 100 || a < 0) return null
  let base = 30 * w
  if (t >= 38) base += 750
  else if (t >= 33) base += 500
  else if (t >= 28) base += 300
  if (h >= 70) base += 200
  base += Math.min(a, 240) * 12
  return Math.round(base)
}