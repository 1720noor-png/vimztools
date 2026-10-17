import { useCallback, useMemo, useState } from 'react'
import { createWorker, OEM } from 'tesseract.js'
import * as pdfjsLib from 'pdfjs-dist'
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url'
import { Download, FileText, Loader2, ScanSearch } from 'lucide-react'
import ToolShell from '../../../../components/tools/ToolShell'
import Dropzone from '../../../../components/ui/Dropzone'
import { Button, Field, Select } from '../../../../components/ui/Fields'
import { LoadingOverlay } from '../../../../components/ui/Spinner'
import { useToast } from '../../../../components/ui/Toast'
import Seo from '../../../../components/ui/Seo'
import { downloadBlob, readFileAsArrayBuffer, stripFileExtension } from '../../../../lib/utils'

pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl

const OCR_OPTIONS = {
  workerPath: '/ocr/worker.min.js',
  corePath: '/ocr/core/',
  langPath: '/ocr/lang/',
  gzip: true,
}

interface PageOcr {
  page: number
  text: string
  confidence: number
}

export default function PdfOcr() {
  const [file, setFile] = useState<File | null>(null)
  const [busy, setBusy] = useState(false)
  const [pages, setPages] = useState<PageOcr[]>([])
  const [scale, setScale] = useState(2)
  const [lang, setLang] = useState('eng')
  const [progress, setProgress] = useState('')
  const { toast } = useToast()

  const onFiles = useCallback(
    (files: File[]) => {
      const pdf = files[0]
      if (!pdf || !/\.pdf$/i.test(pdf.name)) {
        toast('Please choose a valid PDF file.', 'error')
        return
      }
      setFile(pdf)
      setPages([])
    },
    [toast],
  )

  const currentLangLabel = useMemo(
    () => (lang === 'eng' ? 'English' : lang === 'spa' ? 'Spanish' : lang === 'fra' ? 'French' : 'Other'),
    [lang],
  )

  const ocr = async () => {
    if (!file) return
    setBusy(true)
    setProgress('Loading OCR engine...')
    setPages([])
    try {
      const buffer = await readFileAsArrayBuffer(file)
      const loadingTask = pdfjsLib.getDocument({ data: buffer })
      const doc = await loadingTask.promise

      const workerPromise = createWorker(lang, OEM.LSTM_ONLY, {
        ...OCR_OPTIONS,
        logger: (m: { status?: string; progress?: number }) => {
          if (m.status) setProgress(`${m.status}${typeof m.progress === 'number' ? ` ${Math.round(m.progress * 100)}%` : ''}`)
        },
      })
      const worker = await workerPromise

      const results: PageOcr[] = []
      for (let i = 1; i <= doc.numPages; i++) {
        setProgress(`Rendering page ${i} of ${doc.numPages}...`)
        const page = await doc.getPage(i)
        const viewport = page.getViewport({ scale })
        const canvas = document.createElement('canvas')
        canvas.width = Math.floor(viewport.width)
        canvas.height = Math.floor(viewport.height)
        const ctx = canvas.getContext('2d')
        if (!ctx) continue
        await page.render({ canvas, viewport }).promise

        setProgress(`Recognizing text on page ${i} of ${doc.numPages}...`)
        const { data } = await worker.recognize(
          canvas,
          {},
          { text: true },
        )
        results.push({
          page: i,
          text: (data.text ?? '').trim(),
          confidence: data.confidence ?? 0,
        })
        page.cleanup()
      }

      await worker.terminate()
      await loadingTask.destroy()
      setPages(results)
      setProgress('')
      const chars = results.reduce((a, r) => a + r.text.length, 0)
      toast(`OCR complete: ${chars.toLocaleString()} characters from ${results.length} page${results.length > 1 ? 's' : ''}.`)
    } catch (e) {
      console.error(e)
      toast('OCR failed. Check that the pages contain readable text.', 'error')
    } finally {
      setBusy(false)
      setProgress('')
    }
  }

  const downloadText = () => {
    if (pages.length === 0) return
    const parts = pages.map((p) => `--- Page ${p.page} ---\n\n${p.text}`)
    const blob = new Blob([parts.join('\n\n')], { type: 'text/plain;charset=utf-8' })
    downloadBlob(blob, `${stripFileExtension(file?.name ?? 'pdf')}-ocr.txt`)
    toast('Saved OCR text as a .txt file.')
  }

  const copyAll = async () => {
    if (pages.length === 0) return
    const parts = pages.map((p) => `--- Page ${p.page} ---\n\n${p.text}`)
    try {
      await navigator.clipboard.writeText(parts.join('\n\n'))
      toast('Copied extracted text to clipboard.')
    } catch {
      toast('Could not access the clipboard.', 'error')
    }
  }

  const reset = () => {
    setFile(null)
    setPages([])
    setProgress('')
  }

  const maxConfidence = pages.length > 0
    ? Math.round(pages.reduce((max, p) => Math.max(max, p.confidence), 0))
    : 0

  return (
    <>
      <Seo
        title="PDF OCR Text Extractor - Free Online | vimz Tools"
        description="Extract searchable text from scanned PDFs using on-device OCR powered by Tesseract WASM. Your documents never leave your browser - free and private."
      />
      <ToolShell
        title="PDF OCR Text Extractor"
        description="Turn scanned, image-only PDFs into real text. The engine (Tesseract WASM) runs on your device using your browser's WebAssembly - nothing is uploaded."
        icon={<ScanSearch className="h-6 w-6" />}
        breadcrumb="PDF Utilities"
        instruction="Tip: increase the render scale for smaller, low-dpi scans to improve recognition."
      >
        <div className="relative grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            {!file ? (
              <Dropzone
                onFiles={onFiles}
                accept=".pdf"
                multiple={false}
                label="Drop a scanned PDF here to extract its text"
              />
            ) : (
              <div className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5">
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-800">{file.name}</p>
                    <p className="text-xs text-slate-400">OCR language: {currentLangLabel}. On-device WASM.</p>
                  </div>
                  <Button variant="secondary" onClick={reset}>
                    Replace
                  </Button>
                </div>
                <Button onClick={ocr} disabled={busy}>
                  {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <ScanSearch className="h-4 w-4" />}
                  {busy ? 'Recognizing...' : 'Extract text'}
                </Button>
                {busy && progress && (
                  <p className="rounded-xl bg-slate-50 px-3 py-2 text-xs font-medium text-slate-500">
                    {progress} <span className="text-xs text-slate-400">(first run downloads the engine once)</span>
                  </p>
                )}
              </div>
            )}

            {pages.length > 0 && (
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">
                      {pages.length} page{pages.length > 1 && 's'} · avg confidence {maxConfidence}%
                    </h3>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="secondary" onClick={copyAll}>
                      Copy
                    </Button>
                    <Button onClick={downloadText}>
                      <Download className="h-4 w-4" /> Download .txt
                    </Button>
                  </div>
                </div>
                <div className="max-h-[32rem] space-y-4 overflow-y-auto p-5">
                  {pages.map((p) => (
                    <div key={p.page}>
                      <p className="mb-1.5 text-xs font-bold uppercase tracking-wide text-slate-400">
                        Page {p.page}
                      </p>
                      <pre className="whitespace-pre-wrap rounded-xl bg-slate-50 p-3 font-sans text-sm leading-relaxed text-slate-700">
                        {p.text || '(no text found)'}
                      </pre>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="h-fit space-y-5 rounded-2xl border border-slate-200 bg-white p-5 lg:sticky lg:top-24">
            <h3 className="text-sm font-bold text-slate-800">OCR options</h3>
            <Field label="Language">
              <Select
                value={lang}
                onChange={(e) => {
                  setLang(e.target.value)
                  setPages([])
                }}
              >
                <option value="eng">English</option>
                <option value="spa">Spanish</option>
                <option value="fra">French</option>
              </Select>
              <p className="mt-1 text-xs text-slate-400">
                More languages load on first use. Only English is bundled by default.
              </p>
            </Field>
            <Field label={`Render scale ×${scale}`}>
              <input
                type="range"
                min={1}
                max={4}
                step={0.5}
                value={scale}
                onChange={(e) => setScale(Number(e.target.value))}
                className="w-full accent-primary-600"
              />
              <p className="mt-1 text-xs text-slate-400">Higher scale usually means better accuracy.</p>
            </Field>
            <Button onClick={ocr} disabled={busy || !file} className="w-full">
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
              {busy ? 'Recognizing...' : 'Extract text'}
            </Button>
            <p className="text-xs leading-relaxed text-slate-400">
              The Tesseract engine is downloaded once (about 3MB for English) and cached locally afterward.
            </p>
          </div>

          {busy && <LoadingOverlay message="Running on-device OCR..." />}
        </div>
      </ToolShell>
    </>
  )
}