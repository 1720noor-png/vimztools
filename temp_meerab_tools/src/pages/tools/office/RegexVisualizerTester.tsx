import { useMemo, useState } from 'react'
import { AlertTriangle, CopyCheck, Regex, ScanSearch } from 'lucide-react'
import ToolShell from '../../../components/tools/ToolShell'
import Seo from '../../../components/ui/Seo'
import { Field, TextArea, TextInput } from '../../../components/ui/Fields'

interface MatchInfo {
  value: string
  index: number
  groups: string[]
}

const PRESETS = [
  {
    label: 'Email',
    pattern: '[\\w.+-]+@[\\w-]+\\.[\\w.-]+',
    sample: 'Contact vimzadmin@example.com or sales@vimz.io for a quote today.',
  },
  {
    label: 'URL',
    pattern: 'https?://[^\\s]+',
    sample: 'See https://vimz.example.com/docs and http://api.example.org/v1 for details.',
  },
  {
    label: 'Phone',
    pattern: '\\+?\\d[\\d\\s()-]{6,}', 
    sample: 'Reach +233 24 000 0000 or 0302 555 1234 for support.',
  },
  {
    label: 'Numbers',
    pattern: '\\d{3,}',
    sample: 'Order 2048 units in batch 9001 to warehouse 15.',
  },
]

function applySegments(segments: { text: string; isMatch: boolean }[]) {
  return segments.map((seg, i) =>
    seg.isMatch ? (
      <mark key={i} className="rounded bg-fuchsia-200 px-0.5 text-slate-900">
        {seg.text}
      </mark>
    ) : (
      <span key={i}>{seg.text}</span>
    ),
  )
}

export default function RegexVisualizerTester() {
  const [pattern, setPattern] = useState('')
  const [flags, setFlags] = useState<string[]>(['g', 'i'])
  const [test, setTest] = useState('')

  const flagSet = flags.join('')

  const result = useMemo(() => {
    const empty = { error: '', matches: [] as MatchInfo[], segments: [{ text: test, isMatch: false }], stats: 'No matches.' }
    if (!pattern.trim()) {
      return { ...empty, segments: test ? [{ text: test, isMatch: false }] : [] }
    }
    let re: RegExp
    try {
      re = new RegExp(pattern, flagSet)
    } catch (e) {
      return {
        error: e instanceof Error ? e.message : 'Invalid regular expression.',
        matches: [] as MatchInfo[],
        segments: test ? [{ text: test, isMatch: false }] : [],
        stats: '',
      }
    }
    const matches: MatchInfo[] = []
    const segments: { text: string; isMatch: boolean }[] = []
    let m: RegExpExecArray | null
    if (re.global) {
      let last = 0
      re.lastIndex = 0
      while ((m = re.exec(test)) !== null) {
        if (m.index > last) segments.push({ text: test.slice(last, m.index), isMatch: false })
        if (m[0]) {
          segments.push({ text: m[0], isMatch: true })
          matches.push({ value: m[0], index: m.index, groups: m.slice(1) })
        }
        last = m.index + m[0].length
        if (m[0].length === 0) re.lastIndex += 1
      }
      if (last < test.length) segments.push({ text: test.slice(last), isMatch: false })
    } else {
      m = re.exec(test)
      if (m && m.index !== undefined) {
        if (m.index > 0) segments.push({ text: test.slice(0, m.index), isMatch: false })
        if (m[0]) {
          segments.push({ text: m[0], isMatch: true })
          matches.push({ value: m[0], index: m.index, groups: m.slice(1) })
        }
        if (m.index + m[0].length < test.length) {
          segments.push({ text: test.slice(m.index + m[0].length), isMatch: false })
        }
      } else {
        segments.push({ text: test, isMatch: false })
      }
    }
    const totalChars = matches.reduce((a, b) => a + b.value.length, 0)
    const stats = matches.length
      ? `${matches.length} match${matches.length === 1 ? '' : 'es'}, ${totalChars} matched characters.`
      : 'No matches.'
    return { error: '', matches, segments, stats }
  }, [pattern, flagSet, test])

  const toggleFlag = (f: string) => {
    setFlags((prev) => (prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f]))
  }

  const applyPreset = (p: (typeof PRESETS)[number]) => {
    setPattern(p.pattern)
    setTest(p.sample)
  }

  const copySample = (m: MatchInfo) => {
    try {
      navigator.clipboard.writeText(m.value)
    } catch {}
  }

  return (
    <>
      <Seo
        title="Regex Visualizer & Expression Tester - vimz Tools"
        description="Build and test regular expressions live with match highlighting, capture groups and flag toggles."
      />
      <ToolShell
        title="Regex Visualizer & Expression Tester"
        description="Compose a regular expression and watch matches light up in your sample text in real time, with capture groups listed below."
        icon={<Regex className="h-6 w-6" />}
        breadcrumb="Office Utilities"
        instruction="Type a pattern and sample text - every match is highlighted instantly"
      >
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <section className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-800">
                <ScanSearch className="h-4 w-4 text-primary-600" /> Expression
              </h3>
              <Field label="Pattern">
                <TextInput value={pattern} onChange={(e) => setPattern(e.target.value)} placeholder="[\\w.-]+@[\\w-]+\\.[\\w.-]+" className="font-mono" />
              </Field>
              <div className="mt-3">
                <p className="mb-1.5 text-sm font-medium text-slate-700">Flags</p>
                <div className="flex flex-wrap gap-1.5">
                  {['g', 'i', 'm', 's', 'u', 'y'].map((f) => (
                    <button
                      key={f}
                      onClick={() => toggleFlag(f)}
                      className={`rounded-lg border px-3 py-1.5 font-mono text-sm font-bold transition ${flags.includes(f) ? 'border-primary-500 bg-primary-600 text-white' : 'border-slate-200 bg-white text-slate-500 hover:border-primary-300'}`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>
              <div className="mt-4">
                <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-400">Presets</p>
                <div className="flex flex-wrap gap-1.5">
                  {PRESETS.map((p) => (
                    <button
                      key={p.label}
                      onClick={() => applyPreset(p)}
                      className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600 transition hover:border-primary-300 hover:text-primary-700"
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <h3 className="mb-3 text-sm font-bold text-slate-800">Sample text</h3>
              <TextArea rows={10} value={test} onChange={(e) => setTest(e.target.value)} placeholder="Paste the text you want to test against..." />
            </div>
          </section>

          <section className="space-y-4">
            {result.error ? (
              <div className="flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 p-4">
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-rose-600" />
                <div>
                  <p className="text-sm font-bold text-rose-800">The pattern will not compile</p>
                  <p className="mt-0.5 break-all font-mono text-xs text-rose-700">{result.error}</p>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <div className="mb-3 flex items-center justify-between gap-2">
                  <h3 className="text-sm font-bold text-slate-800">Live match preview</h3>
                  <span className="rounded-full bg-fuchsia-100 px-2.5 py-1 text-[11px] font-bold text-fuchsia-700">{result.stats}</span>
                </div>
                <div className="min-h-40 rounded-xl border border-slate-200 bg-slate-50 p-4">
                  {result.segments.length === 0 ? (
                    <p className="text-xs text-slate-400">Paste sample text to see matches highlighted.</p>
                  ) : (
                    <p className="whitespace-pre-wrap break-words font-mono text-sm leading-relaxed text-slate-700">
                      {applySegments(result.segments)}
                    </p>
                  )}
                </div>
              </div>
            )}

            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <h3 className="mb-3 text-sm font-bold text-slate-800">Match list</h3>
              {result.matches.length === 0 ? (
                <p className="rounded-xl border border-dashed border-slate-200 px-4 py-6 text-center text-xs text-slate-400">
                  No matches captured yet.
                </p>
              ) : (
                <ul className="max-h-80 space-y-2 overflow-auto pr-1">
                  {result.matches.map((m, i) => (
                    <li key={`${m.index}-${i}`} className="flex items-start justify-between gap-3 rounded-lg border border-slate-200 bg-white p-3">
                      <div className="min-w-0">
                        <p className="truncate font-mono text-xs font-bold text-slate-800">{m.value}</p>
                        <p className="text-[11px] text-slate-400">
                          index {m.index} · length {m.value.length}
                          {m.groups.length > 0 && ` · ${m.groups.length} capture group${m.groups.length === 1 ? '' : 's'}`}
                        </p>
                        {m.groups.some((g) => g !== undefined) && (
                          <p className="mt-1 font-mono text-[11px] text-slate-500">
                            {m.groups.map((g, gi) => (g !== undefined ? `#${gi + 1}: "${g}"` : '')).filter(Boolean).join(' · ')}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => copySample(m)}
                        className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-slate-200 px-2 py-1 text-[11px] font-semibold text-slate-500 transition hover:bg-slate-50"
                      >
                        <CopyCheck className="h-3.5 w-3.5" /> Copy
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              <p className="mt-4 text-[11px] leading-relaxed text-slate-400">
                Every match is computed locally in this tab. Nothing leaves your browser.
              </p>
            </div>
          </section>
        </div>
      </ToolShell>
    </>
  )
}