import { OFFICE_TOOLS } from '../officeConfig'
import type { OfficeToolSpec } from '../archetypes/spec'
import { specs as mod01 } from './mod01'
import { specs as mod02 } from './mod02'
import { specs as mod03 } from './mod03'
import { specs as mod04 } from './mod04'
import { specs as mod05 } from './mod05'
import { specs as mod06 } from './mod06'
import { specs as mod07 } from './mod07'
import { specs as mod08 } from './mod08'
import { specs as mod09 } from './mod09'
import { specs as mod10 } from './mod10'
import { specs as mod11 } from './mod11'
import { specs as mod12 } from './mod12'

export const officeSpecs: OfficeToolSpec[] = [
  ...mod01,
  ...mod02,
  ...mod03,
  ...mod04,
  ...mod05,
  ...mod06,
  ...mod07,
  ...mod08,
  ...mod09,
  ...mod10,
  ...mod11,
  ...mod12,
]

const specIndex = new Map<string, OfficeToolSpec>()

for (const spec of officeSpecs) {
  if (!specIndex.has(spec.id)) {
    specIndex.set(spec.id, spec)
  }
}

const registered = new Set(OFFICE_TOOLS.map((t) => t.id))

for (const spec of officeSpecs) {
  if (!registered.has(spec.id)) throw new Error(`Office spec has no registered tool: "${spec.id}"`)
}
for (const id of registered) {
  if (!specIndex.has(id)) throw new Error(`Registered office tool has no spec: "${id}"`)
}

export function getOfficeSpec(slug?: string): OfficeToolSpec | undefined {
  return slug ? specIndex.get(slug) : undefined
}