import { mod01 } from './mod01'
import { mod02 } from './mod02'
import { mod03 } from './mod03'
import { mod04 } from './mod04'
import { mod05 } from './mod05'
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
import type { StudentSpec } from './studentSpec'

export const studentSpecs: StudentSpec[] = [
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
  ...mod13,
  ...mod14,
  ...mod15,
  ...mod16,
  ...mod17,
  ...mod18,
  ...mod19,
  ...mod20,
]

const byId = new Map(studentSpecs.map((s) => [s.id, s]))

export function getStudentSpec(id: string): StudentSpec | undefined {
  return byId.get(id)
}

export { studentSpecs as academicsSpecs }
