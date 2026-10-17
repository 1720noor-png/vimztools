import { useCallback, useMemo, useState } from 'react'
import { PDFDocument, rgb } from 'pdf-lib'
import * as pdfjsLib from 'pdfjs-dist'
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url'
import { Loader2, ShieldCheck } from 'lucide-react'
import ToolShell from '../../../../components/tools/ToolShell'
import Dropzone from '../../../../components/ui/Dropzone'
import { Button, Field, TextArea } from '../../../../components/ui/Fields'
import { LoadingOverlay } from '../../../../components/ui/Spinner'
import { useToast } from '../../../../components/ui/Toast'
import Seo from '../../../../components/ui/Seo'
import { downloadBlob, readFileAsArrayBuffer, stripFileExtension } from '../../../../lib/utils'

pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl

interface MatchInfo {
  page: number
  count: number
}

const EMAIL_RE = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/gi
const PHONE_RE = /\+?[\d][\d\s().-]{7,}\d/g
const CARD_RE = /\d[\d -]{11,18}\d/g

export default function PdfRedactor() {
  const [file, setFile] = useState<File | null>(null)
  const [busy, setBusy] = useState(false)
  const [terms, setTerms] = useState('')
  const [autoEmail, setAutoEmail] = useState(true)
  const [autoPhone, setAutoPhone] = useState(false)
  const [autoCard, setAutoCard] = useState(false)
  const [matches, setMatches] = useState<MatchInfo[]>([])
  const [totalRedacted, setTotalRedacted] = useState(0)
  const { toast } = useToast()

  const onFiles = useCallback(
    (files: File[]) => {
      const pdf = files[0]
      if (!pdf || !/\.pdf$/i.test(pdf.name)) {
        toast('Please choose a valid PDF file.', 'error')
        return
      }
      setFile(pdf)
      setMatches([])
      setTotalRedacted(0)
    },
    [toast],
  )

  const termList = useMemo(
    () =>
      terms
        .split(',')
        .map((t) => t.trim())
        .filter((t) => t.length > 1 && t.length <= 60),
    [terms],
  )

  const nothingToRedact = termList.length === 0 && !autoEmail && !autoPhone && !autoCard

  const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

  const regexFor = (term: string) => new RegExp(escapeRe(term), 'gi')

  const autoPatterns = useMemo(() => {
    const patterns: Array<{ src: RegExp; label: string; active: boolean }> = [
      { src: EMAIL_RE, label: 'email', active: autoEmail },
      { src: PHONE_RE, label: 'phone', active: autoPhone },
      { src: CARD_RE, label: 'card', active: autoCard },
    ]
    return patterns.filter((p) => p.active)
  }, [autoEmail, autoPhone, autoCard])

  const countOccurrences = (text: string): number => {
    let n = 0
    for (const t of termList) n += (text.match(regexFor(t)) ?? []).length
    for (const p of autoPatterns) n += (text.match(p.src) ?? []).length
    return n
  }

  const analyze = async () => {
    if (!file) return
    if (nothingToRedact) {
      toast('Add at least one term or enable an auto rule.', 'error')
      return
    }
    setBusy(true)
    setMatches([])
    setTotalRedacted(0)
    try {
      const buffer = await readFileAsArrayBuffer(file)
      const loadingTask = pdfjsLib.getDocument({ data: buffer })
      const doc = await loadingTask.promise
      const perPage: MatchInfo[] = []

      for (let i = 1; i <= doc.numPages; i++) {
        const page = await doc.getPage(i)
        const content = await page.getTextContent()
        let count = 0
        for (const item of content.items) {
          if ('str' in item && item.str) count += countOccurrences(item.str)
        }
        if (count > 0) perPage.push({ page: i, count })
        page.cleanup()
      }
      await loadingTask.destroy()
      const total = perPage.reduce((acc, m) => acc + m.count, 0)
      setMatches(perPage)
      setTotalRedacted(total)
      toast(`Found ${total} match${total !== 1 ? 'es' : ''} across ${perPage.length} page${perPage.length !== 1 ? 's' : ''}.`)
    } catch (e) {
      console.error(e)
      toast('Could not read this PDF.', 'error')
    } finally {
      setBusy(false)
    }
  }

  const rangesFor = (text: string): Array<{ start: number; end: number }> => {
    const ranges: Array<{ start: number; end: number }> = []
    for (const t of termList) {
      const re = regexFor(t)
      let m: RegExpExecArray | null
      while ((m = re.exec(text)) !== null) {
        ranges.push({ start: m.index, end: m.index + m[0].length })
      }
    }
    for (const p of autoPatterns) {
      let m: RegExpExecArray | null
      while ((m = p.src.exec(text)) !== null) {
        ranges.push({ start: m.index, end: m.index + m[0].length })
      }
    }
    return ranges
  }

  const redact = async () => {
    if (!file) return
    if (nothingToRedact) {
      toast('Add at least one term or enable an auto rule.', 'error')
      return
    }
    setBusy(true)
    try {
      const buffer = await readFileAsArrayBuffer(file)
      const doc = await PDFDocument.load(buffer, { ignoreEncryption: true })
      const loadingTask = pdfjsLib.getDocument({ data: buffer })
      const src = await loadingTask.promise

      let redactedTotal = 0

      for (let i = 1; i <= src.numPages; i++) {
        const page = await src.getPage(i)
        const content = await page.getTextContent()
        const boxes: Array<{ x: number; y: number; w: number; h: number }> = []

        for (const item of content.items) {
          if (!('str' in item) || !item.str) continue
          const text = item.str
          const ranges = rangesFor(text)
          if (ranges.length === 0) continue

          const tx = item.transform[4]
          const ty = item.transform[5]
          const fontH = (item as { height?: number }).height ?? 12
          const w = item.width
          const perChar = w / Math.max(text.length, 1)

          for (const r of ranges) {
            const startX = tx + r.start * perChar
            const rw = (r.end - r.start) * perChar
            boxes.push({ x: startX, y: ty, w: rw + 1, h: fontH })
            redactedTotal += 1
          }
        }

        if (boxes.length > 0) {
          const outPage = doc.getPage(i - 1)
          const { height } = outPage.getSize()
          for (const b of boxes) {
            outPage.drawRectangle({
              x: b.x,
              y: height - (b.y + b.h),
              width: b.w,
              height: b.h,
              color: rgb(0, 0, 0),
            })
          }
        }
        page.cleanup()
      }
      await loadingTask.destroy()

      const bytes = await doc.save()
      downloadBlob(new Blob([new Uint8Array(bytes)], { type: 'application/pdf' }), `${stripFileExtension(file.name)}-redacted.pdf`)
      setMatches([])
      setTotalRedacted(redactedTotal)
      toast(`Redacted ${redactedTotal} text region${redactedTotal !== 1 ? 's' : ''}.`)
    } catch (e) {
      console.error(e)
      toast('Redaction failed. The PDF may be protected or use unsupported fonts.', 'error')
    } finally {
      setBusy(false)
    }
  }

  const reset = () => {
    setFile(null)
    setTerms('')
    setMatches([])
    setTotalRedacted(0)
  }

  return (
    <>
      <Seo
        title="PDF Redactor (PII Blackout) - Free Online | vimz Tools"
        description="Permanently black out sensitive information like names and emails in a PDF. Redaction runs entirely in your browser - free and private."
      />
      <ToolShell
        title="PDF Redactor (PII Blackout)"
        description="Type the terms you want to hide (names, addresses, card numbers) and let auto-rules catch emails, phones and card numbers, then burn solid black boxes over every match. The redaction is permanent."
        icon={<ShieldCheck className="h-6 w-6" />}
        breadcrumb="PDF Utilities"
        instruction="Keep the original file somewhere safe - once redacted, the text is gone forever."
      >
        <div className="relative grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            {!file ? (
              <Dropzone
                onFiles={onFiles}
                accept=".pdf"
                multiple={false}
                label="Drop a PDF here to redact sensitive text"
              />
            ) : (
              <div className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5">
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-800">{file.name}</p>
                    <p className="text-xs text-slate-400">Redacted on-device, never uploaded.</p>
                  </div>
                  <Button variant="secondary" onClick={reset}>
                    Replace
                  </Button>
                </div>

                <Field label="Terms to redact (comma separated)">
                  <TextArea
                    value={terms}
                    onChange={(e) => setTerms(e.target.value)}
                    rows={3}
                    placeholder="e.g. John Smith, john@example.com, Blue Corp"
                  />
                  <p className="mt-1 text-xs text-slate-400">
                    Terms match anywhere inside a line of text, case-insensitive.
                  </p>
                </Field>

                <div className="space-y-2">
                  <p className="text-xs font-semibold text-slate-500">Auto rules</p>
                  <label className="flex cursor-pointer items-center gap-2.5 text-sm text-slate-700">
                    <input
                      type="checkbox"
                      checked={autoEmail}
                      onChange={(e) => setAutoEmail(e.target.checked)}
                      className="h-4 w-4 rounded border-slate-300 accent-primary-600"
                    />
                    Email addresses
                  </label>
                  <label className="flex cursor-pointer items-center gap-2.5 text-sm text-slate-700">
                    <input
                      type="checkbox"
                      checked={autoPhone}
                      onChange={(e) => setAutoPhone(e.target.checked)}
                      className="h-4 w-4 rounded border-slate-300 accent-primary-600"
                    />
                    Phone numbers
                  </label>
                  <label className="flex cursor-pointer items-center gap-2.5 text-sm text-slate-700">
                    <input
                      type="checkbox"
                      checked={autoCard}
                      onChange={(e) => setAutoCard(e.target.checked)}
                      className="h-4 w-4 rounded border-slate-300 accent-primary-600"
                    />
                    Card numbers (13-19 digits)
                  </label>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button variant="secondary" onClick={analyze} disabled={busy}>
                    {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                    {busy ? 'Scanning...' : 'Preview matches'}
                  </Button>
                  <Button onClick={redact} disabled={busy}>
                    {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
                    {busy ? 'Redacting...' : 'Redact & download'}
                  </Button>
                </div>
              </div>
            )}
          </div>

          <div className="h-fit space-y-4 rounded-2xl border border-slate-200 bg-white p-5 lg:sticky lg:top-24">
            <h3 className="text-sm font-bold text-slate-800">Match report</h3>
            {matches.length === 0 ? (
              <p className="text-sm text-slate-400">Not scanned yet.</p>
            ) : (
              <>
                <p className="text-sm text-slate-600">
                  <span className="font-bold text-slate-800">{totalRedacted}</span> places found on{' '}
                  {matches.length} page{matches.length !== 1 && 's'}.
                </p>
                <div className="max-h-56 space-y-1.5 overflow-y-auto">
                  {matches.map((m) => (
                    <div
                      key={m.page}
                      className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-xs"
                    >
                      <span className="font-semibold text-slate-600">Page {m.page}</span>
                      <span className="text-slate-400">{m.count} match{m.count !== 1 && 'es'}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {busy && <LoadingOverlay message="Working on your PDF..." />}
        </div>
      </ToolShell>
    </>
  )
}