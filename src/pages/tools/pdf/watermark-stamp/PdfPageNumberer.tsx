import { useCallback, useState } from 'react'
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'
import { Download, Loader2, ListOrdered } from 'lucide-react'
import ToolShell from '../../../../components/tools/ToolShell'
import Dropzone from '../../../../components/ui/Dropzone'
import { Button, Field, Select, TextInput } from '../../../../components/ui/Fields'
import { LoadingOverlay } from '../../../../components/ui/Spinner'
import { useToast } from '../../../../components/ui/Toast'
import Seo from '../../../../components/ui/Seo'
import { downloadBlob, readFileAsArrayBuffer, stripFileExtension } from '../../../../lib/utils'

type VPos = 'top' | 'bottom'
type HPos = 'left' | 'center' | 'right'

export default function PdfPageNumberer() {
  const [file, setFile] = useState<File | null>(null)
  const [busy, setBusy] = useState(false)
  const [vpos, setVPos] = useState<VPos>('bottom')
  const [hpos, setHPos] = useState<HPos>('center')
  const [template, setTemplate] = useState('Page {n} of {total}')
  const [start, setStart] = useState(1)
  const [size, setSize] = useState(10)
  const [margin, setMargin] = useState(30)
  const [color, setColor] = useState('#334155')
  const [stampText, setStampText] = useState('')
  const [stampVpos, setStampVPos] = useState<VPos>('top')
  const [stampHpos, setStampHPos] = useState<HPos>('right')
  const { toast } = useToast()

  const onFiles = useCallback(
    (files: File[]) => {
      const pdf = files[0]
      if (!pdf || !/\.pdf$/i.test(pdf.name)) {
        toast('Please choose a valid PDF file.', 'error')
        return
      }
      setFile(pdf)
    },
    [toast],
  )

  const hexToRgb = (hex: string) => {
    const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim())
    if (!m) return rgb(0.2, 0.23, 0.33)
    const n = parseInt(m[1], 16)
    return rgb(((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255)
  }

  const resolveText = (n: number, total: number) =>
    template
      .replaceAll('{n}', String(start + n - 1))
      .replaceAll('{page}', String(start + n - 1))
      .replaceAll('{total}', String(total))

  const apply = async () => {
    if (!file) return
    setBusy(true)
    try {
      const doc = await PDFDocument.load(await readFileAsArrayBuffer(file), { ignoreEncryption: true })
      const font = await doc.embedFont(StandardFonts.Helvetica)
      const pages = doc.getPages()
      const total = pages.length
      const stroke = hexToRgb(color)
      const base = stripFileExtension(file.name)

      const measure = (text: string, f: typeof font, s: number) => f.widthOfTextAtSize(text, s)

      for (let i = 0; i < total; i++) {
        const page = pages[i]
        let { width, height } = page.getSize()
        if (page.getRotation().angle % 180 !== 0) {
          const t = width
          width = height
          height = t
        }

        const centerX = width / 2
        const putText = (text: string, vp: VPos, hp: HPos, f: typeof font, s: number, m: number) => {
          if (!text) return
          const tw = measure(text, f, s)
          let x = m
          if (hp === 'center') x = centerX - tw / 2
          if (hp === 'right') x = width - m - tw
          const y = vp === 'top' ? height - m - s : m
          page.drawText(text, { x, y, size: s, font: f, color: stroke })
        }

        const numText = resolveText(i + 1, total)
        putText(numText, vpos, hpos, font, size, margin)
        if (stampText.trim()) {
          putText(stampText.trim(), stampVpos, stampHpos, font, size, margin + 14)
        }
      }

      const bytes = await doc.save()
      downloadBlob(new Blob([new Uint8Array(bytes)], { type: 'application/pdf' }), `${base}-numbered.pdf`)
      toast(`Numbered ${total} page${total > 1 ? 's' : ''}.`)
    } catch (e) {
      console.error(e)
      toast('Failed to process this PDF.', 'error')
    } finally {
      setBusy(false)
    }
  }

  const reset = () => setFile(null)

  return (
    <>
      <Seo
        title="PDF Page Numberer & Stamper - Free Online | vimz Tools"
        description="Add page numbers, custom labels, headers and footer stamps to a PDF with a flexible template - processed entirely in your browser."
      />
      <ToolShell
        title="PDF Page Numberer & Stamper"
        description="Stamp page numbers like 'Page 1 of 12' anywhere on the page, or add your own label text such as a company name or document title. Everything is drawn locally with pdf-lib."
        icon={<ListOrdered className="h-6 w-6" />}
        breadcrumb="PDF Utilities"
      >
        <div className="relative grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            {!file ? (
              <Dropzone
                onFiles={onFiles}
                accept=".pdf"
                multiple={false}
                label="Drop a PDF here to number its pages"
              />
            ) : (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-800">{file.name}</p>
                    <p className="text-xs text-slate-400">Label preview: {resolveText(1, 12)} · {resolveText(12, 12)}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="secondary" onClick={reset}>
                      Replace
                    </Button>
                    <Button onClick={apply} disabled={busy}>
                      {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                      {busy ? 'Numbering...' : 'Apply & download'}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            <div className="h-fit space-y-5 rounded-2xl border border-slate-200 bg-white p-5">
              <h3 className="text-sm font-bold text-slate-800">Page number settings</h3>
              <Field label="Label template">
                <TextInput
                  value={template}
                  onChange={(e) => setTemplate(e.target.value)}
                  placeholder="Page {n} of {total}"
                />
                <p className="mt-1 text-xs text-slate-400">
                  Use <code>{'{n}'}</code> for the number and <code>{'{total}'}</code> for the total.
                </p>
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Start number">
                  <TextInput
                    type="number"
                    min={0}
                    value={start}
                    onChange={(e) => setStart(Number(e.target.value))}
                  />
                </Field>
                <Field label="Font size">
                  <TextInput
                    type="number"
                    min={6}
                    max={72}
                    value={size}
                    onChange={(e) => setSize(Number(e.target.value))}
                  />
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Vertical position">
                  <Select value={vpos} onChange={(e) => setVPos(e.target.value as VPos)}>
                    <option value="top">Top</option>
                    <option value="bottom">Bottom</option>
                  </Select>
                </Field>
                <Field label="Horizontal position">
                  <Select value={hpos} onChange={(e) => setHPos(e.target.value as HPos)}>
                    <option value="left">Left</option>
                    <option value="center">Center</option>
                    <option value="right">Right</option>
                  </Select>
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field label={`Edge margin: ${margin}pt`}>
                  <input
                    type="range"
                    min={10}
                    max={100}
                    value={margin}
                    onChange={(e) => setMargin(Number(e.target.value))}
                    className="w-full accent-primary-600"
                  />
                </Field>
                <Field label="Text color">
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="h-10 w-full cursor-pointer rounded-xl border border-slate-300 bg-white"
                  />
                </Field>
              </div>
            </div>

            <div className="h-fit space-y-4 rounded-2xl border border-slate-200 bg-white p-5">
              <h3 className="text-sm font-bold text-slate-800">Extra sticker / header</h3>
              <Field label="Stamp text (optional)">
                <TextInput
                  value={stampText}
                  onChange={(e) => setStampText(e.target.value)}
                  placeholder="e.g. CONFIDENTIAL or My Company"
                />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Vertical position">
                  <Select value={stampVpos} onChange={(e) => setStampVPos(e.target.value as VPos)}>
                    <option value="top">Top</option>
                    <option value="bottom">Bottom</option>
                  </Select>
                </Field>
                <Field label="Horizontal position">
                  <Select value={stampHpos} onChange={(e) => setStampHPos(e.target.value as HPos)}>
                    <option value="left">Left</option>
                    <option value="center">Center</option>
                    <option value="right">Right</option>
                  </Select>
                </Field>
              </div>
            </div>

            <Button onClick={apply} disabled={busy || !file} className="w-full">
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <ListOrdered className="h-4 w-4" />}
              {busy ? 'Numbering...' : 'Apply & download PDF'}
            </Button>
          </div>
          {busy && <LoadingOverlay message="Numbering your pages..." />}
        </div>
      </ToolShell>
    </>
  )
}