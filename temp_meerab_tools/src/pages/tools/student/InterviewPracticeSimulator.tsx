import { useState } from 'react'
import { Mic, ChevronRight, Eye } from 'lucide-react'
import ToolShell from '../../../components/tools/ToolShell'
import { Button, Field, Select } from '../../../components/ui/Fields'
import Seo from '../../../components/ui/Seo'

interface Item {
  q: string
  sample: string
}

const POOL: Record<string, Item[]> = {
  behavioral: [
    { q: 'Tell me about a time you handled pressure.', sample: 'Set the scene in one line, name the action you took, then the measurable result. Close with what it taught you.' },
    { q: 'Describe a conflict with a classmate or colleague.', sample: 'Situation - what you did to listen - the agreed outcome. Stay neutral about the other person.' },
    { q: 'Give an example of a goal you reached.', sample: 'Make the goal specific, show your plan, then the result with a number if possible.' },
    { q: 'Tell me about a mistake you made.', sample: 'Own it fully, show the fix, and state the new habit you built afterwards.' },
    { q: 'When did you go beyond what was asked?', sample: 'Pick extra effort that served a real need and keep the story brief.' },
  ],
  general: [
    { q: 'Tell me about yourself.', sample: 'Past (who you are), present (what you do), future (why this role). Keep it to two minutes.' },
    { q: 'Why should we hire you?', sample: 'Two unique strengths plus one concrete example of each, tied to the role.' },
    { q: 'Where do you see yourself in 5 years?', sample: 'Show growth direction that aligns with the company, not just a job title.' },
    { q: 'How do you handle feedback?', sample: 'Acknowledge, ask a clarifying question, then describe a change you made.' },
    { q: 'Do you have any questions for us?', sample: 'Ask about team priorities, success in the first 90 days, or career growth.' },
  ],
  cognitive: [
    { q: 'Estimate how many cups of coffee are sold in this city in a day.', sample: 'Break it down: population, fraction who drink coffee, cups per person, venues. Explain your rounding.' },
    { q: 'Why are manhole covers round?', sample: 'They cannot fall in, they are easy to roll, and they are just as strong in any orientation.' },
    { q: 'How would you design a better classroom?', sample: 'Define the user, name the problem, propose changes, and say how you would measure success.' },
    { q: 'Estimate the weight of the room you are in.', sample: 'Volume x density of typical building materials, stated with clear assumptions.' },
    { q: 'What is one product you would improve, and how?', sample: 'Choose familiar products, name one friction point, propose a minimal fix.' },
  ],
}

export default function InterviewPracticeSimulator() {
  const [track, setTrack] = useState<'behavioral' | 'general' | 'cognitive'>('behavioral')
  const [deck, setDeck] = useState<Item[]>(POOL.behavioral)
  const [idx, setIdx] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const [done, setDone] = useState(false)

  const item = deck[idx]
  const mins = Math.max(1, Math.min(3, deck.length))

  const start = (t: 'behavioral' | 'general' | 'cognitive') => {
    const rotated = [...POOL[t]]
    for (let i = rotated.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[rotated[i], rotated[j]] = [rotated[j], rotated[i]]
    }
    setTrack(t)
    setDeck(rotated)
    setIdx(0)
    setRevealed(false)
    setDone(false)
  }

  const next = () => {
    if (idx + 1 < deck.length) {
      setIdx(idx + 1)
      setRevealed(false)
    } else {
      setDone(true)
    }
  }

  return (
    <>
      <Seo
        title="Interview Practice Simulator - vimz Tools"
        description="Practice common interview questions with sample answer frameworks in your browser."
      />
      <ToolShell
        title="Interview Practice Simulator"
        description="Work through a timed mock interview with revealable answer frameworks."
        icon={<Mic className="h-6 w-6" />}
        breadcrumb="Student Tools"
        instruction="Pick a track, answer aloud before revealing the sample, then move on."
      >
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <div className="space-y-4">
            <Field label="Practice track">
              <Select
                value={track}
                onChange={(e) => start(e.target.value as 'behavioral' | 'general' | 'cognitive')}
              >
                <option value="behavioral">Behavioural (STAR)</option>
                <option value="general">General</option>
                <option value="cognitive">Estimation & logic</option>
              </Select>
            </Field>
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-400">How it works</p>
              <ul className="mt-2 space-y-1.5 text-sm text-slate-600">
                <li>Answer the question aloud first - aim for about {mins} minute{(mins > 1) ? 's' : ''}.</li>
                <li>Reveal the framework and compare your structure.</li>
                <li>Tap Next to move through the deck.</li>
              </ul>
            </div>
            <Button variant="secondary" onClick={() => start(track)}>Re-draw questions</Button>
          </div>

          <div className="space-y-4">
            {done ? (
              <div className="rounded-2xl border-2 border-emerald-200 bg-emerald-50 p-8 text-center">
                <p className="text-lg font-bold text-emerald-800">Session complete!</p>
                <p className="mt-1 text-sm text-emerald-700">
                  You practised all {deck.length} questions. Review the list again or change track to keep going.
                </p>
                <div className="mt-4 flex justify-center gap-2">
                  <Button onClick={() => start(track)}>Another round</Button>
                </div>
              </div>
            ) : item ? (
              <>
                <div className="rounded-2xl border-2 border-violet-200 bg-violet-50 p-6">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold uppercase tracking-wide text-violet-500">Question {idx + 1} of {deck.length}</p>
                    <span className="rounded-full bg-violet-100 px-2 py-0.5 text-xs font-bold text-violet-700">{Math.round(((idx + 1) / deck.length) * 100)}%</span>
                  </div>
                  <p className="mt-3 text-base font-bold text-violet-900">{item.q}</p>
                  <button
                    onClick={() => setRevealed((v) => !v)}
                    className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-violet-600 hover:text-violet-800"
                  >
                    <Eye className="h-3.5 w-3.5" /> {revealed ? 'Hide' : 'Reveal'} answer framework
                  </button>
                  {revealed && (
                    <p className="mt-3 rounded-xl bg-white p-4 text-sm leading-relaxed text-slate-700">{item.sample}</p>
                  )}
                </div>
                <Button onClick={next}>
                  {idx + 1 < deck.length ? (<><ChevronRight className="h-4 w-4" /> Next question</>) : 'Finish session'}
                </Button>
                <div className="flex flex-wrap gap-1.5">
                  {deck.map((_, i) => (
                    <span key={i} className={`h-2 flex-1 rounded-full ${i === idx ? 'bg-violet-500' : i < idx ? 'bg-emerald-400' : 'bg-slate-200'}`} />
                  ))}
                </div>
              </>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center text-sm text-slate-400">
                Pick a track to start your practice session.
              </div>
            )}
          </div>
        </div>
      </ToolShell>
    </>
  )
}