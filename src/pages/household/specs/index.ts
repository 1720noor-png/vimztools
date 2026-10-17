import { type HouseholdSpec } from './householdSpec'
import { cleaningSpecs } from './mod01_cleaning'
import { laundrySpecs } from './mod02_laundry'
import { kitchenSpecs } from './mod03_kitchen'
import { grocerySpecs } from './mod04_grocery'
import { budgetSpecs } from './mod05_budget'
import { electricitySpecs } from './mod06_electricity'
import { utilitiesSpecs } from './mod07_utilities'
import { homePlanningSpecs } from './mod08_homePlanning'
import { diySpecs } from './mod09_diy'
import { maintenanceSpecs } from './mod10_maintenance'
import { gardeningSpecs } from './mod11_gardening'
import { petsSpecs } from './mod12_pets'
import { familySpecs } from './mod13_family'
import { movingSpecs } from './mod14_moving'
import { safetySpecs } from './mod15_safety'

export { type HouseholdSpec } from './householdSpec'

export const householdSpecs: HouseholdSpec[] = [
  ...cleaningSpecs,
  ...laundrySpecs,
  ...kitchenSpecs,
  ...grocerySpecs,
  ...budgetSpecs,
  ...electricitySpecs,
  ...utilitiesSpecs,
  ...homePlanningSpecs,
  ...diySpecs,
  ...maintenanceSpecs,
  ...gardeningSpecs,
  ...petsSpecs,
  ...familySpecs,
  ...movingSpecs,
  ...safetySpecs,
]

const specMap = new Map<string, HouseholdSpec>()
for (const spec of householdSpecs) {
  specMap.set(spec.id, spec)
}

export function getHouseholdSpec(id: string): HouseholdSpec | undefined {
  return specMap.get(id)
}

export const householdSpecsCount = householdSpecs.length
