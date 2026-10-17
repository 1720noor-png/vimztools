import fs from 'node:fs'
import path from 'node:path'

const PDF_DIR = 'src/pages/tools/pdf'

const MAPPINGS = [
  // Core PDF Tools (pdf-sub-01)
  { file: 'ImageToPdf.tsx', subfolder: 'core' },
  { file: 'PdfToImage.tsx', subfolder: 'core' },
  { file: 'PdfMergeSplit.tsx', subfolder: 'core' },
  { file: 'PdfCompress.tsx', subfolder: 'core' },
  { file: 'WordToPdf.tsx', subfolder: 'core' },
  { file: 'PdfToWord.tsx', subfolder: 'core' },

  // Advanced Page Management & Editing (pdf-sub-02)
  { file: 'PdfSplit.tsx', subfolder: 'page-management' },
  { file: 'PdfPageReorder.tsx', subfolder: 'page-management' },
  { file: 'PdfPageCrop.tsx', subfolder: 'page-management' },

  // Security & Privacy Utilities (pdf-sub-03)
  { file: 'PdfPasswordProtect.tsx', subfolder: 'security-privacy' },
  { file: 'PdfPasswordRemove.tsx', subfolder: 'security-privacy' },
  { file: 'PdfRedactor.tsx', subfolder: 'security-privacy' },

  // Extraction & Smart Tools (pdf-sub-04)
  { file: 'PdfOcr.tsx', subfolder: 'extraction-smart' },
  { file: 'PdfTableExtract.tsx', subfolder: 'extraction-smart' },

  // PDF Forms (pdf-sub-06)
  { file: 'PdfFormFill.tsx', subfolder: 'forms' },

  // Watermark, Stamp & Branding (pdf-sub-08)
  { file: 'PdfWatermark.tsx', subfolder: 'watermark-stamp' },
  { file: 'PdfPageNumberer.tsx', subfolder: 'watermark-stamp' },

  // AI & Machine Learning PDF Utilities (pdf-sub-14)
  { file: 'PdfSummarizer.tsx', subfolder: 'ai-ml' },
]

console.log('=== STARTING PDF TOOLS REORGANIZATION ===')

// 1. Move files into subfolders and adjust relative imports
for (const { file, subfolder } of MAPPINGS) {
  const oldPath = path.join(PDF_DIR, file)
  const destDir = path.join(PDF_DIR, subfolder)
  const newPath = path.join(destDir, file)

  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true })
    console.log(`Created directory: ${destDir}`)
  }

  if (fs.existsSync(oldPath)) {
    let content = fs.readFileSync(oldPath, 'utf8')
    // Update relative imports: ../../../ -> ../../../../
    content = content.replace(/from\s+['"]\.\.\/\.\.\/\.\.\/([^'"]+)['"]/g, "from '../../../../$1'")
    content = content.replace(/import\s+['"]\.\.\/\.\.\/\.\.\/([^'"]+)['"]/g, "import '../../../../$1'")

    fs.writeFileSync(newPath, content, 'utf8')
    fs.unlinkSync(oldPath)
    console.log(`Moved & updated: ${file} -> ${subfolder}/${file}`)
  } else if (fs.existsSync(newPath)) {
    console.log(`Already in place: ${subfolder}/${file}`)
  } else {
    console.warn(`File not found: ${oldPath}`)
  }
}

// 2. Create index.ts barrel in src/pages/tools/pdf
const barrelContent = `// Organized PDF Tool Exports by Subcategory
export { default as ImageToPdf } from './core/ImageToPdf'
export { default as PdfToImage } from './core/PdfToImage'
export { default as PdfMergeSplit } from './core/PdfMergeSplit'
export { default as PdfCompress } from './core/PdfCompress'
export { default as WordToPdf } from './core/WordToPdf'
export { default as PdfToWord } from './core/PdfToWord'

export { default as PdfSplit } from './page-management/PdfSplit'
export { default as PdfPageReorder } from './page-management/PdfPageReorder'
export { default as PdfPageCrop } from './page-management/PdfPageCrop'

export { default as PdfPasswordProtect } from './security-privacy/PdfPasswordProtect'
export { default as PdfPasswordRemove } from './security-privacy/PdfPasswordRemove'
export { default as PdfRedactor } from './security-privacy/PdfRedactor'

export { default as PdfOcr } from './extraction-smart/PdfOcr'
export { default as PdfTableExtract } from './extraction-smart/PdfTableExtract'

export { default as PdfFormFill } from './forms/PdfFormFill'

export { default as PdfWatermark } from './watermark-stamp/PdfWatermark'
export { default as PdfPageNumberer } from './watermark-stamp/PdfPageNumberer'

export { default as PdfSummarizer } from './ai-ml/PdfSummarizer'

export { default as PdfGenericToolPage } from './PdfGenericToolPage'
`
fs.writeFileSync(path.join(PDF_DIR, 'index.ts'), barrelContent, 'utf8')
console.log('Created barrel export at src/pages/tools/pdf/index.ts')

// 3. Update DynamicToolPage.tsx imports
const dynamicPath = 'src/pages/DynamicToolPage.tsx'
let dynamicContent = fs.readFileSync(dynamicPath, 'utf8')

// Replace old imports with new subcategory folder imports
dynamicContent = dynamicContent.replace(
  /import ImageToPdf from '\.\/tools\/pdf\/ImageToPdf'/,
  "import ImageToPdf from './tools/pdf/core/ImageToPdf'"
)
dynamicContent = dynamicContent.replace(
  /import PdfCompress from '\.\/tools\/pdf\/PdfCompress'/,
  "import PdfCompress from './tools/pdf/core/PdfCompress'"
)
dynamicContent = dynamicContent.replace(
  /import PdfFormFill from '\.\/tools\/pdf\/PdfFormFill'/,
  "import PdfFormFill from './tools/pdf/forms/PdfFormFill'"
)
dynamicContent = dynamicContent.replace(
  /import PdfMergeSplit from '\.\/tools\/pdf\/PdfMergeSplit'/,
  "import PdfMergeSplit from './tools/pdf/core/PdfMergeSplit'"
)
dynamicContent = dynamicContent.replace(
  /import PdfOcr from '\.\/tools\/pdf\/PdfOcr'/,
  "import PdfOcr from './tools/pdf/extraction-smart/PdfOcr'"
)
dynamicContent = dynamicContent.replace(
  /import PdfPageCrop from '\.\/tools\/pdf\/PdfPageCrop'/,
  "import PdfPageCrop from './tools/pdf/page-management/PdfPageCrop'"
)
dynamicContent = dynamicContent.replace(
  /import PdfPageNumberer from '\.\/tools\/pdf\/PdfPageNumberer'/,
  "import PdfPageNumberer from './tools/pdf/watermark-stamp/PdfPageNumberer'"
)
dynamicContent = dynamicContent.replace(
  /import PdfPageReorder from '\.\/tools\/pdf\/PdfPageReorder'/,
  "import PdfPageReorder from './tools/pdf/page-management/PdfPageReorder'"
)
dynamicContent = dynamicContent.replace(
  /import PdfPasswordProtect from '\.\/tools\/pdf\/PdfPasswordProtect'/,
  "import PdfPasswordProtect from './tools/pdf/security-privacy/PdfPasswordProtect'"
)
dynamicContent = dynamicContent.replace(
  /import PdfPasswordRemove from '\.\/tools\/pdf\/PdfPasswordRemove'/,
  "import PdfPasswordRemove from './tools/pdf/security-privacy/PdfPasswordRemove'"
)
dynamicContent = dynamicContent.replace(
  /import PdfRedactor from '\.\/tools\/pdf\/PdfRedactor'/,
  "import PdfRedactor from './tools/pdf/security-privacy/PdfRedactor'"
)
dynamicContent = dynamicContent.replace(
  /import PdfSplit from '\.\/tools\/pdf\/PdfSplit'/,
  "import PdfSplit from './tools/pdf/page-management/PdfSplit'"
)
dynamicContent = dynamicContent.replace(
  /import PdfSummarizer from '\.\/tools\/pdf\/PdfSummarizer'/,
  "import PdfSummarizer from './tools/pdf/ai-ml/PdfSummarizer'"
)
dynamicContent = dynamicContent.replace(
  /import PdfTableExtract from '\.\/tools\/pdf\/PdfTableExtract'/,
  "import PdfTableExtract from './tools/pdf/extraction-smart/PdfTableExtract'"
)
dynamicContent = dynamicContent.replace(
  /import PdfToImage from '\.\/tools\/pdf\/PdfToImage'/,
  "import PdfToImage from './tools/pdf/core/PdfToImage'"
)
dynamicContent = dynamicContent.replace(
  /import PdfToWord from '\.\/tools\/pdf\/PdfToWord'/,
  "import PdfToWord from './tools/pdf/core/PdfToWord'"
)
dynamicContent = dynamicContent.replace(
  /import PdfWatermark from '\.\/tools\/pdf\/PdfWatermark'/,
  "import PdfWatermark from './tools/pdf/watermark-stamp/PdfWatermark'"
)
dynamicContent = dynamicContent.replace(
  /import WordToPdf from '\.\/tools\/pdf\/WordToPdf'/,
  "import WordToPdf from './tools/pdf/core/WordToPdf'"
)

fs.writeFileSync(dynamicPath, dynamicContent, 'utf8')
console.log('Updated imports in src/pages/DynamicToolPage.tsx')

console.log('=== REORGANIZATION SCRIPT COMPLETE ===')
