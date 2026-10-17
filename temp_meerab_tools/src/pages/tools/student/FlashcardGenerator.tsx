import { useMemo, useState } from 'react'
import { Layers, Wand2, Eye, EyeOff } from 'lucide-react'
import ToolShell from '../../../components/tools/ToolShell'
import { Button, Field, TextArea } from '../../../components/ui/Fields'
import Seo from '../../../components/ui/Seo'

interface Card {
  front: string
  back: string
}

function parseCards(raw: string): Card[] {
  return raw
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const sep = line.split(/\s{2,}|\t|\|/)
      if (sep.length >= 2) return { front: sep[0].trim(), back: sep.slice(1).join(' ').trim() }
      const colon = line.indexOf(':')
      if (colon > 0) return { front: line.slice(0, colon).trim(), back: line.slice(colon + 1).trim() }
      const arrow = line.indexOf('->')
      if (arrow > 0) return { front: line.slice(0, arrow).trim(), back: line.slice(arrow + 2).trim() }
      return { front: line, back: '' }
    })
    .filter((c) => c.front && c.back)
}

export default function FlashcardGenerator() {
  const [raw, setRaw] = useState('Photosynthesis: process plants convert light into chemical energy\nMitochondrion -> powerhouse of the cell\nEnzyme  |  biological catalyst')
  const [opened, setOpened] = useState<Record<number, boolean>>({})
  const [ran, setRan] = useState(false)
  const [revealAll, setRevealAll] = useState(false)

  const cards = useMemo(() => (void ran, parseCards(raw)), [raw, ran])

  const toggle = (i: number) => setOpened((o) => ({ ...o, [i]: !o[i] }))

  return (
    <>
      <Seo
        title="Flashcard Generator - vimz Tools"
        description="Create digital Q&A flashcards from your notes for active recall, entirely in your browser."
      />
      <ToolShell
        title="Flashcard Generator"
        description="Turn term-and-definition lines into a deck of flip cards for active recall."
        icon={<Layers className="h-6 w-6" />}
        breadcrumb="Student Tools"
        instruction="Put a Q&A pair per line using a colon, pipe, arrow or double space. Tap a card to flip it."
      >
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <div className="space-y-4">
            <Field label="Question : Answer per line">
              <TextArea rows={10} value={raw} onChange={(e) => setRaw(e.target.value)} placeholder={'Term: definition\nTerm  |  definition\nTerm -> definition'} />
            </Field>
            <p className="text-xs text-slate-400">
              Separators: <code className="rounded bg-slate-100 px-1">:</code>, <code className="rounded bg-slate-100 px-1">|</code>, <code className="rounded bg-slate-100 px-1">-{'>'}</code> or two spaces.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => setRan((r) => !r)} disabled={cards.length === 0}>
                <Wand2 className="h-4 w-4" /> Rebuild deck
              </Button>
              <Button variant="secondary" onClick={() => setRevealAll((v) => !v)} disabled={cards.length === 0}>
                {revealAll ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />} {revealAll ? 'Hide all' : 'Reveal all'}
              </Button>
            </div>
            <p className="text-sm font-medium text-slate-500">{cards.length} cards ready</p>
          </div>

          <div className="space-y-3">
            {cards.length === 0 && (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center text-sm text-slate-400">
                Add Q&A pairs to build your deck.
              </div>
            )}
            {cards.map((c, i) => {
              const open = revealAll || !!opened[i]
              return (
                <button
                  key={i}
                  onClick={() => toggle(i)}
                  className="w-full text-left"
                >
                  <div className={`rounded-2xl border p-4 transition ${open ? 'border-violet-300 bg-violet-50' : 'border-slate-200 bg-white hover:border-violet-300'}`}>
                    <p className="text-sm font-bold text-slate-800">Q{i + 1}: {c.front}</p>
                    {open ? (
                      <p className="mt-2 text-sm leading-relaxed text-slate-700">A: {c.back}</p>
                    ) : (
                      <p className="mt-2 text-xs font-medium text-slate-400">Tap to reveal answer</p>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </ToolShell>
    </>
  )
}