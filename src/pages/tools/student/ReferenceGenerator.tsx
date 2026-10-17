import { useMemo, useState } from 'react'
import { BookUp, Wand2, SortAsc } from 'lucide-react'
import ToolShell from '../../../components/tools/ToolShell'
import { Button, Field, Select, TextArea } from '../../../components/ui/Fields'
import CodeBlock from '../../../components/ui/CodeBlock'
import Seo from '../../../components/ui/Seo'

interface Ref {
  title: string
  authors: string
  year: string
  place: string
  kind: 'book' | 'journal' | 'website'
}

function parseRefs(raw: string): Ref[] {
  return raw
    .split(/\n+/)
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => {
      const parts = l.split(/\s*\|\s*/).map((p) => p.trim())
      return {
        title: parts[0] ?? '',
        authors: parts[1] ?? '',
        year: parts[2] ?? 'n.d.',
        place: parts[3] ?? '',
        kind: l.includes('journal') || l.includes('article') ? 'journal' : l.includes('website') || l.toLowerCase().startsWith('http') ? 'website' : 'book',
      } as Ref
    })
    .filter((r) => r.title)
}

function formatAPA(r: Ref): string {
  const year = r.year || 'n.d.'
  const authors = r.authors || 'Unknown'
  if (r.kind === 'journal') return `${authors} (${year}). ${r.title}. ${r.place}.`
  if (r.kind === 'website') return `${authors} (${year}). ${r.title}. Retrieved from ${r.place}.`
  return `${authors} (${year}). ${r.title}. ${r.place || 'Publisher'}.`
}

function formatMLA(r: Ref): string {
  const year = r.year || 'n.d.'
  if (r.kind === 'journal') return `${r.authors || 'Unknown'}. "${r.title}." ${r.place || 'Journal'}, ${year}.`
  if (r.kind === 'website') return `${r.authors || 'Unknown'}. "${r.title}." ${r.place || 'Website'}, ${year}.`
  return `${r.authors || 'Unknown'}. <i>${r.title}</i>. ${r.place || 'Publisher'}, ${year}.`
}

function formatHarvard(r: Ref): string {
  const year = r.year || 'n.d.'
  const surname = (r.authors || 'Unknown').split(',')[0].trim()
  if (r.kind === 'journal') return `${surname} (${year}) '${r.title}', ${r.place || 'Journal'}.`
  if (r.kind === 'website') return `${surname} (${year}) ${r.title}, ${r.place || 'Website'}.`
  return `${surname} (${year}) <i>${r.title}</i>, ${r.place || 'Publisher'}.`
}

const FORMAT: Record<string, (r: Ref) => string> = { apa: formatAPA, mla: formatMLA, harvard: formatHarvard }

export default function ReferenceGenerator() {
  const [raw, setRaw] = useState('')
  const [style, setStyle] = useState<'apa' | 'mla' | 'harvard'>('apa')
  const [ran, setRan] = useState(false)
  const [sort, setSort] = useState(true)

  const refs = useMemo(() => {
    void ran
    const list = parseRefs(raw)
    return sort ? [...list].sort((a, b) => a.authors.localeCompare(b.authors)) : list
  }, [raw, sort, ran])

  const formatted = useMemo(() => (void ran, refs.map((r) => FORMAT[style](r))), [refs, style, ran])

  return (
    <>
      <Seo
        title="Reference Generator - vimz Tools"
        description="Build an alphabetised bibliography in APA, Harvard or MLA from structured source lines."
      />
      <ToolShell
        title="Reference Generator"
        description="Turn a structured list of sources into a complete, alphabetised bibliography."
        icon={<BookUp className="h-6 w-6" />}
        breadcrumb="Student Tools"
        instruction="One source per line as Title | Authors | Year | Place, then format the list."
      >
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <div className="space-y-4">
            <Field label="Sources (Title | Authors | Year | Place)">
              <TextArea rows={8} value={raw} onChange={(e) => setRaw(e.target.value)} placeholder={'The Ecology of Urban Gardens | Smith, Jane | 2023 | Oxford University Press\nPhotosynthesis in Arid Climates | Doe, Alex | 2021 | Journal of Botany\nClimate Adaptation | Lee, Kim | 2022 | https://example.org/climate'} />
            </Field>
            <div className="flex flex-wrap items-end gap-3">
              <Field label="Style">
                <Select value={style} onChange={(e) => setStyle(e.target.value as typeof style)}>
                  <option value="apa">APA</option>
                  <option value="harvard">Harvard</option>
                  <option value="mla">MLA</option>
                </Select>
              </Field>
              <Button onClick={() => setRan((r) => !r)} disabled={refs.length === 0}>
                <Wand2 className="h-4 w-4" /> Build bibliography
              </Button>
              <Button variant="secondary" onClick={() => setSort((s) => !s)}>
                <SortAsc className="h-4 w-4" /> {sort ? 'Sorted A-Z' : 'Listed as entered'}
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            {formatted.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center text-sm text-slate-400">
                Your formatted references will appear here.
              </div>
            ) : (
              <>
                <ol className="space-y-2 rounded-2xl border border-slate-200 bg-white p-4">
                  {formatted.map((f, i) => (
                    <li key={i} className="flex gap-3 text-sm leading-relaxed text-slate-700">
                      <span className="font-bold text-violet-600">{i + 1}.</span>
                      <span dangerouslySetInnerHTML={{ __html: f }} />
                    </li>
                  ))}
                </ol>
                <CodeBlock title="Plain text bibliography" code={formatted.map((f) => f.replace(/<\/?i>/g, '')).join('\n')} lang="plain" />
              </>
            )}
          </div>
        </div>
      </ToolShell>
    </>
  )
}