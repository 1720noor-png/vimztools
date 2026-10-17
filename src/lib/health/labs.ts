import { fin } from './guard.ts'

export function anionGap(sodiumMgEqL: number, chlorideMgEqL: number, bicarbonateMgEqL: number): number | null {
  const na = fin(sodiumMgEqL)
  const cl = fin(chlorideMgEqL)
  const hco3 = fin(bicarbonateMgEqL)
  if (na === null || cl === null || hco3 === null || na <= 0 || cl <= 0 || hco3 <= 0) return null
  return Math.round((na - (cl + hco3)) * 10) / 10
}

export function correctedCalcium(calciumMgDl: number, albuminGdl: number): number | null {
  const ca = fin(calciumMgDl)
  const alb = fin(albuminGdl)
  if (ca === null || alb === null || ca <= 0 || alb <= 0) return null
  return Math.round((ca + 0.8 * (4 - alb)) * 10) / 10
}

export function correctedSodium(sodiumMgEqL: number, glucoseMgDl: number): number | null {
  const na = fin(sodiumMgEqL)
  const g = fin(glucoseMgDl)
  if (na === null || g === null || na <= 0 || g <= 0) return null
  return Math.round((na + 0.024 * (g - 100)) * 10) / 10
}

export function bunCreatinineRatio(bloodUreaNitrogenMgDl: number, creatinineMgDl: number): number | null {
  const bun = fin(bloodUreaNitrogenMgDl)
  const cr = fin(creatinineMgDl)
  if (bun === null || cr === null || bun <= 0 || cr <= 0) return null
  return Math.round((bun / cr) * 10) / 10
}

export function absoluteNeutrophilCount(wbcThousandPerUl: number, neutrophilPct: number): number | null {
  const w = fin(wbcThousandPerUl)
  const p = fin(neutrophilPct)
  if (w === null || p === null || w <= 0 || p < 0 || p > 100) return null
  return Math.round((w * 1000 * (p / 100)) * 10) / 10
}

export function absoluteLymphocyteCount(wbcThousandPerUl: number, lymphocytePct: number): number | null {
  const w = fin(wbcThousandPerUl)
  const p = fin(lymphocytePct)
  if (w === null || p === null || w <= 0 || p < 0 || p > 100) return null
  return Math.round((w * 1000 * (p / 100)) * 10) / 10
}

export function glucoseMmolToMg(mmolPerL: number): number | null {
  const v = fin(mmolPerL)
  if (v === null || v <= 0) return null
  return Math.round(v * 18.0155 * 10) / 10
}

export function glucoseMgToMmol(mgDl: number): number | null {
  const v = fin(mgDl)
  if (v === null || v <= 0) return null
  return Math.round((v / 18.0155) * 100) / 100
}

export function cholesterolMmolToMg(mmolPerL: number): number | null {
  const v = fin(mmolPerL)
  if (v === null || v <= 0) return null
  return Math.round(v * 38.67)
}

export function cholesterolMgToMmol(mgDl: number): number | null {
  const v = fin(mgDl)
  if (v === null || v <= 0) return null
  return Math.round((v / 38.67) * 100) / 100
}

export function hbgdlToGperL(gPerDl: number): number | null {
  const v = fin(gPerDl)
  if (v === null || v <= 0) return null
  return Math.round(v * 10)
}

export function hbGperLtoGdl(gPerL: number): number | null {
  const v = fin(gPerL)
  if (v === null || v <= 0) return null
  return Math.round((v / 10) * 10) / 10
}