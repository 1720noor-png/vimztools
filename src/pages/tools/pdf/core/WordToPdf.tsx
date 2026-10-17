import { useCallback, useState } from 'react'
import mammoth from 'mammoth'
import html2pdf from 'html2pdf.js'
import { FileText, Trash2 } from 'lucide-react'
import ToolShell from '../../../../components/tools/ToolShell'
import Dropzone, { FileChip } from '../../../../components/ui/Dropzone'
import { Button, Field, Select } from '../../../../components/ui/Fields'
import { LoadingOverlay } from '../../../../components/ui/Spinner'
import { useToast } from '../../../../components/ui/Toast'
import Seo from '../../../../components/ui/Seo'
import {
  downloadBlob,
  formatBytes,
  readFileAsArrayBuffer,
  stripFileExtension,
} from '../../../../lib/utils'

interface ConvertedFile {
  name: string
  size: number
  pages: number
  warnings: number
  sourceSize: number
}

const pageFormats: Record<string, { w: number; h: number }> = {
  a3: { w: 297, h: 420 },
  a4: { w: 210, h: 297 },
  a5: { w: 148, h: 210 },
  letter: { w: 215.9, h: 279.4 },
  legal: { w: 215.9, h: 355.6 },
}

const pagePx = (orientation: 'portrait' | 'landscape', format: string) => {
  const fmt = pageFormats[format] ?? pageFormats.a4
  const w = orientation === 'landscape' ? fmt.h : fmt.w
  const h = orientation === 'landscape' ? fmt.w : fmt.h
  return { w: Math.round((w * 96) / 25.4), h: Math.round((h * 96) / 25.4) }
}

export default function WordToPdf() {
  const [files, setFiles] = useState<File[]>([])
  const [busy, setBusy] = useState(false)
  const [converted, setConverted] = useState<ConvertedFile[]>([])
  const [format, setFormat] = useState('a4')
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait')
  const [margin, setMargin] = useState(12)
  const [scale, setScale] = useState(2)
  const { toast } = useToast()

  const onFiles = useCallback(
    (incoming: File[]) => {
      const docx = incoming.filter((f) => /\.docx?$/i.test(f.name))
      if (docx.length === 0) {
        toast('Please choose .docx Word files.', 'error')
        return
      }
      setFiles((prev) => {
        const existing = new Set(prev.map((f) => `${f.name}:${f.size}`))
        const fresh = docx.filter((f) => !existing.has(`${f.name}:${f.size}`))
        return [...prev, ...fresh]
      })
      setConverted([])
    },
    [toast],
  )

  const renderToElement = async (html: string) => {
    const px = pagePx(orientation, format)
    const holder = document.createElement('div')
    holder.innerHTML = html
    Object.assign(holder.style, {
      position: 'fixed',
      top: '0',
      left: '-100000px',
      width: `${px.w}px`,
      background: '#ffffff',
    })
    document.body.appendChild(holder)
    return holder
  }

  const convert = async () => {
    if (files.length === 0) return
    setBusy(true)
    setConverted([])
    const results: ConvertedFile[] = []
    try {
      for (const file of files) {
        const buffer = await readFileAsArrayBuffer(file).catch(() => null)
        if (!buffer) {
          toast(`${file.name}: unreadable file.`, 'error')
          continue
        }
        const { value, messages } = await mammoth.convertToHtml({ arrayBuffer: buffer })
        const holder = await renderToElement(value)
        const base = stripFileExtension(file.name)
        const fmt = pageFormats[format] ?? pageFormats.a4
        const blob = (await html2pdf()
          .set({
            margin: margin,
            filename: `${base}.pdf`,
            image: { type: 'jpeg', quality: 0.95 },
            html2canvas: { scale, useCORS: true, backgroundColor: '#ffffff', logging: false },
            jsPDF: {
              unit: 'mm',
              format: orientation === 'landscape' ? [fmt.h, fmt.w] : [fmt.w, fmt.h],
              orientation,
            },
          })
          .from(holder)
          .outputPdf('blob')) as Blob
        downloadBlob(blob, `${base}.pdf`)
        results.push({
          name: `${base}.pdf`,
          size: blob.size,
          pages: blob.size > 0 ? 1 : 0,
          warnings: messages.filter((m) => m.type === 'warning').length,
          sourceSize: file.size,
        })
        holder.remove()
      }
      setConverted(results)
      toast(`Converted ${results.length} document${results.length > 1 ? 's' : ''} to PDF.`)
    } catch (e) {
      console.error(e)
      toast('Conversion failed. Make sure the .docx file is valid.', 'error')
    } finally {
      setBusy(false)
    }
  }

  const totalSize = files.reduce((acc, f) => acc + f.size, 0)

  return (
    <>
      <Seo
        title="Word to PDF Converter - Free Online | vimz Tools"
        description="Convert .docx Word documents into clean PDF files entirely in your browser. Free, private, no uploads."
      />
      <ToolShell
        title="Word to PDF Converter"
        description="Turn Word documents into perfectly formatted PDF files with one click. Text, tables, bold and lists are all preserved by Mammoth + html2pdf running on your device."
        icon={<FileText className="h-6 w-6" />}
        breadcrumb="PDF Utilities"
      >
        <div className="relative grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-5 lg:col-span-2">
            <Dropzone
              onFiles={onFiles}
              accept=".docx"
              multiple
              label="Drop .docx Word files here to convert them"
            />
            {files.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-slate-700">
                    {files.length} file{files.length > 1 && 's'} · {formatBytes(totalSize)}
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setFiles([])}
                      className="flex items-center gap-1 text-xs font-semibold text-rose-500 hover:text-rose-600"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Clear all
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  {files.map((f) => (
                    <FileChip
                      key={`${f.name}:${f.size}`}
                      file={f}
                      onRemove={(i) => setFiles((prev) => prev.filter((_, j) => j !== i))}
                    />
                  ))}
                </div>
                <Button onClick={convert} disabled={busy}>
                  <FileText className="h-4 w-4" />
                  {busy ? 'Converting...' : `Convert ${files.length} file${files.length > 1 ? 's' : ''} to PDF`}
                </Button>
              </div>
            )}

            {converted.length > 0 && (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {converted.map((c) => (
                  <div
                    key={c.name}
                    className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-emerald-800">{c.name}</p>
                      <p className="text-xs text-emerald-600">
                        {formatBytes(c.size)}{' '}
                        {c.warnings > 0 && `· ${c.warnings} warning${c.warnings > 1 ? 's' : ''}`}
                      </p>
                    </div>
                    <span className="text-xs font-bold text-emerald-700">done</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="h-fit space-y-5 rounded-2xl border border-slate-200 bg-white p-5 lg:sticky lg:top-24">
            <h3 className="text-sm font-bold text-slate-800">Output settings</h3>
            <Field label="Page size">
              <Select value={format} onChange={(e) => setFormat(e.target.value)}>
                <option value="a4">A4 (210 × 297 mm)</option>
                <option value="a3">A3 (297 × 420 mm)</option>
                <option value="a5">A5 (148 × 210 mm)</option>
                <option value="letter">Letter (8.5 × 11 in)</option>
                <option value="legal">Legal (8.5 × 14 in)</option>
              </Select>
            </Field>
            <Field label="Orientation">
              <Select
                value={orientation}
                onChange={(e) => setOrientation(e.target.value as 'portrait' | 'landscape')}
              >
                <option value="portrait">Portrait</option>
                <option value="landscape">Landscape</option>
              </Select>
            </Field>
            <Field label={`Margin: ${margin} mm`}>
              <input
                type="range"
                min={4}
                max={30}
                value={margin}
                onChange={(e) => setMargin(Number(e.target.value))}
                className="w-full accent-primary-600"
              />
            </Field>
            <Field label={`Render scale ×${scale}`}>
              <input
                type="range"
                min={1.5}
                max={3}
                step={0.5}
                value={scale}
                onChange={(e) => setScale(Number(e.target.value))}
                className="w-full accent-primary-600"
              />
              <p className="mt-1 text-xs text-slate-400">Higher = sharper text, slower render</p>
            </Field>
            <Button onClick={convert} disabled={busy || files.length === 0} className="w-full">
              <FileText className="h-4 w-4" />
              {busy ? 'Converting...' : `Convert to PDF (${files.length})`}
            </Button>
            <p className="text-xs leading-relaxed text-slate-400">
              Word files are parsed locally with Mammoth; pages are rendered to PDF with html2pdf on your device.
            </p>
          </div>

          {busy && <LoadingOverlay message="Converting documents..." />}
        </div>
      </ToolShell>
    </>
  )
}