import { useCallback, useState } from 'react'
import { PDFDocument } from 'pdf-lib'
import JSZip from 'jszip'
import { FileStack, Loader2, Scissors, Download } from 'lucide-react'
import ToolShell from '../../../../components/tools/ToolShell'
import Dropzone, { FileChip } from '../../../../components/ui/Dropzone'
import { Button, Field } from '../../../../components/ui/Fields'
import { LoadingOverlay } from '../../../../components/ui/Spinner'
import { useToast } from '../../../../components/ui/Toast'
import Seo from '../../../../components/ui/Seo'
import { downloadBlob, formatBytes, readFileAsArrayBuffer, stripFileExtension } from '../../../../lib/utils'

interface OutputFile {
  name: string
  label: string
  bytes: Uint8Array<ArrayBuffer>
  size: number
}

function parseRanges(input: string, max: number): Array<[number, number]> {
  if (!input.trim()) return []
  const tokens = input.split(',').map((t) => t.trim()).filter(Boolean)
  const groups: Array<[number, number]> = []
  for (const token of tokens) {
    const m = /^(\d{1,4})(?:-(\d{1,4}))?$/.exec(token)
    if (!m) throw new Error(`Invalid range: "${token}"`)
    const lo = Number(m[1])
    const hi = m[2] ? Number(m[2]) : lo
    if (lo < 1 || hi > max || lo > hi) {
      throw new Error(`Range "${token}" is outside 1-${max}`)
    }
    groups.push([lo, hi])
  }
  groups.sort((a, b) => a[0] - b[0])
  const merged: Array<[number, number]> = []
  for (const [lo, hi] of groups) {
    const last = merged[merged.length - 1]
    if (last && lo <= last[1] + 1) {
      last[1] = Math.max(last[1], hi)
    } else {
      merged.push([lo, hi])
    }
  }
  return merged
}

async function splitPdf(
  file: File,
  mode: 'all' | 'ranges',
  ranges: Array<[number, number]>,
): Promise<OutputFile[]> {
  const src = await PDFDocument.load(await readFileAsArrayBuffer(file), { ignoreEncryption: true })
  const total = src.getPageCount()
  const base = stripFileExtension(file.name)
  const outputs: OutputFile[] = []

  const emit = async (indices: number[], label: string, name: string) => {
    const doc = await PDFDocument.create()
    const pages = await doc.copyPages(src, indices)
    pages.forEach((p) => doc.addPage(p))
    const bytes = await doc.save({ useObjectStreams: true })
    const out = new Uint8Array(bytes) as Uint8Array<ArrayBuffer>
    outputs.push({ name, label, bytes: out, size: bytes.byteLength })
  }

  if (mode === 'all') {
    for (let i = 0; i < total; i++) {
      await emit([i], `Page ${i + 1}`, `${base}-page-${i + 1}.pdf`)
    }
  } else {
    for (const [lo, hi] of ranges) {
      const indices: number[] = []
      for (let i = lo; i <= hi; i++) indices.push(i - 1)
      const label = lo === hi ? `Page ${lo}` : `Pages ${lo}-${hi}`
      await emit(indices, label, `${base}-pages-${lo}-${hi}.pdf`)
    }
  }

  return outputs
}

export default function PdfSplit() {
  const [file, setFile] = useState<File | null>(null)
  const [pageCount, setPageCount] = useState(0)
  const [mode, setMode] = useState<'all' | 'ranges'>('all')
  const [rangesInput, setRangesInput] = useState('')
  const [outputs, setOutputs] = useState<OutputFile[]>([])
  const [busy, setBusy] = useState(false)
  const { toast } = useToast()

  const onFiles = useCallback(
    async (files: File[]) => {
      const pdf = files[0]
      if (!pdf || !/\.pdf$/i.test(pdf.name)) {
        toast('Please choose a PDF file.', 'error')
        return
      }
      setFile(pdf)
      setOutputs([])
      setPageCount(0)
      try {
        const doc = await PDFDocument.load(await readFileAsArrayBuffer(pdf), { ignoreEncryption: true })
        setPageCount(doc.getPageCount())
      } catch {
        toast('Could not read this PDF.', 'error')
      }
    },
    [toast],
  )

  const splitNow = async () => {
    if (!file) return
    let ranges: Array<[number, number]> = []
    if (mode === 'ranges') {
      try {
        ranges = parseRanges(rangesInput, pageCount || 1)
      } catch (e) {
        toast((e as Error).message, 'error')
        return
      }
      if (ranges.length === 0) {
        toast('Enter at least one range like 1-3, 5-8.', 'error')
        return
      }
    }
    setBusy(true)
    setOutputs([])
    try {
      const result = await splitPdf(file, mode, ranges)
      setOutputs(result)
      toast(`Created ${result.length} PDF${result.length > 1 ? 's' : ''}.`)
    } catch (e) {
      console.error(e)
      toast('Split failed. The PDF may be corrupt or protected.', 'error')
    } finally {
      setBusy(false)
    }
  }

  const downloadOne = (out: OutputFile) => {
    downloadBlob(new Blob([out.bytes], { type: 'application/pdf' }), out.name)
  }

  const downloadZip = async () => {
    if (outputs.length === 0) return
    setBusy(true)
    try {
      const zip = new JSZip()
      const base = file ? stripFileExtension(file.name) : 'split'
      for (const out of outputs) zip.file(out.name, out.bytes)
      const blob = await zip.generateAsync({ type: 'blob' })
      downloadBlob(blob, `${base}-split.zip`)
      toast(`Downloaded ${outputs.length} PDF${outputs.length > 1 ? 's' : ''} as a ZIP.`)
    } catch (e) {
      console.error(e)
      toast('ZIP export failed.', 'error')
    } finally {
      setBusy(false)
    }
  }

  const totalBytes = outputs.reduce((acc, o) => acc + o.size, 0)

  return (
    <>
      <Seo
        title="PDF Splitter by Pages or Ranges - Free Online | vimz Tools"
        description="Split a PDF into single pages or custom ranges like 1-3 and 5-8. Each range becomes a separate PDF, processed 100% in your browser."
      />
      <ToolShell
        title="PDF Splitter"
        description="Extract pages from a PDF either one-by-one or by custom ranges such as '1-3, 5-8'. Every piece comes out as its own PDF, built locally with pdf-lib."
        icon={<Scissors className="h-6 w-6" />}
        breadcrumb="PDF Utilities"
      >
        <div className="relative grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            {!file ? (
              <Dropzone
                onFiles={onFiles}
                accept=".pdf"
                multiple={false}
                label="Drop a PDF here to split it"
              />
            ) : (
              <div className="space-y-3">
                <div className="relative">
                  <FileChip file={file} index={0} onRemove={() => { setFile(null); setOutputs([]); setPageCount(0); }} />
                </div>
                <p className="text-sm font-medium text-slate-500">
                  {pageCount} page{pageCount !== 1 && 's'} ready to split
                </p>
                <div className="flex gap-2">
                  <Button onClick={splitNow} disabled={busy}>
                    {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Scissors className="h-4 w-4" />}
                    {busy ? 'Splitting...' : 'Split PDF'}
                  </Button>
                </div>
              </div>
            )}

            {outputs.length > 0 && (
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">
                      {outputs.length} PDF{outputs.length > 1 && 's'} · {formatBytes(totalBytes)}
                    </h3>
                    <p className="text-xs text-slate-400">Each range is a separate file.</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="secondary" onClick={() => setOutputs([])}>
                      Clear
                    </Button>
                    <Button onClick={downloadZip} disabled={busy}>
                      <Download className="h-4 w-4" /> Download ZIP
                    </Button>
                  </div>
                </div>
                <div className="max-h-80 divide-y divide-slate-100 overflow-y-auto">
                  {outputs.map((out) => (
                    <div key={out.name} className="flex items-center justify-between gap-3 px-5 py-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-700">{out.label}</p>
                        <p className="truncate text-xs text-slate-400">{out.name}</p>
                      </div>
                      <div className="flex shrink-0 items-center gap-3">
                        <span className="text-xs font-medium text-slate-400">{formatBytes(out.size)}</span>
                        <Button variant="ghost" onClick={() => downloadOne(out)} className="px-3 py-1.5 text-xs">
                          <Download className="h-3.5 w-3.5" /> Save
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="h-fit space-y-5 rounded-2xl border border-slate-200 bg-white p-5 lg:sticky lg:top-24">
            <h3 className="text-sm font-bold text-slate-800">Split options</h3>
            <div className="space-y-2.5">
              <button
                onClick={() => setMode('all')}
                className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left text-sm transition ${
                  mode === 'all'
                    ? 'border-primary-500 bg-primary-50 text-primary-800'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-primary-300'
                }`}
              >
                <span className="font-semibold">One PDF per page</span>
              </button>
              <button
                onClick={() => setMode('ranges')}
                className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left text-sm transition ${
                  mode === 'ranges'
                    ? 'border-primary-500 bg-primary-50 text-primary-800'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-primary-300'
                }`}
              >
                <span className="font-semibold">Custom ranges</span>
              </button>
            </div>

            {mode === 'ranges' && (
              <Field label={`Ranges (1-${pageCount || 'N'})`}>
                <input
                  type="text"
                  value={rangesInput}
                  onChange={(e) => setRangesInput(e.target.value)}
                  placeholder="1-3, 5, 8-10"
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 transition focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
                />
                <p className="mt-1 text-xs text-slate-400">
                  Use commas between ranges, e.g. <code>1-3, 5, 8-10</code>.
                </p>
              </Field>
            )}

            <Button onClick={splitNow} disabled={busy || !file} className="w-full">
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileStack className="h-4 w-4" />}
              {busy ? 'Splitting...' : 'Split PDF'}
            </Button>
            <p className="text-xs leading-relaxed text-slate-400">
              Overlapping ranges are merged automatically, so <code>1-3, 2-4</code> becomes one range.
            </p>
          </div>

          {busy && <LoadingOverlay message="Splitting your PDF..." />}
        </div>
      </ToolShell>
    </>
  )
}