import { useState } from 'react'
import { ChevronLeft, ChevronRight, Layers, Plus, RotateCcw, Shuffle, Trash2 } from 'lucide-react'
import ToolShell from '../../../components/tools/ToolShell'
import { Button, Field, TextArea } from '../../../components/ui/Fields'
import Seo from '../../../components/ui/Seo'
import { uid } from '../../../lib/numbers'

type Card = { id: string; front: string; back: string }

export default function FlashcardMaker() {
  const [cards, setCards] = useState<Card[]>([])
  const [front, setFront] = useState('')
  const [back, setBack] = useState('')
  const [index, setIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)

  const add = () => {
    if (!front.trim() || !back.trim()) return
    setCards((p) => [...p, { id: uid(), front: front.trim(), back: back.trim() }])
    setFront('')
    setBack('')
    setFlipped(false)
  }

  const del = (id: string) => {
    setCards((p) => p.filter((c) => c.id !== id))
    setIndex((i) => Math.min(i, Math.max(0, cards.length - 1)))
    setFlipped(false)
  }

  const go = (delta: number) => {
    if (cards.length === 0) return
    setIndex((i) => (i + delta + cards.length) % cards.length)
    setFlipped(false)
  }

  const shuffle = () => {
    setCards((p) => [...p].sort(() => Math.random() - 0.5))
    setIndex(0)
    setFlipped(false)
  }

  const current = cards.length ? cards[index] : null

  return (
    <>
      <Seo title="Flashcard Maker - vimz Tools" description="Create digital flashcards and flip through them to study." />
      <ToolShell
        title="Flashcard Maker"
        description="Create digital flashcards and flip through them to study."
        icon={<Layers className="h-6 w-6" />}
        breadcrumb="Study & Education"
        instruction="Create cards and flip them to test your memory."
      >
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 lg:col-span-1">
            <h3 className="mb-4 text-sm font-bold text-slate-800">New card</h3>
            <div className="grid grid-cols-1 gap-3">
              <Field label="Front / question">
                <TextArea rows={3} value={front} onChange={(e) => setFront(e.target.value)} placeholder="e.g. What is photosynthesis?" />
              </Field>
              <Field label="Back / answer">
                <TextArea rows={3} value={back} onChange={(e) => setBack(e.target.value)} placeholder="e.g. The process plants use to make food." />
              </Field>
              <Button onClick={add}>
                <Plus className="h-4 w-4" /> Add card
              </Button>
            </div>
            <p className="mt-4 text-xs font-semibold text-slate-400">{cards.length} card(s) in deck</p>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 lg:col-span-2">
            {!current ? (
              <p className="flex h-72 items-center justify-center rounded-2xl border border-dashed border-slate-300 text-center text-sm text-slate-400">
                No cards yet — add your first card on the left.
              </p>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400">Card {index + 1} / {cards.length}</span>
                  <div className="flex items-center gap-2">
                    <Button variant="secondary" onClick={shuffle}>
                      <Shuffle className="h-4 w-4" /> Shuffle
                    </Button>
                    <button onClick={() => del(current.id)} className="rounded-md p-1 text-slate-300 transition hover:text-rose-500" aria-label="Delete card">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div onClick={() => setFlipped((f) => !f)} className="mx-auto mt-4 h-72 w-full max-w-md cursor-pointer [perspective:1200px]" role="button">
                  <div className={`relative h-full w-full transition-transform duration-500 [transform-style:preserve-3d] ${flipped ? '[transform:rotateY(180deg)]' : ''}`}>
                    <div className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl border border-primary-200 bg-primary-50 p-6 text-center [backface-visibility:hidden]">
                      <span className="mb-3 text-[10px] font-bold uppercase tracking-widest text-primary-400">Front</span>
                      <p className="text-lg font-semibold text-primary-900">{current.front}</p>
                      <p className="mt-4 text-[11px] text-primary-300">Tap to flip</p>
                    </div>
                    <div className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center [backface-visibility:hidden] [transform:rotateY(180deg)]">
                      <span className="mb-3 text-[10px] font-bold uppercase tracking-widest text-emerald-400">Back</span>
                      <p className="text-lg font-semibold text-emerald-900">{current.back}</p>
                      <p className="mt-4 text-[11px] text-emerald-300">Tap to flip</p>
                    </div>
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-center gap-3">
                  <Button variant="secondary" onClick={() => go(-1)}>
                    <ChevronLeft className="h-4 w-4" /> Prev
                  </Button>
                  <Button variant="secondary" onClick={() => setFlipped(false)}>
                    <RotateCcw className="h-4 w-4" /> Reset flip
                  </Button>
                  <Button onClick={() => go(1)}>
                    Next <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </>
            )}
          </section>
        </div>
      </ToolShell>
    </>
  )
}