import { useCallback, useState } from 'react'
import { RefreshCw, Download, Loader2 } from 'lucide-react'
import ToolShell from '../../../components/tools/ToolShell'
import Dropzone from '../../../components/ui/Dropzone'
import { Button, Field } from '../../../components/ui/Fields'
import { useToast } from '../../../components/ui/Toast'
import Seo from '../../../components/ui/Seo'
import { canvasToBlob, downloadBlob, formatBytes, loadImage, readFileAsDataUrl, stripFileExtension } from '../../../lib/utils'

const formats = [
  { value: 'png', label: 'PNG (lossless)', mime: 'image/png' },
  { value: 'jpeg', label: 'JPG / JPEG', mime: 'image/jpeg' },
  { value: 'webp', label: 'WebP', mime: 'image/webp' },
]

interface ConvertedResult {
  blob: Blob
  url: string
  name: string
  size: number
}

export default function FormatConverter() {
  const [sourceUrl, setSourceUrl] = useState<string | null>(null)
  const [sourceName, setSourceName] = useState('')
  const [target, setTarget] = useState('png')
  const [quality, setQuality] = useState(0.9)
  const [busy, setBusy] = useState(false)
  const [result, setResult] = useState<ConvertedResult | null>(null)
  const { toast } = useToast()

  const onFiles = useCallback(
    async (files: File[]) => {
      const f = files[0]
      if (!f) return
      try {
        if (sourceUrl?.startsWith('blob:')) URL.revokeObjectURL(sourceUrl)
        if (result?.url) URL.revokeObjectURL(result.url)
        const dataUrl = await readFileAsDataUrl(f)
        setSourceUrl(dataUrl)
        setSourceName(f.name)
        setResult(null)
      } catch {
        toast('Failed to read image.', 'error')
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sourceUrl, toast],
  )

  const convert = async () => {
    if (!sourceUrl) return
    setBusy(true)
    try {
      const img = await loadImage(sourceUrl)
      const canvas = document.createElement('canvas')
      canvas.width = img.naturalWidth
      canvas.height = img.naturalHeight
      const ctx = canvas.getContext('2d')
      if (!ctx) throw new Error('no ctx')
      if (target === 'jpeg') {
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
      }
      ctx.drawImage(img, 0, 0)

      const fmt = formats.find((f) => f.value === target)!
      const blob = await canvasToBlob(canvas, fmt.mime, target === 'png' ? undefined : quality)
      const url = URL.createObjectURL(blob)
      if (result?.url) URL.revokeObjectURL(result.url)
      setResult({ blob, url, name: `${stripFileExtension(sourceName)}.${target}`, size: blob.size })
      toast(`Converted to ${target.toUpperCase()}.`)
    } catch (e) {
      console.error(e)
      toast('Conversion failed.', 'error')
    } finally {
      setBusy(false)
    }
  }

  const download = () => {
    if (!result) return
    downloadBlob(result.blob, result.name)
    toast('Converted image downloaded.')
  }

  const reset = () => {
    if (sourceUrl?.startsWith('blob:')) URL.revokeObjectURL(sourceUrl)
    if (result?.url) URL.revokeObjectURL(result.url)
    setSourceUrl(null)
    setResult(null)
    setSourceName('')
  }

  return (
    <>
      <Seo
        title="Image Format Converter - Free Online | vimz Tools"
        description="Convert images between PNG, JPG and WebP formats instantly in your browser. Free, private, no uploads."
      />
      <ToolShell
        title="Image Format Converter"
        description="Switch any image between PNG, JPG and WebP with quality control. Rendering happens entirely on your device via the Canvas API."
        icon={<RefreshCw className="h-6 w-6" />}
        breadcrumb="Image Tools"
      >
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-5 lg:col-span-2">
            {!sourceUrl ? (
              <Dropzone
                onFiles={onFiles}
                accept=".png,.jpg,.jpeg,.webp,.bmp,.gif,.svg"
                multiple={false}
                label="Drop an image to convert its format"
              />
            ) : (
              <>
                <div className="flex items-center justify-center rounded-2xl border border-slate-200 bg-slate-100 p-4">
                  <img src={sourceUrl} alt="Source" className="max-h-80 rounded-lg object-contain" />
                </div>
                <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-800">{sourceName}</p>
                    <p className="text-xs text-slate-400">Original image</p>
                  </div>
                  <Button variant="secondary" onClick={reset}>Change image</Button>
                </div>
              </>
            )}

            {result && (
              <div className="rounded-2xl border border-primary-200 bg-primary-50 p-5">
                <h3 className="text-sm font-bold text-primary-800">Converted result</h3>
                <div className="mt-3 flex justify-center">
                  <img src={result.url} alt="Converted" className="max-h-72 rounded-xl border border-primary-200 bg-white p-1 object-contain" />
                </div>
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                  <p className="text-xs text-slate-500">
                    {result.name} · <span className="font-semibold text-slate-700">{formatBytes(result.size)}</span>
                  </p>
                  <Button variant="success" onClick={download}>
                    <Download className="h-4 w-4" /> Download
                  </Button>
                </div>
              </div>
            )}
          </div>

          <div className="h-fit space-y-4 rounded-2xl border border-slate-200 bg-white p-5 lg:sticky lg:top-24">
            <h3 className="text-sm font-bold text-slate-800">Target format</h3>
            <div className="space-y-2">
              {formats.map((f) => (
                <button
                  key={f.value}
                  onClick={() => setTarget(f.value)}
                  className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-sm font-semibold transition ${
                    target === f.value
                      ? 'border-primary-500 bg-primary-50 text-primary-800'
                      : 'border-slate-200 text-slate-600 hover:border-primary-300'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
            {target !== 'png' && (
              <Field label={`Quality: ${Math.round(quality * 100)}%`}>
                <input
                  type="range"
                  min={0.3}
                  max={1}
                  step={0.05}
                  value={quality}
                  onChange={(e) => setQuality(Number(e.target.value))}
                  className="w-full accent-primary-600"
                />
              </Field>
            )}
            <Button onClick={convert} disabled={!sourceUrl || busy} className="w-full">
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              {busy ? 'Converting...' : `Convert to ${target.toUpperCase()}`}
            </Button>
          </div>
        </div>
      </ToolShell>
    </>
  )
}