import {
  Aperture,
  BadgeCheck,
  Banknote,
  Crop,
  FileImage,
  FileStack,
  Grid2x2,
  Images,
  Layers,
  LayoutGrid,
  Package,
  Printer,
  QrCode,
  ScanText,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Tag,
  UserRound,
  type LucideIcon,
} from 'lucide-react'
import { imageToolSpecs, placementsOf } from './specs/index.ts'
import type { ImageToolSpec } from '../image-tools/engine/types.ts'
import type { Tool } from '../../lib/catalog'

export const IMAGE_PORTAL_CATEGORY = 'image-tools'
export const IMAGE_PORTAL_CATEGORY_NAME = 'Image Tools'

export interface ImageSubcategory {
  id: string
  title: string
  tagline: string
  description: string
  icon: LucideIcon
  accent: string
  toolIds: string[]
}

/** Catalog ids of the five pre-existing image tools the portal keeps, with their legacy paths. */
export const LEGACY_IMAGE_TOOLS: { id: string; sub: string }[] = [
  { id: 'passport-photo', sub: 'id-passport' },
  { id: 'image-resizer', sub: 'crop-resize' },
  { id: 'format-converter', sub: 'format-conversion' },
  { id: 'background-remover', sub: 'background-cutout' },
  { id: 'watermark', sub: 'watermark-protection' },
]

const STOPWORDS = new Set([
  'the', 'and', 'for', 'of', 'to', 'a', 'an', 'in', 'on', 'with', 'by', 'from',
  'vs', 'or', 'at', 'as', 'per', 'tool', 'tools', 'your', 'you', 'it', 'is', 'are',
  'this', 'that', 'my', 'me', 'i', 'out', 'up', 'to', 'image', 'photo', 'converter',
])

function deriveKeywords(name: string, subject: string): string[] {
  const words = name
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((w) => w.length > 1 && !STOPWORDS.has(w))
  const subjectWords = subject
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((w) => w.length > 2 && !STOPWORDS.has(w))
  return Array.from(new Set([...words, ...subjectWords])).slice(0, 12)
}

export const IMAGE_TOOLS: Tool[] = imageToolSpecs.map((spec: ImageToolSpec) => ({
  id: spec.id,
  name: spec.name,
  categoryId: IMAGE_PORTAL_CATEGORY,
  category: IMAGE_PORTAL_CATEGORY_NAME,
  description: spec.blurb,
  keywords: deriveKeywords(spec.name, spec.sub),
  path: `/image-tools/${spec.sub}/${spec.id}`,
  icon: spec.icon,
  subcategory: spec.sub,
}))

export const IMAGE_LEGACY_ALIASES: { toolId: string; legacyPath: string; sub: string }[] = [
  { toolId: 'passport-photo', legacyPath: '/tools/image/passport-photo', sub: 'id-passport' },
  { toolId: 'image-resizer', legacyPath: '/tools/image/resizer-compressor', sub: 'crop-resize' },
  { toolId: 'format-converter', legacyPath: '/tools/image/format-converter', sub: 'format-conversion' },
  { toolId: 'background-remover', legacyPath: '/tools/image/background-remover', sub: 'background-cutout' },
  { toolId: 'watermark', legacyPath: '/tools/image/watermark', sub: 'watermark-protection' },
]

export const SUBCATEGORY_SLUG_MAP: Record<string, string> = {
  'ecommerce-product': 'ecommerce',
  'photo-collage': 'collage-photo',
  'ai-tools': 'ai-image',
  'metadata-exif': 'metadata-info',
  'batch-processing': 'batch',
}

export function normalizeSubcategorySlug(id: string): string {
  return SUBCATEGORY_SLUG_MAP[id] ?? id
}

function idsFor(sub: string): string[] {
  const norm = normalizeSubcategorySlug(sub)
  const fromSpecs = imageToolSpecs.filter((s) => placementsOf(s).includes(norm) || placementsOf(s).includes(sub)).map((s) => s.id)
  const legacy = LEGACY_IMAGE_TOOLS.filter((l) => l.sub === norm || l.sub === sub).map((l) => l.id)
  return [...fromSpecs, ...legacy]
}

export const imageSubcategories: ImageSubcategory[] = [
  {
    id: 'id-passport',
    title: 'ID & Passport Photos',
    tagline: 'Official-size photos that pass a counter',
    description:
      'Passport, visa, CNIC, driving-licence and job-application photos at every required size, plus background checks and printable A4 sheets. 35×45mm and 51×51mm are measured in millimetres, not guessed at.',
    icon: UserRound,
    accent: 'text-sky-700 bg-sky-50 border-sky-200',
    toolIds: idsFor('id-passport'),
  },
  {
    id: 'crop-resize',
    title: 'Crop & Resize',
    tagline: 'Exact dimensions, clean crops, no guesswork',
    description:
      'Crop, rotate, flip and resize to pixel-exact targets. Includes aspect-ratio and dimension calculators, profile-picture and social-preset sizing, and a real drag-to-pan crop control.',
    icon: Crop,
    accent: 'text-sky-700 bg-sky-50 border-sky-200',
    toolIds: idsFor('crop-resize'),
  },
  {
    id: 'compression',
    title: 'Compression',
    tagline: 'Smaller files that still look right',
    description:
      'Compress JPG, PNG, WebP and GIF, hit an exact target file size, and check what DPI and megapixels your current file really delivers before you compress it further.',
    icon: FileStack,
    accent: 'text-sky-700 bg-sky-50 border-sky-200',
    toolIds: idsFor('compression'),
  },
  {
    id: 'format-conversion',
    title: 'Format Conversion',
    tagline: 'Every common format, converted honestly',
    description:
      'Convert between JPG, PNG, WebP, GIF, BMP, TIFF, AVIF, HEIC and SVG, build a real multi-resolution .ico, and test what a file actually is regardless of its extension.',
    icon: FileImage,
    accent: 'text-sky-700 bg-sky-50 border-sky-200',
    toolIds: idsFor('format-conversion'),
  },
  {
    id: 'background-cutout',
    title: 'Background Removal & Cutouts',
    tagline: 'Clean edges, product shots, transparent PNGs',
    description:
      'Remove a flat background with tolerance and edge feathering, key out a colour, add studio gradients, and place products on white for marketplaces. HEIC is refused with an explanation rather than a silent failure.',
    icon: Aperture,
    accent: 'text-sky-700 bg-sky-50 border-sky-200',
    toolIds: idsFor('background-cutout'),
  },
  {
    id: 'watermark-protection',
    title: 'Watermark & Protection',
    tagline: 'Credit your work, or remove a stolen overlay',
    description:
      'Add text, image, diagonal, signature and copyright watermarks, tile them across an image, and remove an unwanted overlay from a corner or a licence plate.',
    icon: ShieldCheck,
    accent: 'text-sky-700 bg-sky-50 border-sky-200',
    toolIds: idsFor('watermark-protection'),
  },
  {
    id: 'editing-enhancement',
    title: 'Editing & Enhancement',
    tagline: 'Fix exposure, contrast and noise in one pass',
    description:
      'Brightness, contrast, sharpen, blur, denoise, boost, greyscale, sepia, invert, vignette, grain, pixelate, CLAHE local contrast, auto-levels, duotone and relight.',
    icon: SlidersHorizontal,
    accent: 'text-sky-700 bg-sky-50 border-sky-200',
    toolIds: idsFor('editing-enhancement'),
  },
  {
    id: 'face-portrait',
    title: 'Face & Portrait',
    tagline: 'Portrait fixes that stay believable',
    description:
      'Detect a face region, blur or darken the background, focus attention with a vignette, smooth skin, whiten teeth, fix red-eye and check a photo against passport rules. Every effect runs as a deterministic on-device algorithm.',
    icon: Sparkles,
    accent: 'text-sky-700 bg-sky-50 border-sky-200',
    toolIds: idsFor('face-portrait'),
  },
  {
    id: 'social-media',
    title: 'Social Media',
    tagline: 'Every platform size, already preset',
    description:
      'Instagram posts and stories, Facebook posts and cover crops, X/Twitter headers, LinkedIn banners, YouTube thumbnails, Pinterest pins, TikTok covers, profile pictures, caption drafting and memes.',
    icon: Grid2x2,
    accent: 'text-sky-700 bg-sky-50 border-sky-200',
    toolIds: idsFor('social-media'),
  },
  {
    id: 'ecommerce',
    title: 'Ecommerce & Product Photos',
    tagline: 'Marketplace-ready product imagery',
    description:
      'Resize and compress product shots, enforce pure white backgrounds, build lifestyle scenes, size charts, variant swatches, smart crops, thumbnails and a full product catalogue PDF.',
    icon: Package,
    accent: 'text-sky-700 bg-sky-50 border-sky-200',
    toolIds: idsFor('ecommerce'),
  },
  {
    id: 'collage-photo',
    title: 'Collage & Photo Layouts',
    tagline: 'Grids, mosaics, panoramas and templates',
    description:
      'Collage makers, contact sheets, mosaics, side-by-side comparison, panorama stitching, long-exposure stacks and ready-made wedding, baby, travel and school templates.',
    icon: LayoutGrid,
    accent: 'text-sky-700 bg-sky-50 border-sky-200',
    toolIds: idsFor('collage-photo'),
  },
  {
    id: 'image-to-document',
    title: 'Image to Document',
    tagline: 'Turn pictures into shareable documents',
    description:
      'Images to PDF, JPG and PNG to PDF, OCR text into an editable file, table extraction to CSV, receipt to PDF, and a scan-document enhancer for photographed paperwork.',
    icon: Layers,
    accent: 'text-sky-700 bg-sky-50 border-sky-200',
    toolIds: idsFor('image-to-document'),
  },
  {
    id: 'ocr-text',
    title: 'OCR & Text Extraction',
    tagline: 'Read text out of any image',
    description:
      'On-device text recognition for documents, screenshots, receipts, invoices and handwriting, in more than a dozen languages. Nothing is uploaded — recognition runs in this tab.',
    icon: ScanText,
    accent: 'text-sky-700 bg-sky-50 border-sky-200',
    toolIds: idsFor('ocr-text'),
  },
  {
    id: 'metadata-info',
    title: 'Metadata & Image Info',
    tagline: 'See what a file really contains',
    description:
      'Read EXIF, GPS, dimensions, DPI, colour and file-size facts, then strip every trace of metadata before you share a photo publicly.',
    icon: BadgeCheck,
    accent: 'text-sky-700 bg-sky-50 border-sky-200',
    toolIds: idsFor('metadata-info'),
  },
  {
    id: 'color-design',
    title: 'Color & Design',
    tagline: 'Palettes, contrast and colour maths',
    description:
      'Sample a colour, extract a dominant palette, convert HEX to RGB/HSL/CMYK/LAB, check WCAG contrast, build a harmony or duotone, and replace a brand colour across an image.',
    icon: Tag,
    accent: 'text-sky-700 bg-sky-50 border-sky-200',
    toolIds: idsFor('color-design'),
  },
  {
    id: 'qr-barcode',
    title: 'QR & Barcode',
    tagline: 'Generate and read codes',
    description:
      'Generate QR codes for URLs, Wi-Fi credentials and vCards, style them without breaking scannability, build a valid EAN-13 with its check digit, and read codes back out of a photo.',
    icon: QrCode,
    accent: 'text-sky-700 bg-sky-50 border-sky-200',
    toolIds: idsFor('qr-barcode'),
  },
  {
    id: 'batch',
    title: 'Batch Processing',
    tagline: 'A whole folder in one pass',
    description:
      'Resize, crop, watermark, convert, rename, desaturate, OCR, clean metadata and compress a folder at once, then download everything as a single ZIP.',
    icon: Images,
    accent: 'text-sky-700 bg-sky-50 border-sky-200',
    toolIds: idsFor('batch'),
  },
  {
    id: 'print-layout',
    title: 'Print & Layout',
    tagline: 'True-size sheets and print-ready pages',
    description:
      'Passport and ID sheets, photo grids, A4 layouts, business cards, flyers, calendars, print watermarks and photo-card sizing, all computed from millimetres and DPI.',
    icon: Printer,
    accent: 'text-sky-700 bg-sky-50 border-sky-200',
    toolIds: idsFor('print-layout'),
  },
  {
    id: 'icons-logos',
    title: 'Icons & Logos',
    tagline: 'App icons, favicons and logo variants',
    description:
      'Favicons, app icons at platform sizes, transparent logos, padding and clear space, icon masks, branding overlays, delivery grids and 3D depth.',
    icon: Banknote,
    accent: 'text-sky-700 bg-sky-50 border-sky-200',
    toolIds: idsFor('icons-logos'),
  },
  {
    id: 'ai-image',
    title: 'AI Image Tools',
    tagline: 'Deterministic on-device image algorithms',
    description:
      'Upscale, enhance, restore, tone-map and stylise with classical algorithms that run in your browser. They are honest about being deterministic, and your image never leaves the device.',
    icon: Sparkles,
    accent: 'text-sky-700 bg-sky-50 border-sky-200',
    toolIds: idsFor('ai-image'),
  },
]

export const IMAGE_TOTAL_FOLDERS = imageSubcategories.length

export const IMAGE_PORTAL_IDENTITY_COUNT = IMAGE_TOOLS.length + LEGACY_IMAGE_TOOLS.length

export const IMAGE_PORTAL_PLACEMENT_COUNT = imageSubcategories.reduce((n, s) => n + s.toolIds.length, 0)

export function getImageSubcategory(id: string): ImageSubcategory | undefined {
  const norm = normalizeSubcategorySlug(id)
  return imageSubcategories.find((s) => s.id === norm || s.id === id)
}
