import { useMemo, useState } from 'react'
import { Leaf, Sparkles, Check } from 'lucide-react'
import ToolShell from '../../../components/tools/ToolShell'
import Seo from '../../../components/ui/Seo'

type Swap = { name: string; ratio: string; note: string }

const SPICES: Record<string, { advice: string; subs: Swap[] }> = {
  Paprika: {
    advice: 'Mild and sweet. Hotter swaps go light — add half, taste, then adjust.',
    subs: [
      { name: 'Chili powder', ratio: '1:1', note: 'Adds heat, no sweetness.' },
      { name: 'Cayenne', ratio: '¼ tsp per 1 tsp', note: 'Very hot — go easy.' },
      { name: 'Ancho chili', ratio: '1:1', note: 'Closest smoky-sweet match.' },
    ],
  },
  Cumin: {
    advice: 'Earthy and warm. Toasting your swap first doubles the flavour.',
    subs: [
      { name: 'Ground coriander', ratio: '1:1', note: 'Softer and a touch citrusy.' },
      { name: 'Chili powder', ratio: '1:1', note: 'Brings a little heat back.' },
      { name: 'Garam masala', ratio: '½ tsp per 1 tsp', note: 'Complex — use less.' },
    ],
  },
  Oregano: {
    advice: 'Dry oregano is strong; fresh is gentler — double fresh amounts.',
    subs: [
      { name: 'Marjoram', ratio: '1:1', note: 'Milder, floral cousin.' },
      { name: 'Thyme', ratio: '1:1', note: 'Sweet and peppery.' },
      { name: 'Mixed dried herbs', ratio: '1:1', note: 'Provençal blend works well.' },
    ],
  },
  'Garam masala': {
    advice: 'A warm blend. Cinnamon plus a curry-friendly base gets you close.',
    subs: [
      { name: 'Cinnamon + cumin', ratio: '½ tsp each', note: 'Doubles as a warm garam.' },
      { name: 'Curry powder', ratio: '1:1', note: 'Rounder, less aromatic.' },
      { name: 'Allspice', ratio: '½ tsp per 1 tsp', note: 'Sweet kick, use sparingly.' },
    ],
  },
  Cardamom: {
    advice: 'Floral and citrusy. Green pods hold more punch than ground.',
    subs: [
      { name: 'Cinnamon + nutmeg', ratio: '½ tsp each', note: 'Close warm-spice profile.' },
      { name: 'Ginger', ratio: '1:1', note: 'Livelier, less floral.' },
      { name: 'Vanilla bean', ratio: '1 pod + pinch', note: 'For sweet bakes only.' },
    ],
  },
  'Smoked paprika': {
    advice: 'Far harder to swap than plain paprika — chips of it are gold.',
    subs: [
      { name: 'Sweet paprika + liquid smoke', ratio: '1 tsp + 2 drops', note: 'Rebuilds smoke.' },
      { name: 'Chipotle powder', ratio: '½ tsp per 1 tsp', note: 'Smoky with heat.' },
      { name: 'Regular paprika', ratio: '1:1', note: 'Loses smoke, keeps colour.' },
    ],
  },
}

export default function SpiceSubstituteFinder() {
  const [spice, setSpice] = useState('Paprika')

  const pick = useMemo(() => SPICES[spice], [spice])

  return (
    <>
      <Seo
        title="Spice Substitute Finder - vimz Tools"
        description="Find a handy spice swap when the pantry is short. Free spice substitute guide."
      />
      <ToolShell
        title="Spice Substitute Finder"
        description="Find a handy spice swap when the pantry is short."
        icon={<Leaf className="h-6 w-6" />}
        breadcrumb="Cooking & Kitchen"
        instruction="Find a substitute when the spice rack runs dry."
      >
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <h3 className="mb-4 text-sm font-bold text-slate-800">Which spice is out?</h3>
            {Object.keys(SPICES).map((s) => (
              <div key={s} className="mb-2">
                <input
                  type="radio"
                  name="spice"
                  id={`spice-${s}`}
                  className="peer sr-only"
                  checked={spice === s}
                  onChange={() => setSpice(s)}
                />
                <label
                  htmlFor={`spice-${s}`}
                  className="flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 transition peer-checked:border-emerald-500 peer-checked:bg-emerald-50"
                >
                  <span
                    className={`flex h-4 w-4 items-center justify-center rounded-full border ${
                      spice === s ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-slate-300'
                    }`}
                  >
                    {spice === s && <Check className="h-3 w-3" />}
                  </span>
                  <span className={`text-sm font-bold ${spice === s ? 'text-emerald-700' : 'text-slate-700'}`}>{s}</span>
                </label>
              </div>
            ))}
          </section>

          <div className="space-y-5 lg:col-span-2">
            <section className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
              <p className="flex items-start gap-2.5 text-sm font-medium leading-relaxed text-emerald-800">
                <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                <span>
                  <strong>Best swap for {spice}:</strong> {pick.subs[0].name}.
                  <span className="font-bold text-emerald-900"> {pick.advice}</span>
                </span>
              </p>
            </section>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {pick.subs.map((s, i) => (
                <article
                  key={s.name}
                  className={`rounded-2xl border p-4 ${
                    i === 0 ? 'border-emerald-300 bg-emerald-50/60' : 'border-slate-200 bg-white'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Leaf className={`h-4 w-4 ${i === 0 ? 'text-emerald-600' : 'text-slate-300'}`} />
                    <h4 className="text-sm font-extrabold text-slate-800">{s.name}</h4>
                    {i === 0 && (
                      <span className="ml-auto rounded-full bg-emerald-600 px-2 py-0.5 text-[10px] font-bold uppercase text-white">
                        Best
                      </span>
                    )}
                  </div>
                  <p className="mt-3 rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-primary-700">
                    Use {s.ratio}
                  </p>
                  <p className="mt-2 text-xs leading-relaxed text-slate-500">{s.note}</p>
                </article>
              ))}
            </div>

            <p className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm font-medium text-amber-800">
              Rule of thumb: ground spices are 3× stronger than their dried-leaf forms and about 1/3
              the strength of fresh — adjust to taste and trust your nose.
            </p>
          </div>
        </div>
      </ToolShell>
    </>
  )
}