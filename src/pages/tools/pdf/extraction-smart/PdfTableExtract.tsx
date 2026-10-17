import { useCallback, useMemo, useState } from 'react'
import * as pdfjsLib from 'pdfjs-dist'
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url'
import { Download, Loader2, Table2 } from 'lucide-react'
import ToolShell from '../../../../components/tools/ToolShell'
import Dropzone from '../../../../components/ui/Dropzone'
import { Button, Field, Select } from '../../../../components/ui/Fields'
import { LoadingOverlay } from '../../../../components/ui/Spinner'
import { useToast } from '../../../../components/ui/Toast'
import Seo from '../../../../components/ui/Seo'
import { downloadBlob, readFileAsArrayBuffer, stripFileExtension } from '../../../../lib/utils'

pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl

interface Dim {
  page: number
  rows: number
  cols: number
}

interface TextItemLike {
  str: string
  transform: number[]
}

interface ParserState {
  segments: string
  csv: string
  totalCells: number
  dims: Dim[]
}

const ROW_TOLERANCE = 4
const COL_TOLERANCE = 8

function clusters(values: number[], tolerance: number): number[] {
  const sorted = [...values].sort((a, b) => a - b)
  const centers: number[] = []
  for (const v of sorted) {
    const last = centers[centers.length - 1]
    if (last != null && v - last <= tolerance) continue
    centers.push(v)
  }
  return centers
}

async function parseTable(buffer: ArrayBuffer): Promise<ParserState> {
  const loadingTask = pdfjsLib.getDocument({ data: buffer })
  const doc = await loadingTask.promise
  const segments: string[] = []
  const rowsAll: string[][] = []
  const dimsOut: Dim[] = []
  const dimsSnippet: string[] = []

  for (let p = 1; p <= doc.numPages; p++) {
    const page = await doc.getPage(p)
    const content = await page.getTextContent()
    const items = content.items.filter(
      (it) => 'str' in it && !!it.str && it.str.trim().length > 0,
    ) as unknown as TextItemLike[]
    if (items.length === 0) {
      dimsSnippet.push(`Page ${p}: no text`)
      continue
    }

    const ys = clusters(items.map((it) => it.transform[5]), ROW_TOLERANCE)
    const xs = clusters(items.map((it) => it.transform[4]), COL_TOLERANCE)

    const rows: Array<{ y: number; cells: Array<{ x: number; text: string }> }> = ys.map((y) => ({ y, cells: [] }))
    for (const it of items) {
      const y = ys[closestIndex(ys, it.transform[5])]
      const row = rows.find((r) => Math.abs(r.y - y) < 1)
      if (!row) continue
      row.cells.push({
        x: it.transform[4],
        text: it.str.trim(),
      })
    }

    for (const row of rows) row.cells.sort((a, b) => a.x - b.x)

    const nCols = Math.max(...rows.map((r) => r.cells.length), 0)
    dimsOut.push({ page: p, rows: rows.length, cols: nCols })
    for (const row of rows) {
      const line: string[] = new Array(nCols).fill('')
      for (const c of row.cells) {
        const col = closestIndex(xs, c.x)
        if (col >= 0 && col < nCols) line[col] = c.text
      }
      rowsAll.push(line)
    }
    dimsSnippet.push(`Page ${p}: ${rows.length} rows × ${nCols} cols`)
    page.cleanup()
  }
  await loadingTask.destroy()

  const totalCells = rowsAll.reduce((a, r) => a + r.length, 0)
  const csv = rowsAll.map((r) => r.map(escapeCsv).join(',')).join('\n')
  segments.push(dimsSnippet.join('\n'))
  segments.push('')
  segments.push(csv)

  return {
    segments: segments.join('\n'),
    csv,
    totalCells,
    dims: dimsOut,
  }
}

function closestIndex(sorted: number[], value: number): number {
  let best = 0
  let bestDist = Infinity
  for (let i = 0; i < sorted.length; i++) {
    const d = Math.abs(sorted[i] - value)
    if (d < bestDist) {
      bestDist = d
      best = i
    }
  }
  return best
}

function escapeCsv(s: string): string {
  const v = s.replace(/"/g, '""')
  return /[",\n]/.test(v) ? `"${v}"` : v
}

export default function PdfTableExtract() {
  const [file, setFile] = useState<File | null>(null)
  const [busy, setBusy] = useState(false)
  const [result, setResult] = useState<ParserState | null>(null)
  const [dims, setDims] = useState<Dim[]>([])
  const [format, setFormat] = useState<'csv' | 'tsv'>('csv')
  const { toast } = useToast()

  const onFiles = useCallback(
    (files: File[]) => {
      const pdf = files[0]
      if (!pdf || !/\.pdf$/i.test(pdf.name)) {
        toast('Please choose a valid PDF file.', 'error')
        return
      }
      setFile(pdf)
      setResult(null)
      setDims([])
    },
    [toast],
  )

  const extract = async () => {
    if (!file) return
    setBusy(true)
    setResult(null)
    try {
      const buffer = await readFileAsArrayBuffer(file)
      const state = await parseTable(buffer)
      setResult(state)
      setDims(state.dims)
      toast(`Found ${state.totalCells.toLocaleString()} cells across the document.`)
    } catch (e) {
      console.error(e)
      toast('Could not extract tables. The PDF may be a scan (try OCR first).', 'error')
    } finally {
      setBusy(false)
    }
  }

  const downloadSpreadsheet = () => {
    if (!result) return
    const base = stripFileExtension(file?.name ?? 'pdf')
    if (format === 'tsv') {
      const tsv = result.csv.split('\n').map((line) => line.split(',').map(unquote).join('\t')).join('\n')
      downloadBlob(new Blob([tsv], { type: 'text/tab-separated-values;charset=utf-8' }), `${base}-table.tsv`)
    } else {
      downloadBlob(new Blob([result.csv], { type: 'text/csv;charset=utf-8' }), `${base}-table.csv`)
    }
    toast(`Saved spreadsheet as ${format === 'csv' ? 'CSV' : 'TSV'}.`)
  }

  const copyCsv = async () => {
    if (!result) return
    try {
      await navigator.clipboard.writeText(result.csv)
      toast('Copied table to clipboard.')
    } catch {
      toast('Could not access the clipboard.', 'error')
    }
  }

  const reset = () => {
    setFile(null)
    setResult(null)
    setDims([])
  }

  const previewLines = useMemo(() => {
    if (!result) return []
    return result.csv.split('\n').slice(0, 30)
  }, [result])

  return (
    <>
      <Seo
        title="PDF Table to CSV / Excel - Free Online | vimz Tools"
        description="Detect data tables inside a PDF and export them as CSV or TSV for Excel. Table extraction happens entirely in your browser."
      />
      <ToolShell
        title="PDF Table to CSV / Excel"
        description="Find tables inside a PDF by analyzing text positions, then export every page as clean rows and columns ready for Excel, Sheets or your data tools."
        icon={<Table2 className="h-6 w-6" />}
        breadcrumb="PDF Utilities"
        instruction="Tip: run the OCR tool first on scanned documents so the text layer can be read."
      >
        <div className="relative grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            {!file ? (
              <Dropzone
                onFiles={onFiles}
                accept=".pdf"
                multiple={false}
                label="Drop a PDF here to extract its tables"
              />
            ) : (
              <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5">
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-800">{file.name}</p>
                    <p className="text-xs text-slate-400">Parsed on-device, never uploaded.</p>
                  </div>
                  <Button variant="secondary" onClick={reset}>
                    Replace
                  </Button>
                </div>
                <Button onClick={extract} disabled={busy}>
                  {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Table2 className="h-4 w-4" />}
                  {busy ? 'Parsing...' : 'Extract tables'}
                </Button>
              </div>
            )}

            {result && (
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">
                      {result.totalCells.toLocaleString()} cells detected
                    </h3>
                    {dims.length > 0 && (
                      <p className="text-xs text-slate-400">
                        {dims.map((d) => `p${d.page} ${d.rows}×${d.cols}`).join(' · ')}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="secondary" onClick={copyCsv}>
                      Copy
                    </Button>
                    <Button onClick={downloadSpreadsheet}>
                      <Download className="h-4 w-4" /> Download
                    </Button>
                  </div>
                </div>
                <div className="max-h-96 overflow-auto">
                  <table className="w-full text-left text-sm">
                    <tbody>
                      {previewLines.map((line, i) => (
                        <tr key={i} className="border-b border-slate-50">
                          {line.split(',').slice(0, 8).map((cell, c) => (
                            <td key={c} className="max-w-56 truncate whitespace-pre px-4 py-2 align-top text-slate-700">
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          <div className="h-fit space-y-5 rounded-2xl border border-slate-200 bg-white p-5 lg:sticky lg:top-24">
            <h3 className="text-sm font-bold text-slate-800">Export options</h3>
            <Field label="File format">
              <Select value={format} onChange={(e) => setFormat(e.target.value as 'csv' | 'tsv')}>
                <option value="csv">CSV (Excel friendly)</option>
                <option value="tsv">TSV (tab separated)</option>
              </Select>
            </Field>
            <Button onClick={downloadSpreadsheet} disabled={!result} className="w-full">
              <Download className="h-4 w-4" /> Download file
            </Button>
            <p className="text-xs leading-relaxed text-slate-400">
              Complex or multi-column layouts may need manual clean-up after export.
            </p>
          </div>

          {busy && <LoadingOverlay message="Detecting tables in your PDF..." />}
        </div>
      </ToolShell>
    </>
  )
}

function unquote(s: string): string {
  if (s.startsWith('"') && s.endsWith('"')) return s.slice(1, -1).replace(/""/g, '"')
  return s
}