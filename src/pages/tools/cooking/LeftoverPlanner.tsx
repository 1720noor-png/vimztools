import { useMemo, useState } from 'react'
import { Soup, CheckCircle2, Circle } from 'lucide-react'
import ToolShell from '../../../components/tools/ToolShell'
import Seo from '../../../components/ui/Seo'

const LEFTOVERS = ['Rice', 'Chicken', 'Veg', 'Pasta', 'Bread']

type Idea = { name: string; needs: string[]; desc: string; time: string }

const IDEAS: Idea[] = [
  { name: 'Fried rice', needs: ['Rice', 'Chicken', 'Veg'], desc: 'Soy, egg, green onion and a hot pan.', time: '15 min' },
  { name: 'Quesadillas', needs: ['Chicken', 'Veg'], desc: 'Big cheese pull between two crisp tortillas.', time: '10 min' },
  { name: 'Pasta bake', needs: ['Pasta', 'Veg'], desc: 'Tomato sauce and a golden cheese top.', time: '25 min' },
  { name: 'Chicken soup', needs: ['Chicken', 'Veg', 'Pasta'], desc: 'Warm broth with shreds of chicken.', time: '30 min' },
  { name: 'Wrap roll-ups', needs: ['Bread', 'Chicken'], desc: 'Flatbread, greens, sauce, done.', time: '8 min' },
  { name: 'Frittata', needs: ['Pasta', 'Veg'], desc: 'Eggs, parmesan, baked till puffed.', time: '20 min' },
  { name: 'Rice bowl', needs: ['Rice', 'Chicken', 'Veg'], desc: 'Drizzle chili oil, top with a fried egg.', time: '12 min' },
  { name: 'Bread pudding', needs: ['Bread'], desc: 'Sweet cinnamon custard dessert.', time: '40 min' },
]

export default function LeftoverPlanner() {
  const [picked, setPicked] = useState<Set<string>>(new Set())

  const toggle = (name: string) => {
    setPicked((prev) => {
      const n = new Set(prev)
      if (n.has(name)) n.delete(name)
      else n.add(name)
      return n
    })
  }

  const scored = useMemo(
    () =>
      IDEAS.map((idea) => ({
        ...idea,
        matched: idea.needs.filter((n) => picked.has(n)).length,
        ratio: idea.needs.length ? idea.needs.filter((n) => picked.has(n)).length / idea.needs.length : 0,
      })).sort((a, b) => b.ratio - a.ratio),
    [picked],
  )

  const fullMatches = useMemo(() => scored.filter((s) => s.ratio === 1).length, [scored])

  return (
    <>
      <Seo
        title="Leftover Planner - vimz Tools"
        description="Turn leftover ingredients into next meals. Free leftover reuse idea finder."
      />
      <ToolShell
        title="Leftover Planner"
        description="Turn leftover ingredients into next meals."
        icon={<Soup className="h-6 w-6" />}
        breadcrumb="Cooking & Kitchen"
        instruction="Pick leftovers to get ideas for your next meal."
      >
        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <h3 className="mb-3 text-sm font-bold text-slate-800">What's left in the fridge?</h3>
          <div className="flex flex-wrap gap-2">
            {LEFTOVERS.map((l) => {
              const on = picked.has(l)
              return (
                <button
                  key={l}
                  onClick={() => toggle(l)}
                  className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-bold transition ${
                    on
                      ? 'border-emerald-500 bg-emerald-500 text-white'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-emerald-400'
                  }`}
                >
                  {on ? <CheckCircle2 className="h-4 w-4" /> : <Circle className="h-4 w-4" />}
                  {l}
                </button>
              )
            })}
          </div>
          <p className="mt-3 text-xs text-slate-400">
            Pick 1+ leftovers — ideas are ranked by how many match.
          </p>
        </section>

        <section className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
          <p className="text-sm font-semibold text-emerald-800">
            {picked.size === 0
              ? 'Select a leftover to unlock next-meal ideas.'
              : `${fullMatches} idea${fullMatches === 1 ? '' : 's'} you can make right now.`}
          </p>
        </section>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {scored.map((s) => (
            <article
              key={s.name}
              className={`rounded-2xl border p-4 transition ${
                s.ratio === 1
                  ? 'border-emerald-300 bg-emerald-50'
                  : s.ratio > 0
                    ? 'border-primary-200 bg-white'
                    : 'border-slate-200 bg-white opacity-60'
              }`}
            >
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-extrabold text-slate-800">{s.name}</h4>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                    s.ratio === 1 ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {s.matched}/{s.needs.length}
                </span>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-slate-500">{s.desc}</p>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100">
                <div className={`h-1.5 rounded-full ${s.ratio === 1 ? 'bg-emerald-500' : 'bg-primary-400'}`} style={{ width: `${s.ratio * 100}%` }} />
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {s.needs.map((n) => (
                  <span
                    key={n}
                    className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                      picked.has(n) ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400'
                    }`}
                  >
                    {picked.has(n) ? '✓ ' : ''}{n}
                  </span>
                ))}
              </div>
              <p className="mt-3 text-[11px] font-semibold text-slate-400">{s.time}</p>
            </article>
          ))}
        </div>
      </ToolShell>
    </>
  )
}