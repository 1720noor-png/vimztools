import { clamp } from './guard.ts'

export function spacedDosingTimes(timesPerDay: number): { times: string[]; intervalHrs: string } | null {
  if (!Number.isFinite(timesPerDay) || timesPerDay < 1 || timesPerDay > 6) return null
  const n = Math.round(timesPerDay)
  const gap = Math.round((24 / n) * 2) / 2
  const times: string[] = []
  for (let i = 0; i < n; i++) {
    const min = Math.round((i * 24 * 60) / n)
    const h = Math.floor(min / 60)
    const m = min % 60
    times.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`)
  }
  return { times, intervalHrs: `${gap} hours` }
}

export function daysOfSupply(remainingUnits: number, dosesPerDay: number): number | null {
  if (!Number.isFinite(remainingUnits) || remainingUnits < 0 || !Number.isFinite(dosesPerDay) || dosesPerDay <= 0 || dosesPerDay > 24) return null
  return Math.floor(remainingUnits / dosesPerDay)
}

export function missedDoseAdvice(intervalHrs: number): string | null {
  if (!Number.isFinite(intervalHrs) || intervalHrs <= 0 || intervalHrs > 48) return null
  if (intervalHrs <= 2) return 'Very tight schedule - take the missed dose ASAP if under 1-2h late, otherwise skip and never double.'
  if (intervalHrs <= 6) return 'Take it as soon as you remember unless the next dose is nearly due - do not double up.'
  if (intervalHrs <= 12) return 'Take it when remembered (same-day window), skip it if the next dose is due within a few hours.'
  return 'Once-a-day or less - take it when remembered unless the next day\u2019s dose is close; never take two together.'
}

export function interactionTier(medA: string, medB: string): string | null {
  const pair: [string, string] = [medA, medB].sort() as [string, string]
  const high: [string, string][] = [['anticoag', 'nsaid'], ['ssri', 'triptan'], ['anticoag', 'dobule']]
  const highPairs = new Set(high.map((p) => p.join('|')))
  if (highPairs.has(pair.join('|'))) return 'High alert - a known serious interaction family. Get pharmacist confirmation before combining.'
  const mid: [string, string][] = [['nsaid', 'ssri'], ['statin', 'other'], ['anticoag', 'other'], ['nsaid', 'other'], ['ssri', 'other'], ['metformin', 'other'], ['metformin', 'statin'], ['statin', 'ssri']]
  const midPairs = new Set(mid.map((p) => p.join('|')))
  if (midPairs.has(pair.join('|'))) return 'Watch closely - increased risk of bleeding or side effects. Verify dosing with a professional.'
  if (medA === medB) return 'Same medicine twice in one list - check for accidental doubling.'
  return 'No obvious serious pair mined from the general families here - still confirm with a pharmacist.'
}

export function steadyStateDays(halfLifeHrs: number): number | null {
  if (!Number.isFinite(halfLifeHrs) || halfLifeHrs <= 0 || halfLifeHrs > 720) return null
  return Math.ceil((5 * halfLifeHrs) / 24)
}

export function monthlyCost(costPerDose: number, dosesPerDay: number): number | null {
  if (!Number.isFinite(costPerDose) || costPerDose < 0 || !Number.isFinite(dosesPerDay) || dosesPerDay <= 0 || dosesPerDay > 24) return null
  return Math.round(costPerDose * dosesPerDay * 30.42 * 100) / 100
}

export function doseUnitConvert(value: number, from: 'mg' | 'mcg', to: 'mg' | 'mcg'): number | null {
  if (!Number.isFinite(value) || value < 0) return null
  if (from === to) return value
  if (from === 'mg' && to === 'mcg') return value * 1000
  return value / 1000
}

export function daysToExpiry(expiryIso: string): number | null {
  const t = Date.parse(expiryIso)
  if (!Number.isFinite(t)) return null
  return Math.max(0, Math.ceil((t - Date.now()) / 86400000))
}

export { clamp }