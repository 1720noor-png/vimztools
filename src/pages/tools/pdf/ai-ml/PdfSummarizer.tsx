import { useCallback, useState } from 'react'
import * as pdfjsLib from 'pdfjs-dist'
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url'
import { Copy, Download, FileText, Loader2, Sparkles } from 'lucide-react'
import ToolShell from '../../../../components/tools/ToolShell'
import Dropzone from '../../../../components/ui/Dropzone'
import { Button } from '../../../../components/ui/Fields'
import { LoadingOverlay } from '../../../../components/ui/Spinner'
import { useToast } from '../../../../components/ui/Toast'
import Seo from '../../../../components/ui/Seo'
import { downloadBlob, readFileAsArrayBuffer } from '../../../../lib/utils'

pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl

interface SummaryResult {
  sentences: string[]
  keyPoints: string[]
  keywords: string[]
  totalChars: number
}

const STOP = new Set([
  'a', 'an', 'the', 'and', 'or', 'but', 'if', 'then', 'else', 'for', 'of', 'to', 'in', 'on', 'at',
  'by', 'with', 'from', 'as', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has',
  'had', 'do', 'does', 'did', 'will', 'would', 'can', 'could', 'may', 'might', 'shall', 'should',
  'must', 'not', 'no', 'so', 'too', 'very', 'this', 'that', 'these', 'those', 'it', 'its', 'we',
  'you', 'they', 'he', 'she', 'i', 'me', 'my', 'our', 'their', 'your', 'us', 'his', 'her', 'them',
  'k', 'et', 'al', 'vs', 'via', 'per', 'pdf', 'page', 'pages', 'fig', 'figs', 'table', 'tables',
  'e.g.', 'i.e.', 'appx', 'etc', 'ie', 'eg', '&', 'x', 'w', 'r', 'c', 'p', 'pp',
])

function splitSentences(text: string): string[] {
  const normalized = text.replace(/\s+/g, ' ').trim()
  const parts = normalized.match(/[^.!?]+[.!?]+["')\]]*|[^.!?]+$/g) ?? []
  return parts
    .map((s) => s.trim())
    .filter((s) => s.length > 25 && s.length < 500)
}

function tokenize(s: string): string[] {
  return s.toLowerCase().match(/[a-z][a-z0-9'-]{1,}/g) ?? []
}

function summarize(text: string): SummaryResult {
  const sentences = splitSentences(text)
  if (sentences.length === 0) {
    return { sentences: [], keyPoints: [], keywords: [], totalChars: text.length }
  }

  const freq = new Map<string, number>()
  for (const s of sentences) {
    for (const w of tokenize(s)) {
      if (STOP.has(w) || w.length < 3) continue
      freq.set(w, (freq.get(w) ?? 0) + 1)
    }
  }

  const scored = sentences
    .map((s, idx) => {
      const words = tokenize(s)
      let score = words.length > 0 ? words.reduce((acc, w) => acc + (freq.get(w) ?? 0), 0) / words.length : 0
      if (idx === 0 || idx === 1) score += 1.5
      const up = s.match(/[A-Z]/)?.length ?? 0
      if (up / Math.max(words.length, 1) > 0.55) score += 1.2
      return { s, score, idx }
    })
    .sort((a, b) => b.score - a.score)

  const kept = Math.max(2, Math.min(6, Math.ceil(sentences.length * 0.3)))
  const top = scored.slice(0, kept).sort((a, b) => a.idx - b.idx).map((t) => t.s)

  const keywords = [...freq.entries()]
    .filter(([, n]) => n >= 2)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([w]) => w)

  const keyPoints = top.map((s) => {
    const words = tokenize(s)
    const trimmed = words.slice(0, 20).join(' ')
    return trimmed.length < s.length ? `${trimmed}…` : trimmed
  })

  return { sentences: top, keyPoints, keywords, totalChars: text.length }
}

export default function PdfSummarizer() {
  const [file, setFile] = useState<File | null>(null)
  const [busy, setBusy] = useState(false)
  const [summary, setSummary] = useState<SummaryResult | null>(null)
  const { toast } = useToast()

  const onFiles = useCallback(
    (files: File[]) => {
      const pdf = files[0]
      if (!pdf || !/\.pdf$/i.test(pdf.name)) {
        toast('Please choose a valid PDF file.', 'error')
        return
      }
      setFile(pdf)
      setSummary(null)
    },
    [toast],
  )

  const run = async () => {
    if (!file) return
    setBusy(true)
    setSummary(null)
    try {
      const buffer = await readFileAsArrayBuffer(file)
      const loadingTask = pdfjsLib.getDocument({ data: buffer })
      const doc = await loadingTask.promise
      const chunks: string[] = []
      for (let i = 1; i <= doc.numPages; i++) {
        const page = await doc.getPage(i)
        const content = await page.getTextContent()
        let text = ''
        for (const item of content.items) {
          if ('str' in item && item.str) text += `${item.str} `
        }
        chunks.push(text.trim())
        page.cleanup()
      }
      await loadingTask.destroy()
      const result = summarize(chunks.join('\n\n'))
      setSummary(result)
      toast(`Summarized ${result.totalChars.toLocaleString()} characters with keywords.`)
    } catch (e) {
      console.error(e)
      toast('Could not read this PDF. Scanned files need OCR first.', 'error')
    } finally {
      setBusy(false)
    }
  }

  const reset = () => {
    setFile(null)
    setSummary(null)
  }

  const copyText = async () => {
    if (!summary) return
    const parts = ['Summary:', ...summary.sentences.map((s, i) => `${i + 1}. ${s}`), '', 'Key notes:', ...summary.keyPoints.map((p) => `- ${p}`)]
    const joined = parts.join('\n')
    try {
      await navigator.clipboard.writeText(joined)
      toast('Copied summary to clipboard.')
    } catch {
      toast('Could not access the clipboard.', 'error')
    }
  }

  const downloadText = () => {
    if (!summary) return
    const parts = [
      'AI PDF Summary (extractive)',
      '',
      'SUMMARY',
      ...summary.sentences.map((s, i) => `${i + 1}. ${s}`),
      '',
      'KEY NOTES',
      ...summary.keyPoints.map((p) => `- ${p}`),
      '',
      `KEYWORDS: ${summary.keywords.join(', ')}`,
    ]
    downloadBlob(new Blob([parts.join('\n')], { type: 'text/plain;charset=utf-8' }), 'pdf-summary.txt')
    toast('Downloaded summary notes.')
  }

  return (
    <>
      <Seo
        title="PDF Summarizer & Key Notes - Free Online | vimz Tools"
        description="Generate a concise summary and key bullet notes from any PDF document with an extractive AI that runs entirely in your browser."
      />
      <ToolShell
        title="PDF Summarizer & Key Notes"
        description="Ingest a whole PDF, let an extractive AI pick the most important sentences, and get a clean summary plus bullet notes and keywords. Runs fully on your device."
        icon={<Sparkles className="h-6 w-6" />}
        breadcrumb="PDF Utilities"
        instruction="Tip: works best on text-based PDFs like papers and reports. Scans should be OCR-ed first."
      >
        <div className="relative grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            {!file ? (
              <Dropzone
                onFiles={onFiles}
                accept=".pdf"
                multiple={false}
                label="Drop a PDF here to summarize it"
              />
            ) : (
              <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5">
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-800">{file.name}</p>
                    <p className="text-xs text-slate-400">Extracted and summarized on-device.</p>
                  </div>
                  <Button variant="secondary" onClick={reset}>
                    Replace
                  </Button>
                </div>
                <Button onClick={run} disabled={busy}>
                  {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                  {busy ? 'Summarizing...' : 'Generate summary'}
                </Button>
              </div>
            )}

            {summary && (
              <div className="space-y-6">
                <div className="rounded-2xl border border-slate-200 bg-white p-6">
                  <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-800">
                    <FileText className="h-4 w-4 text-primary-600" /> Summary
                  </h3>
                  <ol className="space-y-3">
                    {summary.sentences.map((s, i) => (
                      <li key={i} className="flex gap-3 text-sm leading-relaxed text-slate-700">
                        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary-100 text-[11px] font-bold text-primary-700">
                          {i + 1}
                        </span>
                        {s}
                      </li>
                    ))}
                  </ol>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-6">
                  <h3 className="mb-3 text-sm font-bold text-slate-800">Key notes</h3>
                  <ul className="space-y-2">
                    {summary.keyPoints.map((p, i) => (
                      <li key={i} className="flex gap-2 text-sm leading-relaxed text-slate-700">
                        <span className="mt-0.5">-</span>
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>

                {summary.keywords.length > 0 && (
                  <div className="rounded-2xl border border-slate-200 bg-white p-6">
                    <h3 className="mb-3 text-sm font-bold text-slate-800">Keywords</h3>
                    <div className="flex flex-wrap gap-2">
                      {summary.keywords.map((k) => (
                        <span key={k} className="rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700">
                          {k}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap gap-2">
                  <Button variant="secondary" onClick={copyText}>
                    <Copy className="h-4 w-4" /> Copy notes
                  </Button>
                  <Button onClick={downloadText}>
                    <Download className="h-4 w-4" /> Download .txt
                  </Button>
                </div>
              </div>
            )}
          </div>

          <div className="h-fit space-y-4 rounded-2xl border border-slate-200 bg-white p-5 lg:sticky lg:top-24">
            <h3 className="text-sm font-bold text-slate-800">How the summary works</h3>
            <p className="text-sm leading-relaxed text-slate-600">
              The tool uses extractive summarization: it reads every page, scores sentences by how many
              rare keywords they contain, and keeps the top passages in reading order.
            </p>
            <ul className="space-y-2 text-sm text-slate-600">
              <li>Runs 100% locally - no text is uploaded.</li>
              <li>Great for studies, reports and long articles.</li>
              <li>Short filler words are ignored automatically.</li>
            </ul>
          </div>

          {busy && <LoadingOverlay message="Reading and summarizing your PDF..." />}
        </div>
      </ToolShell>
    </>
  )
}