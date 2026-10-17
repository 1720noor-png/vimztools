import { useCallback, useState } from 'react'
import { Droplets, Download, Loader2, ImagePlus } from 'lucide-react'
import ToolShell from '../../../components/tools/ToolShell'
import Dropzone from '../../../components/ui/Dropzone'
import { Button, Field, Select, TextInput } from '../../../components/ui/Fields'
import { useToast } from '../../../components/ui/Toast'
import Seo from '../../../components/ui/Seo'
import { canvasToBlob, downloadBlob, getFileExtension, readFileAsDataUrl, stripFileExtension } from '../../../lib/utils'

type WatermarkType = 'text' | 'logo'

function drawTextWatermark(
  canvas: HTMLCanvasElement,
  img: HTMLImageElement,
  text: string,
  opts: { opacity: number; fontSize: number; position: string; angle: number; color: string; repeat: boolean },
) {
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  canvas.width = img.width
  canvas.height = img.height
  ctx.drawImage(img, 0, 0)
  ctx.save()
  ctx.globalAlpha = opts.opacity
  ctx.fillStyle = opts.color
  ctx.font = `bold ${opts.fontSize}px Arial, sans-serif`

  if (opts.repeat) {
    ctx.translate(canvas.width / 2, canvas.height / 2)
    ctx.rotate((opts.angle * Math.PI) / 180)
    const spacing = opts.fontSize * 3
    for (let y = -canvas.height / 2; y < canvas.height / 2 + spacing; y += spacing) {
      for (let x = -canvas.width / 2; x < canvas.width / 2 + spacing * 1.6; x += spacing * 1.6) {
        ctx.fillText(text, x, y)
      }
    }
  } else {
    const measure = ctx.measureText(text)
    const pos = calcPosition(canvas.width, canvas.height, measure.width, opts.fontSize, opts.position)
    ctx.translate(pos.x + measure.width / 2, pos.y)
    ctx.rotate((opts.angle * Math.PI) / 180)
    ctx.fillText(text, -measure.width / 2, 0)
  }
  ctx.restore()
}

function calcPosition(
  W: number,
  H: number,
  textW: number,
  textH: number,
  position: string,
): { x: number; y: number } {
  const pad = 24
  switch (position) {
    case 'top-left':
      return { x: pad, y: pad + textH }
    case 'top-right':
      return { x: W - pad - textW, y: pad + textH }
    case 'bottom-left':
      return { x: pad, y: H - pad }
    case 'bottom-right':
      return { x: W - pad - textW, y: H - pad }
    case 'center':
      return { x: (W - textW) / 2, y: (H + textH) / 2 }
    default:
      return { x: (W - textW) / 2, y: H - pad }
  }
}

export default function Watermark() {
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [fileName, setFileName] = useState('')
  const [wmType, setWmType] = useState<WatermarkType>('text')
  const [text, setText] = useState('© vimz Tools')
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const [opacity, setOpacity] = useState(45)
  const [fontSize, setFontSize] = useState(48)
  const [position, setPosition] = useState('bottom-right')
  const [angle, setAngle] = useState(0)
  const [color, setColor] = useState('#ffffff')
  const [repeat, setRepeat] = useState(false)
  const [busy, setBusy] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const { toast } = useToast()

  const onFiles = useCallback(
    async (files: File[]) => {
      const f = files[0]
      if (!f) return
      try {
        const url = await readFileAsDataUrl(f)
        setImageUrl(url)
        setFileName(f.name)
      } catch {
        toast('Failed to read image.', 'error')
      }
    },
    [toast],
  )

  const onLogo = useCallback(
    async (files: File[]) => {
      const f = files[0]
      if (!f) return
      try {
        setLogoUrl(await readFileAsDataUrl(f))
      } catch {
        toast('Failed to read logo.', 'error')
      }
    },
    [toast],
  )

  const renderWatermark = async (): Promise<HTMLCanvasElement> => {
    const src = new Image()
    src.src = imageUrl!
    await new Promise<void>((res, rej) => {
      src.onload = () => res()
      src.onerror = () => rej(new Error('img'))
    })
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('canvas')
    canvas.width = src.width
    canvas.height = src.height
    ctx.drawImage(src, 0, 0)

    if (wmType === 'text' && text.trim()) {
      drawTextWatermark(canvas, src, text, {
        opacity: opacity / 100,
        fontSize,
        position,
        angle,
        color,
        repeat,
      })
    } else if (wmType === 'logo' && logoUrl) {
      const logo = new Image()
      logo.src = logoUrl
      await new Promise<void>((res, rej) => {
        logo.onload = () => res()
        logo.onerror = () => rej(new Error('logo'))
      })
      ctx.save()
      ctx.globalAlpha = opacity / 100
      const maxW = canvas.width * 0.3
      const w = Math.min(logo.width, maxW)
      const h = (logo.height / logo.width) * w
      const pos = calcPosition(canvas.width, canvas.height, w, h, position)
      ctx.translate(pos.x + w / 2, pos.y)
      ctx.rotate((angle * Math.PI) / 180)
      ctx.drawImage(logo, -w / 2, -h / 2, w, h)
      ctx.restore()
    }
    return canvas
  }

  const preview = async () => {
    if (!imageUrl) return
    try {
      const canvas = await renderWatermark()
      if (previewUrl) URL.revokeObjectURL(previewUrl)
      const blob = await canvasToBlob(canvas, 'image/png')
      setPreviewUrl(URL.createObjectURL(blob))
      toast('Preview updated.')
    } catch {
      toast('Preview failed.', 'error')
    }
  }

  const download = async () => {
    if (!imageUrl) return
    setBusy(true)
    try {
      const canvas = await renderWatermark()
      const ext = getFileExtension(fileName) || 'png'
      const blob = await canvasToBlob(canvas, ext === 'png' ? 'image/png' : 'image/jpeg', 0.92)
      downloadBlob(blob, `${stripFileExtension(fileName)}-watermarked.${ext === 'jpg' || ext === 'jpeg' ? 'jpg' : 'png'}`)
      toast('Watermarked image downloaded.')
    } catch (e) {
      console.error(e)
      toast('Export failed.', 'error')
    } finally {
      setBusy(false)
    }
  }

  const reset = () => {
    if (imageUrl?.startsWith('blob:')) URL.revokeObjectURL(imageUrl)
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setImageUrl(null)
    setLogoUrl(null)
    setPreviewUrl(null)
    setFileName('')
  }

  return (
    <>
      <Seo
        title="Watermark Overlay - Free Online | vimz Tools"
        description="Add text or image-logo watermarks to your photos with custom opacity, position and rotation. 100% in-browser, no uploads."
      />
      <ToolShell
        title="Watermark Overlay"
        description="Protect your photos by stamping text or your logo with full control over opacity, size, angle and placement — all rendered locally via Canvas."
        icon={<Droplets className="h-6 w-6" />}
        breadcrumb="Image Tools"
      >
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-5 lg:col-span-2">
            {!imageUrl ? (
              <Dropzone
                onFiles={onFiles}
                accept=".png,.jpg,.jpeg,.webp,.bmp,.gif"
                multiple={false}
                label="Drop the photo you want to watermark"
              />
            ) : (
              <>
                {previewUrl ? (
                  <img src={previewUrl} alt="Watermark preview" className="w-full rounded-2xl border border-slate-200 bg-white object-contain shadow-sm" />
                ) : (
                  <button onClick={preview} className="w-full cursor-pointer overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 transition hover:border-primary-300">
                    <img src={imageUrl} alt="Source" className="w-full rounded-xl object-contain" />
                  </button>
                )}
                <div className="flex flex-wrap gap-2">
                  <Button onClick={preview} disabled={busy}>
                    Update preview
                  </Button>
                  <Button variant="success" onClick={download} disabled={busy}>
                    {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                    {busy ? 'Rendering...' : 'Download'}
                  </Button>
                  <Button variant="secondary" onClick={reset}>
                    <ImagePlus className="h-4 w-4" /> New image
                  </Button>
                </div>
              </>
            )}
          </div>

          <div className="h-fit space-y-4 rounded-2xl border border-slate-200 bg-white p-5 lg:sticky lg:top-24">
            <h3 className="text-sm font-bold text-slate-800">Watermark settings</h3>
            {imageUrl && (
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setWmType('text')}
                  className={`rounded-xl border px-3 py-2 text-sm font-semibold transition ${wmType === 'text' ? 'border-primary-500 bg-primary-50 text-primary-800' : 'border-slate-200 text-slate-600'}`}
                >
                  Text
                </button>
                <button
                  onClick={() => setWmType('logo')}
                  className={`rounded-xl border px-3 py-2 text-sm font-semibold transition ${wmType === 'logo' ? 'border-primary-500 bg-primary-50 text-primary-800' : 'border-slate-200 text-slate-600'}`}
                >
                  Logo
                </button>
              </div>
            )}

            {imageUrl && wmType === 'text' && (
              <Field label="Watermark text">
                <TextInput value={text} onChange={(e) => setText(e.target.value)} placeholder="© Your Name" />
              </Field>
            )}

            {imageUrl && wmType === 'logo' && (
              <div>
                <p className="mb-1.5 text-sm font-medium text-slate-700">Logo image</p>
                {logoUrl ? (
                  <div className="flex items-center gap-2 rounded-xl border border-slate-200 p-2">
                    <img src={logoUrl} alt="Logo" className="h-10 w-10 rounded-lg object-contain bg-slate-100" />
                    <button onClick={() => setLogoUrl(null)} className="text-xs font-semibold text-rose-500 hover:text-rose-600">
                      Remove
                    </button>
                  </div>
                ) : (
                  <Dropzone onFiles={onLogo} multiple={false} accept=".png,.jpg,.jpeg,.webp,.svg" label="Upload logo" />
                )}
              </div>
            )}

            {imageUrl && (
              <>
                <Field label={`Opacity: ${opacity}%`}>
                  <input type="range" min={5} max={100} value={opacity} onChange={(e) => setOpacity(Number(e.target.value))} className="w-full accent-primary-600" />
                </Field>
                {wmType === 'text' && (
                  <Field label={`Font size: ${fontSize}px`}>
                    <input type="range" min={12} max={160} value={fontSize} onChange={(e) => setFontSize(Number(e.target.value))} className="w-full accent-primary-600" />
                  </Field>
                )}
                <Field label="Position">
                  <Select value={position} onChange={(e) => setPosition(e.target.value)}>
                    <option value="bottom-right">Bottom right</option>
                    <option value="bottom-left">Bottom left</option>
                    <option value="top-right">Top right</option>
                    <option value="top-left">Top left</option>
                    <option value="center">Center</option>
                  </Select>
                </Field>
                <Field label={`Rotation: ${angle}°`}>
                  <input type="range" min={-45} max={45} value={angle} onChange={(e) => setAngle(Number(e.target.value))} className="w-full accent-primary-600" />
                </Field>
                {wmType === 'text' && (
                  <>
                    <Field label="Text color">
                      <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="h-10 w-full cursor-pointer rounded-lg border border-slate-300" />
                    </Field>
                    <label className="flex select-none items-center gap-2 text-sm text-slate-600">
                      <input type="checkbox" checked={repeat} onChange={(e) => setRepeat(e.target.checked)} className="h-4 w-4 rounded accent-primary-600" />
                      Repeat across image (tile)
                    </label>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </ToolShell>
    </>
  )
}