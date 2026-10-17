import { useCallback, useEffect, useRef, useState } from 'react'
import Cropper from 'cropperjs'
import 'cropperjs/dist/cropper.css'
import { jsPDF } from 'jspdf'
import { BadgeCheck, Download, Grid2x2, ImagePlus, Loader2 } from 'lucide-react'
import ToolShell from '../../../components/tools/ToolShell'
import Dropzone from '../../../components/ui/Dropzone'
import { Button, Field, Select } from '../../../components/ui/Fields'
import { useToast } from '../../../components/ui/Toast'
import Seo from '../../../components/ui/Seo'
import { downloadBlob, downloadDataUrl, readFileAsDataUrl } from '../../../lib/utils'

type RatioPreset = '35x45' | '2x2'

const presetRations: Record<RatioPreset, { w: number; h: number; label: string }> = {
  '35x45': { w: 413, h: 531, label: '35 × 45 mm @300dpi' },
  '2x2': { w: 600, h: 600, label: '2 × 2 inch @300dpi' },
}

const bgPresets = [
  { name: 'White', value: '#ffffff' },
  { name: 'Light Blue', value: '#d9e8ff' },
  { name: 'Blue', value: '#2e6bdd' },
  { name: 'Light Grey', value: '#e0e0e0' },
  { name: 'Light Pink', value: '#ffdbe0' },
  { name: 'Transparent', value: '' },
]

function renderPhoto(bg: string, cropCanvas: HTMLCanvasElement, w: number, h: number): HTMLCanvasElement {
  const out = document.createElement('canvas')
  out.width = w
  out.height = h
  const ctx = out.getContext('2d')
  if (!ctx) return out
  if (bg) {
    ctx.fillStyle = bg
    ctx.fillRect(0, 0, w, h)
  }
  ctx.drawImage(cropCanvas, 0, 0, w, h)
  return out
}

export default function PassportPhoto() {
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [preset, setPreset] = useState<RatioPreset>('35x45')
  const [bg, setBg] = useState('#ffffff')
  const [busy, setBusy] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const imgRef = useRef<HTMLImageElement>(null)
  const cropperRef = useRef<Cropper | null>(null)
  const { toast } = useToast()

  const cleanupCropper = useCallback(() => {
    if (cropperRef.current) {
      cropperRef.current.destroy()
      cropperRef.current = null
    }
  }, [])

  useEffect(() => {
    return () => {
      cleanupCropper()
      if (imageUrl) URL.revokeObjectURL(imageUrl)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!imageUrl) return
    cleanupCropper()
    const ratio = presetRations[preset]
    const el = imgRef.current
    if (!el) return

    const options: Cropper.Options = {
      viewMode: 1,
      dragMode: 'move',
      aspectRatio: ratio.w / ratio.h,
      autoCropArea: 0.55,
      background: true,
      responsive: true,
      restore: false,
      checkOrientation: true,
      guides: true,
      center: true,
      highlight: false,
      cropBoxMovable: true,
      cropBoxResizable: true,
      ready() {
        const c = cropperRef.current
        if (!c) return
        const container = c.getContainerData()
        const boxH = Math.min(container.height * 0.62, 420)
        const boxW = boxH * (ratio.w / ratio.h)
        c.setCropBoxData({ width: boxW, height: boxH })
      },
    }
    cropperRef.current = new Cropper(el, options)
  }, [imageUrl, preset, cleanupCropper])

  const onFiles = useCallback(
    async (files: File[]) => {
      const file = files[0]
      if (!file) return
      try {
        const dataUrl = await readFileAsDataUrl(file)
        setPreview(null)
        setImageUrl(dataUrl)
        toast('Image loaded. Adjust the crop box, then export.')
      } catch {
        toast('Failed to read image.', 'error')
      }
    },
    [toast],
  )

  const getCropCanvas = (): HTMLCanvasElement | null => {
    const cropper = cropperRef.current
    if (!cropper) return null
    return cropper.getCroppedCanvas()
  }

  const exportPhoto = async () => {
    const cropCanvas = getCropCanvas()
    if (!cropCanvas) return
    const ratio = presetRations[preset]
    const out = renderPhoto(bg, cropCanvas, ratio.w, ratio.h)
    const png = out.toDataURL('image/png')
    setPreview(png)
    downloadDataUrl(png, `passport-photo-${preset.replace('x', 'x')}.png`)
    toast('Passport photo downloaded.')
  }

  const exportGrid = async () => {
    const cropCanvas = getCropCanvas()
    if (!cropCanvas) return
    setBusy(true)
    try {
      const photoMm = preset === '35x45' ? { w: 35, h: 45 } : { w: 50.8, h: 50.8 }
      const mmW = photoMm.w
      const mmH = photoMm.h
      const ratio = presetRations[preset]
      const canvas = renderPhoto(bg, cropCanvas, ratio.w, ratio.h)
      const photoDataUrl = canvas.toDataURL('image/png')

      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4', compress: true })
      const cols = 4
      const rows = 5
      const gap = 5
      const pageW = 210
      const pageH = 297
      const gridW = cols * mmW + (cols - 1) * gap
      const gridH = rows * mmH + (rows - 1) * gap
      const startX = (pageW - gridW) / 2
      const startY = (pageH - gridH) / 2

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const x = startX + c * (mmW + gap)
          const y = startY + r * (mmH + gap)
          doc.addImage(photoDataUrl, 'PNG', x, y, mmW, mmH)
        }
      }

      const blob = doc.output('blob')
      downloadBlob(blob, `passport-photo-a4-grid-${preset.replace('x', 'x')}.pdf`)
      toast(`A4 grid exported with ${cols * rows} photos.`)
    } catch (e) {
      console.error(e)
      toast('Grid export failed.', 'error')
    } finally {
      setBusy(false)
    }
  }

  const reset = () => {
    cleanupCropper()
    setImageUrl(null)
    setPreview(null)
  }

  return (
    <>
      <Seo
        title="Passport Photo Generator - Free Online | vimz Tools"
        description="Create passport, visa and ID photos at 35x45mm or 2x2 inch with background color options, and export a printable A4 grid. 100% in-browser."
      />
      <ToolShell
        title="Passport Size Photo Generator"
        description="Crop a face photo to official 35×45 mm or 2×2 inch proportions, pick a background color, then download a single photo or a ready-to-print A4 grid."
        icon={<BadgeCheck className="h-6 w-6" />}
        breadcrumb="Image Tools"
      >
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-5 lg:col-span-2">
            {!imageUrl ? (
              <Dropzone
                onFiles={onFiles}
                accept=".png,.jpg,.jpeg,.webp,.bmp"
                multiple={false}
                label="Drop a face photo here to begin"
              />
            ) : (
              <>
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
                  <div className="flex min-h-[320px] items-center justify-center p-4">
                    <img
                      ref={imgRef}
                      src={imageUrl}
                      alt="Passport photo crop"
                      className="max-h-[480px] w-auto max-w-full rounded-lg object-contain"
                      style={{ display: 'block', background: '#fff' }}
                    />
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button onClick={exportPhoto}>
                    <Download className="h-4 w-4" /> Download photo
                  </Button>
                  <Button variant="success" onClick={exportGrid} disabled={busy}>
                    {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Grid2x2 className="h-4 w-4" />}
                    {busy ? 'Building grid...' : 'A4 grid (printable)'}
                  </Button>
                  <Button variant="secondary" onClick={reset}>
                    <ImagePlus className="h-4 w-4" /> New photo
                  </Button>
                </div>
              </>
            )}
          </div>

          <div className="h-fit space-y-5 rounded-2xl border border-slate-200 bg-white p-5 lg:sticky lg:top-24">
            <h3 className="text-sm font-bold text-slate-800">Settings</h3>
            <Field label="Photo size">
              <Select value={preset} onChange={(e) => setPreset(e.target.value as RatioPreset)}>
                <option value="35x45">35 × 45 mm (common passport)</option>
                <option value="2x2">2 × 2 inch (US visa / ID)</option>
              </Select>
            </Field>
            <Field label="Background color">
              <div className="flex flex-wrap gap-2">
                {bgPresets.map((b) => (
                  <button
                    key={b.name}
                    onClick={() => setBg(b.value)}
                    title={b.name}
                    className={`h-8 w-8 rounded-full border-2 transition ${
                      bg === b.value ? 'border-primary-600 scale-110' : 'border-slate-200'
                    }`}
                    style={{ backgroundColor: b.value || 'conic-gradient(#eee, #fff, #eee)' }}
                    aria-label={b.name}
                  />
                ))}
                <label className="relative h-8 w-8 cursor-pointer overflow-hidden rounded-full border-2 border-dashed border-slate-300 transition hover:border-primary-500" title="Custom color">
                  <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-slate-400">+</span>
                  <input
                    type="color"
                    value={bg.startsWith('#') ? bg : '#ffffff'}
                    onChange={(e) => setBg(e.target.value)}
                    className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                  />
                </label>
              </div>
            </Field>
            <p className="text-xs leading-relaxed text-slate-400">
              Tip: position the crop box so the face is centered with a small amount of
              headroom at the top.
            </p>
          </div>
        </div>

        {preview && (
          <div className="mt-8">
            <h3 className="mb-3 text-lg font-bold text-slate-900">Last export preview</h3>
            <img
              src={preview}
              alt="Export preview"
              className="max-h-64 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm"
            />
          </div>
        )}
      </ToolShell>
    </>
  )
}