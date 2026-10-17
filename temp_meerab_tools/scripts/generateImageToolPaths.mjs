import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const root = path.resolve(__dirname, '..')

// Read specs index to get all tools
import { imageToolSpecs, placementsOf } from '../src/pages/image-tools/specs/index.ts'
import { LEGACY_IMAGE_TOOLS, SUBCATEGORY_SLUG_MAP } from '../src/pages/image-tools/imageToolsConfig.ts'

const reverseAliasMap = {}
for (const [alias, canonical] of Object.entries(SUBCATEGORY_SLUG_MAP)) {
  reverseAliasMap[canonical] = alias
}

const allPlacements = []

// Add specs
for (const spec of imageToolSpecs) {
  const subs = placementsOf(spec)
  for (const s of subs) {
    allPlacements.push({ sub: s, tool: spec.id })
    // If there is an alias for this subcategory, add that placement too
    if (SUBCATEGORY_SLUG_MAP[s]) {
      allPlacements.push({ sub: SUBCATEGORY_SLUG_MAP[s], tool: spec.id })
    }
    if (reverseAliasMap[s]) {
      allPlacements.push({ sub: reverseAliasMap[s], tool: spec.id })
    }
  }
}

// Add legacy tools
for (const leg of LEGACY_IMAGE_TOOLS) {
  allPlacements.push({ sub: leg.sub, tool: leg.id })
  if (SUBCATEGORY_SLUG_MAP[leg.sub]) {
    allPlacements.push({ sub: SUBCATEGORY_SLUG_MAP[leg.sub], tool: leg.id })
  }
  if (reverseAliasMap[leg.sub]) {
    allPlacements.push({ sub: reverseAliasMap[leg.sub], tool: leg.id })
  }
}

// Deduplicate
const uniquePlacements = []
const seen = new Set()
for (const p of allPlacements) {
  const key = `${p.sub}:::${p.tool}`
  if (!seen.has(key)) {
    seen.add(key)
    uniquePlacements.push(p)
  }
}

console.log(`Generating paths for ${uniquePlacements.length} unique sub/tool pairs...`)

let pageCount = 0
let compCount = 0

for (const { sub, tool } of uniquePlacements) {
  // 1. /src/pages/image-tools/[subcategory]/[tool-slug]/page.tsx
  const pageDir = path.join(root, 'src', 'pages', 'image-tools', sub, tool)
  fs.mkdirSync(pageDir, { recursive: true })
  const pageFile = path.join(pageDir, 'page.tsx')
  const pageContent = `import ImageToolPage from '../../../tools/image/ImageToolPage'

export default function Page() {
  return <ImageToolPage subcategory="${sub}" tool="${tool}" />
}
`
  fs.writeFileSync(pageFile, pageContent, 'utf8')
  pageCount++

  // 2. /src/components/image-tools/[subcategory]/[tool-slug]/index.tsx
  const compDir = path.join(root, 'src', 'components', 'image-tools', sub, tool)
  fs.mkdirSync(compDir, { recursive: true })
  const compFile = path.join(compDir, 'index.tsx')
  const compContent = `import ImageToolPage from '../../../../pages/tools/image/ImageToolPage'

export function ToolView() {
  return <ImageToolPage subcategory="${sub}" tool="${tool}" />
}

export default ToolView
`
  fs.writeFileSync(compFile, compContent, 'utf8')
  compCount++
}

console.log(`Successfully generated ${pageCount} pages and ${compCount} components!`)
