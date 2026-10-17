import { useMemo, useState } from 'react'
import { AlertTriangle, GitCompare, Wand2 } from 'lucide-react'
import ToolShell from '../../../components/tools/ToolShell'
import Seo from '../../../components/ui/Seo'
import { Button, TextArea } from '../../../components/ui/Fields'

type DiffOp = 'keep' | 'add' | 'del'
interface DiffRow {
  op: DiffOp
  left: string | null
  right: string | null
}

const DOWN = {
  original: 'function greet(name) {\n  return `Hello, ${name}!`;\n}\n',
  modified: 'function greet(name, loud = false) {\n  const msg = `Hello, ${name}!`;\n  return loud ? msg.toUpperCase() : msg;\n}\ngreet("vimz");\n',
}

function diffLines(aRaw: string[], bRaw: string[], compare: (x: string, y: string) => boolean): DiffRow[] {
  const n = aRaw.length
  const m = bRaw.length
  if (n * m > 250000) {
    const out: DiffRow[] = []
    for (const line of aRaw) out.push({ op: 'del', left: line, right: null })
    for (const line of bRaw) out.push({ op: 'add', left: null, right: line })
    return out
  }
  const dp: number[][] = Array.from({ length: n + 1 }, () => Array(m + 1).fill(0))
  for (let i = n - 1; i >= 0; i -= 1) {
    for (let j = m - 1; j >= 0; j -= 1) {
      dp[i][j] = compare(aRaw[i], bRaw[j]) ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1])
    }
  }
  const out: DiffRow[] = []
  let i = 0
  let j = 0
  while (i < n && j < m) {
    if (compare(aRaw[i], bRaw[j])) {
      out.push({ op: 'keep', left: aRaw[i], right: bRaw[j] })
      i += 1
      j += 1
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      out.push({ op: 'del', left: aRaw[i], right: null })
      i += 1
    } else {
      out.push({ op: 'add', left: null, right: bRaw[j] })
      j += 1
    }
  }
  while (i < n) {
    out.push({ op: 'del', left: aRaw[i], right: null })
    i += 1
  }
  while (j < m) {
    out.push({ op: 'add', left: null, right: bRaw[j] })
    j += 1
  }
  return out
}

export default function CodeDiffComparer() {
  const [left, setLeft] = useState('')
  const [right, setRight] = useState('')
  const [view, setView] = useState<'split' | 'unified'>('split')
  const [ignoreCase, setIgnoreCase] = useState(false)

  const diff = useMemo(() => {
    const splitInto = (s: string) => {
      if (!s) return []
      const lines = s.replace(/\r\n/g, '\n').split('\n')
      if (lines[lines.length - 1] === '') lines.pop()
      return lines
    }
    const a = splitInto(left)
    const b = splitInto(right)
    const compare = (x: string, y: string) =>
      ignoreCase ? x.trim().toLowerCase() === y.trim().toLowerCase() : x === y
    return diffLines(a, b, compare)
  }, [left, right, ignoreCase])

  const adds = diff.filter((d) => d.op === 'add').length
  const dels = diff.filter((d) => d.op === 'del').length

  const rowCls = (op: DiffOp) => {
    if (op === 'add') return 'bg-emerald-50 text-emerald-900'
    if (op === 'del') return 'bg-rose-50 text-rose-900'
    return 'text-slate-700'
  }

  return (
    <>
      <Seo
        title="Code Diff & Syntax Comparison Tool - vimz Tools"
        description="Compare two code snippets line by line with a highlighted split view, added lines, removed lines and an optional unified mode."
      />
      <ToolShell
        title="Code Diff & Syntax Comparison Tool"
        description="Paste two versions of any code or text and see exactly what changed, line by line, in a split or unified diff view."
        icon={<GitCompare className="h-6 w-6" />}
        breadcrumb="Office Utilities"
        instruction="Paste the original on the left and the edited version on the right"
      >
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <div className="flex overflow-hidden rounded-xl border border-slate-200">
            {(['split', 'unified'] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-4 py-2 text-sm font-bold capitalize transition ${view === v ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'}`}
              >
                {v}
              </button>
            ))}
          </div>
          <button
            onClick={() => setIgnoreCase((x) => !x)}
            className={`rounded-xl border px-4 py-2 text-sm font-bold transition ${ignoreCase ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-slate-200 bg-white text-slate-600'}`}
          >
            Ignore case &amp; whitespace
          </button>
          <div className="ml-auto flex gap-2 text-xs font-bold">
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-emerald-700">{adds} added</span>
            <span className="rounded-full bg-rose-100 px-3 py-1 text-rose-700">{dels} removed</span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <section className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="mb-3 flex items-center justify-between gap-2">
                <h3 className="text-sm font-bold text-slate-800">Original</h3>
                <Button variant="ghost" className="px-3 py-1 text-xs" onClick={() => setLeft(DOWN.original)}>
                  <Wand2 className="h-3.5 w-3.5" /> Sample
                </Button>
              </div>
              <TextArea rows={10} value={left} onChange={(e) => setLeft(e.target.value)} placeholder="Original version..." className="font-mono" />
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="mb-3 flex items-center justify-between gap-2">
                <h3 className="text-sm font-bold text-slate-800">Modified</h3>
                <Button variant="ghost" className="px-3 py-1 text-xs" onClick={() => setRight(DOWN.modified)}>
                  <Wand2 className="h-3.5 w-3.5" /> Sample
                </Button>
              </div>
              <TextArea rows={10} value={right} onChange={(e) => setRight(e.target.value)} placeholder="Modified version..." className="font-mono" />
            </div>
          </section>

          <section>
            {left.trim() === '' && right.trim() === '' ? (
              <div className="flex h-full min-h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 p-8 text-center">
                <GitCompare className="mb-2 h-8 w-8 text-slate-300" />
                <p className="text-xs text-slate-400">Paste both versions to see a line-by-line comparison.</p>
              </div>
            ) : (
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                <div className="flex items-center gap-2 border-b border-slate-200 bg-slate-50 px-4 py-2 text-xs font-bold text-slate-500">
                  {view === 'split' ? (
                    <>
                      <span className="text-rose-600">- removed</span>
                      <span className="text-slate-300">|</span>
                      <span className="text-emerald-600">+ added</span>
                    </>
                  ) : (
                    <span>unified view</span>
                  )}
                </div>
                {view === 'split' ? (
                  <div className="grid grid-cols-2 divide-x divide-slate-200">
                    <div className="text-xs">
                      {diff.map((row, i) => (
                        <div key={i} className={`flex min-h-5 border-l-2 ${row.op === 'del' ? 'border-rose-400' : row.op === 'add' ? 'border-emerald-400' : 'border-transparent'} ${rowCls(row.op)}`}>
                          <span className="w-10 shrink-0 select-none border-r border-slate-200/70 bg-white/60 py-0.5 pr-1 text-right font-mono text-slate-400">{row.left !== null ? String(i + 1) : ''}</span>
                          <span className="whitespace-pre-wrap break-words px-2 py-0.5 font-mono">{row.left ?? ''}</span>
                        </div>
                      ))}
                    </div>
                    <div className="text-xs">
                      {diff.map((row, i) => (
                        <div key={i} className={`flex min-h-5 border-l-2 ${row.op === 'add' ? 'border-emerald-400' : row.op === 'del' ? 'border-rose-400' : 'border-transparent'} ${rowCls(row.op)}`}>
                          <span className="w-10 shrink-0 select-none border-r border-slate-200/70 bg-white/60 py-0.5 pr-1 text-right font-mono text-slate-400">{row.right !== null ? String(i + 1) : ''}</span>
                          <span className="whitespace-pre-wrap break-words px-2 py-0.5 font-mono">{row.right ?? ''}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-xs">
                    {diff.map((row, i) => (
                      <div key={i} className={`flex min-h-5 ${rowCls(row.op)}`}>
                        <span className={`w-7 shrink-0 select-none py-0.5 text-center font-mono ${row.op === 'add' ? 'text-emerald-600' : row.op === 'del' ? 'text-rose-500' : 'bg-white/60 text-slate-400'}`}>
                          {row.op === 'add' ? '+' : row.op === 'del' ? '-' : ' '}
                        </span>
                        <span className="whitespace-pre-wrap break-words px-2 py-0.5 font-mono">{row.left ?? row.right ?? ''}</span>
                      </div>
                    ))}
                  </div>
                )}
                {(adds === 0 && dels === 0) && (
                  <div className="flex items-center justify-center gap-2 border-t border-slate-200 bg-slate-50 px-4 py-3 text-xs font-medium text-emerald-700">
                    Files are identical.
                  </div>
                )}
                {diff.length === 0 && (
                  <div className="flex items-center justify-center gap-2 border-t border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-400">
                    <AlertTriangle className="h-3.5 w-3.5" /> Nothing to compare yet.
                  </div>
                )}
              </div>
            )}
          </section>
        </div>
      </ToolShell>
    </>
  )
}