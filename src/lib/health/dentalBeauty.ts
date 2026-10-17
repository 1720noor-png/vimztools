import { clamp } from './guard.ts'

export function brushingHabitScore(
  brushCount: number,
  durationMin: number,
  flossDaysPerWeek: number,
  tongueCleaned: boolean,
  softBristle: boolean,
): number | null {
  if (![brushCount, durationMin, flossDaysPerWeek].every(Number.isFinite)) return null
  if (brushCount < 0 || durationMin < 0 || flossDaysPerWeek < 0) return null
  const freqPts = Math.min(brushCount, 2) / 2 * 30
  const durPts = clamp((durationMin - 0.5) / 1.5, 0, 1) * 25
  const flossPts = Math.min(flossDaysPerWeek, 7) / 7 * 25
  const tonguePts = tongueCleaned ? 10 : 0
  const bristlePts = softBristle ? 10 : 0
  return Math.round(freqPts + durPts + flossPts + tonguePts + bristlePts)
}

export function brushingScoreBand(score: number | null): string {
  if (score === null) return 'Incomplete input'
  if (score >= 80) return 'Excellent routine'
  if (score >= 60) return 'Good - room to grow'
  if (score >= 40) return 'Getting there'
  return 'Needs a reset'
}

export function flossingStatus(timesPerWeek: number): { times: number; band: string } | null {
  if (!Number.isFinite(timesPerWeek) || timesPerWeek < 0) return null
  const t = Math.min(timesPerWeek, 7)
  const band = t >= 7 ? 'Daily - gold standard' : t >= 4 ? 'Almost daily' : t >= 1 ? 'Building the habit' : 'Not yet started'
  return { times: t, band }
}

export function whiteningFrequency(sessionsPerMonth: number, sensitive: boolean): { band: string; note: string } | null {
  if (!Number.isFinite(sessionsPerMonth) || sessionsPerMonth < 0) return null
  if (sessionsPerMonth >= 4) return { band: 'High frequency', note: 'Monthly whitening this frequent raises enamel sensitivity risk - spread sessions out.' }
  if (sessionsPerMonth >= 2) return { band: 'Moderate use', note: 'Two-plus sessions monthly is on the high side for at-home whitening.' }
  if (sensitive) return { band: 'Sensitive teeth - careful', note: 'Your teeth are already sensitive; go gentle with any whitening product.' }
  return { band: 'Low frequency', note: 'Occasional whitening at your pace is fine. Keep an eye on sensitivity.' }
}

export function fluorideCoverage(waterFluoridated: boolean, toothpasteFluoride: boolean, dentalVarnish: boolean): { count: number; band: string } | null {
  if (typeof waterFluoridated !== 'boolean' && typeof waterFluoridated !== 'boolean') return null
  let count = 0
  if (waterFluoridated) count += 1
  if (toothpasteFluoride) count += 1
  if (dentalVarnish) count += 1
  const band = count >= 3 ? 'Full fluoride shield' : count === 2 ? 'Strong coverage' : count === 1 ? 'Partial coverage' : 'Low coverage'
  return { count, band }
}

export function dryMouthScore(
  dryThroat: boolean,
  stickySaliva: boolean,
  thirstyAtNight: boolean,
  sipsThroughoutDay: boolean,
  sjogrensRisk: boolean,
): number | null {
  if (typeof dryThroat !== 'boolean' && typeof sipsThroughoutDay !== 'boolean') return null
  let score = 0
  if (dryThroat) score += 1
  if (stickySaliva) score += 1
  if (thirstyAtNight) score += 1
  if (sipsThroughoutDay) score += 1
  if (sjogrensRisk) score += 1
  return score
}

export function dryMouthBand(score: number | null): string {
  if (score === null) return 'Incomplete input'
  if (score >= 4) return 'Pronounced dry mouth'
  if (score >= 2) return 'Noticeable dry mouth'
  if (score === 1) return 'Occasional dryness'
  return 'No obvious dry mouth'
}

export function badBreathScore(
  tongueCoating: boolean,
  dryMouth: boolean,
  gumBleeding: boolean,
  postNasalDrip: boolean,
  heavyGarlicOnion: boolean,
): number | null {
  if (typeof tongueCoating !== 'boolean' && typeof heavyGarlicOnion !== 'boolean') return null
  let score = 0
  if (tongueCoating) score += 1
  if (dryMouth) score += 1
  if (gumBleeding) score += 1
  if (postNasalDrip) score += 1
  if (heavyGarlicOnion) score += 1
  return score
}

export function badBreathBand(score: number | null): string {
  if (score === null) return 'Incomplete input'
  if (score >= 4) return 'Several contributors at once'
  if (score >= 2) return 'A couple of likely causes'
  if (score === 1) return 'One likely cause'
  return 'Routine halitosis only'
}

export function gumHealthScore(
  gumBleeding: boolean,
  gumRedness: boolean,
  gumSwelling: boolean,
  recedingGums: boolean,
  badTaste: boolean,
): number | null {
  if (typeof gumBleeding !== 'boolean' && typeof badTaste !== 'boolean') return null
  let score = 0
  if (gumBleeding) score += 1
  if (gumRedness) score += 1
  if (gumSwelling) score += 1
  if (recedingGums) score += 1
  if (badTaste) score += 1
  return score
}

export function gumHealthBand(score: number | null): string {
  if (score === null) return 'Incomplete input'
  if (score >= 4) return 'Talk with your dentist soon'
  if (score >= 2) return 'Several gum warning signs'
  if (score === 1) return 'One gum warning sign'
  return 'Gums look healthy'
}

export function scalpHealthScore(
  dandruff: boolean,
  dryness: boolean,
  oiliness: boolean,
  itching: boolean,
  flaking: boolean,
): number | null {
  if (typeof dandruff !== 'boolean' && typeof flaking !== 'boolean') return null
  let score = 0
  if (dandruff) score += 1
  if (dryness) score += 1
  if (oiliness) score += 1
  if (itching) score += 1
  if (flaking) score += 1
  return score
}

export function scalpHealthBand(score: number | null): string {
  if (score === null) return 'Incomplete input'
  if (score >= 4) return 'Visible scalp discomfort'
  if (score >= 2) return 'Mild scalp imbalance'
  if (score === 1) return 'Minor scalp signal'
  return 'Scalp at ease'
}

export function hairWashFrequency(
  scalpType: number,
  stylingDaysWeek: number,
): { washesPerWeek: number; band: string } | null {
  if (!Number.isFinite(scalpType) || !Number.isFinite(stylingDaysWeek)) return null
  if (scalpType < 1 || scalpType > 4) return null
  if (stylingDaysWeek < 1 || stylingDaysWeek > 7) return null
  const s = Math.floor(scalpType)
  const washes = s === 1 ? 2 : s === 2 ? 3 : s === 3 ? 2 : s === 4 ? 3 : 2
  const band = s === 1 ? 'Normal scalp - 1-2 washes a week' : s === 2 ? 'Oily scalp - 2-4 washes a week' : s === 3 ? 'Dry scalp - 1-2 washes a week' : 'Dandruff-prone - 2-3 washes a week'
  return { washesPerWeek: washes, band }
}

export function skinMoistureRoutine(
  skinType: number,
  drySeason: boolean,
  indoorHeat: boolean,
  hotShowers: boolean,
): { goals: string[]; count: number; band: string } | null {
  if (!Number.isFinite(skinType) || skinType < 1 || skinType > 4) return null
  const goals: string[] = ['Moisturize within minutes after washing']
  const s = Math.floor(skinType)
  if (s === 1) goals.push('Light gel or water-based lotion')
  if (s === 2) goals.push('Richer cream or ceramide moisturizer')
  if (s === 3) goals.push('Balanced lotion, twice a day')
  if (s === 4) goals.push('Fragrance-free, minimal ingredients')
  if (drySeason) goals.push('Upgrade to a thicker product in winter')
  if (indoorHeat) goals.push('Add a humidifier in heated rooms')
  if (hotShowers) goals.push('Shorten showers and end lukewarm')
  const count = goals.length
  const band = count >= 6 ? 'Complete moisture plan' : count >= 4 ? 'Solid moisture plan' : count >= 2 ? 'Core plan' : 'Start with the basics'
  return { goals, count, band }
}

export function moleAwarenessScore(
  moreThan30Moles: boolean,
  newOrChanged: boolean,
  itchyOrBleeding: boolean,
  familyHistory: boolean,
  severeSunburnHistory: boolean,
): number | null {
  if (typeof moreThan30Moles !== 'boolean' && typeof severeSunburnHistory !== 'boolean') return null
  let score = 0
  if (moreThan30Moles) score += 1
  if (newOrChanged) score += 1
  if (itchyOrBleeding) score += 1
  if (familyHistory) score += 1
  if (severeSunburnHistory) score += 1
  return score
}

export function moleAwarenessBand(score: number | null): string {
  if (score === null) return 'Incomplete input'
  if (score >= 3) return 'Schedule a skin review'
  if (score >= 2) return 'Keep close watch on moles'
  if (score === 1) return 'Routine self-checks advised'
  return 'Low-signal profile'
}