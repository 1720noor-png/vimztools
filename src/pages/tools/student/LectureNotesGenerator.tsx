import { useMemo, useState } from 'react'
import { BookOpenText, Wand2 } from 'lucide-react'
import ToolShell from '../../../components/tools/ToolShell'
import { Button, Field, Select, TextArea, TextInput } from '../../../components/ui/Fields'
import CodeBlock from '../../../components/ui/CodeBlock'
import Seo from '../../../components/ui/Seo'

function buildNotes(transcript: string, format: 'outline' | 'paragraph'): string {
  const blocks = transcript
    .split(/\n{2,}/)
    .map((b) => b.trim())
    .filter(Boolean)

  if (blocks.length === 0) return ''

  if (format === 'outline') {
    const out: string[] = []
    blocks.forEach((block, i) => {
      const lines = block.split('\n').map((l) => l.trim()).filter(Boolean)
      const heading = lines[0].replace(/[#*\-•]+/g, '').trim() || `Section ${i + 1}`
      out.push(String(i + 1) + '. ' + heading)
      for (const line of lines.slice(1)) {
        const clean = line.replace(/[#*\-•]+/g, '').trim()
        if (clean) out.push('   - ' + clean)
      }
    })
    return out.join('\n')
  }

  const out: string[] = []
  blocks.forEach((block, i) => {
    const clean = block.replace(/(^|\n)[#*\-•]+/g, '\n').replace(/[#*\-•]+/g, '').replace(/\n+/g, ' ').trim()
    if (clean) out.push(String(i + 1) + '. ' + clean)
  })
  return out.join('\n\n')
}

export default function LectureNotesGenerator() {
  const [title, setTitle] = useState('Intro to Macroeconomics')
  const [transcript, setTranscript] = useState('')
  const [format, setFormat] = useState<'outline' | 'paragraph'>('outline')
  const [ran, setRan] = useState(false)

  const notes = useMemo(
    () => (void ran, transcript.trim() ? buildNotes(transcript, format) : ''),
    [transcript, format, ran],
  )
  const corePoints = useMemo(
    () => (void ran, [...new Set((transcript.match(/[A-Z][a-z]+(?: [A-Z][a-z]+){1,4}/g) ?? []))].slice(0, 6)),
    [transcript, ran],
  )

  return (
    <>
      <Seo
        title="Lecture Notes Generator - vimz Tools"
        description="Convert transcripts or rough outlines into structured, readable lecture notes."
      />
      <ToolShell
        title="Lecture Notes Generator"
        description="Turn a raw transcript or rough outline into clean, structured study notes."
        icon={<BookOpenText className="h-6 w-6" />}
        breadcrumb="Student Tools"
        instruction="Paste a transcript or outline, choose a format, and generate tidy notes."
      >
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <div className="space-y-4">
            <Field label="Lecture title">
              <TextInput value={title} onChange={(e) => setTitle(e.target.value)} />
            </Field>
            <Field label="Transcript or rough outline">
              <TextArea rows={10} value={transcript} onChange={(e) => setTranscript(e.target.value)} placeholder={'Paste the raw transcript here...\n\nSeparate ideas or paragraphs with a blank line.'} />
            </Field>
            <div className="flex flex-wrap items-end gap-3">
              <Field label="Output format">
                <Select value={format} onChange={(e) => setFormat(e.target.value as 'outline' | 'paragraph')}>
                  <option value="outline">Bulleted outline</option>
                  <option value="paragraph">Linked paragraphs</option>
                </Select>
              </Field>
              <Button variant="primary" onClick={() => setRan((r) => !r)} disabled={!transcript.trim()}>
                <Wand2 className="h-4 w-4" /> Generate notes
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            {notes ? (
              <>
                <section className="rounded-2xl border border-slate-200 bg-white p-5">
                  <h3 className="mb-3 text-lg font-bold text-slate-900">{title}</h3>
                  <pre className="whitespace-pre-wrap rounded-xl bg-slate-50 p-4 font-sans text-sm leading-relaxed text-slate-700">
                    {notes}
                  </pre>
                </section>
                {corePoints.length > 0 && (
                  <div className="rounded-2xl border border-slate-200 bg-white p-4">
                    <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-400">Spotlight points</p>
                    <div className="flex flex-wrap gap-1.5">
                      {corePoints.map((p) => (
                        <span key={p} className="rounded-full bg-violet-50 px-2.5 py-1 text-xs font-semibold text-violet-700">{p}</span>
                      ))}
                    </div>
                  </div>
                )}
                <CodeBlock title="Copyable notes" code={notes} lang="plain" />
              </>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center text-sm text-slate-400">
                Structured notes will appear here.
              </div>
            )}
          </div>
        </div>
      </ToolShell>
    </>
  )
}