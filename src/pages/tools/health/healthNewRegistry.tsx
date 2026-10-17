import type { HealthToolConfig } from './HealthGenericTool'
import { bodyWeightGroup } from './registry/bodyWeightGroup'
import { lifestyleGroup } from './registry/lifestyleGroup'
import { womenSleepGroup } from './registry/womenSleepGroup'
import { clinicGroup } from './registry/clinicGroup'
import { respKidneyGroup } from './registry/respKidneyGroup'
import { dentalHairSymGroup } from './registry/dentalHairSymGroup'
import { extrasWeightGroup } from './registry/extrasWeightGroup'
import { extrasFitnessHeartGroup } from './registry/extrasFitnessHeartGroup'
import { extrasWomenSleepGroup } from './registry/extrasWomenSleepGroup'
import { extrasDiabetesMentalGroup } from './registry/extrasDiabetesMentalGroup'
import { extrasBabyMedGroup } from './registry/extrasBabyMedGroup'
import { extrasClinicalHealthGroup } from './registry/extrasClinicalHealthGroup'
import { extrasDentalBeautySymptomGroup } from './registry/extrasDentalBeautySymptomGroup'

export { default } from './HealthGenericTool'

export const allHealthToolConfigs: Record<string, HealthToolConfig> = {
  ...bodyWeightGroup,
  ...lifestyleGroup,
  ...womenSleepGroup,
  ...clinicGroup,
  ...respKidneyGroup,
  ...dentalHairSymGroup,
  ...extrasWeightGroup,
  ...extrasFitnessHeartGroup,
  ...extrasWomenSleepGroup,
  ...extrasDiabetesMentalGroup,
  ...extrasBabyMedGroup,
  ...extrasClinicalHealthGroup,
  ...extrasDentalBeautySymptomGroup,
}

export const healthNewConfigArray: HealthToolConfig[] = Object.values(allHealthToolConfigs)