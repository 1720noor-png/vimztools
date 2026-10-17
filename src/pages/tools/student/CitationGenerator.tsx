import { useMemo, useState } from 'react'
import { Quote, Wand2 } from 'lucide-react'
import ToolShell from '../../../components/tools/ToolShell'
import { Button, Field, Select, TextInput } from '../../../components/ui/Fields'
import CodeBlock from '../../../components/ui/CodeBlock'
import Seo from '../../../components/ui/Seo'

type Style = 'apa' | 'mla' | 'chicago'
type Source = 'book' | 'journal' | 'website'

const STYLE_LABEL: Record<Style, string> = { apa: 'APA 7th', mla: 'MLA 9th', chicago: 'Chicago 17th' }

interface Citation {
  full: string
  inline: string
}

function buildCitation(s: {
  style: Style
  source: Source
  authors: string
  year: string
  title: string
  journal: string
  volume: string
  issue: string
  pages: string
  publisher: string
  city: string
  url: string
}): Citation {
  const authors = s.authors.split(',').map((a) => a.trim()).filter(Boolean)
  const a = (i: number) => authors[i] ?? 'Unknown'
  const year = s.year || 'n.d.'

  if (s.style === 'apa') {
    const titlePart = s.source === 'journal'
      ? `${s.title[0].toUpperCase() + s.title.slice(1)}.`
      : `<i>${s.title[0].toUpperCase() + s.title.slice(1)}</i>.`
    const sourcePart =
      s.source === 'journal'
        ? `<i>${s.journal || 'Journal'}</i>, ${s.volume || ''}(${s.issue || ''}), ${s.pages || ''}.`
        : s.source === 'book'
          ? `${s.publisher || 'Publisher'}.`
          : `Retrieved from ${s.url || 'https://example.com'}`
    const full = `${a(0)}, ${a(1) ? `& ${a(1)} ` : ''}(${year}). ${titlePart.replace(/\./, '')} ${sourcePart}`.replace(/\s{2,}/g, ' ').replace('  ', ' ')
    const inline = `(${authors[0]?.split(' ').pop() ?? 'Author'}, ${year.replace('n.d.', 'n.d.')})`
    return { full, inline }
  }

  if (s.style === 'mla') {
    const full = `${authors[0] ?? 'Unknown'}. ${s.title}. ${s.source === 'book' ? `${s.publisher || 'Publisher'}, ${year}.` : s.source === 'journal' ? `${s.journal || 'Journal'}, vol. ${s.volume || ''}, no. ${s.issue || ''}, ${year}, pp. ${s.pages || ''}.` : `${s.publisher || 'Website'}, ${year}, ${s.url || ''}.`}`
    const inline = `(${authors[0]?.split(' ').pop() ?? 'Author'} ${s.pages || ''})`.trim()
    return { full, inline }
  }

  const full = `${authors[0] ?? 'Unknown'}. <i>${s.title}</i>. ${s.city ? `${s.city}: ` : ''}${s.publisher || 'Publisher'}, ${year}.`
  const inline = `(${authors[0] ?? 'Author'} ${year})`
  return { full, inline }
}

export default function CitationGenerator() {
  const [style, setStyle] = useState<Style>('apa')
  const [source, setSource] = useState<Source>('book')
  const [authors, setAuthors] = useState('Smith, Jane')
  const [year, setYear] = useState('2023')
  const [title, setTitle] = useState('The Ecology of Urban Gardens')
  const [journal, setJournal] = useState('')
  const [volume, setVolume] = useState('')
  const [issue, setIssue] = useState('')
  const [pages, setPages] = useState('')
  const [publisher, setPublisher] = useState('Oxford University Press')
  const [city, setCity] = useState('')
  const [url, setUrl] = useState('')
  const [ran, setRan] = useState(false)

  const citation = useMemo(
    () => {
      void ran
      return buildCitation({
        style, source, authors, year, title, journal, volume, issue, pages, publisher, city, url,
      })
    },
    [style, source, authors, year, title, journal, volume, issue, pages, publisher, city, url, ran],
  )

  return (
    <>
      <Seo
        title="Citation Generator - vimz Tools"
        description="Format references in APA 7th, MLA 9th or Chicago 17th from a few quick fields."
      />
      <ToolShell
        title="Citation Generator"
        description="Format a reference and its in-text citation in three major styles."
        icon={<Quote className="h-6 w-6" />}
        breadcrumb="Student Tools"
        instruction="Fill in the source (only the fields you have) and copy the formatted citation."
      >
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Style">
                <Select value={style} onChange={(e) => setStyle(e.target.value as Style)}>
                  <option value="apa">APA 7th</option>
                  <option value="mla">MLA 9th</option>
                  <option value="chicago">Chicago 17th</option>
                </Select>
              </Field>
              <Field label="Source type">
                <Select value={source} onChange={(e) => setSource(e.target.value as Source)}>
                  <option value="book">Book</option>
                  <option value="journal">Journal article</option>
                  <option value="website">Website</option>
                </Select>
              </Field>
            </div>
            <Field label="Authors (comma separated)">
              <TextInput value={authors} onChange={(e) => setAuthors(e.target.value)} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Year">
                <TextInput value={year} onChange={(e) => setYear(e.target.value)} />
              </Field>
              <Field label="Title">
                <TextInput value={title} onChange={(e) => setTitle(e.target.value)} />
              </Field>
            </div>
            {source === 'journal' && (
              <div className="grid grid-cols-3 gap-3">
                <Field label="Journal">
                  <TextInput value={journal} onChange={(e) => setJournal(e.target.value)} />
                </Field>
                <Field label="Volume">
                  <TextInput value={volume} onChange={(e) => setVolume(e.target.value)} />
                </Field>
                <Field label="Issue">
                  <TextInput value={issue} onChange={(e) => setIssue(e.target.value)} />
                </Field>
              </div>
            )}
            {source === 'journal' && (
              <Field label="Pages">
                <TextInput value={pages} onChange={(e) => setPages(e.target.value)} placeholder="e.g. 45-67" />
              </Field>
            )}
            {source === 'book' && (
              <div className="grid grid-cols-2 gap-3">
                <Field label="Publisher">
                  <TextInput value={publisher} onChange={(e) => setPublisher(e.target.value)} />
                </Field>
                <Field label="City (Chicago)">
                  <TextInput value={city} onChange={(e) => setCity(e.target.value)} />
                </Field>
              </div>
            )}
            {source === 'website' && (
              <Field label="URL">
                <TextInput value={url} onChange={(e) => setUrl(e.target.value)} />
              </Field>
            )}
            <Button onClick={() => setRan((r) => !r)}>
              <Wand2 className="h-4 w-4" /> Format citation
            </Button>
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-400">{STYLE_LABEL[style]} reference</p>
              <p className="text-sm leading-relaxed text-slate-700" dangerouslySetInnerHTML={{ __html: citation.full }} />
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-400">In-text citation</p>
              <p className="font-mono text-sm text-slate-700">{citation.inline}</p>
            </div>
            <CodeBlock title="Plain text reference" code={citation.full.replace(/<\/?i>/g, '')} lang="plain" />
          </div>
        </div>
      </ToolShell>
    </>
  )
}