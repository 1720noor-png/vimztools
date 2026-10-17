import { clamp, safeDiv } from './guard.ts'

export function sofaScore(values: number[]): { total: number; band: string } | null {
  if (!Array.isArray(values) || values.length !== 6) return null
  if (values.some((v) => v < 0 || v > 4)) return null
  const total = values.reduce((a, b) => a + b, 0)
  const band = total < 2 ? 'Low suspicion of organ failure' : total <= 3 ? 'Moderate - watch closely' : 'High - escalation usually needed'
  return { total, band }
}

export function apache2Simplified(age: number, chronicHealth: boolean, gcs: number, hr: number, map: number, tempC: number): number | null {
  if (age < 16 || age > 100 || gcs < 3 || gcs > 15 || hr < 20 || hr > 300 || map < 20 || map > 250 || tempC < 30 || tempC > 45) return null
  const agePts = age <= 44 ? 0 : age <= 54 ? 2 : age <= 64 ? 3 : age <= 74 ? 5 : 6
  const chronic = chronicHealth ? 5 : 0
  const hrPts = Math.floor(clamp(Math.abs(hr - 100) / 20, 0, 4))
  const mapPts = Math.floor(clamp(Math.abs(map - 90) / 15, 0, 4))
  const tempPts = Math.floor(clamp(Math.abs(tempC - 37) / 1.5, 0, 4))
  const total = agePts + chronic + (15 - gcs) + hrPts + mapPts + tempPts
  return total
}

export function serumOsmolality(na: number, glucose: number, bun: number): { osm: number; band: string } | null {
  if (na < 100 || na > 180 || glucose < 20 || glucose > 1200 || bun < 1 || bun > 300) return null
  const osm = Math.round(2 * na + glucose / 18 + bun / 2.8)
  const band = osm < 275 ? 'Low osmolality' : osm <= 295 ? 'Typical range' : 'High osmolality'
  return { osm, band }
}

export function rdwBand(rdwPct: number): string | null {
  if (rdwPct < 10 || rdwPct > 30) return null
  return rdwPct <= 14.5 ? 'Typical variation (11.5-14.5%)' : 'High variation - often linked to nutrition deficiency work-ups'
}

export function nlrRatio(anc: number, alc: number): { ratio: number; band: string } | null {
  if (anc < 0.1 || anc > 100 || alc <= 0 || alc > 200) return null
  const ratio = Math.round((anc / alc) * 10) / 10
  const band = ratio < 2 ? 'Low (usual stress signal)' : ratio <= 3 ? 'Mid-normal' : ratio <= 5 ? 'Elevated' : 'High - worth clinical interpretation'
  return { ratio, band }
}

export function agrRatio(albuminGdl: number, totalProteinGdl: number): { ratio: number; band: string } | null {
  if (albuminGdl < 1 || albuminGdl > 6 || totalProteinGdl < 3 || totalProteinGdl > 12 || totalProteinGdl <= albuminGdl) return null
  const globulin = totalProteinGdl - albuminGdl
  const ratio = Math.round((albuminGdl / globulin) * 100) / 100
  const band = ratio >= 1 && ratio <= 2.5 ? 'Typical range' : ratio < 1 ? 'Reversed - globulins dominate' : 'High relative albumin fraction'
  return { ratio, band }
}

export { clamp, safeDiv }