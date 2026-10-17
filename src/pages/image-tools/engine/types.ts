export type SubId =
  | 'id-passport'
  | 'crop-resize'
  | 'compression'
  | 'format-conversion'
  | 'background-cutout'
  | 'watermark-protection'
  | 'editing-enhancement'
  | 'face-portrait'
  | 'social-media'
  | 'ecommerce'
  | 'collage-photo'
  | 'image-to-document'
  | 'ocr-text'
  | 'ai-image'
  | 'metadata-info'
  | 'color-design'
  | 'qr-barcode'
  | 'batch'
  | 'print-layout'
  | 'icons-logos'

export type Mime = 'image/jpeg' | 'image/png' | 'image/webp' | 'image/avif' | 'image/gif' | 'image/bmp' | 'image/tiff' | 'image/heic' | 'image/svg+xml' | 'image/x-icon' | 'application/pdf' | 'text/plain' | 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' | 'application/msword'

export type MimeGroup = 'jpeg' | 'png' | 'webp' | 'avif' | 'gif' | 'bmp' | 'tiff' | 'heic' | 'svg' | 'ico' | 'pdf' | 'text' | 'doc'

export type ParamKind = 'number' | 'slider' | 'select' | 'text' | 'color' | 'toggle' | 'coords' | 'pair' | 'multi'

export interface ParamDef {
  key: string
  label: string
  kind: ParamKind
  def?: string | number | boolean
  min?: number
  max?: number
  step?: number
  unit?: string
  options?: string[]
  hint?: string
  /** grid fields that are hidden unless a preceding toggle is true */
  when?: string
}

export type Op =
  | { op: 'crop'; x: number; y: number; w: number; h: number; unit: 'px' | 'ratio' }
  | { op: 'cropShape'; shape: 'rect' | 'circle' | 'rounded'; radius: number }
  | { op: 'aspect'; ratio: number; mode: 'cover' | 'contain' }
  | { op: 'resize'; w: number; h: number; mode: 'exact' | 'fit' | 'fill' | 'cover' | 'contain'; unit: 'px' | 'percent' | 'mm'; dpi?: number }
  | { op: 'scaleToWidth'; w: number }
  | { op: 'scaleToHeight'; h: number }
  | { op: 'scale'; factor: number }
  | { op: 'longEdge'; px: number }
  | { op: 'rotate'; deg: number; expand: boolean }
  | { op: 'flip'; axis: 'x' | 'y' }
  | { op: 'adjust'; brightness: number; contrast: number; saturation: number; hue: number; blur: number; sharpen: number; grayscale: number; sepia: number; invert: number; exposure: number; temperature: number; tint: number }
  | { op: 'vignette'; strength: number; radius: number; feather: number }
  | { op: 'grain'; amount: number; mono: boolean }
  | { op: 'pixelate'; block: number }
  | { op: 'mosaicFace'; block: number; region: 'auto' | 'top' | 'center' }
  | { op: 'denoise'; strength: number }
  | { op: 'autolevels'; amount: number }
  | { op: 'clahe'; tiles: number; clip: number }
  | { op: 'unsharp'; radius: number; amount: number }
  | { op: 'upscale'; factor: number; method: 'lanczos' | 'bilinear' | 'nearest' }
  | { op: 'background'; mode: 'transparent' | 'color' | 'blur' | 'gradient' | 'studio' | 'remove'; color: string; color2: string; blur: number; tolerance: number; feather: number; keepColor: 'auto' | 'none' | 'keep' }
  | { op: 'shadow'; blur: number; offsetX: number; offsetY: number; color: string; opacity: number }
  | { op: 'border'; width: number; color: string; style: 'solid' | 'dashed' | 'double' }
  | { op: 'watermarkText'; text: string; fontSize: number; opacity: number; color: string; x: number; y: number; rotation: number; font: string; tile: boolean }
  | { op: 'watermarkImage'; opacity: number; x: number; y: number; rotation: number; scale: number; tile: boolean }
  | { op: 'removeWatermark'; region: 'topright' | 'bottomright' | 'topleft' | 'bottomleft' | 'center'; patch: number }
  | { op: 'relight'; angle: number; strength: number }
  | { op: 'inpaint'; region: 'center' | 'top' | 'bottom'; radius: number; feather: number }
  | { op: 'photoFrame'; style: 'white' | 'black' | 'polaroid' | 'shadow'; margin: number; caption: string }
  | { op: 'stripMetadata' }
  | { op: 'sticker' }
  | { op: 'posterize'; levels: number }
  | { op: 'duotone'; dark: string; light: string }
  | { op: 'colorReplace'; from: string; to: string; tolerance: number }
  | { op: 'chromaKey'; keyColor: string; tolerance: number; softness: number }
  | { op: 'faceBox'; pad: number; shape: 'rect' | 'circle' | 'rounded' }
  | { op: 'cutoutRect'; inset: number }
  | { op: 'contactSheet'; cols: number; gap: number; bg: string; square: boolean }
  | { op: 'idSheet'; cols: number; rows: number; gap: number; page: string; wMm: number; hMm: number; cutMarks: boolean }
  | { op: 'grid' }
  | { op: 'combine'; axis: 'x' | 'y'; gap: number; bg: string }
  | { op: 'collageLayout'; layout: 'rows' | 'cols' | 'grid' | 'strip' | 'mosaic'; cols: number; gap: number; bg: string }
  | { op: 'beforeAfter'; split: number }

export type OutputKind = 'image' | 'sheet' | 'pdf' | 'doc' | 'text' | 'json' | 'zip' | 'multi'

export interface ImageToolSpec {
  id: string
  name: string
  sub: SubId
  blurb: string
  tip: string
  icon: string
  kind: OutputKind
  params: ParamDef[]
  /** static pipeline; ignored when `pipeline` is supplied */
  ops: Op[]
  /** builds ops from the current parameter values — use for slider-driven tools */
  pipeline?: (v: ParamValues) => Op[]
  /** escape hatch for tools that need their own algorithm (OCR, QR, captions…) */
  custom?: (input: RunInput) => Promise<RunResult> | RunResult
  /** default output container; the renderer exposes it as a format select */
  outGroup?: MimeGroup
  /** hard target size, used for the size-checker/matrix tools */
  target?: { w: number; h: number; label: string }
  accept?: string
  multiple?: number
  quality?: boolean
  compare?: boolean
  worker?: boolean
  /** set false for calculators/checkers that never read an uploaded file */
  needsUpload?: boolean
  /** extra folders this tool also appears in (the 5 cross-listed tools) */
  alsoIn?: SubId[]
  /** informational tools that never touch the canvas */
  info?: InfoSection[]
  notes?: string[]
}

export interface InfoSection {
  label: string
  value: string
  tone?: 'good' | 'warn' | 'bad' | 'neutral'
  hint?: string
}

export type ParamValues = Record<string, string | number | boolean>

export interface LoadedImage {
  name: string
  size: number
  mime: string
  url: string
  width: number
  height: number
  bitmap?: ImageBitmap
  element?: HTMLImageElement
  /** formats the browser cannot decode (BMP/TIFF) come in as raw pixels */
  pixels?: ImageData
  file?: File
  group: MimeGroup | null
}

export interface OutputFile {
  name: string
  blob: Blob
  width: number
  height: number
}

export interface RunResult {
  files: OutputFile[]
  info: InfoSection[]
  text?: string
  error?: string
}

export interface RunInput {
  spec: ImageToolSpec
  values: ParamValues
  images: LoadedImage[]
  secondary?: LoadedImage | null
  onProgress?: (label: string, pct: number) => void
}
