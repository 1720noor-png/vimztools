import { useState } from 'react'
import { Copy, Check } from 'lucide-react'
import { TemplateShell, inputCls, btnCls, btnGhostCls } from './TemplateShell'
import type { RegistryTool } from '../../lib/toolRegistry'

export function ConverterFormTemplate({ tool }: { tool: RegistryTool }) {
  const [value, setValue] = useState('')
  const [src, setSrc] = useState('m')
  const [dst, setDst] = useState('ft')

  const units: Record<string, { label: string; toBase: number }> = {
    m: { label: 'meter (m)', toBase: 1 },
    km: { label: 'kilometer (km)', toBase: 1000 },
    cm: { label: 'centimeter (cm)', toBase: 0.01 },
    ft: { label: 'foot (ft)', toBase: 0.3048 },
    in: { label: 'inch (in)', toBase: 0.0254 },
    mi: { label: 'mile (mi)', toBase: 1609.344 },
    yd: { label: 'yard (yd)', toBase: 0.9144 },
  }

  function convert() {
    const n = parseFloat(value)
    if (Number.isNaN(n)) return 'Enter a numeric value to convert.'
    const base = n * units[src].toBase
    const out = base / units[dst].toBase
    return `${n} ${units[src].label} = ${out.toLocaleString(undefined, { maximumFractionDigits: 6 })} ${units[dst].label}`
  }

  const result = convert()

  return (
    <TemplateShell tool={tool}>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-400">Value</label>
          <input className={inputCls} type="number" value={value} onChange={(e) => setValue(e.target.value)} placeholder="0" />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-400">From</label>
          <select className={inputCls} value={src} onChange={(e) => setSrc(e.target.value)}>
            {Object.entries(units).map(([k, u]) => (
              <option key={k} value={k}>{u.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-400">To</label>
          <select className={inputCls} value={dst} onChange={(e) => setDst(e.target.value)}>
            {Object.entries(units).map(([k, u]) => (
              <option key={k} value={k}>{u.label}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-base font-bold text-emerald-900">
        {result}
      </div>
    </TemplateShell>
  )
}

export function TextManipulatorTemplate({ tool }: { tool: RegistryTool }) {
  const [text, setText] = useState('')
  const [copied, setCopied] = useState(false)

  function apply(fn: (s: string) => string) {
    setText(fn(text))
  }

  async function copy() {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const words = text.trim() ? text.trim().split(/\s+/).length : 0
  const chars = text.length

  return (
    <TemplateShell tool={tool}>
      <textarea
        className={`${inputCls} min-h-44 font-mono`}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Paste or type your text here..."
      />
      <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500">
        <span>{words} words</span>·<span>{chars} characters</span>
      </div>
      <div className="mt-5 flex flex-wrap gap-2">
        <button className={btnGhostCls} onClick={() => apply((s) => s.toUpperCase())}>UPPERCASE</button>
        <button className={btnGhostCls} onClick={() => apply((s) => s.toLowerCase())}>lowercase</button>
        <button className={btnGhostCls} onClick={() => apply((s) => s.replace(/\b\w/g, (m) => m.toUpperCase()))}>Title Case</button>
        <button className={btnGhostCls} onClick={() => apply((s) => s.trim().replace(/\s+/g, ' '))}>Trim Spaces</button>
        <button className={btnGhostCls} onClick={() => apply((s) => s.split('').reverse().join(''))}>Reverse</button>
        <button className={btnGhostCls} onClick={() => setText('')}>Clear</button>
      </div>
      <div className="mt-6">
        <button className={btnCls} onClick={copy}>
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          {copied ? 'Copied!' : 'Copy result'}
        </button>
      </div>
    </TemplateShell>
  )
}