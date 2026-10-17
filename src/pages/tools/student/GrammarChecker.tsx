import { useMemo, useState } from 'react'
import { SpellCheck2, Wand2 } from 'lucide-react'
import ToolShell from '../../../components/tools/ToolShell'
import { Button, Field, TextArea } from '../../../components/ui/Fields'
import Seo from '../../../components/ui/Seo'

interface Issue {
  type: string
  at: number
  original: string
  suggestion: string
}

const COMMON = new Map([
  ['recieve', 'receive'],
  ['seperate', 'separate'],
  ['occured', 'occurred'],
  ['definately', 'definitely'],
  ['goverment', 'government'],
  ['wierd', 'weird'],
  ['adress', 'address'],
  ['arguement', 'argument'],
  ['beleive', 'believe'],
  ['begining', 'beginning'],
  ['comittee', 'committee'],
  ['environement', 'environment'],
  ['febuary', 'February'],
  ['foriegn', 'foreign'],
  ['freind', 'friend'],
  ['neccessary', 'necessary'],
])

function checkAll(text: string): { issues: Issue[]; corrected: string } {
  const issues: Issue[] = []
  let arr = text.split(' ')

  for (let i = 0; i < arr.length; i++) {
    const w = arr[i]
    const low = w.toLowerCase().replace(/[^a-z']/g, '')
    if (COMMON.has(low) && low.length > 0) {
      const fix = COMMON.get(low)!
      const withPunct = w.replace(low, fix)
      issues.push({ type: 'Spelling', at: i, original: w, suggestion: withPunct })
      arr[i] = withPunct
    }
    if (i < arr.length - 1 && w.toLowerCase() === arr[i + 1].toLowerCase() && /[a-z]/i.test(w) && arr[i + 1].length > 2) {
      issues.push({ type: 'Repeated word', at: i, original: `${w} ${arr[i + 1]}`, suggestion: w })
    }
    if (w === 'i') {
      issues.push({ type: 'Capitalisation', at: i, original: 'i', suggestion: 'I' })
      arr[i] = 'I'
    }
    if (w.toLowerCase() === 'of' && arr[i + 1]?.toLowerCase() === 'should') {
      // handled by the phrase pass below
    }
  }

  const joined = arr.join(' ')
  const shouldOf = joined.replace(/\bshould of\b/gi, 'should have')
  if (shouldOf !== joined) issues.push({ type: 'Verb form', at: 0, original: 'should of', suggestion: 'should have' })
  const wouldOf = joined.replace(/\bcould of\b/gi, 'could have')
  if (wouldOf !== joined) issues.push({ type: 'Verb form', at: 0, original: 'could of', suggestion: 'could have' })

  let final = wouldOf
  const split = final.trimEnd()
  const hasEndPunct = /[.!?]["')\]]?$/.test(split)
  final = hasEndPunct || split === '' ? split : split + '.'

  const longSentences = (text.match(/[^.?!]+(?:[.!?]+|$)/g) ?? []).filter((s) => s.trim().split(/\s+/).length > 40)
  if (longSentences.length > 0) issues.push({ type: 'Long sentence', at: 0, original: 'Runner of 40+ words', suggestion: 'Consider splitting into two sentences.' })

  const passive = (text.match(/\b(was|were|been) +(\w+ed)\b/g) ?? []).slice(0, 3)
  for (const p of passive) issues.push({ type: 'Possible passive voice', at: 0, original: p, suggestion: 'Optionally recast in active voice.' })

  issues.sort((a, b) => a.at - b.at)
  return { issues, corrected: final }
}

export default function GrammarChecker() {
  const [text, setText] = useState('')
  const [ran, setRan] = useState(false)

  const result = useMemo(() => (void ran, text.trim() ? checkAll(text) : null), [text, ran])

  return (
    <>
      <Seo
        title="Grammar Checker - vimz Tools"
        description="Catch spelling slips, repeated words and common grammar errors before you submit."
      />
      <ToolShell
        title="Grammar Checker"
        description="A fast, private spell and grammar pass - nothing leaves your browser."
        icon={<SpellCheck2 className="h-6 w-6" />}
        breadcrumb="Student Tools"
        instruction="Paste any text and review each flagged issue with a suggested fix."
      >
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <div className="space-y-4">
            <Field label="Your text">
              <TextArea rows={10} value={text} onChange={(e) => setText(e.target.value)} placeholder="Type or paste something to check..." />
            </Field>
            <Button onClick={() => setRan((r) => !r)} disabled={!text.trim()}>
              <Wand2 className="h-4 w-4" /> Check text
            </Button>
          </div>

          <div className="space-y-4">
            {!result ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center text-sm text-slate-400">
                Issues will be listed here.
              </div>
            ) : (
              <>
                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <p className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-400">
                    {result.issues.length} issue{result.issues.length === 1 ? '' : 's'} found
                  </p>
                  <ul className="space-y-2.5">
                    {result.issues.length === 0 && <li className="text-sm text-emerald-600 font-medium">No issues detected.</li>}
                    {result.issues.map((it, i) => (
                      <li key={i} className="flex flex-wrap items-center gap-2 text-sm">
                        <span className="rounded-full bg-rose-100 px-2 py-0.5 text-xs font-bold text-rose-700">{it.type}</span>
                        <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-rose-700">{it.original}</code>
                        <span className="text-slate-400">&rarr;</span>
                        <code className="rounded bg-emerald-50 px-1.5 py-0.5 font-mono text-emerald-700">{it.suggestion}</code>
                      </li>
                    ))}
                  </ul>
                </div>
                <Field label="Suggested clean version">
                  <pre className="whitespace-pre-wrap rounded-2xl border border-slate-200 bg-white p-4 font-sans text-sm leading-relaxed text-slate-700">{result.corrected}</pre>
                </Field>
              </>
            )}
          </div>
        </div>
      </ToolShell>
    </>
  )
}