import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')

// 1. Config and spec checks
import {
  imageSubcategories,
  getImageSubcategory,
  normalizeSubcategorySlug,
  LEGACY_IMAGE_TOOLS,
  SUBCATEGORY_SLUG_MAP,
} from '../src/pages/image-tools/imageToolsConfig.ts'
import {
  imageToolSpecs,
  getImageToolSpec,
  validateImageSpecCounts,
} from '../src/pages/image-tools/specs/index.ts'
import { runSpec } from '../src/pages/image-tools/engine/run.ts'
import { CanvasEngine } from '../src/components/image-tools/common/CanvasWorker.ts'

console.log('=== PRE-FLIGHT VERIFICATION MATRIX ===\n')

// STEP 1: Subcategory Route Registry & Manifest Check
console.log('STEP 1: Verifying Subcategory Route Registry (20 Folders)...')
const targetSubcategories = [
  'id-passport',
  'crop-resize',
  'compression',
  'format-conversion',
  'background-cutout',
  'watermark-protection',
  'editing-enhancement',
  'face-portrait',
  'social-media',
  'ecommerce-product',
  'photo-collage',
  'image-to-document',
  'ocr-text',
  'ai-tools',
  'metadata-exif',
  'color-design',
  'qr-barcode',
  'batch-processing',
  'print-layout',
  'icons-logos',
]

for (const subSlug of targetSubcategories) {
  const resolved = getImageSubcategory(subSlug)
  assert.ok(resolved, `Subcategory "${subSlug}" failed to resolve in getImageSubcategory!`)
  assert.ok(resolved.toolIds.length > 0, `Subcategory "${subSlug}" has 0 mapped tools!`)
  console.log(`  ✓ Subcategory /image-tools/${subSlug} -> "${resolved.title}" (${resolved.toolIds.length} tools)`)
}
console.log('Subcategories verified: 20/20 OK.\n')

// STEP 2: Preserved Assets Check
console.log('STEP 2: Verifying Preserved Assets [Passport Photo, Resizer, Format Converter, BG Remover, Watermark]...')
const preservedIds = ['passport-photo', 'image-resizer', 'format-converter', 'background-remover', 'watermark']
for (const legId of preservedIds) {
  const found = LEGACY_IMAGE_TOOLS.find((l) => l.id === legId)
  assert.ok(found, `Legacy tool "${legId}" not found in LEGACY_IMAGE_TOOLS!`)
  console.log(`  ✓ Preserved asset "${legId}" mapped to subcategory "${found.sub}"`)
}
console.log('Preserved assets verified: 5/5 OK.\n')

// STEP 3: Isolated Paths Topology Check
console.log('STEP 3: Verifying Architecture & Folder Topology (/src/pages/image-tools & /src/components/image-tools)...')
let checkedPages = 0
let checkedComponents = 0
for (const sub of targetSubcategories) {
  const resolved = getImageSubcategory(sub)
  for (const toolId of resolved.toolIds) {
    const pagePath = path.join(root, 'src', 'pages', 'image-tools', sub, toolId, 'page.tsx')
    const compPath = path.join(root, 'src', 'components', 'image-tools', sub, toolId, 'index.tsx')
    assert.ok(fs.existsSync(pagePath), `Missing isolated page at ${pagePath}`)
    assert.ok(fs.existsSync(compPath), `Missing isolated component at ${compPath}`)
    checkedPages++
    checkedComponents++
  }
}
console.log(`  ✓ Verified ${checkedPages} page.tsx files and ${checkedComponents} component index.tsx files across all 20 folders.`)
console.log('Topology verified: OK.\n')

// STEP 4: Common Scaffolding Components Check
console.log('STEP 4: Verifying Unified Component Scaffolding...')
const commonFiles = [
  'ToolCardWrapper.tsx',
  'DropZone.tsx',
  'CanvasWorker.ts',
  'CompareSlider.tsx',
  'CanvasWorkspace.tsx',
  'Exporter.tsx',
  'ProTipBox.tsx',
  'index.ts',
]
for (const cf of commonFiles) {
  const filePath = path.join(root, 'src', 'components', 'image-tools', 'common', cf)
  assert.ok(fs.existsSync(filePath), `Missing common component file: ${filePath}`)
  console.log(`  ✓ Component src/components/image-tools/common/${cf} exists`)
}
console.log('Scaffolding verified: 8/8 OK.\n')

// STEP 5: Canvas Lifecycle & Memory Management
console.log('STEP 5: Verifying Canvas Lifecycle & Memory Management...')
const mockCanvas = {
  width: 800,
  height: 600,
  getContext: () => ({
    clearRect: () => {},
  }),
}
CanvasEngine.releaseCanvas(mockCanvas)
assert.equal(mockCanvas.width, 0, 'Canvas width was not released to 0')
assert.equal(mockCanvas.height, 0, 'Canvas height was not released to 0')
console.log('  ✓ Canvas buffer explicit release: canvas.width=0, canvas.height=0')

// STEP 6: Export Validation & MIME Streams
console.log('\nSTEP 6: Verifying Export Validation & Output File Streams...')
// Create synthetic test input to run a spec (e.g. 2x2 photo maker or qr code generator)
const qrSpec = getImageToolSpec('image-qr-code-generator')
assert.ok(qrSpec, 'image-qr-code-generator spec exists')

const runResult = await runSpec({
  spec: qrSpec,
  values: { text: 'https://vimz.ai', size: '256', ec: 'M', fg: '#000000', bg: '#ffffff', fmt: 'png' },
  images: [],
})

assert.ok(runResult.files.length > 0, 'Expected output files from qr generator')
const out = runResult.files[0]
assert.ok(out.name.endsWith('.png'), `Output file name "${out.name}" must end with .png`)
assert.equal(out.blob.type, 'image/png', `Output file blob MIME "${out.blob.type}" must be image/png`)
assert.ok(out.blob.size > 0, `Output blob size ${out.blob.size} must be greater than 0`)
console.log(`  ✓ Generator produced valid ${out.name} (${out.blob.size} bytes, ${out.blob.type})`)

// Test ICO conversion spec
const icoSpec = getImageToolSpec('ico-converter')
assert.ok(icoSpec, 'ico-converter spec exists')

console.log('\n=========================================')
console.log('ALL PRE-FLIGHT VERIFICATION CHECKS PASSED!')
console.log('=========================================\n')
