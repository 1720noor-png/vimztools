import { fin, clamp } from './guard.ts'

export function sugarExposureScore(sweetDrinksPerDay: number, snacksPerDay: number, candyPerDay: number): number | null {
  const a = fin(sweetDrinksPerDay)
  const b = fin(snacksPerDay)
  const c = fin(candyPerDay)
  if (a === null || b === null || c === null || a < 0 || b < 0 || c < 0) return null
  return clamp(Math.round(a + b + c), 0, 20)
}

export function sugarExposureBand(score: number | null): string {
  if (score === null) return 'Unknown'
  return score === 0 ? 'Excellent - very limited sugar exposure' : score <= 3 ? 'Low exposure - good habit' : score <= 7 ? 'Moderate - try cutting one exposure daily' : 'High exposure - enamel and gum risks rise'
}

export function uvBurnTimeMinutes(uvIndex: number, spf: number): number | null {
  const uv = fin(uvIndex)
  const s = fin(spf)
  if (uv === null || s === null || uv <= 0 || s < 1) return null
  const unprotectedMin = 90 / uv
  return Math.round(unprotectedMin * (s === 1 ? 1 : s))
}

export function uvBurnLabel(minutes: number | null): string {
  if (minutes === null) return 'Unknown'
  return minutes <= 20 ? 'Very quick burn - protect skin and reapply often' : minutes <= 60 ? 'Quick burn - reapply at least hourly' : 'Burn time is longer - still reapply after swimming or sweating'
}

export function hairLossRiskScore(genetic: boolean, stress: boolean, recentTelogen: boolean, poorIronDiet: boolean, tightStyling: boolean, recentMeds: boolean): number | null {
  let score = 0
  if (genetic) score += 2
  if (stress) score += 1
  if (recentTelogen) score += 1
  if (poorIronDiet) score += 1
  if (tightStyling) score += 1
  if (recentMeds) score += 1
  if (score === 0 && !genetic) return null
  return score
}

export function hairLossBand(score: number | null): string {
  if (score === null) return 'No risk factors selected'
  return score <= 2 ? 'Low - regular care is fine' : score <= 4 ? 'Moderate - nutrition and stress review help' : 'Higher - worth a scalp/dermatology review'
}

export function hairPorosityTest(porosityFloatTestSeconds: number): string {
  const s = fin(porosityFloatTestSeconds)
  if (s === null || s < 0 || s > 300) return 'Enter a value between 0 and 300 seconds'
  return s <= 2 ? 'High porosity - strands sink fast, focus on moisture retention' : s <= 5 ? 'Medium porosity - balanced care works well' : 'Low porosity - strands resist water, use lightweight moisturizers'
}

export function dehydrationScore(headache: boolean, darkUrine: boolean, thirst: boolean, dizziness: boolean, fatigue: boolean, dryMouth: boolean): number | null {
  let score = 0
  if (headache) score += 1
  if (darkUrine) score += 1
  if (thirst) score += 1
  if (dizziness) score += 1
  if (fatigue) score += 1
  if (dryMouth) score += 1
  if (score === 0) return null
  return score
}

export function dehydrationBand(score: number | null): string {
  if (score === null) return 'No signs selected - hydration looks fine'
  return score <= 2 ? 'Mild signs - have a glass of water now' : score <= 4 ? 'Moderate signs - hydrate steadily' : 'Strong signs - hydrate and rest; seek care if severe/confused'
}

export function coldOrFlu(feverOver38: boolean, bodyAches: boolean, chills: boolean, cough: boolean, soreThroat: boolean, sneezing: boolean, fatigue: boolean): string | null {
  void feverOver38
  if (!cough && !soreThroat && !sneezing && !bodyAches) return null
  const fluSigns = (bodyAches ? 1 : 0) + (chills ? 1 : 0) + (fatigue ? 1 : 0)
  if (fluSigns >= 2 && feverOver38) return 'Flu-like pattern is likely (sudden fever with aches)'
  if (fluSigns >= 2) return 'More flu-like than a common cold - rest and fluids'
  return 'Common-cold pattern is likely (nose/throat symptoms dominate)'
}

export function chestPainRedFlagCount(arms: boolean, sweating: boolean, nausea: boolean, mhCrushing: boolean, shortnessBreath: boolean): number | null {
  let count = 0
  if (arms) count += 1
  if (sweating) count += 1
  if (nausea) count += 1
  if (mhCrushing) count += 1
  if (shortnessBreath) count += 1
  if (count === 0) return null
  return count
}

export function chestPainBand(count: number | null): string {
  if (count === null) return 'No red-flag symptoms selected'
  return count === 1 ? 'One red-flag symptom - if chest pain is new/severe, seek urgent care' : count === 2 ? 'Multiple red flags - seek urgent medical review' : 'Several red flags - this warrants emergency care now'
}

export function utiLikelihoodScore(frequency: boolean, burning: boolean, urgency: boolean, pelvicPain: boolean, fever: boolean, backPain: boolean): number | null {
  let score = 0
  if (burning) score += 2
  if (frequency) score += 1
  if (urgency) score += 1
  if (pelvicPain) score += 1
  if (fever) score += 1
  if (backPain) score += 2
  if (score === 0) return null
  return score
}

export function utiBand(score: number | null): string {
  if (score === null) return 'No symptoms selected'
  return score <= 3 ? 'Mild pattern - increase fluids and monitor' : score <= 5 ? 'Possible UTI - see a clinician if symptoms persist' : 'Strong UTI signal (with back pain/fever) - seek care soon'
}

export function migraineScore(oneSided: boolean, throbbing: boolean, nausea: boolean, lightSensitive: boolean, visualAura: boolean): number | null {
  let score = 0
  if (oneSided) score += 1
  if (throbbing) score += 1
  if (nausea) score += 1
  if (lightSensitive) score += 1
  if (visualAura) score += 1
  if (score === 0) return null
  return score
}

export function migraineBand(score: number | null): string {
  if (score === null) return 'No migraine features selected'
  return score <= 2 ? 'Possible tension-type headache pattern' : score >= 3 ? 'Migrainous features likely - a clinician can confirm and plan triggers' : 'Mixed pattern - keep a headache diary'
}