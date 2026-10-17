import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { AlertCircle, Check, ClipboardCopy, Download } from 'lucide-react'
import Seo from '../../../components/ui/Seo'
import ToolShell from '../../../components/tools/ToolShell'
import { formatBytes } from '../../../lib/utils'
import { getImageToolSpec } from '../../image-tools/specs/index.ts'
import { getImageSubcategory, normalizeSubcategorySlug } from '../../image-tools/imageToolsConfig'
import { loadFile, releaseAll } from '../../image-tools/engine/load.ts'
import { runSpec } from '../../image-tools/engine/run.ts'
import type { ImageToolSpec, LoadedImage, OutputFile, ParamDef, ParamValues, RunResult } from '../../image-tools/engine/types.ts'

// Preserved Legacy Tools
import PassportPhoto from './PassportPhoto'
import ImageResizer from './ImageResizer'
import FormatConverter from './FormatConverter'
import BackgroundRemover from './BackgroundRemover'
import Watermark from './Watermark'

// Common Unified Scaffolding Components
import {
  ToolCardWrapper,
  ImageDropZone,
  CanvasWorkspace,
  BeforeAfterSlider,
  ControlToolbar,
  ExportDropdown,
  ProTipCard,
  WorkerOrCanvasEngine,
  CanvasEngine,
} from '../../../components/image-tools/common'

const ACCEPT = 'image/*,.bmp,.tif,.tiff,.heic,.heif,.avif,.svg,.ico'

function initialValues(spec: ImageToolSpec): ParamValues {
  const v: ParamValues = {}
  for (const p of spec.params) v[p.key] = p.def ?? (p.kind === 'toggle' ? false : '')
  return v
}

function download(file: OutputFile) {
  const url = URL.createObjectURL(file.blob)
  const a = document.createElement('a')
  a.href = url
  a.download = file.name
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

function Field({
  param,
  value,
  onChange,
}: {
  param: ParamDef
  value: string | number | boolean | undefined
  onChange: (v: string | number | boolean) => void
}) {
  const id = `imgp-${param.key}`
  const base =
    'w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200'

  if (param.kind === 'toggle') {
    return (
      <label htmlFor={id} className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2.5 dark:border-slate-700 dark:bg-slate-800">
        <span className="text-sm font-medium text-slate-600 dark:text-slate-300">{param.label}</span>
        <input
          id={id}
          type="checkbox"
          checked={value === true || value === 'on'}
          onChange={(e) => onChange(e.target.checked)}
          className="h-4 w-4 accent-sky-500"
        />
      </label>
    )
  }

  if (param.kind === 'select') {
    return (
      <label htmlFor={id} className="block">
        <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-400">{param.label}</span>
        <select id={id} value={String(value ?? '')} onChange={(e) => onChange(e.target.value)} className={base}>
          {(param.options ?? []).map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
        {param.hint && <span className="mt-1 block text-xs text-slate-400">{param.hint}</span>}
      </label>
    )
  }

  if (param.kind === 'color') {
    return (
      <label htmlFor={id} className="block">
        <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-400">{param.label}</span>
        <div className="flex items-center gap-2">
          <input
            id={id}
            type="color"
            value={String(value ?? '#ffffff')}
            onChange={(e) => onChange(e.target.value)}
            className="h-9 w-12 cursor-pointer rounded-lg border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800"
          />
          <input
            value={String(value ?? '')}
            onChange={(e) => onChange(e.target.value)}
            className={base}
            aria-label={`${param.label} hex`}
          />
        </div>
      </label>
    )
  }

  if (param.kind === 'text' || param.kind === 'coords' || param.kind === 'pair') {
    return (
      <label htmlFor={id} className="block">
        <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-400">{param.label}</span>
        <input id={id} value={String(value ?? '')} onChange={(e) => onChange(e.target.value)} className={base} />
        {param.hint && <span className="mt-1 block text-xs text-slate-400">{param.hint}</span>}
      </label>
    )
  }

  const num = Number(value ?? 0)
  if (param.kind === 'slider') {
    return (
      <label htmlFor={id} className="block">
        <span className="mb-1 flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-400">
          {param.label}
          <span className="font-mono text-slate-500 dark:text-slate-400">
            {num}
            {param.unit ?? ''}
          </span>
        </span>
        <input
          id={id}
          type="range"
          min={param.min ?? 0}
          max={param.max ?? 1}
          step={param.step ?? 0.01}
          value={num}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full accent-sky-500"
        />
      </label>
    )
  }

  return (
    <label htmlFor={id} className="block">
      <span className="mb-1 flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-400">
        {param.label}
        <span className="font-mono text-slate-500 dark:text-slate-400">
          {num}
          {param.unit ?? ''}
        </span>
      </span>
      <input
        id={id}
        type="number"
        min={param.min}
        max={param.max}
        step={param.step ?? 1}
        value={String(value ?? 0)}
        onChange={(e) => onChange(Number(e.target.value))}
        className={base}
      />
    </label>
  )
}

function visibleParams(spec: ImageToolSpec, values: ParamValues): ParamDef[] {
  return spec.params.filter((p) => {
    if (!p.when) return true
    return values[p.when] === true || values[p.when] === 'on'
  })
}

export interface ImageToolPageProps {
  subcategory?: string
  tool?: string
}

export default function ImageToolPage({ subcategory: propSubcategory, tool: propTool }: ImageToolPageProps = {}) {
  const routeParams = useParams<{ subcategory: string; tool: string }>()
  const rawSub = propSubcategory ?? routeParams.subcategory
  const toolId = propTool ?? routeParams.tool

  // SECTION 0: PRESERVED ASSETS EMBEDDING
  if (toolId === 'passport-photo') {
    return <PassportPhoto />
  }
  if (toolId === 'image-resizer' || toolId === 'resizer-compressor') {
    return <ImageResizer />
  }
  if (toolId === 'format-converter') {
    return <FormatConverter />
  }
  if (toolId === 'background-remover') {
    return <BackgroundRemover />
  }
  if (toolId === 'watermark') {
    return <Watermark />
  }

  return <ImageToolWorkspace subcategory={rawSub} toolId={toolId} />
}

function ImageToolWorkspace({ subcategory: rawSub, toolId }: { subcategory?: string; toolId?: string }) {
  const normalizedSub = rawSub ? normalizeSubcategorySlug(rawSub) : undefined
  const sub = normalizedSub ? getImageSubcategory(normalizedSub) : undefined
  const spec = toolId ? getImageToolSpec(toolId) : undefined

  const [values, setValues] = useState<ParamValues>(() => (spec ? initialValues(spec) : {}))
  const [images, setImages] = useState<LoadedImage[]>([])
  const [result, setResult] = useState<RunResult | null>(null)
  const [busy, setBusy] = useState(false)
  const [progress, setProgress] = useState('')
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const [resultUrl, setResultUrl] = useState<string | null>(null)
  const runId = useRef(0)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    setValues(spec ? initialValues(spec) : {})
    setResult(null)
    setError('')
  }, [spec?.id])

  // Memory Leak Prevention: Release images & abort runs on unmount/change
  useEffect(() => {
    return () => {
      runId.current++
      releaseAll(images)
    }
  }, [images])

  // Memory Leak Prevention: Revoke result object URL when result changes or unmounts
  useEffect(() => {
    if (result?.files[0] && result.files[0].blob.type.startsWith('image/')) {
      const url = URL.createObjectURL(result.files[0].blob)
      setResultUrl(url)
      return () => {
        URL.revokeObjectURL(url)
      }
    } else {
      setResultUrl(null)
    }
  }, [result])

  // Canvas context buffer release on unmount
  useEffect(() => {
    return () => {
      if (canvasRef.current) {
        CanvasEngine.releaseCanvas(canvasRef.current)
      }
    }
  }, [])

  const setValue = useCallback((key: string, v: string | number | boolean) => {
    setValues((prev) => ({ ...prev, [key]: v }))
  }, [])

  const onFiles = useCallback(
    async (files: File[]) => {
      if (!spec) return
      setError('')
      const max = spec.multiple ?? 1
      const list = files.slice(0, max)
      const loaded: LoadedImage[] = []
      for (const f of list) {
        try {
          loaded.push(await loadFile(f, (label) => setProgress(label)))
        } catch (e) {
          setError(e instanceof Error ? e.message : 'That file could not be decoded.')
        }
      }
      releaseAll(images)
      setImages(loaded)
      setResult(null)
      setProgress('')
    },
    [spec, images],
  )

  const clearImages = useCallback(() => {
    releaseAll(images)
    setImages([])
    setResult(null)
    setError('')
  }, [images])

  const execute = useCallback(async () => {
    if (!spec) return
    const id = ++runId.current
    setBusy(true)
    setError('')
    setProgress('Processing…')
    try {
      const out = await runSpec({
        spec,
        values,
        images,
        onProgress: (label, pct) => setProgress(`${label} ${Math.round(pct * 100)}%`),
      })
      if (id !== runId.current) return
      setResult(out)
      if (out.error) setError(out.error)
    } catch (e) {
      if (id !== runId.current) return
      setError(e instanceof Error ? e.message : 'Something went wrong while processing this image.')
    } finally {
      if (id === runId.current) {
        setBusy(false)
        setProgress('')
      }
    }
  }, [spec, values, images])

  const resetValues = useCallback(() => {
    if (spec) setValues(initialValues(spec))
  }, [spec])

  if (!spec) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Tool not found</h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">That image tool does not exist.</p>
        <Link to="/image-tools" className="mt-4 inline-block text-sm font-semibold text-sky-600 dark:text-sky-400">
          Back to all image tools
        </Link>
      </div>
    )
  }

  const needsUpload = spec.needsUpload !== false
  const params = visibleParams(spec, values)
  const files = result?.files ?? []
  const canRun = !needsUpload || images.length > 0

  // File metrics for DropZone
  const fileMetrics = images.map((img) => ({
    name: img.name,
    size: img.size,
    width: img.width,
    height: img.height,
    type: img.mime,
  }))

  // Slider parameter labels for Section 3
  const sliderNames = spec.params
    .filter((p) => p.kind === 'slider' || p.kind === 'number')
    .map((p) => p.label)
    .slice(0, 4)

  // Safe aspect ratio (defense against division by zero)
  const originalWidth = images[0]?.width ?? 0
  const originalHeight = images[0]?.height ?? 0
  const safeAspectRatio = originalHeight > 0 ? originalWidth / originalHeight : undefined

  return (
    <>
      <Seo
        title={`${spec.name} - Free Online Tool | vimz Tools`}
        description={`${spec.blurb} Runs entirely in your browser - no uploads, no sign-up.`}
      />
      <ToolShell
        title={spec.name}
        description={spec.blurb}
        icon={<span className="text-2xl" aria-hidden="true" />}
        breadcrumb={`Home > Image Tools > ${sub?.title ?? spec.sub} > ${spec.name}`}
        instruction={spec.blurb}
        guideSteps={[
          {
            title: 'Add your image',
            text: needsUpload
              ? 'Drop a file or browse. Nothing is uploaded - processing happens in this tab.'
              : 'This tool works from its settings alone. No file needed.',
          },
          {
            title: 'Tune the settings',
            text: spec.params.length
              ? 'Adjust the controls, then run the tool to see the result live.'
              : 'Run the tool to analyse the file.',
          },
          {
            title: 'Save the result',
            text: 'Download the output, or copy the text when the tool returns text instead of an image.',
          },
        ]}
        guideTips={[spec.tip]}
        tipsTitle="Pro Image Design Tip"
      >
        <ToolCardWrapper theme="sky" className="rounded-2xl border border-sky-100 dark:border-sky-900/30 dark:bg-slate-900 p-5 shadow-sm space-y-6">
          {/* SECTION 1: UPLOAD & METRICS */}
          {needsUpload && (
            <ImageDropZone
              accept={spec.accept ?? ACCEPT}
              maxFiles={spec.multiple ?? 1}
              showDimensions
              showFileSizeBadge
              label={
                spec.multiple && spec.multiple > 1
                  ? `Drop up to ${spec.multiple} images`
                  : 'Drop an image here, or click to browse'
              }
              files={fileMetrics}
              onFiles={onFiles}
              onClear={clearImages}
              error={error}
              onDismissWarning={() => setError('')}
            />
          )}

          {/* SECTION 2: VIEWPORT & LIVE CANVAS ENGINE */}
          <CanvasWorkspace engine={WorkerOrCanvasEngine} canvasRef={canvasRef}>
            <BeforeAfterSlider
              beforeUrl={images[0]?.url ?? null}
              afterUrl={resultUrl}
              beforeLabel="Original"
              afterLabel="Result"
              aspectRatio={safeAspectRatio}
            />
          </CanvasWorkspace>

          {/* PARAMETERS CONFIGURATION */}
          {params.length > 0 && (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 pt-1">
              {params.map((p) => (
                <Field key={p.key} param={p} value={values[p.key]} onChange={(v) => setValue(p.key, v)} />
              ))}
            </div>
          )}

          {/* SECTION 3: ACTION CONTROLS & EXPORTER */}
          <ControlToolbar
            sliders={sliderNames.length > 0 ? sliderNames : ['Quality', 'Dimension', 'Opacity']}
            canRun={canRun}
            isBusy={busy}
            progress={progress}
            onRun={execute}
            onReset={resetValues}
          >
            <ExportDropdown
              formats={['JPG', 'PNG', 'WebP']}
              allowClipboardCopy
              files={files}
              copyText={result?.text}
              disabled={files.length === 0 && !result?.text}
            />
          </ControlToolbar>

          {/* INLINE ERROR ALERT */}
          {error && (
            <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/40 dark:text-rose-300">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* RESULTS INFORMATION */}
          {result?.info && result.info.length > 0 && (
            <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900/80">
              <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Analysis & Metrics
              </h3>
              <dl className="space-y-1.5">
                {result.info.map((row, i) => (
                  <div
                    key={i}
                    className="flex flex-wrap items-baseline justify-between gap-2 border-b border-slate-100 pb-1.5 last:border-0 dark:border-slate-800"
                  >
                    <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">{row.label}</dt>
                    <dd
                      className={`font-mono text-sm font-medium ${
                        row.tone === 'good'
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : row.tone === 'bad'
                          ? 'text-rose-600 dark:text-rose-400'
                          : row.tone === 'warn'
                          ? 'text-amber-600 dark:text-amber-400'
                          : 'text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {row.value}
                    </dd>
                    {row.hint && <p className="w-full text-xs text-slate-400">{row.hint}</p>}
                  </div>
                ))}
              </dl>
            </div>
          )}

          {/* EXTRACTED TEXT SECTION */}
          {result?.text && (
            <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900/80">
              <div className="mb-2 flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Extracted Text
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    void navigator.clipboard?.writeText(result.text ?? '')
                    setCopied(true)
                    setTimeout(() => setCopied(false), 1500)
                  }}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-sky-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <ClipboardCopy className="h-3.5 w-3.5" />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
              <pre className="max-h-80 overflow-auto whitespace-pre-wrap rounded-lg bg-slate-50 p-3 font-mono text-xs text-slate-700 dark:bg-slate-950 dark:text-slate-300">
                {result.text}
              </pre>
            </div>
          )}

          {/* READY FILES DOWNLOAD LIST */}
          {files.length > 0 && (
            <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900/80">
              <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                {files.length} File{files.length === 1 ? '' : 's'} Ready
              </h3>
              <ul className="space-y-1.5">
                {files.map((f, i) => (
                  <li
                    key={`${f.name}-${i}`}
                    className="flex items-center justify-between gap-3 rounded-lg border border-slate-100 px-3 py-2 dark:border-slate-800"
                  >
                    <span className="min-w-0 truncate text-xs text-slate-600 dark:text-slate-300">
                      {f.name} <span className="text-slate-400">({formatBytes(f.blob.size)})</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => download(f)}
                      className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-sky-50 px-2.5 py-1.5 text-xs font-semibold text-sky-600 hover:bg-sky-100 dark:bg-sky-950/60 dark:text-sky-400 dark:hover:bg-sky-900/60 transition"
                    >
                      <Download className="h-3.5 w-3.5" /> Download
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* SECTION 4: CONTEXTUAL GUIDANCE */}
          <ProTipCard
            category={sub?.title ?? spec.sub}
            tipContent={spec.tip}
          />

          {/* CROSS-TOOL NAV PILLS */}
          <nav className="flex flex-wrap gap-2 pt-2 border-t border-slate-100 dark:border-slate-800" aria-label="Other tools in this category">
            {(sub?.toolIds ?? [])
              .filter((id) => id !== spec.id)
              .slice(0, 12)
              .map((id) => (
                <Link
                  key={id}
                  to={`/image-tools/${rawSub ?? spec.sub}/${id}`}
                  className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-500 transition hover:border-sky-300 hover:text-sky-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 dark:hover:border-sky-500 dark:hover:text-sky-400"
                >
                  {id.replace(/-/g, ' ')}
                </Link>
              ))}
          </nav>
        </ToolCardWrapper>
      </ToolShell>
    </>
  )
}
