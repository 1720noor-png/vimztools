import { mod06 } from './mod06'
import { mod07 } from './mod07'
import { mod08 } from './mod08'
import { mod09 } from './mod09'
import { mod10 } from './mod10'
import { mod11 } from './mod11'
import { mod12 } from './mod12'
import { mod13 } from './mod13'
import { mod14 } from './mod14'
import { mod15 } from './mod15'
import { mod16 } from './mod16'
import { mod17 } from './mod17'
import { mod18 } from './mod18'
import { mod19 } from './mod19'
import { mod20 } from './mod20'
import { mod21 } from './mod21'
import { mod22 } from './mod22'
import { mod23 } from './mod23'
import type { MarketingSeoSpec } from './marketingSpec'

export const marketingSeoSpecs: MarketingSeoSpec[] = [
  ...mod06,
  ...mod07,
  ...mod08,
  ...mod09,
  ...mod10,
  ...mod11,
  ...mod12,
  ...mod13,
  ...mod14,
  ...mod15,
  ...mod16,
  ...mod17,
  ...mod18,
  ...mod19,
  ...mod20,
  ...mod21,
  ...mod22,
  ...mod23,
]

const seen = new Set<string>()
for (const s of marketingSeoSpecs) {
  if (seen.has(s.id)) {
    throw new Error(`Duplicate marketing SEO spec id: "${s.id}"`)
  }
  seen.add(s.id)
}

export function getMarketingSeoSpec(id: string): MarketingSeoSpec | undefined {
  return marketingSeoSpecs.find((s) => s.id === id)
}

export { marketingSeoSpecs as marketingSpecs }