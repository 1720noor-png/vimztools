import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')

// 1. Literal tools in catalog.ts
const catalogContent = fs.readFileSync(path.join(root, 'src/lib/catalog.ts'), 'utf8')
const toolsStart = catalogContent.indexOf('export const tools: Tool[] = [')
const toolsSection = catalogContent.slice(toolsStart)
const literalMatches = toolsSection.match(/id:\s*'([a-z0-9-]+)'/g)
const literalCount = literalMatches ? literalMatches.length : 0

// 2. Office tools
let officeCount = 0
for (let i = 1; i <= 30; i++) {
  const modNum = String(i).padStart(2, '0')
  const p = path.join(root, `src/pages/office/specs/mod${modNum}.ts`)
  if (fs.existsSync(p)) {
    const c = fs.readFileSync(p, 'utf8')
    const m = c.match(/id:\s*'([a-z0-9-]+)'/g)
    if (m) officeCount += m.length
  }
}

// 3. Health curated tools
const healthHomeContent = fs.readFileSync(path.join(root, 'src/pages/health/healthConfig.ts'), 'utf8')
const healthCuratedMatches = healthHomeContent.match(/id:\s*'([a-z0-9-]+)'/g) || []

// 4. Health new config tools
let healthNewCount = 0
const healthRegistryDir = path.join(root, 'src/pages/tools/health/registry')
for (const file of fs.readdirSync(healthRegistryDir)) {
  if (file.endsWith('.tsx') || file.endsWith('.ts')) {
    const c = fs.readFileSync(path.join(healthRegistryDir, file), 'utf8')
    const m = c.match(/id:\s*'([a-z0-9-]+)'/g)
    if (m) healthNewCount += m.length
  }
}

// 5. Marketers & SEO tools
let seoCount = 0
for (let i = 6; i <= 23; i++) {
  const modNum = String(i).padStart(2, '0')
  const p = path.join(root, `src/pages/marketing/specs/mod${modNum}.ts`)
  if (fs.existsSync(p)) {
    const c = fs.readFileSync(p, 'utf8')
    const m = c.match(/id:\s*'([a-z0-9-]+)'/g)
    if (m) seoCount += m.length
  }
}

// 6. Student Academics tools
let academicsCount = 0
for (let i = 1; i <= 20; i++) {
  const modNum = String(i).padStart(2, '0')
  const p = path.join(root, `src/pages/students/specs/mod${modNum}.ts`)
  if (fs.existsSync(p)) {
    const c = fs.readFileSync(p, 'utf8')
    const m = c.match(/id:\s*'([a-z0-9-]+)'/g)
    if (m) academicsCount += m.length
  }
}

// 7. Image Tools
import { imageToolSpecs } from '../src/pages/image-tools/specs/index.ts'
import { IMAGE_TOOLS } from '../src/pages/image-tools/imageToolsConfig.ts'
import { PDF_NEW_TOOLS } from '../src/pages/pdf/pdfConfig.ts'
import { HOUSEHOLD_TOOLS } from '../src/pages/household/householdConfig.ts'

console.log('Literal base tools:', literalCount)
console.log('Office tools (30 modules):', officeCount)
console.log('Health Curated tools:', healthCuratedMatches.length)
console.log('Health New Config tools:', healthNewCount)
console.log('Marketers & SEO tools (mod06-mod23):', seoCount)
console.log('Students & Academics tools (mod01-mod20):', academicsCount)
console.log('Image Tools new in catalog:', IMAGE_TOOLS.length)
console.log('Image Tools total identities (specs):', imageToolSpecs.length)
console.log('Household Tools:', HOUSEHOLD_TOOLS.length)
console.log('PDF Utilities New Config tools:', PDF_NEW_TOOLS.length)
console.log('TOTAL CATALOG TOOLS:', literalCount + officeCount + healthCuratedMatches.length + healthNewCount + seoCount + academicsCount + IMAGE_TOOLS.length + HOUSEHOLD_TOOLS.length + PDF_NEW_TOOLS.length)

