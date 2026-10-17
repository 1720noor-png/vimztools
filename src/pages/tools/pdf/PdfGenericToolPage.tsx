import { useEffect, useMemo, useRef, useState, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import {
  FileText,
  Download,
  Loader2,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  Info,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  PenTool,
} from 'lucide-react'
import NotFoundPage from '../../NotFoundPage'
import ToolShell from '../../../components/tools/ToolShell'
import Seo from '../../../components/ui/Seo'
import Dropzone, { FileChip } from '../../../components/ui/Dropzone'
import { getPdfToolSpec } from '../../pdf/specs/pdfSpecsData'
import { PDF_ICON_MAP } from '../../pdf/pdfConfig'
import {
  executePdfTool,
  renderPdfToThumbnails,
  readFileAsBuffer,
  revokeAllObjectUrls,
  type EngineResult,
} from '../../pdf/engine/pdfEngine'
import * as pdfjsLib from 'pdfjs-dist'

export default function PdfGenericToolPage() {
  const { toolSlug } = useParams<{ toolSlug: string }>()
  const spec = useMemo(() => (toolSlug ? getPdfToolSpec(toolSlug) : undefined), [toolSlug])

  // Form parameter states
  const [params, setParams] = useState<Record<string, any>>({})
  const [files, setFiles] = useState<File[]>([])
  const [pageCount, setPageCount] = useState<number | null>(null)
  const [thumbnails, setThumbnails] = useState<string[]>([])
  const [busy, setBusy] = useState(false)
  const [loadingFile, setLoadingFile] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<EngineResult | null>(null)
  const [copied, setCopied] = useState(false)

  // Signature canvas
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [hasDrawn, setHasDrawn] = useState(false)

  // Initialize parameters when spec changes
  useEffect(() => {
    if (!spec) return
    const initial: Record<string, any> = {}
    for (const p of spec.params) {
      initial[p.id] = p.defaultValue
    }
    setParams(initial)
    setFiles([])
    setPageCount(null)
    setThumbnails([])
    setResult(null)
    setError(null)
    setHasDrawn(false)
  }, [spec])

  // Cleanup Object URLs on unmount
  useEffect(() => {
    return () => {
      revokeAllObjectUrls()
    }
  }, [])

  // Handle uploaded files
  const handleFiles = useCallback(
    async (incoming: File[]) => {
      if (!incoming || incoming.length === 0) return
      setError(null)
      setResult(null)
      const targetFiles = spec?.multiple ? incoming : [incoming[0]]
      setFiles(targetFiles)

      const primary = targetFiles[0]
      if (primary && primary.type === 'application/pdf') {
        setLoadingFile(true)
        try {
          const buffer = await readFileAsBuffer(primary)
          const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(buffer) })
          const pdf = await loadingTask.promise
          setPageCount(pdf.numPages)

          const thumbs = await renderPdfToThumbnails(buffer, 6)
          setThumbnails(thumbs)
        } catch {
          setPageCount(null)
          setThumbnails([])
        } finally {
          setLoadingFile(false)
        }
      } else {
        setPageCount(null)
        setThumbnails([])
      }
    },
    [spec],
  )

  const handleRemoveFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
    if (files.length <= 1) {
      setPageCount(null)
      setThumbnails([])
      setResult(null)
    }
  }

  const handleParamChange = (id: string, value: any) => {
    setParams((prev) => ({ ...prev, [id]: value }))
  }

  // Canvas drawing handlers for signature & markup tools
  const isSignatureTool = spec?.op.includes('sign') || spec?.op.includes('draw') || spec?.op.includes('freehand')

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    setIsDrawing(true)
    setHasDrawn(true)
    const rect = canvas.getBoundingClientRect()
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY
    ctx.beginPath()
    ctx.moveTo(clientX - rect.left, clientY - rect.top)
    ctx.lineWidth = 2.5
    ctx.lineCap = 'round'
    ctx.strokeStyle = '#0284c7'
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const rect = canvas.getBoundingClientRect()
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY
    ctx.lineTo(clientX - rect.left, clientY - rect.top)
    ctx.stroke()
  }

  const stopDrawing = () => {
    setIsDrawing(false)
  }

  const clearCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height)
    setHasDrawn(false)
  }

  // Execution handler
  const handleExecute = async () => {
    if (!spec) return
    setBusy(true)
    setError(null)

    try {
      let canvasDrawing: string | undefined = undefined
      if (isSignatureTool && hasDrawn && canvasRef.current) {
        canvasDrawing = canvasRef.current.toDataURL('image/png')
      }

      const res = await executePdfTool({
        spec,
        files,
        params,
        canvasDrawing,
      })
      setResult(res)
    } catch (err: any) {
      setError(err?.message || 'Failed to process PDF document.')
    } finally {
      setBusy(false)
    }
  }

  const handleCopyText = (text: string) => {
    if (!navigator.clipboard) return
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  if (!spec) {
    return <NotFoundPage />
  }

  const IconComp = PDF_ICON_MAP[spec.icon] || FileText
  const primaryFile = files[0]
  const requiresFile = spec.accept !== '.txt' && !spec.op.startsWith('gen-') && spec.op !== 'text-to-pdf'

  return (
    <>
      <Seo
        title={`${spec.name} - Free Online PDF Tool | Vimz.ai`}
        description={spec.blurb}
      />

      <ToolShell
        title={spec.name}
        description={spec.blurb}
        icon={<IconComp className="h-6 w-6 text-sky-600 dark:text-sky-400" />}
        breadcrumb={`PDF Utilities > ${spec.sub} > ${spec.name}`}
        instruction={`Configure options below and execute ${spec.name} directly in your browser with zero data uploads.`}
        tipsTitle="Pro PDF Document Tip"
        guideTips={[spec.proTip]}
        guideSteps={[
          {
            title: '1. Select or Upload Document',
            text: 'Drop your PDF or document file into the browser workspace. Your data stays 100% private.',
          },
          {
            title: '2. Fine-tune Parameters',
            text: 'Configure settings, layout margins, stamp watermarks or ranges in the interactive control panel.',
          },
          {
            title: '3. Instant Processing & Download',
            text: 'Process on-device and download your finalized high-fidelity document with a single click.',
          },
        ]}
      >
        <div className="rounded-2xl border border-sky-100 bg-sky-50/50 p-6 shadow-sm dark:border-sky-900/30 dark:bg-slate-900">
          {/* Section 1: File Uploader & Document Header Badge */}
          <div className="mb-6">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-sky-700 dark:text-sky-300">
                1. Document Input
              </span>
              {primaryFile && (
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-sky-100 px-2.5 py-0.5 text-xs font-semibold text-sky-800 dark:bg-sky-900/40 dark:text-sky-300">
                    <FileCheck className="h-3.5 w-3.5" />
                    {(primaryFile.size / 1024).toFixed(1)} KB
                  </span>
                  {pageCount !== null && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">
                      {pageCount} {pageCount === 1 ? 'Page' : 'Pages'}
                    </span>
                  )}
                </div>
              )}
            </div>

            <Dropzone
              onFiles={handleFiles}
              accept={spec.accept}
              multiple={!!spec.multiple}
              label={
                spec.multiple
                  ? 'Drag & drop multiple PDF documents here, or click to browse'
                  : 'Drag & drop your PDF file here, or click to browse'
              }
            />

            {/* Uploaded File Chips */}
            {files.length > 0 && (
              <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
                {files.map((file, idx) => (
                  <FileChip
                    key={`${file.name}-${idx}`}
                    file={file}
                    index={idx}
                    onRemove={() => handleRemoveFile(idx)}
                  />
                ))}
              </div>
            )}

            {loadingFile && (
              <div className="mt-3 flex items-center gap-2 text-xs font-medium text-sky-600 dark:text-sky-400">
                <Loader2 className="h-4 w-4 animate-spin" />
                Analyzing PDF structure and generating page previews...
              </div>
            )}
          </div>

          {/* Section 2: Live Preview Canvas / Thumbnails Grid */}
          {thumbnails.length > 0 && (
            <div className="mb-6 rounded-xl border border-sky-100 bg-white p-4 dark:border-slate-800 dark:bg-slate-800/60">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                  Page Preview & Thumbnail Inspection
                </span>
                <span className="text-[11px] text-slate-400">
                  Showing {thumbnails.length} of {pageCount} pages
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
                {thumbnails.map((thumb, idx) => (
                  <div
                    key={idx}
                    className="group relative flex flex-col items-center rounded-lg border border-slate-200 bg-slate-50 p-1.5 shadow-2xs dark:border-slate-700 dark:bg-slate-900"
                  >
                    <img
                      src={thumb}
                      alt={`Page ${idx + 1}`}
                      className="h-28 w-full object-contain"
                    />
                    <span className="mt-1 text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                      Page {idx + 1}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Optional Signature / Markup Canvas */}
          {isSignatureTool && (
            <div className="mb-6 rounded-xl border border-sky-100 bg-white p-4 dark:border-slate-800 dark:bg-slate-800/60">
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-200">
                  <PenTool className="h-4 w-4 text-sky-600" />
                  Interactive Signature & Freehand Pad
                </div>
                <button
                  type="button"
                  onClick={clearCanvas}
                  className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-slate-500 hover:bg-slate-100 hover:text-rose-600 dark:hover:bg-slate-700"
                >
                  <RotateCcw className="h-3 w-3" /> Clear
                </button>
              </div>
              <p className="mb-2 text-xs text-slate-400">
                Draw your digital signature or annotations below with your mouse, trackpad, or finger.
              </p>
              <canvas
                ref={canvasRef}
                width={500}
                height={160}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
                className="w-full cursor-crosshair touch-none rounded-lg border border-dashed border-sky-300 bg-slate-50/50 dark:border-sky-800 dark:bg-slate-900"
              />
            </div>
          )}

          {/* Section 3: Action Control Panel */}
          {spec.params.length > 0 && (
            <div className="mb-6 rounded-xl border border-sky-100 bg-white p-5 dark:border-slate-800 dark:bg-slate-800/60">
              <div className="mb-4 flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-sky-700 dark:text-sky-300">
                  2. Configuration & Tool Parameters
                </span>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {spec.params.map((p) => {
                  const val = params[p.id] ?? p.defaultValue

                  if (p.type === 'slider') {
                    return (
                      <div key={p.id} className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs font-medium text-slate-700 dark:text-slate-300">
                          <label htmlFor={p.id}>{p.label}</label>
                          <span className="rounded-md bg-sky-50 px-2 py-0.5 font-bold text-sky-700 dark:bg-sky-950 dark:text-sky-300">
                            {val}
                          </span>
                        </div>
                        <input
                          id={p.id}
                          type="range"
                          min={p.min ?? 0}
                          max={p.max ?? 100}
                          step={p.step ?? 1}
                          value={val}
                          onChange={(e) => handleParamChange(p.id, Number(e.target.value))}
                          className="h-2 w-full cursor-pointer accent-sky-600"
                        />
                      </div>
                    )
                  }

                  if (p.type === 'select') {
                    return (
                      <div key={p.id} className="space-y-1.5">
                        <label
                          htmlFor={p.id}
                          className="block text-xs font-medium text-slate-700 dark:text-slate-300"
                        >
                          {p.label}
                        </label>
                        <select
                          id={p.id}
                          value={val}
                          onChange={(e) => handleParamChange(p.id, e.target.value)}
                          className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 transition focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                        >
                          {p.options?.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    )
                  }

                  if (p.type === 'toggle') {
                    return (
                      <div key={p.id} className="flex items-center gap-2 pt-2">
                        <input
                          id={p.id}
                          type="checkbox"
                          checked={!!val}
                          onChange={(e) => handleParamChange(p.id, e.target.checked)}
                          className="h-4 w-4 rounded-md border-slate-300 text-sky-600 focus:ring-sky-500"
                        />
                        <label
                          htmlFor={p.id}
                          className="text-xs font-medium text-slate-700 dark:text-slate-300"
                        >
                          {p.label}
                        </label>
                      </div>
                    )
                  }

                  if (p.type === 'number') {
                    return (
                      <div key={p.id} className="space-y-1.5">
                        <label
                          htmlFor={p.id}
                          className="block text-xs font-medium text-slate-700 dark:text-slate-300"
                        >
                          {p.label}
                        </label>
                        <input
                          id={p.id}
                          type="number"
                          min={p.min}
                          max={p.max}
                          step={p.step}
                          value={val}
                          onChange={(e) => handleParamChange(p.id, Number(e.target.value))}
                          className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                        />
                      </div>
                    )
                  }

                  // Default text input
                  return (
                    <div key={p.id} className="space-y-1.5">
                      <label
                        htmlFor={p.id}
                        className="block text-xs font-medium text-slate-700 dark:text-slate-300"
                      >
                        {p.label}
                      </label>
                      <input
                        id={p.id}
                        type="text"
                        placeholder={p.placeholder || ''}
                        value={val}
                        onChange={(e) => handleParamChange(p.id, e.target.value)}
                        className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                      />
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Section 4: Action Button & Instant Execution */}
          <div className="mb-6 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleExecute}
              disabled={busy || (requiresFile && files.length === 0)}
              className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-sky-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-sky-500 dark:hover:bg-sky-600"
            >
              {busy ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Processing In Browser...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Execute {spec.name}
                </>
              )}
            </button>

            {requiresFile && files.length === 0 && (
              <span className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                <Info className="h-3.5 w-3.5 text-amber-500" />
                Please drop or select a document to start
              </span>
            )}
          </div>

          {/* Error Notice */}
          {error && (
            <div className="mb-6 flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs font-medium text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-300">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
              <div>{error}</div>
            </div>
          )}

          {/* Result Output Display */}
          {result && (
            <div className="rounded-xl border border-sky-200 bg-white p-5 shadow-xs dark:border-sky-900/50 dark:bg-slate-800">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    Operation Complete
                  </span>
                </div>
                {result.downloadUrl && (
                  <a
                    href={result.downloadUrl}
                    download={result.downloadName || 'document.pdf'}
                    className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600"
                  >
                    <Download className="h-4 w-4" />
                    Download {result.downloadName || 'Document'}
                  </a>
                )}
              </div>

              {/* Result Statistics */}
              {result.stats && result.stats.length > 0 && (
                <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {result.stats.map((st, i) => (
                    <div
                      key={i}
                      className="rounded-lg border border-slate-100 bg-slate-50 p-3 text-center dark:border-slate-700/60 dark:bg-slate-900/50"
                    >
                      <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                        {st.label}
                      </div>
                      <div className="mt-0.5 text-sm font-bold text-slate-800 dark:text-slate-200">
                        {st.value}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Text Result Display */}
              {result.text && (
                <div className="mt-4">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Output Content Preview
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopyText(result.text!)}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-sky-600 hover:text-sky-800 dark:text-sky-400"
                    >
                      {copied ? (
                        <>
                          <Check className="h-3.5 w-3.5 text-emerald-500" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5" />
                          Copy Text
                        </>
                      )}
                    </button>
                  </div>
                  <pre className="max-h-60 overflow-auto rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs font-mono text-slate-800 select-all dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
                    {result.text}
                  </pre>
                </div>
              )}

              {/* Table Data Display */}
              {result.tableData && result.tableData.length > 0 && (
                <div className="mt-4 overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <tbody>
                      {result.tableData.map((row, rIdx) => (
                        <tr
                          key={rIdx}
                          className="border-b border-slate-200 dark:border-slate-700"
                        >
                          {row.map((cell, cIdx) => (
                            <td
                              key={cIdx}
                              className="px-3 py-2 font-mono text-slate-700 dark:text-slate-300"
                            >
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </ToolShell>
    </>
  )
}
