import { useCallback, useEffect, useRef, useState } from 'react'
import { degrees, PDFDocument, rgb, StandardFonts } from 'pdf-lib'
import * as pdfjsLib from 'pdfjs-dist'
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url'
import { Droplets, Loader2, Image as ImageIcon } from 'lucide-react'
import ToolShell from '../../../../components/tools/ToolShell'
import Dropzone from '../../../../components/ui/Dropzone'
import { Button, Field } from '../../../../components/ui/Fields'
import { LoadingOverlay } from '../../../../components/ui/Spinner'
import { useToast } from '../../../../components/ui/Toast'
import Seo from '../../../../components/ui/Seo'
import { downloadBlob, formatBytes, readFileAsArrayBuffer, readFileAsDataUrl } from '../../../../lib/utils'

pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl

const presets = ['CONFIDENTIAL', 'DRAFT', 'TOP SECRET', 'DO NOT COPY', 'INTERNAL USE']

function hexToRgb(hex: string) {
  const clean = hex.replace('#', '')
  const r = parseInt(clean.slice(0, 2), 16) / 255
  const g = parseInt(clean.slice(2, 4), 16) / 255
  const b = parseInt(clean.slice(4, 6), 16) / 255
  return rgb(r, g, b)
}

interface Center {
  x: number
  y: number
}

function gridCenters(w: number, h: number, cols: number, rows: number): Center[] {
  const centers: Center[] = []
  for (let r = 1; r <= rows; r++) {
    for (let c = 1; c <= cols; c++) {
      centers.push({ x: (w * c) / (cols + 1), y: (h * r) / (rows + 1) })
    }
  }
  return centers
}

interface Placement {
  x: number
  y: number
  w: number
  h: number
}

function rotatedPlacement(cx: number, cy: number, w: number, h: number, deg: number): Placement {
  const rad = (deg * Math.PI) / 180
  const dx = (w / 2) * Math.cos(rad) - (h / 2) * Math.sin(rad)
  const dy = (w / 2) * Math.sin(rad) + (h / 2) * Math.cos(rad)
  return { x: cx - dx, y: cy - dy, w, h }
}

export default function PdfWatermark() {
  const [file, setFile] = useState<File | null>(null)
  const [busy, setBusy] = useState(false)
  const [mode, setMode] = useState<'text' | 'logo'>('text')
  const [text, setText] = useState('CONFIDENTIAL')
  const [fontSize, setFontSize] = useState(44)
  const [opacityPct, setOpacityPct] = useState(28)
  const [color, setColor] = useState('#e11d48')
  const [angle, setAngle] = useState(45)
  const [tile, setTile] = useState(true)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoDataUrl, setLogoDataUrl] = useState<string | null>(null)
  const [logoSizePct, setLogoSizePct] = useState(22)
  const [resultBytes, setResultBytes] = useState<Uint8Array<ArrayBuffer> | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    if (!resultBytes || !canvasRef.current) return
    let cancelled = false
    const render = async () => {
      const data = new Uint8Array(resultBytes)
      const task = pdfjsLib.getDocument({ data })
      try {
        const doc = await task.promise
        const page = await doc.getPage(1)
        const viewport = page.getViewport({ scale: 1.2 })
        const canvas = canvasRef.current
        if (!canvas || cancelled) return
        canvas.width = Math.floor(viewport.width)
        canvas.height = Math.floor(viewport.height)
        const ctx = canvas.getContext('2d')
        if (!ctx) return
        await page.render({ canvas, viewport }).promise
        page.cleanup()
        await task.destroy()
      } catch (e) {
        console.error(e)
      }
    }
    render()
    return () => {
      cancelled = true
    }
  }, [resultBytes])

  const onFiles = useCallback(
    (files: File[]) => {
      const pdf = files[0]
      if (!pdf || !/\.pdf$/i.test(pdf.name)) {
        toast('Please choose a PDF file.', 'error')
        return
      }
      setFile(pdf)
      setResultBytes(null)
    },
    [toast],
  )

  const onLogoFiles = useCallback(
    async (files: File[]) => {
      const img = files[0]
      if (!img || !/\.(png|jpe?g)$/i.test(img.name)) {
        toast('Please choose a PNG or JPG logo image.', 'error')
        return
      }
      try {
        const url = await readFileAsDataUrl(img)
        setLogoFile(img)
        setLogoDataUrl(url)
        setMode('logo')
      } catch {
        toast('Failed to read the logo image.', 'error')
      }
    },
    [toast],
  )

  const apply = async () => {
    if (!file) return
    setBusy(true)
    setResultBytes(null)
    try {
      const buffer = await readFileAsArrayBuffer(file)
      const pdfDoc = await PDFDocument.load(buffer, { ignoreEncryption: true })
      const pages = pdfDoc.getPages()
      const opacity = opacityPct / 100

      let font: Awaited<ReturnType<typeof pdfDoc.embedFont>> | null = null
      if (mode === 'text') font = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

      let logoImage: Awaited<ReturnType<typeof pdfDoc.embedPng>> | Awaited<
        ReturnType<typeof pdfDoc.embedJpg>
      > | null = null
      if (mode === 'logo' && logoFile) {
        const imgBytes = new Uint8Array(await logoFile.arrayBuffer())
        const isPng = /\.png$/i.test(logoFile.name)
        logoImage = isPng ? await pdfDoc.embedPng(imgBytes) : await pdfDoc.embedJpg(imgBytes)
      }

      const fill = hexToRgb(color)

      for (const page of pages) {
        const { width: pw, height: ph } = page.getSize()
        if (mode === 'text' && font) {
          const textWidth = font.widthOfTextAtSize(text, fontSize)
          const centers = tile
            ? gridCenters(pw, ph, 4, 3)
            : [{ x: pw / 2, y: ph / 2 }]
          for (const c of centers) {
            const p = rotatedPlacement(c.x, c.y, textWidth, fontSize, angle)
            page.drawText(text, {
              x: p.x,
              y: p.y,
              size: fontSize,
              font,
              color: fill,
              opacity,
              rotate: degrees(angle),
            })
          }
        } else if (mode === 'logo' && logoImage) {
          const imgW = (pw * logoSizePct) / 100
          const imgH = (imgW * logoImage.height) / logoImage.width
          const centers = tile
            ? gridCenters(pw, ph, 3, 3)
            : [{ x: pw / 2, y: ph / 2 }]
          for (const c of centers) {
            const p = rotatedPlacement(c.x, c.y, imgW, imgH, angle)
            page.drawImage(logoImage, {
              x: p.x,
              y: p.y,
              width: imgW,
              height: imgH,
              opacity,
              rotate: degrees(angle),
            })
          }
        }
      }

      const bytes = await pdfDoc.save({ useObjectStreams: true })
      const out = new Uint8Array(bytes) as Uint8Array<ArrayBuffer>
      setResultBytes(out)
      toast(`Watermarked ${pages.length} page${pages.length > 1 ? 's' : ''}.`)
    } catch (e) {
      console.error(e)
      toast('Watermark failed. The PDF may be corrupt or protected.', 'error')
    } finally {
      setBusy(false)
    }
  }

  const download = () => {
    if (!resultBytes || !file) return
    const blob = new Blob([resultBytes], { type: 'application/pdf' })
    downloadBlob(blob, `${file.name.replace(/\.pdf$/i, '')}-watermarked.pdf`)
  }

  const reset = () => {
    setFile(null)
    setResultBytes(null)
    setLogoFile(null)
    setLogoDataUrl(null)
  }

  return (
    <>
      <Seo
        title="PDF Watermark Overlay - Free Online | vimz Tools"
        description="Stamp text or logo watermarks across every page of a PDF with adjustable opacity, size, colour and rotation. 100% in-browser with pdf-lib."
      />
      <ToolShell
        title="PDF Watermark Overlay"
        description="Protect your documents by overlaying text watermarks like 'CONFIDENTIAL' or a logo image. Control opacity, size, color and rotation — everything runs on your device with pdf-lib."
        icon={<Droplets className="h-6 w-6" />}
        breadcrumb="PDF Utilities"
      >
        <div className="relative grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            {!file ? (
              <Dropzone
                onFiles={onFiles}
                accept=".pdf"
                multiple={false}
                label="Drop a PDF to watermark"
              />
            ) : (
              <div className="flex flex-col items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 sm:flex-row">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-800">{file.name}</p>
                  <p className="text-xs text-slate-400">{formatBytes(file.size)}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="secondary" onClick={reset}>
                    Replace
                  </Button>
                  <Button onClick={apply} disabled={busy}>
                    {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Droplets className="h-4 w-4" />}
                    {busy ? 'Applying...' : 'Apply watermark'}
                  </Button>
                </div>
              </div>
            )}

            <div className="mb-4 grid max-w-md grid-cols-2 gap-2 rounded-2xl border border-slate-200 bg-white p-2">
              <button
                onClick={() => setMode('text')}
                className={`flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                  mode === 'text' ? 'bg-primary-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Droplets className="h-4 w-4" /> Text
              </button>
              <button
                onClick={() => setMode('logo')}
                className={`flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                  mode === 'logo' ? 'bg-primary-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <ImageIcon className="h-4 w-4" /> Logo
              </button>
            </div>

            {resultBytes && (
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
                  <h3 className="text-sm font-bold text-slate-800">Preview (page 1)</h3>
                  <Button onClick={download} variant="success">
                    <DownloadIcon /> Download PDF
                  </Button>
                </div>
                <div className="flex items-center justify-center bg-slate-100 p-4">
                  <canvas
                    ref={canvasRef}
                    className="max-h-[480px] max-w-full rounded-lg bg-white shadow-sm"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="h-fit space-y-5 rounded-2xl border border-slate-200 bg-white p-5 lg:sticky lg:top-24">
            <h3 className="text-sm font-bold text-slate-800">Watermark settings</h3>

            {mode === 'text' ? (
              <>
                <Field label="Label text">
                  <input
                    type="text"
                    value={text}
                    onChange={(e) => setText(e.target.value.slice(0, 60))}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-800 transition focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
                  />
                </Field>
                <div className="flex flex-wrap gap-1.5">
                  {presets.map((p) => (
                    <button
                      key={p}
                      onClick={() => setText(p)}
                      className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-semibold text-slate-600 transition hover:border-primary-300 hover:text-primary-700"
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <Dropzone
                onFiles={onLogoFiles}
                accept=".png,.jpg,.jpeg"
                multiple={false}
                label="Drop a logo image (PNG or JPG)"
              />
            )}

            {mode === 'logo' && logoDataUrl && (
              <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3">
                <img src={logoDataUrl} alt="logo" className="h-12 w-12 rounded-lg object-contain" />
                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold text-slate-700">{logoFile?.name}</p>
                  <button onClick={() => setLogoFile(null)} className="text-[11px] font-semibold text-rose-500 hover:text-rose-600">
                    Remove
                  </button>
                </div>
              </div>
            )}

            <Field label={`Opacity: ${opacityPct}%`}>
              <input
                type="range"
                min={5}
                max={80}
                value={opacityPct}
                onChange={(e) => setOpacityPct(Number(e.target.value))}
                className="w-full accent-primary-600"
              />
            </Field>

            {mode === 'text' ? (
              <>
                <Field label={`Font size: ${fontSize} pt`}>
                  <input
                    type="range"
                    min={12}
                    max={140}
                    value={fontSize}
                    onChange={(e) => setFontSize(Number(e.target.value))}
                    className="w-full accent-primary-600"
                  />
                </Field>
                <Field label="Color">
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="h-10 w-full cursor-pointer rounded-xl border border-slate-300 bg-white"
                  />
                </Field>
              </>
            ) : (
              <Field label={`Logo size: ${logoSizePct}% of width`}>
                <input
                  type="range"
                  min={5}
                  max={60}
                  value={logoSizePct}
                  onChange={(e) => setLogoSizePct(Number(e.target.value))}
                  className="w-full accent-primary-600"
                />
              </Field>
            )}

            <Field label={`Rotation: ${angle}°`}>
              <input
                type="range"
                min={0}
                max={90}
                step={5}
                value={angle}
                onChange={(e) => setAngle(Number(e.target.value))}
                className="w-full accent-primary-600"
              />
            </Field>

            <label className="flex items-center gap-2.5 rounded-xl border border-slate-200 px-3.5 py-2.5">
              <input
                type="checkbox"
                checked={tile}
                onChange={(e) => setTile(e.target.checked)}
                className="h-4 w-4 accent-primary-600"
              />
              <span className="text-sm text-slate-700">Tile across the whole page</span>
            </label>

            <Button onClick={apply} disabled={busy || !file} className="w-full">
              <Droplets className="h-4 w-4" />
              {busy ? 'Applying...' : 'Apply watermark'}
            </Button>
            {resultBytes && (
              <Button onClick={download} variant="success" className="w-full">
                <DownloadIcon /> Download PDF
              </Button>
            )}
            <p className="text-xs leading-relaxed text-slate-400">
              Text watermarks stay vector text; logo watermarks are embedded into the page. Toggling options re-applies to every page.
            </p>
          </div>

          {busy && <LoadingOverlay message="Applying watermark..." />}
        </div>
      </ToolShell>
    </>
  )
}

function DownloadIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  )
}