import { applySingle, makeSurface, surfaceFromSource, type OpOptions, type Surface } from './ops.ts'
import { combineImages, composeBeforeAfter, composeCollageLayout, composeContactSheet, composeGrid, composeIdSheets } from './sheets.ts'
import { sourceOf } from './load.ts'
import { filesToZip, guardExport, jsonBlob, outputName, surfaceToBlob, surfacesToDoc, surfacesToPdf, textBlob } from './outputs.ts'
import { boolOf, numOf, selectOf, strOf } from './values.ts'
import { describeFileSize, groupOfMime } from './values.ts'
import type { ImageToolSpec, MimeGroup, OutputFile, ParamValues, RunInput, RunResult } from './types.ts'
import type { Op } from './types.ts'

const MULTI_OPS = new Set(['contactSheet', 'idSheet', 'grid', 'combine', 'collageLayout', 'beforeAfter'])

export function resolveOutGroup(values: ParamValues, spec: ImageToolSpec): MimeGroup {
  const raw = selectOf(values, 'format', '')
  return groupOfMime(raw) ?? spec.outGroup ?? 'png'
}

export function opsOf(spec: ImageToolSpec, values: ParamValues): Op[] {
  if (spec.pipeline) return spec.pipeline(values)
  return spec.ops
}

function needsImages(spec: ImageToolSpec): boolean {
  return spec.needsUpload !== false
}

function baseSurfaceOf(input: RunInput, index: number): Surface {
  const img = input.images[index]
  const src = sourceOf(img)
  return surfaceFromSource(src, img.width, img.height)
}

function applyChain(s: Surface, ops: Op[], opts: OpOptions): Surface {
  let cur = s
  for (const op of ops) cur = applySingle(cur, op, opts)
  return cur
}

function sheetOptions(values: ParamValues) {
  return {
    gap: numOf(values, 'gap', 12, 0, 200),
    bg: strOf(values, 'bg', '#ffffff'),
    cols: numOf(values, 'cols', 0, 0, 40),
    square: boolOf(values, 'square'),
    cellMax: numOf(values, 'cell', 320, 24, 4000),
  }
}

async function toFiles(surfaces: Surface[], base: string, group: MimeGroup, quality: number, suffix: string): Promise<OutputFile[]> {
  guardExport(group)
  const files: OutputFile[] = []
  for (let i = 0; i < surfaces.length; i++) {
    const s = surfaces[i]
    const blob = await surfaceToBlob(s, group, quality)
    const name = outputName(base, group, surfaces.length > 1 ? `${suffix}${i + 1}` : suffix)
    files.push({ name, blob, width: s.w, height: s.h })
  }
  return files
}

/**
 * Run a declarative tool: build surfaces, walk the op chain, compose any
 * multi-image step, then encode to the requested container.
 */
export async function runSpec(input: RunInput): Promise<RunResult> {
  const { spec, values, images } = input
  const progress = input.onProgress ?? (() => {})
  if (spec.custom) return spec.custom(input)
  if (needsImages(spec) && images.length === 0) {
    return { files: [], info: [], error: 'Upload an image first — this tool needs at least one file.' }
  }
  try {
    progress('Building the pipeline', 10)
    const ops = opsOf(spec, values)
    const group = resolveOutGroup(values, spec)
    const quality = numOf(values, 'quality', 0.9, 0.1, 1)
    const multiIndex = ops.findIndex((o) => MULTI_OPS.has(o.op))
    const pre = multiIndex >= 0 ? ops.slice(0, multiIndex) : ops
    const post = multiIndex >= 0 ? ops.slice(multiIndex + 1) : []
    const secondary = input.secondary ?? null
    const opts: OpOptions = {
      secondary: secondary ? (sourceOf(secondary) as ImageBitmap | HTMLImageElement) : null,
      secondaryW: secondary?.width,
      secondaryH: secondary?.height,
    }
    progress('Reading pixels', 25)

    let surfaces: Surface[]
    if (multiIndex >= 0) {
      const composed: Surface[] = []
      for (let i = 0; i < images.length; i++) {
        composed.push(applyChain(baseSurfaceOf(input, i), pre, opts))
        progress(`Preparing image ${i + 1} of ${images.length}`, 25 + Math.round((i / images.length) * 35))
      }
      const terminal = ops[multiIndex]
      progress('Composing the layout', 65)
      switch (terminal.op) {
        case 'contactSheet':
          surfaces = [composeContactSheet(composed, sheetOptions(values))]
          break
        case 'grid':
          surfaces = [composeGrid(composed, sheetOptions(values))]
          break
        case 'combine':
          surfaces = [combineImages(composed, terminal.axis, terminal.gap, terminal.bg)]
          break
        case 'collageLayout':
          surfaces = [composeCollageLayout(composed, { ...sheetOptions(values), layout: terminal.layout })]
          break
        case 'beforeAfter': {
          const a = composed[0]
          const b = composed[1] ?? composed[0]
          surfaces = [composeBeforeAfter(a, b, terminal.split)]
          break
        }
        case 'idSheet': {
          const cellRatio = safeRatio(terminal.hMm, terminal.wMm)
          const pad = numOf(values, 'padMm', 0, 0, 20)
          const wMm = Math.max(4, terminal.wMm - pad * 2)
          const hMm = Math.max(4, terminal.hMm - pad * 2)
          void cellRatio
          surfaces = composeIdSheets(composed, {
            page: terminal.page,
            dpi: numOf(values, 'dpi', 300, 72, 600),
            wMm,
            hMm,
            gapMm: numOf(values, 'gapMm', 2, 0, 20),
            marginMm: numOf(values, 'marginMm', 8, 0, 30),
            cutMarks: terminal.cutMarks,
          })
          break
        }
        default:
          surfaces = composed
      }
      if (post.length) surfaces = surfaces.map((s) => applyChain(s, post, opts))
    } else if ((spec.multiple ?? 1) > 1) {
      surfaces = []
      for (let i = 0; i < images.length; i++) {
        surfaces.push(applyChain(baseSurfaceOf(input, i), ops, opts))
        progress(`Processing ${i + 1} of ${images.length}`, 25 + Math.round((i / images.length) * 55))
      }
    } else {
      surfaces = [applyChain(baseSurfaceOf(input, 0), ops, opts)]
    }

    progress('Encoding the result', 85)
    const base = images[0]?.name ?? 'image'
    let files: OutputFile[]
    if (spec.kind === 'pdf') {
      const blob = await surfacesToPdf(surfaces, {
        page: selectOf(values, 'page', 'a4') as 'a4' | 'letter' | 'a3' | 'a5',
        orientation: selectOf(values, 'orientation', 'portrait') as 'portrait' | 'landscape',
        marginMm: numOf(values, 'marginMm', 10, 0, 40),
        fit: selectOf(values, 'fit', 'contain') as 'contain' | 'cover',
        title: strOf(values, 'title', 'Image export'),
      })
      files = [{ name: outputName(base, 'pdf'), blob, width: surfaces[0]?.w ?? 0, height: surfaces[0]?.h ?? 0 }]
    } else if (spec.kind === 'doc') {
      const blob = surfacesToDoc(surfaces, strOf(values, 'title', base))
      files = [{ name: `${base}.doc`, blob, width: surfaces[0]?.w ?? 0, height: surfaces[0]?.h ?? 0 }]
    } else if (spec.kind === 'json') {
      files = [{ name: `${base}.json`, blob: jsonBlob({ tool: spec.id, results: surfaces.length }), width: 0, height: 0 }]
    } else if (spec.kind === 'text') {
      files = [{ name: `${base}.txt`, blob: textBlob(surfaces.map(() => '').join('\n')), width: 0, height: 0 }]
    } else if (spec.kind === 'zip') {
      const inner = await toFiles(surfaces, base, group, quality, '')
      const blob = await filesToZip(inner.map((f) => ({ name: f.name, blob: f.blob })))
      files = [{ name: `${stripExt(base)}-images.zip`, blob, width: 0, height: 0 }]
    } else {
      files = await toFiles(surfaces, base, group, quality, '')
    }

    progress('Done', 100)
    const info = [
      { label: 'Output', value: files.length === 1 ? files[0].name : `${files.length} files` },
      { label: 'Result size', value: `${surfaces[0]?.w ?? 0} × ${surfaces[0]?.h ?? 0} px` },
      { label: 'File size', value: describeFileSize(files.reduce((a, f) => a + f.blob.size, 0)) },
    ]
    if (images.length > 1) info.splice(1, 0, { label: 'Images processed', value: String(images.length) })
    return { files, info }
  } catch (e) {
    return { files: [], info: [], error: e instanceof Error ? e.message : 'Something went wrong while processing.' }
  }
}

function safeRatio(a: number, b: number): number {
  return b === 0 ? 1 : a / b
}

export function stripExt(name: string): string {
  const i = name.lastIndexOf('.')
  return i > 0 ? name.slice(0, i) : name
}

export { makeSurface }
