import { imageSubcategories, LEGACY_IMAGE_TOOLS, IMAGE_TOOLS, IMAGE_PORTAL_PLACEMENT_COUNT, IMAGE_PORTAL_IDENTITY_COUNT, IMAGE_TOTAL_FOLDERS } from '../src/pages/image-tools/imageToolsConfig.ts'
import { imageToolSpecs, validateImageSpecCounts } from '../src/pages/image-tools/specs/index.ts'

const v = validateImageSpecCounts()
console.log('specs folders/ids/placements:', v.folders, imageToolSpecs.length, v.placements ?? '')
console.log('dupes:', v.duplicateIds.length, v.duplicatePlacements.length, 'copyComplete:', v.ok)
console.log('portal folders:', IMAGE_TOTAL_FOLDERS, 'identities:', IMAGE_PORTAL_IDENTITY_COUNT, 'placements:', IMAGE_PORTAL_PLACEMENT_COUNT)
const dupToolIds = IMAGE_TOOLS.map((t) => t.id).filter((id, i, a) => a.indexOf(id) !== i)
console.log('duplicate catalog ids:', dupToolIds)
const collisions = IMAGE_TOOLS.filter((t) => LEGACY_IMAGE_TOOLS.some((l) => l.id === t.id))
console.log('collisions with legacy:', collisions.map((t) => t.id))
let total = 0
for (const s of imageSubcategories) {
  const miss = s.toolIds.filter((id) => !imageToolSpecs.some((sp) => sp.id === id) && !LEGACY_IMAGE_TOOLS.some((l) => l.id === id))
  if (miss.length) console.log('MISSING in', s.id, miss)
  const dupes = s.toolIds.filter((id, i, a) => a.indexOf(id) !== i)
  if (dupes.length) console.log('DUP in', s.id, dupes)
  total += s.toolIds.length
  console.log(String(s.toolIds.length).padStart(3), s.id, '-', s.title)
}
console.log('sum of folder toolIds:', total)
