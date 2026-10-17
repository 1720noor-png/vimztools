import { clamp } from './guard.ts'

export function rhinitisScore(
  sneezing: boolean,
  runnyNose: boolean,
  itchyEyes: boolean,
  itchyNose: boolean,
  congestion: boolean,
  seasonalTrigger: boolean,
): number | null {
  if (typeof sneezing !== 'boolean' && typeof seasonalTrigger !== 'boolean') return null
  let s = 0
  if (sneezing) s += 1
  if (runnyNose) s += 1
  if (itchyEyes) s += 1
  if (itchyNose) s += 1
  if (congestion) s += 1
  if (seasonalTrigger) s += 1
  return s
}

export function rhinitisBand(s: number | null): string {
  if (s === null) return 'Incomplete input'
  if (s >= 5) return 'Very allergy-shaped picture'
  if (s >= 3) return 'Likely allergic rhinitis pattern'
  if (s >= 2) return 'Some allergic features'
  return 'Few allergic features'
}

export function soreThroatScore(
  painSwallow: boolean,
  fever: boolean,
  swollenGlands: boolean,
  whitePatches: boolean,
  durationDays: number,
): number | null {
  if (!Number.isFinite(durationDays) || durationDays < 0) return null
  if (typeof painSwallow !== 'boolean' && typeof whitePatches !== 'boolean') return null
  let s = 0
  if (painSwallow) s += 1
  if (fever) s += 1
  if (swollenGlands) s += 1
  if (whitePatches) s += 1
  if (durationDays >= 7) s += 1
  const long = durationDays > 10
  return s + (long ? 1 : 0)
}

export function soreThroatBand(s: number | null): string {
  if (s === null) return 'Incomplete input'
  if (s >= 4) return 'Several throat infection signs'
  if (s >= 2) return 'Moderate throat involvement'
  return 'Mild throat irritation'
}

export function coughScore(
  type: number,
  nightCough: boolean,
  fever: boolean,
  durationWeeks: number,
  smoking: boolean,
): { score: number; band: string } | null {
  if (!Number.isFinite(type) || !Number.isFinite(durationWeeks)) return null
  if (type < 1 || type > 3 || durationWeeks < 0) return null
  let s = 0
  if (type === 3) s += 1
  if (nightCough) s += 1
  if (fever) s += 2
  if (durationWeeks >= 3) s += 2
  if (durationWeeks >= 8) s += 1
  if (smoking) s += 1
  const band = s >= 4 ? 'Worth a clinical review' : s >= 2 ? 'Follow-up worthy' : 'Likely short-lived'
  return { score: s, band }
}

export function headacheSeverity(
  pain: number,
  nausea: boolean,
  lightSensitive: boolean,
  suddenWorst: boolean,
  neckStiff: boolean,
): { score: number; band: string } | null {
  if (!Number.isFinite(pain) || pain < 0 || pain > 10) return null
  if (typeof nausea !== 'boolean' && typeof neckStiff !== 'boolean') return null
  let s = 0
  if (pain >= 7) s += 2
  else if (pain >= 4) s += 1
  if (nausea) s += 1
  if (lightSensitive) s += 1
  if (suddenWorst) s += 3
  if (neckStiff) s += 3
  const band = s >= 5 ? 'Red-flag territory - seek urgent review' : s >= 3 ? 'Strong headache signal' : s >= 2 ? 'Notable headache' : 'Milder headache'
  return { score: s, band }
}

export function nauseaScore(
  episodesPerDay: number,
  vomiting: boolean,
  fever: boolean,
  diarrhea: boolean,
  dehydrSigns: boolean,
  durationDays: number,
): number | null {
  if (!Number.isFinite(episodesPerDay) || !Number.isFinite(durationDays)) return null
  if (episodesPerDay < 0 || durationDays < 0) return null
  let s = 0
  if (episodesPerDay >= 5) s += 2
  else if (episodesPerDay >= 2) s += 1
  if (vomiting) s += 1
  if (fever) s += 1
  if (diarrhea) s += 1
  if (dehydrSigns) s += 2
  if (durationDays >= 2) s += 1
  return s
}

export function nauseaBand(s: number | null): string {
  if (s === null) return 'Incomplete input'
  if (s >= 5) return 'High burden - fluids and review'
  if (s >= 3) return 'Moderate stomach burden'
  if (s >= 1) return 'Mild or short episode'
  return 'Nothing pointing to it'
}

export function diarrheaStatus(
  stoolsPerDay: number,
  blood: boolean,
  fever: boolean,
  durationDays: number,
): { score: number; band: string } | null {
  if (!Number.isFinite(stoolsPerDay) || !Number.isFinite(durationDays)) return null
  if (stoolsPerDay < 0 || durationDays < 0) return null
  let s = 0
  if (stoolsPerDay >= 8) s += 2
  else if (stoolsPerDay >= 4) s += 1
  if (blood) s += 3
  if (fever) s += 2
  if (durationDays >= 2) s += 1
  if (durationDays >= 7) s += 2
  const band = s >= 5 ? 'High concern - hydrate and seek review' : s >= 3 ? 'Moderate - watch hydration' : s >= 1 ? 'Mild bout' : 'No clear signal'
  return { score: s, band }
}

export function constipationScore(
  bmsPerWeek: number,
  straining: boolean,
  hardStools: boolean,
  bloating: boolean,
): number | null {
  if (!Number.isFinite(bmsPerWeek) || bmsPerWeek < 0) return null
  let s = 0
  if (bmsPerWeek <= 2) s += 2
  else if (bmsPerWeek <= 5) s += 1
  if (straining) s += 1
  if (hardStools) s += 1
  if (bloating) s += 1
  return s
}

export function constipationBand(s: number | null): string {
  if (s === null) return 'Incomplete input'
  if (s >= 4) return 'Frequent constipation pattern'
  if (s >= 2) return 'Occasional constipation'
  if (s === 1) return 'Mild or rare constipation'
  return 'Regular movements'
}

export function lymphNodeScore(
  swollenSites: number,
  tender: boolean,
  fever: boolean,
  durationWeeks: number,
): { score: number; band: string } | null {
  if (!Number.isFinite(swollenSites) || !Number.isFinite(durationWeeks)) return null
  if (swollenSites < 0 || durationWeeks < 0) return null
  const sites = clamp(Math.floor(swollenSites), 0, 10)
  let s = 0
  if (sites >= 3) s += 2
  else if (sites >= 1) s += 1
  if (tender) s += 2
  if (fever) s += 1
  if (durationWeeks >= 4) s += 3
  else if (durationWeeks >= 2) s += 1
  const band = s >= 5 ? 'Prolonged or extensive - review needed' : s >= 3 ? 'Several-signal picture' : s >= 1 ? 'Short-lived reaction' : 'No nodes to flag'
  return { score: s, band }
}

export function rashScore(
  itchy: boolean,
  spreading: boolean,
  fever: boolean,
  blisters: boolean,
  durationDays: number,
): number | null {
  if (!Number.isFinite(durationDays) || durationDays < 0) return null
  let s = 0
  if (itchy) s += 1
  if (spreading) s += 2
  if (fever) s += 2
  if (blisters) s += 1
  if (durationDays >= 7) s += 1
  return s
}

export function rashBand(s: number | null): string {
  if (s === null) return 'Incomplete input'
  if (s >= 4) return 'Worth a clinician look'
  if (s >= 2) return 'Watchful eye needed'
  if (s >= 1) return 'Minor or local response'
  return 'No strong signal'
}

export function dizzinessScore(
  lightheaded: boolean,
  spins: boolean,
  falls: boolean,
  chestPain: boolean,
  palpitations: boolean,
  durationMin: number,
): { score: number; band: string } | null {
  if (!Number.isFinite(durationMin) || durationMin < 0) return null
  let s = 0
  if (lightheaded) s += 1
  if (spins) s += 1
  if (falls) s += 3
  if (chestPain) s += 3
  if (palpitations) s += 2
  if (durationMin >= 30) s += 1
  const band = s >= 5 ? 'Red-flag territory - urgent review' : s >= 3 ? 'Notable dizziness signal' : s >= 1 ? 'Minor episode' : 'No dizziness pattern'
  return { score: s, band }
}

export function fatigueScore(
  energy: number,
  sleepHrs: number,
  concentration: boolean,
  mood: boolean,
  durationWeeks: number,
): number | null {
  if (!Number.isFinite(energy) || !Number.isFinite(sleepHrs) || !Number.isFinite(durationWeeks)) return null
  if (energy < 0 || energy > 10 || sleepHrs < 0) return null
  let s = 0
  if (energy <= 3) s += 3
  else if (energy <= 6) s += 2
  else if (energy <= 8) s += 1
  if (sleepHrs < 6) s += 1
  else if (sleepHrs > 9) s += 1
  if (concentration) s += 1
  if (mood) s += 1
  if (durationWeeks >= 4) s += 2
  else if (durationWeeks >= 1) s += 1
  return s
}

export function fatigueBand(s: number | null): string {
  if (s === null) return 'Incomplete input'
  if (s >= 7) return 'Persistent heavy fatigue'
  if (s >= 4) return 'Notable fatigue burden'
  if (s >= 2) return 'Mild fatigue'
  return 'Energy holding up'
}

export function insomniaScore(
  latencyMin: number,
  nightWakings: number,
  earlyWake: boolean,
  unrefreshed: boolean,
  durationWeeks: number,
): number | null {
  if (!Number.isFinite(latencyMin) || !Number.isFinite(nightWakings) || !Number.isFinite(durationWeeks)) return null
  if (latencyMin < 0 || nightWakings < 0 || durationWeeks < 0) return null
  let s = 0
  if (latencyMin >= 60) s += 2
  else if (latencyMin >= 20) s += 1
  if (nightWakings >= 2) s += 2
  else if (nightWakings >= 1) s += 1
  if (earlyWake) s += 1
  if (unrefreshed) s += 1
  if (durationWeeks >= 4) s += 1
  return s
}

export function insomniaBand(s: number | null): string {
  if (s === null) return 'Incomplete input'
  if (s >= 5) return 'Insomnia-shaped pattern'
  if (s >= 3) return 'Noticeable sleep disruption'
  if (s >= 1) return 'Minor sleep signal'
  return 'Sleep broadly on track'
}

export function eyeStrainScore(
  screenHrs: number,
  dryEyes: boolean,
  blurred: boolean,
  headaches: boolean,
  distanceCm: number,
): number | null {
  if (!Number.isFinite(screenHrs) || !Number.isFinite(distanceCm)) return null
  if (screenHrs < 0 || distanceCm < 0) return null
  let s = 0
  if (screenHrs >= 8) s += 2
  else if (screenHrs >= 4) s += 1
  if (dryEyes) s += 1
  if (blurred) s += 1
  if (headaches) s += 1
  if (distanceCm < 40 || distanceCm > 75) s += 1
  return s
}

export function eyeStrainBand(s: number | null): string {
  if (s === null) return 'Incomplete input'
  if (s >= 4) return 'Significant screen-strain pattern'
  if (s >= 2) return 'Mild-to-moderate strain'
  if (s >= 1) return 'Early strain signals'
  return 'Eyes coping well'
}

export function refluxScore(
  heartburnPerWeek: number,
  regurgitation: boolean,
  nightCough: boolean,
  hoarseVoice: boolean,
  sourTaste: boolean,
): number | null {
  if (!Number.isFinite(heartburnPerWeek) || heartburnPerWeek < 0) return null
  let s = 0
  if (heartburnPerWeek >= 3) s += 2
  else if (heartburnPerWeek >= 1) s += 1
  if (regurgitation) s += 1
  if (nightCough) s += 1
  if (hoarseVoice) s += 1
  if (sourTaste) s += 1
  return s
}

export function refluxBand(s: number | null): string {
  if (s === null) return 'Incomplete input'
  if (s >= 4) return 'Frequent reflux pattern'
  if (s >= 2) return 'Occasional reflux clues'
  if (s >= 1) return 'Mild or rare reflux'
  return 'No reflux pattern'
}