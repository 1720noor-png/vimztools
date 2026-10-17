import fs from 'fs'
import { pdfSpecsData } from '../src/pages/pdf/specs/pdfSpecsData.ts'
import { PDF_SUBCATEGORIES, PDF_PRESERVED_IDS } from '../src/pages/pdf/pdfConfig.ts'

console.log('=== 1. SPEC INTEGRITY ===')
console.log('Total new PDF specs in pdfSpecsData.ts:', pdfSpecsData.length)
const specIds = pdfSpecsData.map((s) => s.id)
const uniqueSpecIds = new Set(specIds)
console.log('Unique new PDF spec IDs:', uniqueSpecIds.size)
if (uniqueSpecIds.size !== specIds.length) {
  console.error('ERROR: Duplicate spec IDs found!')
  process.exit(1)
} else {
  console.log(`SUCCESS: All ${pdfSpecsData.length} new PDF tool IDs are 100% unique.`)
}

console.log('\n=== 2. 23 SUBCATEGORIES INTEGRITY ===')
console.log('Total PDF subcategories in pdfConfig.ts:', PDF_SUBCATEGORIES.length)
if (PDF_SUBCATEGORIES.length === 23) {
  console.log('SUCCESS: Exactly 23 subcategories registered.')
} else {
  console.error('ERROR: Subcategory count is', PDF_SUBCATEGORIES.length)
  process.exit(1)
}

const catalogContent = fs.readFileSync('src/lib/catalog.ts', 'utf8')
if (catalogContent.includes('PDF_SUBCATEGORIES.map((s) => s.title)')) {
  console.log('SUCCESS: catalog.ts PDF category references all 23 PDF_SUBCATEGORIES.')
} else {
  console.error('ERROR: catalog.ts does not reference PDF_SUBCATEGORIES.')
  process.exit(1)
}

console.log('\n=== 3. 18 PRESERVED TOOLS INTEGRITY ===')
console.log('Preserved IDs count:', PDF_PRESERVED_IDS.length)
const collisions = specIds.filter((id) => PDF_PRESERVED_IDS.includes(id))
if (collisions.length > 0) {
  console.error('ERROR: Collisions detected:', collisions)
  process.exit(1)
} else {
  console.log('SUCCESS: 0 collisions with preserved tools.')
}

const dynamicContent = fs.readFileSync('src/pages/DynamicToolPage.tsx', 'utf8')
for (const id of PDF_PRESERVED_IDS) {
  if (!dynamicContent.includes(`'${id}':`)) {
    console.error(`ERROR: Preserved tool ${id} not found in DynamicToolPage`)
    process.exit(1)
  }
}
console.log('SUCCESS: All 18 preserved tools are registered in DynamicToolPage.')

console.log('\n=== 4. TOTAL TOOLS & FOLDER PLACEMENTS ===')
let totalMappedInSubcategories = 0
const seenInFolders = new Map<string, string>()
const multiFolderDuplicates: string[] = []

for (const sc of PDF_SUBCATEGORIES) {
  totalMappedInSubcategories += sc.toolIds.length
  for (const tid of sc.toolIds) {
    if (seenInFolders.has(tid)) {
      multiFolderDuplicates.push(`${tid} in both ${seenInFolders.get(tid)} and ${sc.id}`)
    } else {
      seenInFolders.set(tid, sc.id)
    }
  }
}
console.log('Total tools mapped across 23 subcategories:', totalMappedInSubcategories)
console.log('Unique tools mapped in folders:', seenInFolders.size)
if (multiFolderDuplicates.length > 0) {
  console.error('ERROR: Multi-folder duplicates found:', multiFolderDuplicates)
  process.exit(1)
} else {
  console.log('SUCCESS: 0 multi-folder duplicates! Exact 1:1 mapping across all 23 subcategories.')
}

const expectedTotal = pdfSpecsData.length + PDF_PRESERVED_IDS.length
if (totalMappedInSubcategories === expectedTotal && seenInFolders.size === expectedTotal) {
  console.log(`SUCCESS: Exact ${expectedTotal} tools mapped with 0 duplicate placements!`)
} else {
  console.warn(`NOTE: Count mismatch: mapped=${totalMappedInSubcategories}, expected=${expectedTotal}`)
  process.exit(1)
}

if (catalogContent.includes('...PDF_NEW_TOOLS')) {
  console.log('SUCCESS: catalog.ts spreads ...PDF_NEW_TOOLS into main tools array.')
} else {
  console.error('ERROR: catalog.ts does not spread ...PDF_NEW_TOOLS')
  process.exit(1)
}

console.log('\n🎉 ALL ARCHITECTURAL TESTS PASSED SUCCESSFULLY! 🎉')
