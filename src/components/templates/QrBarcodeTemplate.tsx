import { useEffect, useState } from 'react'
import QRCode from 'qrcode'
import { Copy, Check, Loader2 } from 'lucide-react'
import { TemplateShell, inputCls, btnCls } from './TemplateShell'
import type { RegistryTool } from '../../lib/toolRegistry'

export function QrBarcodeTemplate({ tool }: { tool: RegistryTool }) {
  const [text, setText] = useState('https://vimz.com')
  const [dataUrl, setDataUrl] = useState('')
  const [copied, setCopied] = useState(false)
  const [busy, setBusy] = useState(true)

  useEffect(() => {
    let alive = true
    QRCode.toDataURL(text || ' ', { margin: 2, width: 320, errorCorrectionLevel: 'M' })
      .then((url) => {
        if (alive) setDataUrl(url)
      })
      .catch(() => {
        if (alive) setDataUrl('')
      })
      .finally(() => {
        if (alive) setBusy(false)
      })
    return () => {
      alive = false
    }
  }, [text])

  async function copy() {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <TemplateShell tool={tool}>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-400">Content</label>
          <textarea
            className={`${inputCls} min-h-28`}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type a URL, text or Wi-Fi credentials…"
          />
          <div className="mt-3 flex gap-2">
            <button className={btnCls} onClick={copy}>
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? 'Copied!' : 'Copy content'}
            </button>
            {dataUrl && (
              <a
                href={dataUrl}
                download={`${(tool.id || 'qr').replace(/[^a-z0-9]+/g, '-')}.png`}
                className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:border-primary-400 hover:text-primary-700"
              >
                Download PNG
              </a>
            )}
          </div>
        </div>
        <div className="flex items-center justify-center rounded-2xl bg-slate-50 p-6">
          {busy ? (
            <Loader2 className="h-10 w-10 animate-spin text-slate-300" />
          ) : dataUrl ? (
            <img src={dataUrl} alt="QR code" className="h-52 w-52 rounded-xl bg-white p-2 shadow-sm" />
          ) : (
            <p className="text-sm text-slate-400">Enter content to generate</p>
          )}
        </div>
      </div>
    </TemplateShell>
  )
}