import type { DevCloudSpec } from './devCloudSpec'
import { MOD01_SPECS } from './mod01'
import { MOD02_SPECS } from './mod02'
import { MOD03_SPECS } from './mod03'
import { MOD04_SPECS } from './mod04'
import { MOD05_SPECS } from './mod05'
import { MOD06_SPECS } from './mod06'
import { MOD07_SPECS } from './mod07'
import { MOD08_SPECS } from './mod08'
import { MOD09_SPECS } from './mod09'
import { MOD10_SPECS } from './mod10'
import { MOD11_SPECS } from './mod11'
import { MOD12_SPECS } from './mod12'
import { MOD13_SPECS } from './mod13'
import { MOD14_SPECS } from './mod14'
import { MOD15_SPECS } from './mod15'
import { MOD16_SPECS } from './mod16'
import { MOD17_SPECS } from './mod17'
import { MOD18_SPECS } from './mod18'
import { MOD19_SPECS } from './mod19'
import { MOD20_SPECS } from './mod20'

export const devCloudSpecs: DevCloudSpec[] = [
  ...MOD01_SPECS,
  ...MOD02_SPECS,
  ...MOD03_SPECS,
  ...MOD04_SPECS,
  ...MOD05_SPECS,
  ...MOD06_SPECS,
  ...MOD07_SPECS,
  ...MOD08_SPECS,
  ...MOD09_SPECS,
  ...MOD10_SPECS,
  ...MOD11_SPECS,
  ...MOD12_SPECS,
  ...MOD13_SPECS,
  ...MOD14_SPECS,
  ...MOD15_SPECS,
  ...MOD16_SPECS,
  ...MOD17_SPECS,
  ...MOD18_SPECS,
  ...MOD19_SPECS,
  ...MOD20_SPECS,
]

export const devCloudSpecMap: Record<string, DevCloudSpec> = {}
for (const spec of devCloudSpecs) {
  devCloudSpecMap[spec.id] = spec
}

export function getDevCloudSpec(id: string): DevCloudSpec | undefined {
  return devCloudSpecMap[id]
}

export * from './devCloudSpec'
