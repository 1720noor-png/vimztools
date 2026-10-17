import { useState } from 'react'
import { RefreshCw, Copy, Check } from 'lucide-react'
import { TemplateShell, inputCls, btnCls, btnGhostCls } from './TemplateShell'
import type { RegistryTool } from '../../lib/toolRegistry'

const WORDS = ['purple','octopus','sunset','candle','river','thunder','banana','mirror','meadow','falcon','breeze','window','crystal','orchid','pocket','lantern']

export function GeneratorUtilityTemplate({ tool }: { tool: RegistryTool }) {
  const kw = (tool.keywords ?? []).join(' ')

  const [length, setLength] = useState(16)
  const [symbols, setSymbols] = useState(true)
  const [output, setOutput] = useState('')
  const [copied, setCopied] = useState(false)

  const isPassword = /password|pass/i.test(kw)
  const isUuid = /uuid|identifier|unique/i.test(kw)
  const isText = /lorem|placeholder|text/i.test(kw)
  const isQuote = /quote|inspiration/i.test(kw)

  function randomPassword(len: number, useSymbols: boolean): string {
    const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    const lower = 'abcdefghijklmnopqrstuvwxyz'
    const digits = '0123456789'
    const sym = '!@#$%^&*()-_=+[]{};:,.<>?'
    const pool = upper + lower + digits + (useSymbols ? sym : '')
    const arr = new Uint32Array(len)
    crypto.getRandomValues(arr)
    return Array.from(arr, (n) => pool[n % pool.length]).join('')
  }

  function generate() {
    if (isPassword) {
      setOutput(randomPassword(length, symbols))
    } else if (isUuid) {
      const s = crypto.randomUUID()
      setOutput(s)
    } else if (isText) {
      const count = Math.max(1, Math.min(6, length))
      const words = Array.from({ length: count }, (_, i) => `${WORDS[i % WORDS.length]}${i % 3 === 0 ? ' lorem ipsum dolor sit amet' : ''}`)
      setOutput(words.join(' '))
    } else if (isQuote) {
      const quotes = [
        '“Small daily improvements are the key to staggering long-term results.”',
        '“You do not have to be great to start, but you have to start to be great.”',
        '“Discipline is choosing between what you want now and what you want most.”',
        '“The best time to plant a tree was 20 years ago. The second best time is now.”',
      ]
      setOutput(quotes[Math.floor(Math.random() * quotes.length)])
    } else {
      setOutput(randomPassword(length, symbols))
    }
  }

  async function copy() {
    if (!output) return
    await navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <TemplateShell tool={tool}>
      <div className="flex flex-wrap items-center gap-4">
        <div>
          <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-400">Length / count</label>
          <input
            type="number"
            min={4}
            max={64}
            className={`${inputCls} w-28`}
            value={length}
            onChange={(e) => setLength(Number(e.target.value))}
          />
        </div>
        {isPassword && (
          <label className="flex items-center gap-2 pt-5 text-sm font-medium text-slate-600">
            <input type="checkbox" checked={symbols} onChange={(e) => setSymbols(e.target.checked)} className="h-4 w-4 rounded border-slate-300 text-primary-600" />
            Include symbols
          </label>
        )}
        <div className="pt-3">
          <button className={btnCls} onClick={generate}>
            <RefreshCw className="h-4 w-4" /> Generate
          </button>
        </div>
      </div>

      {output && (
        <div className="mt-6">
          <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4">
            <span className="flex-1 break-all font-mono text-sm text-slate-800">{output}</span>
            <button className={btnGhostCls} onClick={copy}>
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>
      )}
    </TemplateShell>
  )
}