import { fmtParam, n, pr, qualityParam, sel, sl, tg, tool } from '../engine/factories.ts'
import { convertToIco } from '../engine/runners.ts'
import type { ImageToolSpec, MimeGroup, Op } from '../engine/types.ts'

const SUB = 'format-conversion' as const

const sizeParams = [
  pr('target', 'Output size (px, 0 = keep)', '0,0'),
  tg('flatten', 'Flatten transparency onto a solid background'),
  pr('bg', 'Background colour', '#ffffff'),
]

function sizeBuilder(v: Record<string, string | number | boolean | undefined>): [number, number] {
  const raw = String(v.target ?? '')
  const parts = raw
    .split(/[,;x×\s]+/)
    .map((s) => Number(s.trim()))
    .filter((x) => Number.isFinite(x) && x >= 0)
  if (parts.length < 2) return [0, 0]
  return [Math.round(parts[0]), Math.round(parts[1])]
}

function pipeline(to: MimeGroup) {
  return (v: Record<string, string | number | boolean | undefined>): Op[] => {
    const ops: Op[] = []
    const [w, h] = sizeBuilder(v)
    if (w > 0 && h > 0) ops.push({ op: 'resize', w, h, mode: 'exact', unit: 'px' })
    if (v.flatten === 'on' && to !== 'png') {
      ops.push({ op: 'background', mode: 'color', color: String(v.bg ?? '#ffffff'), color2: '#0EA5E9', blur: 0, tolerance: 0, feather: 0, keepColor: 'auto' })
    }
    return ops
  }
}

function conversion(
  id: string,
  name: string,
  icon: string,
  from: string,
  to: MimeGroup,
  blurb: string,
  tip: string,
  lossy: boolean,
): ImageToolSpec {
  return tool({
    id,
    name,
    sub: SUB,
    icon,
    blurb,
    tip,
    accept: from,
    params: [
      ...sizeParams,
      ...(lossy ? [qualityParam(0.9)] : [fmtParam()]),
    ],
    outGroup: to,
    build: pipeline(to),
  })
}

export const FORMAT_SPECS: ImageToolSpec[] = [
  conversion('jpg-to-png', 'JPG to PNG', 'FileImage', '.jpg,.jpeg', 'png', 'Turn a JPG into a lossless PNG with a real alpha channel.', 'PNG is bigger but never re-compresses your photo. Use it when you need transparency or plan to edit again.', false),
  conversion('png-to-jpg', 'PNG to JPG', 'FileImage', '.png', 'jpeg', 'Flatten a PNG into a compact JPG for email and forms.', 'JPG has no transparency. Turn on "Flatten transparency" so the background does not turn black.', true),
  conversion('jpg-to-webp', 'JPG to WebP', 'FileImage', '.jpg,.jpeg', 'webp', 'Convert a JPG to WebP for a big size saving at the same quality.', 'WebP is usually 30% smaller than JPG at matching quality. Keep JPG as a fallback for very old browsers.', true),
  conversion('webp-to-jpg', 'WebP to JPG', 'FileImage', '.webp', 'jpeg', 'Convert a WebP back to the universally supported JPG.', 'Some email clients and old Office installs still cannot show WebP. JPG is the safe fallback.', true),
  conversion('png-to-webp', 'PNG to WebP', 'FileImage', '.png', 'webp', 'Get a much smaller WebP from a PNG without losing transparency.', 'Modern WebP keeps the alpha channel, so logos stay clean while shrinking dramatically.', true),
  conversion('webp-to-png', 'WebP to PNG', 'FileImage', '.webp', 'png', 'Convert a WebP to a lossless PNG.', 'PNG is the safer format for design work you will keep editing later.', false),
  conversion('gif-to-jpg', 'GIF to JPG', 'FileImage', '.gif', 'jpeg', 'Freeze a GIF into a still JPG.', 'This keeps the first frame only. The result is a normal photo, not an animation.', true),
  conversion('gif-to-png', 'GIF to PNG', 'FileImage', '.gif', 'png', 'Freeze a GIF into a still PNG with transparency.', 'Only the first frame is kept. Use a video-to-GIF style tool if you need motion.', false),
  conversion('svg-to-png', 'SVG to PNG', 'FileImage', '.svg', 'png', 'Rasterise a vector SVG at the resolution you need.', 'Export at 2× or 3× the size you will display so it stays sharp on retina screens.', false),
  conversion('svg-to-jpg', 'SVG to JPG', 'FileImage', '.svg', 'jpeg', 'Flatten a vector SVG into a JPG for documents and email.', 'JPG has no transparency, so a white background is filled in behind the artwork.', true),
  conversion('bmp-to-jpg', 'BMP to JPG', 'FileImage', '.bmp', 'jpeg', 'Turn a bulky Windows BMP into a compact JPG.', 'BMP files are uncompressed, so they are often 10–50× larger than the same picture as a JPG.', true),
  conversion('tiff-to-jpg', 'TIFF to JPG', 'FileImage', '.tif,.tiff', 'jpeg', 'Convert a TIFF scan or print file into a JPG.', 'Scanners produce TIFFs with embedded DPI. Export to JPG for sharing, keep the TIFF for archiving.', true),
  conversion('tiff-to-png', 'TIFF to PNG', 'FileImage', '.tif,.tiff', 'png', 'Convert a TIFF into a lossless PNG.', 'PNG is a good middle ground for scans: smaller than TIFF, sharper than JPG.', false),
  conversion('heic-to-jpg', 'HEIC to JPG', 'FileImage', '.heic,.heif', 'jpeg', 'Open an iPhone HEIC photo and save it as a normal JPG.', 'HEIC needs a browser that supports it — Safari and recent iOS builds do. Chrome often cannot, so convert on the phone first.', true),
  conversion('heic-to-png', 'HEIC to PNG', 'FileImage', '.heic,.heif', 'png', 'Convert an iPhone HEIC photo into a lossless PNG.', 'PNG keeps full quality but gets large. Use it for logos or images you will keep editing.', false),
  conversion('avif-to-jpg', 'AVIF to JPG', 'FileImage', '.avif', 'jpeg', 'Turn an AVIF image into a widely supported JPG.', 'AVIF compresses extremely well, so converting to JPG can make the file several times larger.', true),
  conversion('avif-to-png', 'AVIF to PNG', 'FileImage', '.avif', 'png', 'Convert an AVIF image into a lossless PNG.', 'Choose PNG if you need an alpha channel or plan to edit the image again.', false),
  tool({
    id: 'ico-converter',
    name: 'ICO Converter',
    sub: SUB,
    icon: 'AppWindow',
    blurb: 'Build a real multi-size .ico file for a Windows app or website favicon.',
    tip: 'Include 16, 32 and 48 pixels. Windows scales badly from a single large size, so the small ones matter most.',
    accept: '.png,.jpg,.jpeg,.bmp,.ico',
    params: [
      sel('sizes', 'Sizes to include', ['16,32,48', '16,32,48,64,128,256', '16,48,256'], '16,32,48'),
      n('padding', 'Transparent padding', 0, 0, 64, 1, 'px'),
    ],
    outGroup: 'ico',
    custom: convertToIco,
  }),
  tool({
    id: 'image-format-tester',
    name: 'Image Format Tester',
    sub: SUB,
    icon: 'FlaskConical',
    blurb: 'Try any output format on your own image and compare the results side by side.',
    tip: 'Run the same photo through every format, then judge at 100% zoom rather than by file size alone.',
    params: [sl('quality', 'Quality', 0.85, 0.2, 1, 0.05, '', 'Applies to JPG and WebP'), tg('flatten', 'Flatten transparency')],
    outGroup: 'webp',
    build: (v) => [
      ...(v.flatten === 'on' ? [{ op: 'background' as const, mode: 'color' as const, color: '#ffffff', color2: '#0EA5E9', blur: 0, tolerance: 0, feather: 0, keepColor: 'auto' as const }] : []),
    ],
  }),
]
