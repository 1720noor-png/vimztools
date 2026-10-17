import { useMemo, useState } from 'react'
import { RefreshCcwDot, Wand2 } from 'lucide-react'
import ToolShell from '../../../components/tools/ToolShell'
import { Button, Field, Select, TextArea } from '../../../components/ui/Fields'
import CodeBlock from '../../../components/ui/CodeBlock'
import Seo from '../../../components/ui/Seo'

const SYNONYMS: Record<string, string[]> = {
  important: ['significant', 'notable', 'considerable', 'crucial'],
  good: ['effective', 'solid', 'reliable', 'sound'],
  bad: ['poor', 'ineffective', 'unreliable', 'weak'],
  big: ['large', 'substantial', 'considerable', 'significant'],
  small: ['minor', 'modest', 'limited', 'slight'],
  show: ['demonstrate', 'illustrate', 'indicate', 'reveal'],
  use: ['employ', 'apply', 'utilise', 'draw on'],
  help: ['support', 'assist', 'facilitate'],
  make: ['produce', 'create', 'generate', 'construct'],
  get: ['obtain', 'receive', 'acquire', 'secure'],
  need: ['require', 'demand', 'necessitate'],
  think: ['believe', 'consider', 'suggest', 'argue'],
  fast: ['rapid', 'quick', 'swift', 'speedy'],
  hard: ['difficult', 'challenging', 'demanding', 'tough'],
  easy: ['straightforward', 'simple', 'uncomplicated'],
  many: ['numerous', 'a great many', 'plentiful'],
  also: ['furthermore', 'in addition', 'likewise', 'moreover'],
  but: ['however', 'nevertheless', 'yet', 'still'],
  very: ['extremely', 'particularly', 'notably', 'markedly'],
  really: ['genuinely', 'truly', 'substantially'],
  about: ['concerning', 'regarding', 'with respect to'],
}

const FILLERS = ['just', 'basically', 'actually', 'really', 'very', 'quite', 'sort of', 'kind of', 'basically']

function paraphrase(text: string, mode: 'academic' | 'concise' | 'expanded'): string {
  const words = text.split(' ')
  let out = words.map((w, i) => {
    if (mode === 'academic') {
      const clean = w.toLowerCase().replace(/[^a-z']/g, '')
      const opts = SYNONYMS[clean]
      if (opts && (i % 2 === 0 || Math.random() < 0.5)) {
        const pick = opts[(i + w.length) % opts.length]
        const punct = w.replace(/[a-z]/gi, '')
        return pick + punct
      }
      return w
    }
    return w
  })
  if (mode === 'concise') {
    out = out.filter((w, i) => {
      if (FILLERS.includes(w) && i > 0) return false
      return true
    })
  }
  if (mode === 'expanded') {
    out = out.flatMap((w, i) => {
      if (i > 0 && w === w.toLowerCase() && ['and', 'because', 'so'].includes(w)) {
        const openers = ['furthermore', 'moreover', 'as a result', 'consequently']
        return [...openers[(i + 0) % openers.length].split(' '), w]
      }
      return [w]
    })
  }
  return out.join(' ').replace(/\s+([,.;:!?])/g, '$1')
}

export default function ParaphrasingTool() {
  const [text, setText] = useState('Genetic modification can be used to make crops more resistant to disease, which is important for food security.')
  const [mode, setMode] = useState<'academic' | 'concise' | 'expanded'>('academic')
  const [ran, setRan] = useState(false)

  const result = useMemo(() => (void ran, text.trim() ? paraphrase(text, mode) : ''), [text, mode, ran])

  return (
    <>
      <Seo
        title="Paraphrasing Tool - vimz Tools"
        description="Reword school and essay text in academic, concise or expanded styles."
      />
      <ToolShell
        title="Paraphrasing Tool"
        description="Reword your own sentences with fresh vocabulary and structure."
        icon={<RefreshCcwDot className="h-6 w-6" />}
        breadcrumb="Student Tools"
        instruction="Paste your sentence, pick a style, and copy the reworded version."
      >
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <div className="space-y-4">
            <Field label="Your text">
              <TextArea rows={6} value={text} onChange={(e) => setText(e.target.value)} />
            </Field>
            <Field label="Style">
              <Select value={mode} onChange={(e) => setMode(e.target.value as typeof mode)}>
                <option value="academic">Academic word swap</option>
                <option value="concise">Concise (drop filler)</option>
                <option value="expanded">Expanded (add connectors)</option>
              </Select>
            </Field>
            <div className="flex gap-2">
              <Button onClick={() => setRan((r) => !r)} disabled={!text.trim()}>
                <Wand2 className="h-4 w-4" /> Reword
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            {result ? (
              <>
                <div className="rounded-2xl border border-slate-200 bg-white p-5">
                  <p className="text-sm leading-relaxed text-slate-700">{result}</p>
                </div>
                <CodeBlock title="Copyable version" code={result} lang="plain" />
                <p className="text-xs leading-relaxed text-slate-400">
                  Always rewrite in your own voice and double-check meaning - this tool keeps your work inside your
                  browser and never stores it.
                </p>
              </>
            ) : null}
          </div>
        </div>
      </ToolShell>
    </>
  )
}