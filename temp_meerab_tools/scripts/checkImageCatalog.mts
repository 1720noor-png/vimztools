import { tools, getToolById } from '../src/lib/catalog.ts'
import { LEGACY_IMAGE_TOOLS, IMAGE_TOOLS, imageSubcategories } from '../src/pages/image-tools/imageToolsConfig.ts'

const ids = new Set(tools.map((t) => t.id))
console.log('catalog total:', tools.length)
console.log('image portal new tools:', IMAGE_TOOLS.length)
console.log('all new tools present in catalog:', IMAGE_TOOLS.every((t) => ids.has(t.id)))
console.log('legacy 5 resolvable:', LEGACY_IMAGE_TOOLS.map((l) => `${l.id}=${Boolean(getToolById(l.id))}`).join(' '))
const imageCategoryTools = tools.filter((t) => t.categoryId === 'image-tools')
console.log('catalog image-tools categoryId count:', imageCategoryTools.length)
let missing = 0
for (const s of imageSubcategories) {
  const miss = s.toolIds.filter((id) => !getToolById(id))
  if (miss.length) { missing += miss.length; console.log('UNRESOLVED in', s.id, miss) }
}
console.log('unresolved folder entries:', missing)
console.log('students-academics still intact:', tools.filter((t) => t.categoryId === 'students-academics').length)
console.log('health still intact:', tools.filter((t) => t.categoryId === 'health').length)
