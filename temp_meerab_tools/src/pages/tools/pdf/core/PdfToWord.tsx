import { useCallback, useState } from 'react'
import * as pdfjsLib from 'pdfjs-dist'
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url'
import { Document as DocxDocument, HeadingLevel, Packer, Paragraph, TextRun } from 'docx'
import { FileText, Loader2 } from 'lucide-react'
import ToolShell from '../../../../components/tools/ToolShell'
import Dropzone from '../../../../components/ui/Dropzone'
import { Button, Field } from '../../../../components/ui/Fields'
import { LoadingOverlay } from '../../../../components/ui/Spinner'
import { useToast } from '../../../../components/ui/Toast'
import Seo from '../../../../components/ui/Seo'
import { downloadBlob, formatBytes, readFileAsArrayBuffer, stripFileExtension } from '../../../../lib/utils'

pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl

interface TextItem {
  str: string
  x: number
  y: number
  width: number
  height: number
  fontName: string
}

interface PdfLine {
  y: number
  height: number
  items: TextItem[]
}

function buildLines(content: { items: unknown[] }): PdfLine[] {
  const lines: PdfLine[] = []
  let current: TextItem[] = []
  let lastY = 0

  const flush = () => {
    if (current.length === 0) return
    const lineItems = [...current]
    lineItems.sort((a, b) => a.x - b.x)
    lines.push({
      y: Math.max(...lineItems.map((i) => i.y)),
      height: Math.max(...lineItems.map((i) => i.height)),
      items: lineItems,
    })
    current = []
  }

  for (const raw of content.items) {
    const it = raw as unknown as {
      str: string
      transform: number[]
      width: number
      height: number
      fontName?: string
      hasEOL?: boolean
    }
    if (typeof it.str !== 'string' || it.str.trim() === '') continue
    const item: TextItem = {
      str: it.str,
      x: it.transform?.[4] ?? 0,
      y: it.transform?.[5] ?? 0,
      width: it.width ?? 0,
      height: it.height ?? 0,
      fontName: it.fontName ?? '',
    }
    if (current.length > 0 && Math.abs(item.y - lastY) > 1) flush()
    if (current.length === 0) lastY = item.y
    current.push(item)
    if (it.hasEOL) flush()
  }
  flush()

  lines.sort((a, b) => b.y - a.y)
  return lines
}

function linesToParagraphs(lines: PdfLine[]): Array<{ text: string; heading: boolean }> {
  const out: Array<{ text: string; heading: boolean }> = []
  const sizes = lines.map((l) => l.height).filter((h) => h > 0)
  const bodyMedian = sizes.length
    ? sizes.slice().sort((a, b) => a - b)[Math.floor(sizes.length / 2)]
    : 12

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    let text = ''
    let prevEnd = 0
    for (const it of line.items) {
      if (text.length === 0) {
        text += it.str
      } else {
        const gap = it.x - prevEnd
        const needsSpace = gap > 0.15 * Math.max(line.height, 6)
        if (needsSpace && !/[ \t]$/.test(text) && !/^[ \t]/.test(it.str)) text += ' '
        text += it.str
      }
      prevEnd = it.x + it.width
    }
    text = text.replace(/\s+/g, ' ').trim()
    if (!text) continue

    const isBold = line.items.some((it) => /bold/i.test(it.fontName))
    const isHeader = line.height > 1.35 * bodyMedian + 3 || (isBold && line.height > bodyMedian)

    if (i > 0) {
      const prev = lines[i - 1]
      const gap = prev.y - line.y - line.height
      const threshold = Math.max(10, prev.height * 1.6)
      if (gap > threshold) out.push({ text: '', heading: false })
    }
    out.push({ text, heading: isHeader })
  }
  return out
}

export default function PdfToWord() {
  const [file, setFile] = useState<File | null>(null)
  const [busy, setBusy] = useState(false)
  const [pageCount, setPageCount] = useState(0)
  const [preview, setPreview] = useState('')
  const [includePageMarks, setIncludePageMarks] = useState(true)
  const { toast } = useToast()

  const onFiles = useCallback(
    (files: File[]) => {
      const pdf = files[0]
      if (!pdf || !/\.pdf$/i.test(pdf.name)) {
        toast('Please choose a PDF file.', 'error')
        return
      }
      setFile(pdf)
      setPreview('')
      setPageCount(0)
    },
    [toast],
  )

  const convert = async () => {
    if (!file) return
    setBusy(true)
    setPreview('')
    try {
      const buffer = await readFileAsArrayBuffer(file)
      const loadingTask = pdfjsLib.getDocument({ data: buffer })
      const doc = await loadingTask.promise
      setPageCount(doc.numPages)

      const paragraphs: Array<{ text: string; heading: boolean }> = []
      const rawParts: string[] = []

      for (let p = 1; p <= doc.numPages; p++) {
        const page = await doc.getPage(p)
        const content = await page.getTextContent()
        const lines = buildLines(content)
        const block = linesToParagraphs(lines)

        if (includePageMarks && p > 1) {
          paragraphs.push({ text: '', heading: false })
          paragraphs.push({ text: `Page ${p}`, heading: true })
        }
        paragraphs.push(...block)
        rawParts.push(block.map((b) => b.text).filter(Boolean).join('\n\n'))
        page.cleanup()
      }
      await loadingTask.destroy()

      const docxParagraphs: Paragraph[] = [
        new Paragraph({ text: stripFileExtension(file.name), heading: HeadingLevel.TITLE }),
        new Paragraph({ children: [] }),
        ...paragraphs.map((p) =>
          p.heading
            ? new Paragraph({ text: p.text || '', heading: HeadingLevel.HEADING_2 })
            : new Paragraph({
                children: p.text ? [new TextRun({ text: p.text })] : [],
              }),
        ),
      ]

      const docx = new DocxDocument({
        sections: [
          {
            properties: {
              page: {
                margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
              },
            },
            children: docxParagraphs,
          },
        ],
      })

      const blob = await Packer.toBlob(docx)
      downloadBlob(blob, `${stripFileExtension(file.name)}.docx`)
      setPreview(rawParts.join('\n\n').slice(0, 3000))
      toast(`Extracted ${doc.numPages} page${doc.numPages > 1 ? 's' : ''} into an editable Word file.`)
    } catch (e) {
      console.error(e)
      toast('Failed to extract text. Scanned/image-only PDFs need OCR first.', 'error')
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <Seo
        title="PDF to Word Converter - Free Online | vimz Tools"
        description="Extract text, paragraphs and layout from any PDF and export it as an editable .docx file. 100% in-browser, free and private."
      />
      <ToolShell
        title="PDF to Word Converter"
        description="Turn PDF pages into an editable .docx document. Text, line breaks, headings and paragraph structure are preserved by PDF.js + docx, all locally."
        icon={<FileText className="h-6 w-6" />}
        breadcrumb="PDF Utilities"
      >
        <div className="relative grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            {!file ? (
              <Dropzone
                onFiles={onFiles}
                accept=".pdf"
                multiple={false}
                label="Drop a PDF here to convert it to Word"
              />
            ) : (
              <div className="flex flex-col items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 sm:flex-row">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-800">{file.name}</p>
                  <p className="text-xs text-slate-400">
                    {formatBytes(file.size)}
                    {pageCount > 0 && ` · ${pageCount} page${pageCount > 1 ? 's' : ''}`}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="secondary" onClick={() => { setFile(null); setPreview(''); setPageCount(0); }}>
                    Replace
                  </Button>
                  <Button onClick={convert} disabled={busy}>
                    {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
                    {busy ? 'Converting...' : 'Convert to Word'}
                  </Button>
                </div>
              </div>
            )}

            {preview && (
              <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <h3 className="mb-3 text-sm font-bold text-slate-800">Extracted preview</h3>
                <pre className="max-h-64 overflow-auto whitespace-pre-wrap rounded-xl bg-slate-50 p-4 text-xs leading-relaxed text-slate-600">
                  {preview}
                </pre>
                <p className="mt-3 text-xs text-slate-400">
                  Text-only extraction. Scanned PDFs without a text layer can't be converted without OCR.
                </p>
              </div>
            )}
          </div>

          <div className="h-fit space-y-5 rounded-2xl border border-slate-200 bg-white p-5 lg:sticky lg:top-24">
            <h3 className="text-sm font-bold text-slate-800">Word options</h3>
            <Field label="Structure">
              <label className="flex items-center gap-2.5 rounded-xl border border-slate-200 px-3.5 py-2.5">
                <input
                  type="checkbox"
                  checked={includePageMarks}
                  onChange={(e) => setIncludePageMarks(e.target.checked)}
                  className="h-4 w-4 accent-primary-600"
                />
                <span className="text-sm text-slate-700">Add page headings (Page 2, …)</span>
              </label>
            </Field>
            <Field label="Output">
              <p className="rounded-xl bg-slate-50 px-3.5 py-2.5 text-sm text-slate-600">
                .docx Word document
              </p>
            </Field>
            <Button onClick={convert} disabled={busy || !file} className="w-full">
              <FileText className="h-4 w-4" />
              {busy ? 'Converting...' : 'Download .docx'}
            </Button>
            <p className="text-xs leading-relaxed text-slate-400">
              Headings and paragraph breaks are estimated from text size, bold runs and vertical gaps.
            </p>
          </div>

          {busy && <LoadingOverlay message="Extracting text and building the Word file..." />}
        </div>
      </ToolShell>
    </>
  )
}