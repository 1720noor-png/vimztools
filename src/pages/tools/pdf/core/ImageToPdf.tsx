import { useCallback, useRef, useState } from 'react'
import { jsPDF } from 'jspdf'
import { ArrowDownUp, FileImage, Plus, Trash2 } from 'lucide-react'
import ToolShell from '../../../../components/tools/ToolShell'
import Dropzone from '../../../../components/ui/Dropzone'
import { Button, Field, Select } from '../../../../components/ui/Fields'
import { LoadingOverlay } from '../../../../components/ui/Spinner'
import { useToast } from '../../../../components/ui/Toast'
import Seo from '../../../../components/ui/Seo'
import { readFileAsDataUrl } from '../../../../lib/utils'

interface ImageItem {
  id: string
  name: string
  dataUrl: string
}

const pageFormats: Record<string, { w: number; h: number }> = {
  a3: { w: 297, h: 420 },
  a4: { w: 210, h: 297 },
  a5: { w: 148, h: 210 },
  letter: { w: 215.9, h: 279.4 },
  legal: { w: 215.9, h: 355.6 },
}

const imgFormat = (name: string) => {
  const ext = name.split('.').pop()?.toLowerCase() || 'png'
  const map: Record<string, string> = { jpg: 'JPEG', jpeg: 'JPEG', png: 'PNG', webp: 'WEBP' }
  return map[ext] || 'JPEG'
}

export default function ImageToPdf() {
  const [images, setImages] = useState<ImageItem[]>([])
  const [format, setFormat] = useState('a4')
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait')
  const [fit, setFit] = useState<'contain' | 'fill'>('contain')
  const [margin, setMargin] = useState(10)
  const [busy, setBusy] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const onFiles = useCallback(
    async (files: File[]) => {
      try {
        const allowed = files.filter((f) => /\.(png|jpe?g|webp|bmp|gif)$/i.test(f.name))
        if (allowed.length === 0) {
          toast('Please choose valid image files (JPG, PNG, WebP, BMP, GIF).', 'error')
          return
        }
        const items: ImageItem[] = []
        for (const f of allowed) {
          const dataUrl = await readFileAsDataUrl(f)
          items.push({ id: `${f.name}-${f.size}`, name: f.name, dataUrl })
        }
        setImages((prev) => [...prev, ...items])
        toast(`${items.length} image${items.length > 1 ? 's' : ''} added.`)
      } catch {
        toast('Failed to read images.', 'error')
      }
    },
    [toast],
  )

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index))
  }

  const moveImage = (index: number, dir: -1 | 1) => {
    setImages((prev) => {
      const next = [...prev]
      const target = index + dir
      if (target < 0 || target >= next.length) return prev
      ;[next[index], next[target]] = [next[target], next[index]]
      return next
    })
  }

  const convert = async () => {
    if (images.length === 0) return
    setBusy(true)
    try {
      const fmt = pageFormats[format]
      const pageSize: [number, number] = [fmt.w, fmt.h]
      const doc = new jsPDF({
        orientation,
        unit: 'mm',
        format: pageSize,
        compress: true,
      })

      for (let i = 0; i < images.length; i++) {
        const img = images[i]
        if (i > 0) doc.addPage(pageSize, orientation)
        const props = doc.getImageProperties(img.dataUrl)
        const pageW = orientation === 'landscape' ? fmt.h : fmt.w
        const pageH = orientation === 'landscape' ? fmt.w : fmt.h
        const availW = pageW - margin * 2
        const availH = pageH - margin * 2

        let drawW = availW
        let drawH = (props.height / props.width) * availW
        if (fit === 'contain') {
          if (drawH > availH) {
            drawH = availH
            drawW = (props.width / props.height) * availH
          }
        } else {
          const scale = Math.max(availW / props.width, availH / props.height)
          drawW = props.width * scale
          drawH = props.height * scale
        }
        const x = (pageW - drawW) / 2
        const y = (pageH - drawH) / 2
        doc.addImage(img.dataUrl, imgFormat(img.name), x, y, drawW, drawH, undefined, 'FAST')
      }

      const blob = doc.output('blob')
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'vimz-images-to-pdf.pdf'
      a.click()
      setTimeout(() => URL.revokeObjectURL(url), 3000)
      toast('PDF generated successfully!')
      setImages([])
    } catch (e) {
      console.error(e)
      toast('Conversion failed. Please try again.', 'error')
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <Seo
        title="Image to PDF Converter - Free Online | vimz Tools"
        description="Convert JPG, PNG and WebP images into a single merged PDF, entirely in your browser. Free, private and no uploads."
      />
      <ToolShell
        title="Image to PDF Converter"
        description="Combine JPG, PNG or WebP images into a single, nicely-fitted PDF document. Pick a page size, orientation and margin — everything happens on your device."
        icon={<FileImage className="h-6 w-6" />}
        breadcrumb="PDF Utilities"
      >
        <div className="relative grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <Dropzone
              onFiles={onFiles}
              accept=".png,.jpg,.jpeg,.webp,.bmp,.gif"
              multiple
              label="Drop images here to add them to your PDF"
            />
            {images.length > 0 && (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-slate-700">
                    {images.length} image{images.length > 1 && 's'} selected
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setImages([])}
                      className="text-xs font-semibold text-rose-500 hover:text-rose-600"
                    >
                      Clear all
                    </button>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-1.5 rounded-lg border border-primary-300 bg-primary-50 px-3 py-1.5 text-xs font-semibold text-primary-700 transition hover:bg-primary-100"
                    >
                      <Plus className="h-3.5 w-3.5" /> Add more
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".png,.jpg,.jpeg,.webp,.bmp,.gif"
                      multiple
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files?.length) onFiles(Array.from(e.target.files))
                        e.target.value = ''
                      }}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                  {images.map((img, i) => (
                    <div key={img.id} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-2.5">
                      <img
                        src={img.dataUrl}
                        alt={img.name}
                        className="h-11 w-11 shrink-0 rounded-lg object-cover"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-medium text-slate-700">{img.name}</p>
                        <p className="text-[11px] text-slate-400">Page {i + 1}</p>
                      </div>
                      <div className="flex shrink-0 items-center gap-0.5">
                        <button
                          onClick={() => moveImage(i, -1)}
                          disabled={i === 0}
                          className="rounded-md p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 disabled:opacity-30"
                          aria-label="Move up"
                        >
                          <ArrowDownUp className="h-3.5 w-3.5 rotate-90" />
                        </button>
                        <button
                          onClick={() => moveImage(i, 1)}
                          disabled={i === images.length - 1}
                          className="rounded-md p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 disabled:opacity-30"
                          aria-label="Move down"
                        >
                          <ArrowDownUp className="h-3.5 w-3.5 -rotate-90" />
                        </button>
                        <button
                          onClick={() => removeImage(i)}
                          className="rounded-md p-1.5 text-slate-400 transition hover:bg-rose-50 hover:text-rose-500"
                          aria-label={`Remove ${img.name}`}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {images.length > 0 && (
              <div className="flex">
                <Button onClick={convert} disabled={busy}>
                  <FileImage className="h-4 w-4" />
                  {busy ? 'Generating...' : `Create PDF (${images.length} page${images.length > 1 ? 's' : ''})`}
                </Button>
              </div>
            )}
          </div>

          <div className="h-fit space-y-5 rounded-2xl border border-slate-200 bg-white p-5 lg:sticky lg:top-24">
            <h3 className="flex items-center gap-2 text-sm font-bold text-slate-800">
              <FileImage className="h-4 w-4 text-primary-600" /> Page settings
            </h3>
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
            <Field label="Fit mode">
              <Select value={fit} onChange={(e) => setFit(e.target.value as 'contain' | 'fill')}>
                <option value="contain">Fit (preserve aspect)</option>
                <option value="fill">Fill (cover page)</option>
              </Select>
            </Field>
            <Field label={`Margin: ${margin} mm`}>
              <input
                type="range"
                min={0}
                max={30}
                value={margin}
                onChange={(e) => setMargin(Number(e.target.value))}
                className="w-full accent-primary-600"
              />
            </Field>
            {images.length > 0 && (
              <Button onClick={convert} disabled={busy} className="w-full">
                <FileImage className="h-4 w-4" />
                {busy ? 'Generating...' : `Create PDF (${images.length} pages)`}
              </Button>
            )}
          </div>

          {busy && <LoadingOverlay message="Building your PDF..." />}
        </div>
      </ToolShell>
    </>
  )
}